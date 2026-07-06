"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires a lightweight page-view ping to /api/track on every page. An anonymous
// session id (localStorage) lets the admin count unique visitors. Admin pages
// are skipped so the owner's own browsing doesn't pollute the stats.
const SID_KEY = "souq.sid";

// Don't track the owner's admin/auth/account pages — only real storefront browsing.
function isPrivate(path: string) {
  return /^\/(admin|login|register|account|api)(\/|$)/.test(path);
}

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

  // Log a page view on every route (skips admin).
  useEffect(() => {
    if (!pathname || isPrivate(pathname)) return;
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

  // Heartbeat for the live "online now" count — ping every 45s while the tab
  // is visible. Mounted once (component lives in the root layout).
  useEffect(() => {
    const ping = () => {
      if (typeof document === "undefined") return;
      if (document.visibilityState !== "visible") return;
      if (isPrivate(window.location.pathname)) return;
      fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId() }),
        keepalive: true,
      }).catch(() => {});
    };
    ping();
    const id = window.setInterval(ping, 45_000);
    document.addEventListener("visibilitychange", ping);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", ping);
    };
  }, []);

  return null;
}
