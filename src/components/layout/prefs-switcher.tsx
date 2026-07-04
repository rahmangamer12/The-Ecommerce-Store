"use client";

import { useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { usePrefs } from "@/components/providers/prefs-provider";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function PrefsSwitcher() {
  const { currency, setCurrency, locale, setLocale, mounted } = usePrefs();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full px-2 py-2 text-sm font-medium text-ink-soft hover:bg-ink/5 sm:px-2.5"
        aria-label="Currency and language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">
          {mounted ? currency : siteConfig.currency} · {locale.toUpperCase()}
        </span>
        <ChevronDown className="hidden h-3.5 w-3.5 sm:block" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-card p-3 shadow-luxe-lg">
            {/* Language */}
            <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">
              Language
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {(["en", "ar"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    locale === l ? "bg-ink text-paper" : "hover:bg-ink/5",
                  )}
                >
                  {l === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>

            {/* Currency */}
            <p className="mt-4 px-1 text-xs font-semibold uppercase tracking-wider text-muted">
              Currency
            </p>
            <div className="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
              {siteConfig.currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-ink/5"
                >
                  {c.code}
                  {currency === c.code && <Check className="h-4 w-4 text-gold-strong" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
