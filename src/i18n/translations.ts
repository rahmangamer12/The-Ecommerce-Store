// UI string dictionaries. English is the source of truth (src/i18n/locales/en.ts);
// every other locale is a Record<TranslationKey, string> so a missing key fails
// the build. Add a new language by dropping a file in ./locales and wiring it in
// ./keys.ts (Locale union + names) and the `translations` map below.

import { en } from "./locales/en";
import { ar } from "./locales/ar";
import { hi } from "./locales/hi";
import { ur } from "./locales/ur";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { zh } from "./locales/zh";
import { ru } from "./locales/ru";
import { pt } from "./locales/pt";
import { de } from "./locales/de";
import { ja } from "./locales/ja";
import { tr } from "./locales/tr";
import type { Locale, TranslationKey } from "./keys";

export type { Locale, TranslationKey } from "./keys";
export {
  RTL_LOCALES,
  LOCALE_NAMES,
  INTL_LOCALE,
  LOCALES,
  isLocale,
} from "./keys";

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  ar,
  hi,
  ur,
  es,
  fr,
  zh,
  ru,
  pt,
  de,
  ja,
  tr,
};
