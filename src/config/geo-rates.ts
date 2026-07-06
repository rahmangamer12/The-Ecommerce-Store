import { siteConfig } from "@/config/site";

// -------------------------------------------------------------
//  Location-based tax & shipping.
//  Tax and shipping depend on where the SHOPPER is (their country),
//  not a single flat rate. Prices are stored in the base currency
//  (USD); these amounts are in that same base currency.
//
//  Keyed by ISO 3166-1 alpha-2 country code. Anything not listed
//  falls back to DEFAULT_RATE (which mirrors the site config, so
//  there's still one place to change the "rest of world" rate).
// -------------------------------------------------------------

export type GeoRate = {
  /** Tax rate as a decimal, e.g. 0.20 = 20% (VAT/GST/sales tax). */
  taxRate: number;
  /** Flat shipping charge in the base currency (USD). */
  shipping: number;
  /** Free shipping once the subtotal reaches this amount. */
  freeShippingThreshold: number;
};

const COUNTRY_RATES: Record<string, GeoRate> = {
  // ---- Gulf / Middle East ----
  QA: { taxRate: 0, shipping: 5, freeShippingThreshold: 80 },
  AE: { taxRate: 0.05, shipping: 5, freeShippingThreshold: 80 },
  SA: { taxRate: 0.15, shipping: 5, freeShippingThreshold: 80 },
  KW: { taxRate: 0, shipping: 5, freeShippingThreshold: 80 },
  BH: { taxRate: 0.1, shipping: 5, freeShippingThreshold: 80 },
  OM: { taxRate: 0.05, shipping: 5, freeShippingThreshold: 80 },

  // ---- South Asia ----
  PK: { taxRate: 0, shipping: 6, freeShippingThreshold: 60 },
  IN: { taxRate: 0.18, shipping: 6, freeShippingThreshold: 60 },
  BD: { taxRate: 0, shipping: 6, freeShippingThreshold: 60 },

  // ---- North America ----
  US: { taxRate: 0.07, shipping: 7, freeShippingThreshold: 75 },
  CA: { taxRate: 0.05, shipping: 8, freeShippingThreshold: 90 },

  // ---- Europe (VAT) ----
  GB: { taxRate: 0.2, shipping: 8, freeShippingThreshold: 90 },
  DE: { taxRate: 0.19, shipping: 8, freeShippingThreshold: 90 },
  FR: { taxRate: 0.2, shipping: 8, freeShippingThreshold: 90 },
  IT: { taxRate: 0.22, shipping: 8, freeShippingThreshold: 90 },
  ES: { taxRate: 0.21, shipping: 8, freeShippingThreshold: 90 },

  // ---- Oceania ----
  AU: { taxRate: 0.1, shipping: 10, freeShippingThreshold: 100 },
  NZ: { taxRate: 0.15, shipping: 10, freeShippingThreshold: 100 },
};

/** Global fallback (rest of world) — mirrors the site config values. */
export const DEFAULT_RATE: GeoRate = {
  taxRate: siteConfig.taxRate,
  shipping: siteConfig.shippingFlatRate,
  freeShippingThreshold: siteConfig.freeShippingThreshold,
};

/**
 * Rates for a destination country CODE (ISO alpha-2, e.g. "PK").
 * Falls back to the global default for unlisted countries.
 */
export function ratesForCode(code?: string | null): GeoRate {
  const cc = (code ?? "").trim().toUpperCase();
  return (cc && COUNTRY_RATES[cc]) || DEFAULT_RATE;
}
