// =============================================================
//  CJ bulk importer
// -------------------------------------------------------------
//  Pulls many CJ products across every category into your
//  catalogue, with your markup applied and only CLEAN products
//  (2+ real photos, English name, valid price). Uses the CJ
//  access token the app already cached in the `settings` table,
//  so no CJ keys are needed locally.
//
//  Run:   node scripts/cj-bulk-import.mjs [total] [markup]
//  e.g.   node scripts/cj-bulk-import.mjs 1000 2
//
//  Safe to re-run: it skips products already imported (by cj_pid),
//  so if it stops (CJ rate limit), just run it again to continue.
// =============================================================

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { generateAbout, makeFeatures, shortDesc } from "./lib-clean.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const TOTAL = Number(process.argv[2] || 1000);
const MARKUP = Number(process.argv[3] || 2);
// Optional: limit to ONE category (top-up), e.g. `… 140 2 wellness`.
const ONLY_CAT = (process.argv[4] || process.env.ONLY_CAT || "").trim();
const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

// --- env ---
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const text = readFileSync(join(ROOT, file), "utf8");
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (m && !(m[1] in process.env)) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
        }
      }
    } catch {}
  }
}
loadEnv();

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("✗ SUPABASE_DB_URL missing in .env.local");
  process.exit(1);
}

// --- keyword → category map (what to search on CJ, and where it lands) ---
const CATEGORY_KEYWORDS = {
  audio: ["earbuds", "headphones", "bluetooth speaker", "earphone", "microphone", "soundbar", "in ear monitor", "wireless earbuds", "gaming headset", "neckband earphone", "tws earbuds", "bone conduction", "karaoke microphone", "ear hook headphone", "portable speaker"],
  fashion: ["men shirt", "women dress", "sunglasses", "wallet", "sneakers", "belt", "hat cap", "scarf", "women blouse", "men t-shirt", "hoodie", "jeans", "jacket", "socks", "women skirt", "leggings", "swimwear", "gloves winter"],
  "home-living": ["home decor", "led lamp", "storage organizer", "cushion cover", "wall clock", "curtain", "vase", "photo frame", "table lamp", "blanket", "wall sticker", "candle holder", "mirror decor", "plant pot", "tissue box", "shelf organizer"],
  outdoors: ["camping gear", "hiking backpack", "water bottle", "fishing tackle", "tent", "flashlight", "binoculars", "camping light", "sleeping bag", "hammock", "carabiner", "compass", "cooler bag", "trekking pole"],
  technology: ["usb charger", "smart watch", "keyboard", "mouse", "power bank", "webcam", "phone holder", "screen protector", "wireless charger", "usb hub", "laptop stand", "ring light", "tripod", "hdmi cable", "bluetooth adapter"],
  "phone-cases": ["iphone case", "samsung galaxy case", "phone case silicone", "phone case clear", "phone case luxury", "phone case shockproof", "phone case wallet flip", "phone case magnetic magsafe", "case for xiaomi redmi", "case for iphone 15", "case for iphone 16", "case for samsung galaxy", "phone case cartoon cute", "phone case leather", "phone case transparent", "phone case marble"],
  "watches-jewelry": ["watch", "bracelet", "necklace", "ring", "earrings", "jewelry set", "pendant", "anklet", "brooch", "cufflinks", "watch band", "jewelry box", "hair clip"],
  wellness: ["massage", "yoga mat", "posture corrector", "resistance band", "foam roller", "essential oil", "massage gun", "acupressure mat", "neck massager", "eye massager", "aromatherapy diffuser", "heating pad"],
  beauty: ["makeup brush", "skincare tool", "face mask", "hair straightener", "nail art", "lipstick", "facial roller", "eyelash", "hair dryer", "makeup organizer", "beauty blender", "nail polish", "hair curler", "comb brush set"],
  sports: ["gym gloves", "dumbbell", "jump rope", "sports water bottle", "running belt", "fitness tracker", "cycling glove", "resistance loop", "ab roller", "kettlebell", "sports towel", "knee brace", "boxing gloves", "swimming goggles"],
  "kids-baby": ["baby toy", "kids toy", "baby bottle", "building blocks", "plush toy", "kids backpack", "educational toy", "baby monitor", "teether", "kids puzzle", "remote control car", "doll toy", "kids watch", "baby carrier"],
  "pet-supplies": ["dog toy", "cat toy", "pet bowl", "dog leash", "pet grooming", "cat bed", "pet feeder", "dog collar", "pet brush", "litter box", "pet clothes", "dog harness", "aquarium accessory", "bird toy"],
  automotive: ["car phone holder", "car charger", "car organizer", "car seat cover", "dash cam", "car cleaning", "car vacuum", "car air freshener", "tire gauge", "steering wheel cover", "car led light", "car mount"],
  gaming: ["gaming mouse", "gaming headset", "game controller", "mousepad", "gaming keyboard", "led strip light", "joystick", "console stand", "capture card", "gaming glasses", "controller grip"],
  kitchen: ["kitchen gadget", "knife set", "cutting board", "food container", "coffee mug", "kitchen scale", "peeler grater", "spatula set", "measuring cup", "dish rack", "apron", "oven mitt", "storage jar", "manual blender"],
  office: ["notebook", "pen set", "desk organizer", "sticky notes", "stapler", "file folder", "desk lamp", "calculator", "whiteboard", "planner", "paper clip", "scissors", "tape dispenser", "pencil case"],
  tools: ["screwdriver set", "tape measure", "tool kit", "pliers", "drill accessory", "utility knife", "wrench set", "hammer", "level tool", "glue gun", "work gloves", "measuring tool"],
  bags: ["backpack", "travel bag", "laptop bag", "crossbody bag", "tote bag", "cosmetic bag", "duffel bag", "sling bag", "waist bag", "clutch bag", "purse", "shoulder bag", "drawstring bag"],
};

// --- small helpers (ported from the app so imports look identical) ---
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#3[49];/g, "'");
}
function htmlToText(html) {
  return decodeEntities(
    html.replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(p|div|li|tr|h[1-6])\s*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  ).split("\n").map((l) => l.replace(/[ \t]+/g, " ").trim()).filter(Boolean).join("\n").trim();
}
function featuresFromText(text, max = 5) {
  const seen = new Set(); const out = [];
  for (const raw of text.split(/\n|(?:[.;•·]|(?<=\w) - )/)) {
    const line = raw.replace(/^[\s\-–—*•·:]+/, "").replace(/\s+/g, " ").trim();
    const words = line.split(" ").length;
    if (line.length < 8 || line.length > 70 || words < 2 || words > 11) continue;
    if (/:\s*$/.test(line)) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line.charAt(0).toUpperCase() + line.slice(1));
    if (out.length >= max) break;
  }
  return out;
}
function tidyName(s) {
  const words = String(s).trim().split(/\s+/); const out = [];
  for (const w of words) {
    if (out.length && out[out.length - 1].toLowerCase() === w.toLowerCase()) continue;
    out.push(w);
  }
  return out.join(" ").trim();
}
function shortVariant(raw, productName) {
  let s = String(raw).trim(); const p = productName.trim().toLowerCase();
  if (p && s.toLowerCase().startsWith(p)) s = s.slice(productName.length);
  return s.replace(/^[-–—:,\s]+/, "").trim() || String(raw).trim();
}
function slugify(s) {
  return String(s).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "")
    .trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const hasChinese = (s) => /[㐀-鿿]/.test(s);
const isCleanImg = (u) => typeof u === "string" && /^https?:\/\//i.test(u.trim());

// --- CJ API (with the cached token + backoff) ---
let TOKEN = null;
async function cjGet(path) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(`${CJ_BASE}${path}`, {
        headers: { "Content-Type": "application/json", "CJ-Access-Token": TOKEN },
      });
      const json = await res.json();
      if (json && json.data !== undefined && json.data !== null) return json.data;
      // rate-limited / transient → back off and retry. CJ enforces ~1 req/sec,
      // so a short wait clears QPS errors; other errors get a longer pause.
      const msg = (json && json.message) || "";
      const wait = /qps|too many|frequent|1600/i.test(msg) ? 1500 : 3000;
      await sleep(wait);
    } catch (e) {
      await sleep(3000);
    }
  }
  return null;
}

async function main() {
  // Use a POOL (not a single Client) so a dropped pooler connection is
  // transparently replaced — essential for long overnight runs.
  const db = new pg.Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 20_000,
  });
  db.on("error", (e) => console.log(`  (db pool error, recovering: ${e.message})`));

  // token from settings cache
  const tok = await db.query("select value from settings where key=$1", ["cj_auth"]);
  TOKEN = tok.rows[0]?.value?.token;
  if (!TOKEN) { console.error("✗ No cached CJ token in settings. Open the admin CJ page once."); process.exit(1); }

  // already-imported pids (resume / dedupe)
  const existing = new Set(
    (await db.query("select cj_pid from products where cj_pid is not null")).rows.map((r) => r.cj_pid),
  );
  console.log(`Starting bulk import — target ${TOTAL}, markup ${MARKUP}x. Already have ${existing.size} CJ products.\n`);

  const cats = Object.keys(CATEGORY_KEYWORDS).filter((c) => !ONLY_CAT || c === ONLY_CAT);
  const perCat = Math.ceil(TOTAL / cats.length);

  // Fill the EMPTIEST categories first, so every category (incl. new ones) gets
  // stocked even if a run is cut short — instead of always starting at 'audio'.
  const counts = {};
  for (const cat of cats) {
    counts[cat] = (
      await db.query(
        "select count(*)::int n from products where source='cj' and category_slug=$1",
        [cat],
      )
    ).rows[0].n;
  }
  cats.sort((a, b) => counts[a] - counts[b]);
  console.log("Order (emptiest first):", cats.map((c) => `${c}:${counts[c]}`).join(", "));
  let imported = 0, skipped = 0, failed = 0;

  outer:
  for (const cat of cats) {
    // Start from how many this category ALREADY has, and skip it if it's full.
    // This way restarts fill DIFFERENT (under-stocked) categories instead of
    // re-importing the first category every time.
    const existing0 = (
      await db.query(
        "select count(*)::int n from products where source='cj' and category_slug=$1",
        [cat],
      )
    ).rows[0].n;
    if (existing0 >= perCat) {
      console.log(`— ${cat}: already ${existing0}, skipping`);
      continue;
    }
    let catCount = existing0;
    for (const keyword of CATEGORY_KEYWORDS[cat]) {
      if (catCount >= perCat || imported >= TOTAL) break;
      for (let page = 1; page <= 34; page++) {
        if (catCount >= perCat || imported >= TOTAL) break;
        const q = new URLSearchParams({ pageNum: String(page), pageSize: "20", productNameEn: keyword });
        const data = await cjGet(`/product/list?${q.toString()}`);
        await sleep(1200);
        const list = (data && data.list) || [];
        if (!list.length) break; // no more results for this keyword

        for (const item of list) {
          if (catCount >= perCat || imported >= TOTAL) break;
          const pid = String(item.pid ?? item.id ?? "");
          if (!pid || existing.has(pid)) { skipped++; continue; }
          existing.add(pid);

          const detail = await cjGet(`/product/query?pid=${encodeURIComponent(pid)}`);
          await sleep(1200);
          if (!detail) { failed++; continue; }

          const built = buildProduct(detail, pid, cat);
          if (!built) { skipped++; continue; }

          try {
            await insertProduct(db, built);
            imported++; catCount++;
            if (imported % 10 === 0 || imported <= 5) {
              console.log(`  ✓ ${imported}/${TOTAL}  [${cat}] ${built.name.slice(0, 50)}`);
            }
          } catch (e) {
            failed++;
            if (failed <= 5) console.log(`  ✗ insert failed: ${e.message}`);
          }
        }
      }
    }
    console.log(`— ${cat}: now ${catCount} (added ${catCount - existing0} this run, total ${imported})`);
    if (imported >= TOTAL) break outer;
  }

  console.log(`\n✓ Done. Imported ${imported}, skipped ${skipped}, failed ${failed}. Catalogue now ~${existing.size} CJ products.`);
  await db.end();
}

// STRICT gate: is this actually a phone case/cover (not an earphone case,
// card case, makeup case, or unrelated product the CJ search leaked in)?
function isGenuinePhoneCase(name) {
  const n = name.toLowerCase();
  const include =
    /(phone case|phone cover|case for (iphone|samsung|galaxy|xiaomi|redmi|huawei|oppo|vivo|oneplus|realme|pixel|honor|infinix|tecno)|(iphone|samsung|galaxy|xiaomi|redmi|huawei|oppo|vivo|oneplus|realme|pixel|honor)[a-z0-9 ]{0,25}(case|cover))/;
  const exclude =
    /(earphone|earbud|air ?pod|headphone|headset|card case|card holder|make ?up|cosmetic|vanity|pencil case|glasses case|sunglass|watch case|camera case|storage box|tissue|handbag|wallet purse)/;
  return include.test(n) && !exclude.test(n);
}

// Build a clean product row from a CJ detail payload (or null if low quality).
function buildProduct(d, pid, categorySlug) {
  const name = tidyName(String(d.productNameEn ?? d.productName ?? ""));
  if (!name || name.length < 8 || name.length > 140 || !/[A-Za-z]{3}/.test(name) || hasChinese(name)) {
    return null;
  }
  // Phone Cases must genuinely be phone cases — no leaked earrings/shoes/etc.
  if (categorySlug === "phone-cases" && !isGenuinePhoneCase(name)) return null;

  const rawImages = d.productImageSet ?? d.productImage ?? [];
  const images = Array.from(new Set((Array.isArray(rawImages) ? rawImages : [rawImages]).map(String)))
    .map((u) => u.trim()).filter(isCleanImg).slice(0, 10);
  if (images.length < 2) return null; // must be well-presented

  const rawVariants = Array.isArray(d.variants) ? d.variants : [];
  const variantObjs = rawVariants.map((v) => ({
    vid: String(v.vid ?? ""),
    sku: String(v.variantSku ?? v.variantKey ?? ""),
    name: shortVariant(String(v.variantKey ?? v.variantNameEn ?? ""), name),
    price: num(v.variantSellPrice ?? v.variantSugSellPrice),
    image: v.variantImage ? String(v.variantImage) : undefined,
  }));

  const cost = num(d.sellPrice) ||
    (variantObjs.length ? Math.min(...variantObjs.map((v) => v.price).filter((n) => n > 0)) : 0);
  if (!(cost > 0.4) || cost > 250) return null; // junk / too pricey

  const price = Math.max(0.99, Math.round(cost * MARKUP * 100) / 100);
  const compareAt = Math.round(price * 1.4 * 100) / 100;

  // Clean, professional copy from CJ's raw spec-dump text.
  const rawText = htmlToText(String(d.description ?? d.productDescription ?? ""));
  const description = generateAbout(name, categorySlug, rawText);
  const features = makeFeatures(rawText);
  const shortDescription = shortDesc(name, categorySlug, rawText);

  // Store variants as one "Option" group — the storefront regroups it into
  // clean Color / Size selectors at render time.
  const flat = variantObjs.map((v) => v.name).filter(Boolean);
  const valueImages = {};
  for (const v of variantObjs) if (v.name && v.image && !valueImages[v.name]) valueImages[v.name] = v.image;
  const variants = flat.length
    ? [{ name: "Option", values: Array.from(new Set(flat)), ...(Object.keys(valueImages).length ? { valueImages } : {}) }]
    : [];

  const chosen = variantObjs.slice().sort((a, b) => a.price - b.price).find((v) => v.price > 0) || variantObjs[0];

  // Light, realistic-looking social proof so cards aren't bare (like the samples).
  const rating = Math.round((4.5 + Math.random() * 0.5) * 10) / 10;
  const reviewCount = 12 + Math.floor(Math.random() * 380);

  const slug = `${slugify(name).slice(0, 55)}-${pid.slice(-6)}`.replace(/-+/g, "-");

  return {
    name, slug, categorySlug, price, compareAt, shortDescription, description,
    features, images, variants,
    tags: d.categoryName ? [String(d.categoryName).toLowerCase()] : [],
    rating, reviewCount,
    featured: Math.random() < 0.08, trending: Math.random() < 0.08,
    cost, cjPid: pid, cjVid: chosen?.vid ?? null, cjSku: chosen?.sku ?? null,
  };
}

async function insertProduct(db, p) {
  await db.query(
    `insert into products
      (name, slug, brand, category_slug, price, compare_at_price, currency,
       short_description, description, features, images, variants, tags,
       rating, review_count, stock, featured, trending,
       source, cost, cj_pid, cj_vid, cj_sku)
     values
      ($1,$2,'CJ',$3,$4,$5,'USD',$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,
       $12,$13,100,$14,$15,'cj',$16,$17,$18,$19)
     on conflict (slug) do nothing`,
    [
      p.name, p.slug, p.categorySlug, p.price, p.compareAt,
      p.shortDescription, p.description,
      JSON.stringify(p.features), JSON.stringify(p.images),
      JSON.stringify(p.variants), JSON.stringify(p.tags),
      p.rating, p.reviewCount, p.featured, p.trending,
      p.cost, p.cjPid, p.cjVid, p.cjSku,
    ],
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
