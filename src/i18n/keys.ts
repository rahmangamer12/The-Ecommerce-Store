import { en } from "./locales/en";

// The English dictionary is the single source of truth for the key set.
// Every other locale is typed `Record<TranslationKey, string>`, so TypeScript
// refuses to build if a locale is missing (or misspells) any key.
export type TranslationKey = keyof typeof en;

export type Locale =
  | "en"
  | "ar"
  | "hi"
  | "ur"
  | "es"
  | "fr"
  | "zh"
  | "ru"
  | "pt"
  | "de"
  | "ja"
  | "tr";

/** Locales that read right-to-left (drive <html dir="rtl">). */
export const RTL_LOCALES: readonly Locale[] = ["ar", "ur"];

/** Native language name shown in the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  hi: "हिन्दी",
  ur: "اردو",
  es: "Español",
  fr: "Français",
  zh: "中文",
  ru: "Русский",
  pt: "Português",
  de: "Deutsch",
  ja: "日本語",
  tr: "Türkçe",
};

/** BCP-47 tags used by Intl for currency/number formatting. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-US",
  ar: "ar",
  hi: "hi-IN",
  ur: "ur-PK",
  es: "es-ES",
  fr: "fr-FR",
  zh: "zh-CN",
  ru: "ru-RU",
  pt: "pt-PT",
  de: "de-DE",
  ja: "ja-JP",
  tr: "tr-TR",
};

/** All supported locales, in switcher order. */
export const LOCALES = Object.keys(LOCALE_NAMES) as Locale[];

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as string[]).includes(v);
}
