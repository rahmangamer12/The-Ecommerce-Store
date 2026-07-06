-- =============================================================
--  Migration 0005 — Link orders to the signed-in user
-- =============================================================
--  user_id: the Clerk user id of the shopper when they were signed
--  in at checkout. Lets "My orders" show a user's orders reliably
--  even if the email they typed at checkout differs from their
--  account email.
--
--  How to apply:  npm run db:migrate   (or paste into Supabase SQL Editor)
-- =============================================================

alter table orders
  add column if not exists user_id text;

create index if not exists orders_user_id_idx on orders(user_id);
