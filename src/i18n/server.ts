import { cookies } from "next/headers";
import { translations, type Locale, type TranslationKey } from "./translations";
import { isLocale } from "./keys";

/** Read the visitor's chosen language from the cookie (server-side). */
export async function getLocale(): Promise<Locale> {
  try {
    const c = await cookies();
    const v = c.get("souq.locale")?.value;
    return isLocale(v) ? v : "en";
  } catch {
    return "en";
  }
}

/** Returns a translate function for a given locale (use in server components). */
export function getT(locale: Locale) {
  return (key: TranslationKey): string =>
    translations[locale][key] ?? translations.en[key] ?? key;
}
