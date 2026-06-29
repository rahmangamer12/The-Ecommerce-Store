-- =============================================================
--  Migration 0002 — Affiliate products
-- =============================================================
--  Adds an optional affiliate link to products. When set, the
--  storefront shows a "Buy now" button that sends the shopper to
--  this URL (e.g. an Amazon affiliate link) instead of using the
--  cart — so you can earn affiliate commission.
--
--  How to apply: paste into Supabase SQL Editor and Run.
-- =============================================================

alter table products
  add column if not exists affiliate_url text;
