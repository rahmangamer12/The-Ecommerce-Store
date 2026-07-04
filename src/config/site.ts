/**
 * =============================================================
 *  CENTRAL STORE CONFIGURATION
 * =============================================================
 *  Edit this file to rebrand the whole store. Everything here is
 *  safe to expose to the browser (no secret keys — those live in
 *  .env.local and are read in src/config/env.ts).
 * =============================================================
 */

export const siteConfig = {
  // ---- Brand ----
  name: "Souq Empire",
  legalName: "Souq Empire",
  // Short tagline shown in the hero / SEO
  tagline: "Premium finds, delivered worldwide",
  description:
    "Souq Empire is a global online store. Discover great products across tech, home, fashion, beauty and more — shipped worldwide, with secure online payment.",
  // Logo: an emoji/letter mark by default. Replace `logoText` or set `logoImage`.
  logoText: "Souq Empire",
  logoMark: "S",
  logoImage: "", // e.g. "/logo.svg" (leave empty to use the text mark)

  // ---- Contact ----
  supportEmail: "sheerazshahbaloch@gmail.com",
  whatsapp: "+974 3126 9934", // shown in UI
  whatsappNumber: "97431269934", // wa.me format, no + or spaces
  // Formspree form ID for the contact form (formspree.io). The form works
  // immediately with this ID — change it to your own Formspree form.
  formspreeId: "mwvdqvkn",

  // ---- Which payment methods to show at checkout ----
  // (Card also needs MYFATOORAH_API_KEY set to actually appear.)
  // COD is OFF by default: in dropshipping the cash goes to the courier,
  // not you — so prefer prepaid methods (WhatsApp / bank / card).
  payments: {
    paypal: true, // global — needs PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET set
    card: true,
    whatsapp: true,
    bank: true,
    cod: false,
  },

  // ---- Bank details (shown for the "Bank Transfer" payment option) ----
  bank: {
    name: "Commercial Bank (QSC)",
    accountName: "SHEERAZ SHAHJAHAN",
    accountNumber: "4060366234001",
    iban: "QA71CBQA000000004060366234001",
    swift: "CBQAQAQA",
    address: "Commercial Bank Plaza, 380 Al Markhi Street, 60 Al Dafna Area, Doha",
  },

  // ---- Address ----
  address: {
    line1: "Al Sadd",
    city: "Doha",
    state: "",
    zip: "",
    country: "Qatar",
  },

  // ---- Commerce settings ----
  // Base currency: all product prices are stored in THIS currency (USD).
  // Enter your product prices in USD in the admin — that's what you pay the
  // supplier in, so your margins stay clear.
  currency: "USD",
  currencySymbol: "$",
  locale: "en-US",
  // Currencies the shopper can switch between. `rate` = how much 1 base
  // currency (1 USD) is worth in that currency (approximate — edit anytime).
  currencies: [
    { code: "USD", rate: 1 },
    { code: "QAR", rate: 3.64 },
    { code: "AED", rate: 3.67 },
    { code: "SAR", rate: 3.75 },
    { code: "GBP", rate: 0.79 },
    { code: "PKR", rate: 278 },
  ],
  // Free shipping above this subtotal (in base currency). 0 = always charge.
  freeShippingThreshold: 100,
  shippingFlatRate: 9.0,
  // Tax rate as a decimal (0.08 = 8%). Set 0 to disable tax.
  taxRate: 0.08,

  // ---- Social links (leave "" to hide) ----
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    tiktok: "https://tiktok.com",
    youtube: "",
    pinterest: "",
  },

  // ---- Geo / multi-country SEO ----
  defaultCountry: "US",
  supportedCountries: ["US", "GB", "CA", "AU", "AE", "QA", "PK"],

  // ---- Trust / marketing copy ----
  trustBadges: [
    "Secure checkout",
    "Worldwide shipping",
    "30-day easy returns",
    "24/7 support",
  ],
} as const;

/** Public site URL (used for canonical URLs, sitemap, OG). */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export type SiteConfig = typeof siteConfig;
