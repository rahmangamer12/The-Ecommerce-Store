import { Monitor, Smartphone, Tablet, Users, Eye, Globe } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { OnlineNow } from "@/components/admin/online-now";
import { LiveVisitors } from "@/components/admin/live-visitors";

export const dynamic = "force-dynamic";

type View = {
  session_id: string | null;
  path: string | null;
  referrer: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  created_at: string;
};

function tally(rows: View[], key: keyof View, limit = 8) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const v = (r[key] as string | null)?.trim() || "Unknown";
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function prettyReferrer(r: string | null): string {
  if (!r) return "Direct / none";
  try {
    return new URL(r).hostname.replace(/^www\./, "");
  } catch {
    return r.slice(0, 40);
  }
}

const deviceIcon: Record<string, typeof Monitor> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

export default async function AdminVisitorsPage() {
  const admin = createAdminClient();

  let total = 0;
  let rows: View[] = [];
  if (admin) {
    const { count } = await admin
      .from("page_views")
      .select("*", { count: "exact", head: true });
    total = count ?? 0;
    const { data } = await admin
      .from("page_views")
      .select("session_id, path, referrer, device, browser, os, country, created_at")
      .order("created_at", { ascending: false })
      .limit(3000);
    rows = (data as View[]) ?? [];
  }

  const now = Date.now();
  const since = (ms: number) =>
    rows.filter((r) => now - new Date(r.created_at).getTime() < ms).length;
  const uniqueVisitors = new Set(rows.map((r) => r.session_id).filter(Boolean)).size;

  const devices = tally(rows, "device", 3);
  const browsers = tally(rows, "browser", 6);
  const oses = tally(rows, "os", 6);
  const pages = tally(rows, "path", 8);
  const referrers = new Map<string, number>();
  for (const r of rows) {
    const k = prettyReferrer(r.referrer);
    referrers.set(k, (referrers.get(k) ?? 0) + 1);
  }
  const topReferrers = [...referrers.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const countries = tally(rows, "country", 6);
  const recent = rows.slice(0, 30);
  const sampleMax = Math.max(rows.length, 1);

  const stats = [
    { icon: Eye, label: "Total page views", value: total },
    { icon: Users, label: "Unique visitors", value: uniqueVisitors, sub: "recent" },
    { icon: Eye, label: "Views (24h)", value: since(24 * 3600e3) },
    { icon: Eye, label: "Views (7 days)", value: since(7 * 24 * 3600e3) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Visitors</h1>
          <p className="mt-1 text-sm text-muted">
            Who&apos;s visiting your store — devices, pages and where they came from.
            Breakdowns use the most recent {rows.length.toLocaleString()} views.
          </p>
        </div>
        <OnlineNow />
      </div>

      {/* Live — always shown, independent of historical data */}
      <LiveVisitors />

      {/* Stat cards — always shown (real totals) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <s.icon className="h-5 w-5 text-gold-strong" />
            <p className="mt-2 font-display text-2xl font-semibold sm:mt-3">
              {s.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted">
          Device, page and source breakdowns will appear here as people browse
          your live store.
        </div>
      ) : (
        <>
          {/* Devices */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card title="Devices">
              <div className="space-y-3">
                {devices.map(([name, n]) => {
                  const Icon = deviceIcon[name] ?? Monitor;
                  return (
                    <Bar
                      key={name}
                      label={
                        <span className="inline-flex items-center gap-2 capitalize">
                          <Icon className="h-4 w-4 text-gold-strong" /> {name}
                        </span>
                      }
                      value={n}
                      max={sampleMax}
                    />
                  );
                })}
              </div>
            </Card>
            <Card title="Browsers">
              <div className="space-y-3">
                {browsers.map(([name, n]) => (
                  <Bar key={name} label={name} value={n} max={sampleMax} />
                ))}
              </div>
            </Card>
            <Card title="Operating system">
              <div className="space-y-3">
                {oses.map(([name, n]) => (
                  <Bar key={name} label={name} value={n} max={sampleMax} />
                ))}
              </div>
            </Card>
          </div>

          {/* Pages / referrers / countries */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card title="Top pages">
              <ul className="space-y-2 text-sm">
                {pages.map(([p, n]) => (
                  <li key={p} className="flex items-center justify-between gap-3">
                    <span className="truncate text-ink-soft">{p}</span>
                    <span className="font-medium">{n}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Came from">
              <ul className="space-y-2 text-sm">
                {topReferrers.map(([r, n]) => (
                  <li key={r} className="flex items-center justify-between gap-3">
                    <span className="truncate text-ink-soft">{r}</span>
                    <span className="font-medium">{n}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Countries">
              <ul className="space-y-2 text-sm">
                {countries.map(([c, n]) => (
                  <li key={c} className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-ink-soft">
                      <Globe className="h-3.5 w-3.5" /> {c}
                    </span>
                    <span className="font-medium">{n}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Recent visits */}
          <Card title="Recent visits">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="py-2 pr-4 font-medium">When</th>
                    <th className="py-2 pr-4 font-medium">Page</th>
                    <th className="py-2 pr-4 font-medium">Device</th>
                    <th className="py-2 pr-4 font-medium">Browser</th>
                    <th className="py-2 pr-4 font-medium">OS</th>
                    <th className="py-2 font-medium">Country</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recent.map((r, i) => (
                    <tr key={i}>
                      <td className="whitespace-nowrap py-2.5 pr-4 text-ink-soft">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="max-w-[160px] truncate py-2.5 pr-4">{r.path}</td>
                      <td className="py-2.5 pr-4 capitalize">{r.device}</td>
                      <td className="py-2.5 pr-4">{r.browser}</td>
                      <td className="py-2.5 pr-4">{r.os}</td>
                      <td className="py-2.5">{r.country ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Bar({
  label,
  value,
  max,
}: {
  label: React.ReactNode;
  value: number;
  max: number;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="font-medium">
          {value} <span className="text-xs text-muted">({pct}%)</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-2">
        <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
