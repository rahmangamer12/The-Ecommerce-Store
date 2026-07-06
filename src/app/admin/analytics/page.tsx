import { Eye, Users, ShoppingBag, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueAreaChart, CategoryBarChart } from "@/components/admin/charts";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

type OrderRow = { total: number | null; status: string | null; created_at: string };
type ViewRow = {
  session_id: string | null;
  referrer: string | null;
  device: string | null;
  created_at: string;
};

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}
function dayLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function prettyReferrer(r: string | null): string {
  if (!r) return "Direct / none";
  try {
    return new URL(r).hostname.replace(/^www\./, "");
  } catch {
    return r.slice(0, 40);
  }
}

export default async function AdminAnalyticsPage() {
  const admin = createAdminClient();
  let orders: OrderRow[] = [];
  let views: ViewRow[] = [];
  let totalViews = 0;

  if (admin) {
    const [{ data: o }, { data: v }, { count }] = await Promise.all([
      admin.from("orders").select("total, status, created_at").order("created_at", { ascending: false }).limit(5000),
      admin.from("page_views").select("session_id, referrer, device, created_at").order("created_at", { ascending: false }).limit(5000),
      admin.from("page_views").select("*", { count: "exact", head: true }),
    ]);
    orders = (o as OrderRow[]) ?? [];
    views = (v as ViewRow[]) ?? [];
    totalViews = count ?? 0;
  }

  // ---- Real metrics ----
  const paidLike = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
  const totalRevenue = paidLike.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const orderCount = orders.length;
  const sessions = new Set(views.map((v) => v.session_id).filter(Boolean)).size;
  const conversion = sessions > 0 ? (orderCount / sessions) * 100 : 0;
  const money = (n: number) =>
    `${siteConfig.currencySymbol}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  // ---- Revenue over the last 14 days (real orders) ----
  const days: { name: string; revenue: number }[] = [];
  const byDay = new Map<string, number>();
  for (const o of paidLike) {
    const k = dayKey(new Date(o.created_at));
    byDay.set(k, (byDay.get(k) ?? 0) + Number(o.total ?? 0));
  }
  const base = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    days.push({ name: dayLabel(d), revenue: Math.round(byDay.get(dayKey(d)) ?? 0) });
  }

  // ---- Visitors by device (real) ----
  const deviceMap = new Map<string, number>();
  for (const v of views) {
    const k = (v.device ?? "unknown").replace(/^./, (c) => c.toUpperCase());
    deviceMap.set(k, (deviceMap.get(k) ?? 0) + 1);
  }
  const deviceData = [...deviceMap.entries()].map(([name, value]) => ({ name, value }));

  // ---- Traffic sources (real referrers) ----
  const refMap = new Map<string, number>();
  for (const v of views) {
    const k = prettyReferrer(v.referrer);
    refMap.set(k, (refMap.get(k) ?? 0) + 1);
  }
  const refTotal = views.length || 1;
  const trafficSources = [...refMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([source, n]) => ({ source, pct: Math.round((n / refTotal) * 100), visits: n }));

  const hasData = orders.length > 0 || views.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted">
          Your real store performance — revenue, orders and traffic.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Revenue" value={money(totalRevenue)} />
        <StatCard icon={ShoppingBag} label="Orders" value={orderCount.toLocaleString()} />
        <StatCard icon={Users} label="Sessions (recent)" value={sessions.toLocaleString()} />
        <StatCard icon={Eye} label="Page views" value={totalViews.toLocaleString()} />
      </div>

      {!hasData && (
        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted">
          No orders or visits yet — these charts fill in with real data as people
          shop and browse your live store.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Revenue</h2>
          <p className="text-sm text-muted">Last 14 days · conversion {conversion.toFixed(1)}%</p>
          <div className="mt-4">
            <RevenueAreaChart data={days} />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Visitors by device</h2>
          <p className="text-sm text-muted">From recent page views</p>
          <div className="mt-4">
            {deviceData.length ? (
              <CategoryBarChart data={deviceData} />
            ) : (
              <p className="py-10 text-center text-sm text-muted">No visits yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Traffic sources</h2>
        <p className="text-sm text-muted">Where your visitors came from</p>
        <div className="mt-5 space-y-4">
          {trafficSources.length === 0 && (
            <p className="text-sm text-muted">No visits recorded yet.</p>
          )}
          {trafficSources.map((t) => (
            <div key={t.source}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{t.source}</span>
                <span className="text-muted">
                  {t.pct}% · {t.visits} visits
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-2">
                <div className="h-full rounded-full bg-gold" style={{ width: `${t.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
