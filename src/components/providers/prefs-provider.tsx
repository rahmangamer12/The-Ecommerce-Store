"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { translations, type Locale, type TranslationKey } from "@/i18n/translations";

type PrefsState = {
  currency: string;
  setCurrency: (code: string) => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  formatPrice: (baseAmount: number) => string;
  t: (key: TranslationKey) => string;
  mounted: boolean;
};

const PrefsContext = createContext<PrefsState | null>(null);

const LS_CUR = "souq.currency";
const LS_LOC = "souq.locale";

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currency, setCurrencyState] = useState<string>(siteConfig.currency);
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  // Load saved prefs once.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const c = window.localStorage.getItem(LS_CUR);
      const l = window.localStorage.getItem(LS_LOC) as Locale | null;
      if (c) setCurrencyState(c);
      if (l === "ar" || l === "en") setLocaleState(l);
    } catch {}
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Apply text direction + lang to <html> whenever locale changes.
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale, mounted]);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    try {
      window.localStorage.setItem(LS_CUR, code);
    } catch {}
  }, []);

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l);
      try {
        window.localStorage.setItem(LS_LOC, l);
        // Cookie so SERVER components can render in the right language.
        document.cookie = `${LS_LOC}=${l}; path=/; max-age=31536000; samesite=lax`;
      } catch {}
      // Re-render server components in the new language.
      router.refresh();
    },
    [router],
  );

  const formatPrice = useCallback(
    (baseAmount: number) => {
      const cur =
        siteConfig.currencies.find((c) => c.code === currency) ??
        siteConfig.currencies[0];
      const value = baseAmount * cur.rate;
      try {
        return new Intl.NumberFormat(locale === "ar" ? "ar-QA" : "en-US", {
          style: "currency",
          currency: cur.code,
          minimumFractionDigits: value % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        }).format(value);
      } catch {
        return `${cur.code} ${value.toFixed(2)}`;
      }
    },
    [currency, locale],
  );

  const t = useCallback(
    (key: TranslationKey) => translations[locale][key] ?? translations.en[key] ?? key,
    [locale],
  );

  return (
    <PrefsContext.Provider
      value={{ currency, setCurrency, locale, setLocale, formatPrice, t, mounted }}
    >
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used within <PrefsProvider>");
  return ctx;
}
