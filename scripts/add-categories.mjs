// Adds new store categories (idempotent). Run before the bulk import so
// products can reference these category slugs.  node scripts/add-categories.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
function env() {
  for (const f of [".env.local", ".env"]) {
    try {
      for (const line of readFileSync(join(ROOT, f), "utf8").split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {}
  }
}
env();

// Temporary image (a known-good Unsplash) — overridden with a real product
// photo by set-category-images.mjs once each category has products.
const TEMP = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80";

const CATEGORIES = [
  { slug: "beauty", name: "Beauty & Care", description: "Skincare, makeup and grooming essentials." },
  { slug: "sports", name: "Sports & Fitness", description: "Gear to move, train and play." },
  { slug: "kids-baby", name: "Kids & Baby", description: "Toys, care and everyday baby needs." },
  { slug: "pet-supplies", name: "Pet Supplies", description: "Everything for your furry friends." },
  { slug: "automotive", name: "Automotive", description: "Car gadgets and accessories." },
  { slug: "gaming", name: "Gaming", description: "Gear for gamers and setups." },
  { slug: "kitchen", name: "Kitchen & Dining", description: "Tools and gadgets for the kitchen." },
  { slug: "office", name: "Office & Stationery", description: "Desk, stationery and work essentials." },
  { slug: "tools", name: "Tools & DIY", description: "Hardware, tools and repair gear." },
  { slug: "bags", name: "Bags & Luggage", description: "Bags, backpacks and travel." },
];

const c = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();
let added = 0;
for (const cat of CATEGORIES) {
  const r = await c.query(
    `insert into categories (name, slug, description, image)
     values ($1,$2,$3,$4) on conflict (slug) do nothing`,
    [cat.name, cat.slug, cat.description, TEMP],
  );
  if (r.rowCount) added++;
}
const total = (await c.query("select count(*) from categories")).rows[0].count;
console.log(`✓ Added ${added} new categories. Total categories: ${total}.`);
await c.end();
