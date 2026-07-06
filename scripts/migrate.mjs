// =============================================================
//  Database migration runner
// =============================================================
//  Applies every supabase/migrations/*.sql file to your database,
//  in order, ONCE each. So you never paste SQL into Supabase by
//  hand again — just run:  npm run db:migrate
//
//  One-time setup: add your database connection string to
//  .env.local as SUPABASE_DB_URL. Get it from Supabase →
//  Project Settings → Database → "Connection string" →
//  URI (use the "Session"/"Direct" one). It looks like:
//    postgresql://postgres:YOUR-PASSWORD@db.xxxx.supabase.co:5432/postgres
// =============================================================

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// --- Load env from .env.local (simple parser, no dependency) ---
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
    } catch {
      /* file may not exist — fine */
    }
  }
}

loadEnv();

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!url) {
  console.error(
    "\n✗ No database connection string found.\n" +
      "  Add SUPABASE_DB_URL to .env.local (Supabase → Settings → Database →\n" +
      "  Connection string → URI). Then run: npm run db:migrate\n",
  );
  process.exit(1);
}

const migrationsDir = join(ROOT, "supabase", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  // Track which migrations have run so re-running is safe.
  await client.query(
    `create table if not exists _migrations (
       name text primary key,
       applied_at timestamptz not null default now()
     )`,
  );
  const { rows } = await client.query("select name from _migrations");
  const done = new Set(rows.map((r) => r.name));

  let applied = 0;
  for (const file of files) {
    if (done.has(file)) {
      console.log(`• skip  ${file} (already applied)`);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    process.stdout.write(`→ apply ${file} … `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into _migrations(name) values ($1)", [file]);
      await client.query("commit");
      console.log("done ✓");
      applied++;
    } catch (err) {
      await client.query("rollback");
      console.error(`\n✗ Failed on ${file}:\n  ${err.message}\n`);
      process.exit(1);
    }
  }

  console.log(
    `\n✓ Migrations complete — ${applied} applied, ${files.length - applied} already up to date.`,
  );
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
