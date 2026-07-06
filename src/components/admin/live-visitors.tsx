"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet, Globe } from "lucide-react";

type Visitor = {
  path: string | null;
  device: string | null;
  browser: string | null;
  country: string | null;
  secondsAgo: number;
};

const icon: Record<string, typeof Monitor> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

function ago(s: number) {
  if (s < 60) return `${s}s ago`;
  return `${Math.round(s / 60)}m ago`;
}

// Live list of who's on the site right now — refreshes every 15s.
export function LiveVisitors() {
  const [visitors, setVisitors] = useState<Visitor[] | null>(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/online", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => active && setVisitors(Array.isArray(d.visitors) ? d.visitors : []))
        .catch(() => {});
    load();
    const id = window.setInterval(load, 15_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
        </span>
        <h2 className="text-sm font-semibold">Who&apos;s online right now</h2>
      </div>

      {visitors === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : visitors.length === 0 ? (
        <p className="text-sm text-muted">
          No one on the site right now. This updates live as people visit.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {visitors.map((v, i) => {
            const Icon = icon[v.device ?? "desktop"] ?? Monitor;
            return (
              <li key={i} className="flex items-center gap-3 py-2.5 text-sm">
                <Icon className="h-4 w-4 shrink-0 text-gold-strong" />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {v.path || "/"}
                </span>
                <span className="hidden shrink-0 text-xs text-muted sm:inline">
                  {v.browser}
                </span>
                {v.country && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted">
                    <Globe className="h-3 w-3" /> {v.country}
                  </span>
                )}
                <span className="shrink-0 text-xs text-success">{ago(v.secondsAgo)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
