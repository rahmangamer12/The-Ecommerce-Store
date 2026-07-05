import { COUNTRIES } from "@/data/geo";

// -------------------------------------------------------------
//  Country name → ISO 3166-1 alpha-2 code.
//  CJ (and most fulfilment APIs) require the 2-letter code
//  (e.g. "PK"), but orders may store a full name ("Pakistan").
//  Backed by the full 250-country geo dataset.
// -------------------------------------------------------------

const NAME_TO_CODE = new Map(
  COUNTRIES.map((c) => [c.name.toLowerCase(), c.code]),
);

/**
 * Return a 2-letter country code for a country name or code.
 * Accepts an existing 2-letter code (passed through), any known country
 * name, or falls back to the first 2 letters uppercased as a last resort.
 */
export function toCountryCode(input?: string | null): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  return NAME_TO_CODE.get(raw.toLowerCase()) ?? raw.slice(0, 2).toUpperCase();
}
