-- =============================================================
--  Migration 0006 — Visitor analytics (page views)
-- =============================================================
--  One row per page view. Lets the admin see how many people
--  visited, on what device/browser/OS, which pages they viewed,
--  and where they came from.
--
--  How to apply:  npm run db:migrate
-- =============================================================

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text,        -- anonymous id (distinguishes unique visitors)
  user_id text,           -- Clerk id if signed in
  path text,              -- page visited
  referrer text,          -- where they came from
  device text,            -- mobile | tablet | desktop
  browser text,           -- Chrome | Safari | …
  os text,                -- Windows | iOS | Android | …
  country text,           -- 2-letter code (from the edge)
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx on page_views (created_at desc);
create index if not exists page_views_session_idx on page_views (session_id);

alter table page_views enable row level security;
