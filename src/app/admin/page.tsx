import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueAreaChart, StatusDonut } from "@/components/admin/charts";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { getAllOrders } from "@/lib/order-queries";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function AdminOverview() {
  const orders = await getAllOrders();

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const uniqueCustomers = new Set(orders.map((o) => o.customerEmail)).size;

  // Status breakdown for the donut.
  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  const donut = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Revenue grouped by month label.
  const byMonth: Record<string, number> = {};
  for (const o of orders) {
    const d = new Date(o.date);
    if (!isNaN(d.getTime())) {
      const key = MONTHS[d.getMonth()];
      byMonth[key] = (byMonth[key] ?? 0) + o.total;
    }
  }
  const revenueData = Object.entries(byMonth).map(([name, revenue]) => ({
    name,
    revenue: Math.round(revenue),
  }));

  // Top products from real order items.
  const productCount: Record<string, { name: string; qty: number }> = {};
  for (const o of orders) {
    for (const it of o.items) {
      const k = it.name;
      productCount[k] = { name: it.name, qty: (productCount[k]?.qty ?? 0) + it.quantity };
    }
  }
  const topProducts = Object.values(productCount).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const hasData = orders.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted">A snapshot of your store&apos;s performance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total revenue" value={formatPrice(totalRevenue, siteConfig.currency)} />
        <StatCard icon={ShoppingCart} label="Orders" value={`${orders.length}`} />
        <StatCard icon={Users} label="Customers" value={`${uniqueCustomers}`} />
        <StatCard icon={TrendingUp} label="Avg. order" value={hasData ? formatPrice(totalRevenue / orders.length, siteConfig.currency) : "—"} />
      </div>

      {!hasData ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <p className="font-display text-xl font-semibold">No sales data yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Your revenue, orders and customer insights will appear here after your
            first sale. Add products and share your store to get started.
          </p>
          <Link href="/admin/products/new" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper">
            Add your first product
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <h2 className="font-semibold">Revenue</h2>
              <p className="text-sm text-muted">By month</p>
              <div className="mt-4">
                <RevenueAreaChart data={revenueData} />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold">Orders by status</h2>
              <p className="text-sm text-muted">Current pipeline</p>
              <div className="mt-4">
                <StatusDonut data={donut} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Recent orders</h2>
                <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-gold-strong hover:underline">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="pb-3 font-medium">Order</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.slice(0, 6).map((o) => (
                      <tr key={o.id}>
                        <td className="py-3 font-medium">{o.number}</td>
                        <td className="py-3 text-ink-soft">{o.customerName}</td>
                        <td className="py-3"><OrderStatusBadge status={o.status} /></td>
                        <td className="py-3 text-right font-medium">{formatPrice(o.total, siteConfig.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold">Top products</h2>
              <ul className="mt-4 space-y-3">
                {topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="w-4 text-sm font-semibold text-muted">{i + 1}</span>
                    <p className="line-clamp-1 flex-1 text-sm font-medium">{p.name}</p>
                    <span className="text-sm text-muted">{p.qty} sold</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
