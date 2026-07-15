"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { usePrefs } from "@/components/providers/prefs-provider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = usePrefs();
  useEffect(() => {
    // Log to your error reporting service here.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-3xl font-semibold">{t("err.title")}</h1>
      <p className="mt-3 text-ink-soft">
        {t("err.desc")}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold hover:text-white"
        >
          <RefreshCw className="h-4 w-4" /> {t("err.tryAgain")}
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:border-gold"
        >
          <Home className="h-4 w-4" /> {t("nf.backHome")}
        </Link>
      </div>
    </div>
  );
}
