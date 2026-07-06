"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires a lightweight page-view ping to /api/track on every page. An anonymous
// session id (localStorage) lets the admin count unique visitors. Admin pages
// are skipped so the owner's own browsing doesn't pollute the stats.
const SID_KEY = "souq.sid";

function getSessionId(): string {
  try {
    let v = window.localStorage.getItem(SID_KEY);
    if (!v) {
      v = Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(SID_KEY, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    try {
      const body = JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        sessionId: getSessionId(),
      });
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
