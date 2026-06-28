# Integrations Guide

Every integration is **optional** — the app runs fine without any keys (local
sample data, live features disabled). Add keys to `.env.local` (locally) and to
your Vercel project's **Environment Variables** (production), then restart /
redeploy. You can see live connection status in **Admin → Settings → Integrations**.

---

## 1. Cloudinary (product images + uploads)

**Why:** host and optimize product images; upload from the admin.

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the **Dashboard**, copy your **Cloud name**, **API Key**, **API Secret**.
3. Choose an upload mode:
   - **Unsigned (easiest):** Settings → Upload → *Add upload preset* → set
     *Signing mode = Unsigned* → copy the preset name into
     `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
   - **Signed (more secure):** leave the preset blank and provide
     `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`. The app signs uploads via
     `/api/cloudinary/sign`.

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset   # OR use the two below
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Code:** `src/lib/cloudinary.ts` (URL builder + signer),
`src/app/api/cloudinary/sign/route.ts` (signature endpoint),
`src/components/admin/image-uploader.tsx` (upload widget).
`res.cloudinary.com` is already allowed in `next.config.ts`.

---

## 2. Resend (transactional + marketing email)

**Why:** send welcome, order confirmation, shipping and abandoned-cart emails.

1. Sign up at [resend.com](https://resend.com) and verify a sending domain.
2. Create an API key (API Keys → Create).

```bash
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=Luxora <hello@yourdomain.com>
```

**Code:** `src/lib/email/send.ts` (sender), `src/lib/email/templates.ts`
(ready HTML templates). Used by `/api/newsletter` and `/api/contact`.
*(Mailchimp / ConvertKit keys are also accepted as alternatives.)*

---

## 3. Google Analytics 4 (GA4)

1. In [analytics.google.com](https://analytics.google.com) create a GA4 property.
2. Admin → Data Streams → Web → copy the **Measurement ID** (`G-XXXXXXX`).

```bash
NEXT_PUBLIC_GA4_ID=G-XXXXXXX
```

**Code:** `src/components/analytics.tsx` loads gtag only when the ID is present.
Fire ecommerce events from anywhere with `analyticsEvents` in
`src/lib/analytics.ts` (e.g. `analyticsEvents.purchase(orderId, total)`).

---

## 4. Google Tag Manager (GTM)

1. In [tagmanager.google.com](https://tagmanager.google.com) create a container.
2. Copy the **Container ID** (`GTM-XXXXXXX`).

```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

**Code:** the GTM script (`src/components/analytics.tsx`) and the `<noscript>`
fallback (`src/app/layout.tsx`) load automatically when the ID is set. All
`trackEvent` calls also push to `dataLayer`.

---

## 5. Google Search Console (verification)

1. Add your property at
   [search.google.com/search-console](https://search.google.com/search-console).
2. Choose the **HTML tag** method and copy the `content` value of the
   `google-site-verification` meta tag.

```bash
NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION=the-content-token
```

**Code:** injected as `<meta name="google-site-verification">` via
`buildMetadata()` in `src/lib/seo.ts`. After deploying, click **Verify**, then
submit your sitemap: `https://your-domain.com/sitemap.xml`.

---

## 6. Other pixels (optional)

```bash
NEXT_PUBLIC_META_PIXEL_ID=        # Meta / Facebook
NEXT_PUBLIC_TIKTOK_PIXEL_ID=      # TikTok
NEXT_PUBLIC_CLARITY_ID=           # Microsoft Clarity
```

All load conditionally in `src/components/analytics.tsx`.

---

## SEO config summary

Handled centrally in `src/lib/seo.ts`:

- `buildMetadata()` — titles, descriptions, canonical URLs, OpenGraph, Twitter
  cards, robots index/noindex, Search Console verification.
- JSON-LD helpers — Product, Organization, Website, Breadcrumb, FAQ, Review,
  SearchAction (used across pages).
- Auto files: `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`.

Per-product SEO overrides live on each product (`seo` field in
`src/data/products.ts` / the `products` table) and the **Admin → Settings → SEO**
panel manages site-wide defaults.
