# Luxora — Premium Ecommerce Platform 🛍️

An ultra-premium, production-grade ecommerce storefront + admin dashboard for a
**manual-fulfilment dropshipping** business. Built to look luxurious and convert
— and engineered to **run before you add a single API key** (it falls back to
local sample data and disables live features gracefully).

> **The store runs out-of-the-box.** Paste your keys into `.env.local` when ready
> to enable real auth, payments, image uploads, email and analytics.

---

## ✨ Tech stack

| Layer | Tech |
|------|------|
| Framework | **Next.js 16** (App Router, Turbopack) + **TypeScript** |
| Styling | **Tailwind CSS v4** (configured in `globals.css`) |
| Animation | **Framer Motion** |
| Database & Auth | **Supabase** (Postgres + Auth + RLS) |
| Payments | **Polar** |
| Images | **Cloudinary** (+ `next/image` optimization) |
| Charts | **Recharts** |
| Email | **Resend** / Mailchimp / ConvertKit ready |
| Hosting | **Vercel** |

---

## 🚀 Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Build & run production:

```bash
npm run build
npm start
```

Lint:

```bash
npm run lint
```

> ✅ `npm run dev`, `npm run build` and `npm run lint` all pass with **zero
> errors** out of the box.

---

## 🔑 Environment variables — where to put your keys

Two files are already created for you: **`.env.local`** (your real keys — git
ignored) and **`.env`**. A reference copy lives in **`.env.example`**.

Open **`.env.local`** and paste your values after each `=`:

```bash
# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase  (Dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Polar  (polar.sh → Settings → Developers → Access Tokens)
POLAR_ACCESS_TOKEN=
POLAR_SERVER=sandbox          # or "production"
POLAR_PRODUCT_ID=             # the Polar product used for checkout
POLAR_SUCCESS_URL=http://localhost:3000/order-success

# Cloudinary  (Cloudinary Dashboard)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Admin — emails that get admin access automatically
ADMIN_EMAILS=you@example.com

# Email marketing (optional, pick one)
RESEND_API_KEY=
EMAIL_FROM=Luxora <onboarding@resend.dev>

# Analytics / pixels (all optional)
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_CLARITY_ID=
```

**Restart `npm run dev` after editing env files.**

What unlocks when you add keys:
- **Supabase** → real accounts, login/register, order persistence, admin lockdown.
- **Polar** (+ `POLAR_PRODUCT_ID`) → live hosted checkout. Without it, checkout
  completes as a demo order (the manual-fulfilment flow still works).
- **Cloudinary** → product image uploads from the admin.
- **Resend** → welcome / contact / order emails actually send.
- **Analytics IDs** → the matching pixels load automatically.

---

## 🎨 Rebrand in one file

Edit **`src/config/site.ts`** to change the store name, logo mark, support
email, WhatsApp, social links, currency, shipping cost, tax rate and address.
Everything across the site updates automatically.

Brand colours & fonts live in **`src/app/globals.css`** (change `--gold` /
`--ink` to re-theme; supports light + dark mode).

---

## 🗄️ Database setup (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.
   This creates all tables (products, categories, orders, order_items,
   customers/profiles, addresses, coupons, reviews, wishlists, settings,
   notifications, audit_logs) with **Row Level Security**.
3. Copy your API keys into `.env.local`.
4. To make yourself an admin, add your email to `ADMIN_EMAILS`, then run in SQL:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```

---

## 📁 Folder structure

```
src/
  app/
    page.tsx                 # Premium homepage
    shop/                    # Shop (filters, sort, pagination)
    categories/[slug]/       # Category pages
    products/[slug]/         # Product detail (gallery, zoom, reviews…)
    cart/  checkout/         # Cart + checkout (+ checkout/actions.ts)
    order-success/
    search/
    login/ register/ forgot-password/
    account/                 # Dashboard, orders, wishlist, addresses, settings
    admin/                   # Overview, products, orders, customers,
                             # analytics, coupons, settings (+ SEO panel)
    blog/  blog/[slug]/      # Journal (TOC, reading time, share)
    contact/ faq/ privacy/ terms/
    api/newsletter/ api/contact/
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx
    loading/error/not-found states
  components/                # ui/, layout/, product/, cart/, admin/, …
  config/                    # site.ts (brand), env.ts (keys)
  data/                      # products, categories, coupons, blog, orders…
  lib/                       # utils, seo, polar, email/, supabase/
  types/
supabase/migrations/         # SQL schema
```

---

## 🛠️ Admin guide

Visit **`/admin`**. While Supabase keys are absent it runs in **demo mode**
(open access). Once configured, only `ADMIN_EMAILS` / `role = 'admin'` users can
enter (enforced by `src/proxy.ts` + the admin layout).

- **Overview** — revenue chart, orders pipeline, KPIs, top products.
- **Products** — searchable catalogue table (wire create/edit to Supabase + Cloudinary).
- **Orders** — click a row to expand, view items/address, and update status.
- **Customers / Analytics / Coupons / Settings (incl. SEO panel)**.

### Uploading a product (when Cloudinary + Supabase are connected)
1. Admin → **Products → Add product**.
2. Upload images (Cloudinary), fill details, price, stock, variants, SEO fields.
3. Save → it appears in the store and sitemap automatically.

### Processing an order (manual fulfilment)
1. A paid order appears under Admin → **Orders** (`paid`).
2. Buy the item from your supplier → set status **Purchased**.
3. When the supplier ships → set **Shipped** (add tracking).
4. Mark **Delivered** when it arrives. The customer sees status in their account.

---

## 🔍 SEO & marketing (built in)

- Dynamic metadata, canonical URLs, OpenGraph + Twitter cards on every page.
- JSON-LD: Product, Organization, Website, Breadcrumb, FAQ, Review, SearchAction.
- Auto `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, generated OG image.
- Pixels for GA4, GTM, Meta, TikTok, Clarity — enabled by env IDs only.
- CRO: sticky buy box, social proof, trust badges, low-stock cues, recently
  viewed, related products, cart upsells, free-shipping progress bar.
- Email templates ready: welcome, order confirmation, shipping, abandoned cart.

---

## ☁️ Deploy to Vercel

1. Push this repo to GitHub (see below).
2. Import it at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected.
3. Add the **same environment variables** from `.env.local` in
   Vercel → Project → Settings → **Environment Variables**.
4. Set `NEXT_PUBLIC_SITE_URL` to your real domain and **Deploy**.

---

## 🧾 Push to GitHub

```bash
git init
git add .
git commit -m "Luxora: premium ecommerce platform"
git branch -M main
git remote add origin git@github.com:rahmangamer12/The-Ecommerce-Store.git
git push -u origin main
```

> `.env*` files are git-ignored, so your keys never get pushed. 👍

---

## 🧩 Sample data

24 realistic products across 8 categories, 4 blog articles, testimonials,
coupons (`WELCOME10`, `LUXE25`, `FREESHIP`) and demo orders — all in
`src/data/`. Replace with your own or migrate to Supabase.

Enjoy building. ✨
