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
  name: "Souq Al Qatar",
  legalName: "Souq Al Qatar",
  // Short tagline shown in the hero / SEO
  tagline: "Qatar's home for everything you love",
  description:
    "Souq Al Qatar is an online store for shoppers in Qatar. Discover great products across tech, home, fashion, beauty and more — with fast delivery and Cash on Delivery.",
  // Logo: an emoji/letter mark by default. Replace `logoText` or set `logoImage`.
  logoText: "Souq Al Qatar",
  logoMark: "S",
  logoImage: "", // e.g. "/logo.svg" (leave empty to use the text mark)

  // ---- Contact ----
  supportEmail: "islamic.official.content.creator@gmail.com",
  whatsapp: "+92 320 9203728", // shown in UI
  whatsappNumber: "923209203728", // wa.me format, no + or spaces
  // Formspree form ID for the contact form (formspree.io). The form works
  // immediately with this ID — change it to your own Formspree form.
  formspreeId: "mwvdqvkn",

  // ---- Which payment methods to show at checkout ----
  // (Card also needs MYFATOORAH_API_KEY set to actually appear.)
  // COD is OFF by default: in dropshipping the cash goes to the courier,
  // not you — so prefer prepaid methods (WhatsApp / bank / card).
  payments: {
    card: true,
    whatsapp: true,
    bank: true,
    cod: false,
  },

  // ---- Bank details (shown for the "Bank Transfer" payment option) ----
  bank: {
    name: "Your Bank Name", // e.g. Qatar National Bank (QNB)
    accountName: "Sheeraz",
    iban: "QA00 0000 0000 0000 0000 0000 000", // replace with your real IBAN
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
  // Base currency: all product prices are stored in THIS currency.
  currency: "QAR",
  currencySymbol: "QAR",
  locale: "en-US",
  // Currencies the shopper can switch between. `rate` = how much 1 base
  // currency (QAR) is worth in that currency (approximate — edit anytime).
  currencies: [
    { code: "QAR", rate: 1 },
    { code: "USD", rate: 0.2747 },
    { code: "AED", rate: 1.009 },
    { code: "SAR", rate: 1.03 },
    { code: "GBP", rate: 0.216 },
    { code: "PKR", rate: 76.5 },
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
