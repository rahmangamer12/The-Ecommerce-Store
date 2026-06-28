-- =============================================================
--  LUXORA — DATABASE SCHEMA (Supabase / Postgres)
-- =============================================================
--  How to apply:
--    Option A (Dashboard): paste this whole file into the
--      Supabase SQL Editor and click "Run".
--    Option B (CLI): supabase db push
--
--  Safe to run once on a fresh project. Includes Row Level
--  Security (RLS) so customers only see their own data.
-- =============================================================

create extension if not exists "uuid-ossp";

-- ---------- Enums ----------
do $$ begin
  create type order_status as enum (
    'pending','paid','processing','purchased','shipped',
    'delivered','cancelled','refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type coupon_type as enum ('percent','fixed','free_shipping');
exception when duplicate_object then null; end $$;

-- ---------- Profiles (customers) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'customer', -- 'customer' | 'admin'
  marketing_opt_in boolean default false,
  created_at timestamptz default now()
);

-- ---------- Addresses ----------
create table if not exists addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  label text,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  zip text not null,
  country text not null,
  phone text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ---------- Categories ----------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  image text,
  icon text,
  created_at timestamptz default now()
);

-- ---------- Products ----------
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  brand text,
  category_slug text references categories(slug),
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  currency text default 'USD',
  short_description text,
  description text,
  features jsonb default '[]',
  images jsonb default '[]',
  variants jsonb default '[]',
  tags jsonb default '[]',
  rating numeric(2,1) default 0,
  review_count int default 0,
  stock int default 0,
  badge text,
  featured boolean default false,
  trending boolean default false,
  -- SEO
  seo_title text,
  seo_description text,
  seo_keywords text,
  og_image text,
  indexable boolean default true,
  created_at timestamptz default now()
);

-- ---------- Orders ----------
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  number text unique not null,
  user_id uuid references profiles(id) on delete set null,
  customer_name text,
  customer_email text,
  status order_status default 'pending',
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2) not null,
  coupon_code text,
  shipping_address jsonb,
  polar_checkout_id text,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Order items ----------
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  image text,
  price numeric(10,2) not null,
  quantity int not null,
  variant jsonb
);

-- ---------- Coupons ----------
create table if not exists coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  type coupon_type not null,
  value numeric(10,2) not null default 0,
  min_subtotal numeric(10,2),
  description text,
  active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ---------- Reviews ----------
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  author text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  verified boolean default false,
  created_at timestamptz default now()
);

-- ---------- Wishlists ----------
create table if not exists wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

-- ---------- Settings (single-row key/value store) ----------
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ---------- Notifications ----------
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

-- ---------- Audit logs (admin actions) ----------
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  meta jsonb,
  created_at timestamptz default now()
);

-- =============================================================
--  Auto-create a profile row when a new auth user signs up
-- =============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- =============================================================
--  ROW LEVEL SECURITY
-- =============================================================
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table wishlists enable row level security;
alter table notifications enable row level security;
alter table products enable row level security;
alter table categories enable row level security;
alter table coupons enable row level security;

-- Public catalog is readable by everyone
drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);
drop policy if exists "public read active coupons" on coupons;
create policy "public read active coupons" on coupons for select using (active = true);
drop policy if exists "public read reviews" on reviews;
create policy "public read reviews" on reviews for select using (true);

-- Admins can write the catalog
drop policy if exists "admin write products" on products;
create policy "admin write products" on products for all using (is_admin()) with check (is_admin());
drop policy if exists "admin write categories" on categories;
create policy "admin write categories" on categories for all using (is_admin()) with check (is_admin());
drop policy if exists "admin write coupons" on coupons;
create policy "admin write coupons" on coupons for all using (is_admin()) with check (is_admin());

-- Profiles: users see/update their own; admins see all
drop policy if exists "own profile read" on profiles;
create policy "own profile read" on profiles for select using (auth.uid() = id or is_admin());
drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- Addresses: owner only
drop policy if exists "own addresses" on addresses;
create policy "own addresses" on addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders: owner reads own, admin reads all
drop policy if exists "own orders read" on orders;
create policy "own orders read" on orders for select using (auth.uid() = user_id or is_admin());
drop policy if exists "admin manage orders" on orders;
create policy "admin manage orders" on orders for update using (is_admin());

-- Order items follow their order
drop policy if exists "order items read" on order_items;
create policy "order items read" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin()))
);

-- Reviews: authenticated users can write their own
drop policy if exists "write own review" on reviews;
create policy "write own review" on reviews for insert with check (auth.uid() = user_id);

-- Wishlists & notifications: owner only
drop policy if exists "own wishlist" on wishlists;
create policy "own wishlist" on wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own notifications" on notifications;
create policy "own notifications" on notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Helpful indexes
create index if not exists idx_products_category on products(category_slug);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_reviews_product on reviews(product_id);
