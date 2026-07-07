// Overnight runner: repeatedly runs the CJ bulk import (which is resumable),
// restarting after any crash/connection drop, until we hit the target or stop
// making progress. Then refreshes category images from the imported products.
//   node scripts/overnight-runner.mjs
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const f of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(join(ROOT, f), "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const TARGET = 6000; // ~1170 existing + ~4800 new
const MAX_PASSES = 80;

async function cjCount() {
  const c = new pg.Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await c.connect();
    const r = await c.query("select count(*)::int n from products where source='cj'");
    await c.end();
    return r.rows[0].n;
  } catch {
    try { await c.end(); } catch {}
    return -1;
  }
}

function run(script, args = []) {
  spawnSync("node", [join("scripts", script), ...args], {
    cwd: ROOT,
    stdio: "inherit",
  });
}

let prev = 0;
let stall = 0;
for (let pass = 1; pass <= MAX_PASSES; pass++) {
  console.log(`\n================= RUNNER PASS ${pass} =================`);
  run("cj-bulk-import.mjs", ["6000", "2"]);

  const c = await cjCount();
  console.log(`\n>>> after pass ${pass}: ${c} CJ products (prev ${prev})`);

  if (c >= TARGET) {
    console.log(">>> TARGET reached.");
    break;
  }
  if (c >= 0 && c <= prev) {
    stall++;
    console.log(`>>> no progress (${stall}/3)`);
    if (stall >= 3) {
      console.log(">>> stalled — likely CJ daily limit or keywords exhausted. Stopping.");
      break;
    }
  } else if (c > prev) {
    stall = 0;
    prev = c;
  }
  await new Promise((r) => setTimeout(r, 8000));
}

console.log("\n================= refreshing category images =================");
run("set-category-images.mjs");
console.log("\n================= RUNNER DONE =================");
