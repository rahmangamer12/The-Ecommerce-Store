-- =============================================================
--  Migration 0004 — Web push notifications
-- =============================================================
--  Stores each browser's push subscription so the store can send
--  notifications (new deals, order updates) even when the shopper
--  isn't on the site. One row per browser/device.
--
--  endpoint: unique push endpoint URL from the browser
--  p256dh / auth: encryption keys from the subscription
--  country: detected country (optional — lets you target by region)
--
--  How to apply: paste into Supabase SQL Editor and Run. Safe to
--  re-run (uses "if not exists").
-- =============================================================

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  country text,
  created_at timestamptz not null default now()
);

-- Only the service role (server) touches this table.
alter table push_subscriptions enable row level security;
