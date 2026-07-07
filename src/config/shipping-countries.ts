// -------------------------------------------------------------
//  Countries you SHIP TO (where CJ / your supplier reliably
//  delivers). At checkout the customer can only pick from these,
//  so you never receive an order you can't fulfil — no "no
//  shipping method available" surprises, no forced refunds.
//
//  Add or remove ISO alpha-2 codes as your coverage changes.
// -------------------------------------------------------------
export const SHIPPING_COUNTRY_CODES: string[] = [
  // North America
  "US", "CA", "MX",
  // UK & Ireland
  "GB", "IE",
  // Europe
  "DE", "FR", "IT", "ES", "NL", "BE", "AT", "CH", "SE", "NO", "DK", "FI",
  "PT", "PL", "CZ", "GR", "HU", "RO", "SK", "LU", "IS", "HR", "BG",
  // Oceania
  "AU", "NZ",
  // Gulf & Middle East
  "AE", "SA", "QA", "KW", "BH", "OM", "JO", "IL", "TR",
  // South & Southeast Asia
  "PK", "IN", "BD", "LK", "NP", "MY", "SG", "PH", "ID", "TH", "VN",
  // East Asia
  "JP", "KR", "HK", "TW",
  // Africa & LatAm (major markets)
  "BR", "ZA", "EG", "MA", "NG", "KE",
];

export const SHIPPING_COUNTRY_SET = new Set(SHIPPING_COUNTRY_CODES);
