// -------------------------------------------------------------
//  Country name → ISO 3166-1 alpha-2 code.
//  CJ (and most fulfilment APIs) require the 2-letter code
//  (e.g. "PK"), but the checkout stores full names ("Pakistan").
//  This converts either form to a code.
// -------------------------------------------------------------

const NAME_TO_CODE: Record<string, string> = {
  pakistan: "PK",
  india: "IN",
  bangladesh: "BD",
  "sri lanka": "LK",
  nepal: "NP",
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  "great britain": "GB",
  canada: "CA",
  australia: "AU",
  "new zealand": "NZ",
  ireland: "IE",
  germany: "DE",
  france: "FR",
  spain: "ES",
  italy: "IT",
  netherlands: "NL",
  belgium: "BE",
  switzerland: "CH",
  austria: "AT",
  sweden: "SE",
  norway: "NO",
  denmark: "DK",
  finland: "FI",
  portugal: "PT",
  poland: "PL",
  "czech republic": "CZ",
  greece: "GR",
  turkey: "TR",
  "united arab emirates": "AE",
  uae: "AE",
  "saudi arabia": "SA",
  qatar: "QA",
  kuwait: "KW",
  bahrain: "BH",
  oman: "OM",
  jordan: "JO",
  lebanon: "LB",
  egypt: "EG",
  morocco: "MA",
  "south africa": "ZA",
  nigeria: "NG",
  kenya: "KE",
  china: "CN",
  "hong kong": "HK",
  japan: "JP",
  "south korea": "KR",
  korea: "KR",
  singapore: "SG",
  malaysia: "MY",
  indonesia: "ID",
  thailand: "TH",
  vietnam: "VN",
  philippines: "PH",
  brazil: "BR",
  mexico: "MX",
  argentina: "AR",
  chile: "CL",
  russia: "RU",
};

/**
 * Return a 2-letter country code for a country name or code.
 * Accepts an existing 2-letter code (passed through), a known name,
 * or falls back to the first 2 letters uppercased as a last resort.
 */
export function toCountryCode(input?: string | null): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  // Already a 2-letter code.
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  const hit = NAME_TO_CODE[raw.toLowerCase()];
  if (hit) return hit;
  // Last resort — better than sending the full name, but log-worthy.
  return raw.slice(0, 2).toUpperCase();
}
