"use client";

import { useEffect, useState } from "react";

// Live "online now" badge — polls /api/online every 20s.
export function OnlineNow() {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/online", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => active && setN(typeof d.online === "number" ? d.online : 0))
        .catch(() => {});
    load();
    const id = window.setInterval(load, 20_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
      </span>
      <span className="text-sm font-medium">
        {n === null ? "…" : n} online now
      </span>
    </div>
  );
}
