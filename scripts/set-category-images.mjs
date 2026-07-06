// Sets each category's image to a real, clean product photo from that category
// (replaces the generic stock images). Run after imports.
//   node scripts/set-category-images.mjs
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

const c = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const cats = (await c.query("select slug, name from categories order by name")).rows;
let updated = 0;
for (const cat of cats) {
  // A recent product in this category with at least one image.
  const p = await c.query(
    `select images from products
     where category_slug = $1 and jsonb_array_length(images) > 0
     order by review_count desc, created_at desc limit 1`,
    [cat.slug],
  );
  const img = p.rows[0]?.images?.[0];
  if (img && /^https?:\/\//.test(img)) {
    await c.query("update categories set image = $1 where slug = $2", [img, cat.slug]);
    updated++;
    console.log(`  ✓ ${cat.name} → product photo`);
  } else {
    console.log(`  — ${cat.name}: no products yet, kept current image`);
  }
}
console.log(`\n✓ Updated ${updated}/${cats.length} category images.`);
await c.end();
