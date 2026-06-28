import { Eye, MousePointerClick, ShoppingBag, Repeat } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueAreaChart, CategoryBarChart } from "@/components/admin/charts";
import { categories } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";

const revenueData = [
  { name: "Week 1", revenue: 3200 },
  { name: "Week 2", revenue: 4100 },
  { name: "Week 3", revenue: 3800 },
  { name: "Week 4", revenue: 5750 },
];

const trafficSources = [
  { source: "Organic search", pct: 42, visits: "18,420" },
  { source: "Direct", pct: 24, visits: "10,530" },
  { source: "Social", pct: 19, visits: "8,340" },
  { source: "Referral", pct: 9, visits: "3,950" },
  { source: "Email", pct: 6, visits: "2,630" },
];

export default function AdminAnalyticsPage() {
  // Category "performance" derived from catalogue depth (demo metric).
  const categoryData = categories.map((c) => ({
    name: c.name,
    value: getProductsByCategory(c.slug).reduce((s, p) => s + p.reviewCount, 0),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted">
          Conversion and traffic insights. Connect GA4 / Clarity in your env for
          live data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Eye} label="Sessions" value="43,870" delta="9.2%" />
        <StatCard icon={MousePointerClick} label="Add-to-cart rate" value="11.4%" delta="1.1%" />
        <StatCard icon={ShoppingBag} label="Conversion rate" value="3.8%" delta="0.4%" />
        <StatCard icon={Repeat} label="Repeat rate" value="28%" delta="2.3%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Revenue trend</h2>
          <p className="text-sm text-muted">This month</p>
          <div className="mt-4">
            <RevenueAreaChart data={revenueData} />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Engagement by category</h2>
          <p className="text-sm text-muted">Total reviews as a proxy for demand</p>
          <div className="mt-4">
            <CategoryBarChart data={categoryData} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Traffic sources</h2>
        <div className="mt-5 space-y-4">
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
