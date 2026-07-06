"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

// Simple, privacy-friendly cookie notice. Remembers the choice so it only
// shows once. "Decline" keeps only essential cookies (the default).
const KEY = "luxora.cookies";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(KEY)) setShow(true);
  }, []);

  function choose(value: "all" | "essential") {
    window.localStorage.setItem(KEY, value);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-luxe sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-strong">
          <Cookie className="h-5 w-5" />
        </span>
        <p className="flex-1 text-sm text-ink-soft">
          We use cookies to keep your cart, remember preferences and improve the
          store. See our{" "}
          <Link href="/privacy" className="font-medium text-gold-strong hover:underline">
            privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-ink/30"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-white shadow-gold transition-colors hover:bg-gold-strong"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
