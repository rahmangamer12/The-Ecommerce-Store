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
  name: "Luxora",
  legalName: "Luxora Commerce Ltd.",
  // Short tagline shown in the hero / SEO
  tagline: "The world's finest, curated for you",
  description:
    "Luxora is a premium global marketplace. Discover thoughtfully curated products across tech, home, fashion, beauty and more — delivered worldwide with white-glove care.",
  // Logo: an emoji/letter mark by default. Replace `logoText` or set `logoImage`.
  logoText: "Luxora",
  logoMark: "L",
  logoImage: "", // e.g. "/logo.svg" (leave empty to use the text mark)

  // ---- Contact ----
  supportEmail: "support@luxora.store",
  whatsapp: "+1 (555) 000-0000", // shown in UI
  whatsappNumber: "15550000000", // wa.me format, no + or spaces
  // Formspree form ID for the contact form (formspree.io). The form works
  // immediately with this ID — change it to your own Formspree form.
  formspreeId: "mwvdqvkn",

  // ---- Address ----
  address: {
    line1: "1 Commerce Avenue",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
  },

  // ---- Commerce settings ----
  currency: "USD",
  currencySymbol: "$",
  locale: "en-US",
  // Free shipping above this subtotal (in currency units). 0 = always charge.
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
