// =============================================================
//  CJ auto price/stock sync
// -------------------------------------------------------------
//  Re-checks every imported CJ product against CJ and updates:
//    • cost  → the latest CJ price you'd pay
//    • price → recomputed keeping each product's current markup
//    • stock → 0 if the product is gone from CJ, else in-stock
//
//  Run:   node scripts/cj-sync.mjs [limit]
//  e.g.   node scripts/cj-sync.mjs 300     (sync up to 300, oldest first)
//
//  Meant to run on a schedule (e.g. nightly). Processes the least-
//  recently-synced first, so running it in chunks eventually covers
//  everything. Safe to re-run.
// =============================================================

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LIMIT = Number(process.argv[2] || 500);
const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const text = readFileSync(join(ROOT, file), "utf8");
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {}
  }
}
loadEnv();

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!DB_URL) { console.error("✗ SUPABASE_DB_URL missing"); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

let TOKEN = null;
async function cjGet(path) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`${CJ_BASE}${path}`, {
        headers: { "Content-Type": "application/json", "CJ-Access-Token": TOKEN },
      });
      const json = await res.json();
      if (json && json.data !== undefined && json.data !== null) return json.data;
      const msg = (json && json.message) || "";
      // "product not found" is a real answer (deleted) — don't retry forever.
      if (/not found|not exist|deleted|下架|invalid pid/i.test(msg)) return "GONE";
      await sleep(/frequent|limit|too much|1600/i.test(msg) ? 12000 : 3000);
    } catch { await sleep(3000); }
  }
  return null;
}

async function main() {
  const db = new pg.Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await db.connect();

  const tok = await db.query("select value from settings where key=$1", ["cj_auth"]);
  TOKEN = tok.rows[0]?.value?.token;
  if (!TOKEN) { console.error("✗ No cached CJ token."); process.exit(1); }

  // Ensure a column to track when each product was last synced.
  await db.query("alter table products add column if not exists cj_synced_at timestamptz");

  const { rows } = await db.query(
    `select id, name, price, cost, cj_pid from products
     where source='cj' and cj_pid is not null
     order by cj_synced_at asc nulls first
     limit $1`,
    [LIMIT],
  );
  console.log(`Syncing ${rows.length} CJ products…\n`);

  let updated = 0, priceChanged = 0, outOfStock = 0, failed = 0;
  for (const p of rows) {
    const detail = await cjGet(`/product/query?pid=${encodeURIComponent(p.cj_pid)}`);
    await sleep(700);

    if (detail === null) { failed++; continue; }

    if (detail === "GONE") {
      await db.query("update products set stock=0, cj_synced_at=now() where id=$1", [p.id]);
      outOfStock++; updated++;
      continue;
    }

    // Latest cost = cheapest variant sell price, else product sell price.
    const variants = Array.isArray(detail.variants) ? detail.variants : [];
    const vPrices = variants.map((v) => num(v.variantSellPrice ?? v.variantSugSellPrice)).filter((n) => n > 0);
    const newCost = (vPrices.length ? Math.min(...vPrices) : 0) || num(detail.sellPrice);

    if (!(newCost > 0)) {
      await db.query("update products set stock=0, cj_synced_at=now() where id=$1", [p.id]);
      outOfStock++; updated++;
      continue;
    }

    // Keep each product's existing markup (price ÷ cost); default 2x.
    const markup = p.cost > 0 ? num(p.price) / num(p.cost) : 2;
    const newPrice = Math.max(0.99, Math.round(newCost * markup * 100) / 100);
    const changed = Math.abs(newPrice - num(p.price)) > 0.001 || Math.abs(newCost - num(p.cost)) > 0.001;

    await db.query(
      "update products set cost=$1, price=$2, stock=greatest(stock,1), cj_synced_at=now() where id=$3",
      [newCost, newPrice, p.id],
    );
    updated++;
    if (changed) { priceChanged++; if (priceChanged <= 8) console.log(`  ~ ${p.name.slice(0, 40)}  $${p.price} → $${newPrice}`); }
  }

  console.log(`\n✓ Synced ${updated} products. Price/cost changed: ${priceChanged}. Out of stock: ${outOfStock}. Failed: ${failed}.`);
  await db.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
