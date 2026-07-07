// Rewrites every CJ product's about/features/short_description into clean,
// professional copy (CJ ships raw spec-dumps + cut-off fragments).
//   node scripts/cleanup-products.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { generateAbout, makeFeatures, shortDesc } from "./lib-clean.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const f of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(join(ROOT, f), "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const db = new pg.Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  keepAlive: true,
  max: 5,
});
db.on("error", (e) => console.log(`  (pool error, recovering: ${e.message})`));

const { rows } = await db.query(
  "select id, name, category_slug, description from products where source='cj'",
);
console.log(`Cleaning ${rows.length} products…`);

let done = 0;
const BATCH = 20;
for (let i = 0; i < rows.length; i += BATCH) {
  const slice = rows.slice(i, i + BATCH);
  await Promise.all(
    slice.map((p) => {
      const src = p.description || "";
      const description = generateAbout(p.name, p.category_slug, src);
      const features = makeFeatures(src);
      const short = shortDesc(p.name, p.category_slug, src);
      return db
        .query(
          "update products set description=$1, features=$2::jsonb, short_description=$3 where id=$4",
          [description, JSON.stringify(features), short, p.id],
        )
        .catch((e) => console.log(`  skip ${p.id}: ${e.message}`));
    }),
  );
  done += slice.length;
  if (done % 200 === 0 || done === rows.length) console.log(`  ${done}/${rows.length}`);
}

console.log(`\n✓ Cleaned ${done} products.`);
await db.end();
