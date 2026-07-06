-- =============================================================
--  Migration 0007 — Store the Clerk user id on orders (as text)
-- =============================================================
--  The existing `user_id` column is a UUID (for Supabase auth), but
--  Clerk ids are strings like "user_2abc…" — inserting one into a
--  uuid column FAILS, which broke checkout for signed-in shoppers.
--  We store the Clerk id in its own text column instead.
--
--  How to apply:  npm run db:migrate
-- =============================================================

alter table orders
  add column if not exists clerk_user_id text;

create index if not exists orders_clerk_user_id_idx on orders (clerk_user_id);
