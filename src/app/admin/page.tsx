import Link from "next/link";
import Image from "next/image";
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
import { sampleOrders } from "@/data/orders";
import { getBestsellers } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const revenueData = [
  { name: "Jan", revenue: 8400 },
  { name: "Feb", revenue: 9600 },
  { name: "Mar", revenue: 11200 },
  { name: "Apr", revenue: 10400 },
  { name: "May", revenue: 14200 },
  { name: "Jun", revenue: 16850 },
];

export default function AdminOverview() {
  const totalRevenue = sampleOrders.reduce((s, o) => s + o.total, 0) + 12500;
  const uniqueCustomers = new Set(sampleOrders.map((o) => o.customerEmail)).size;

  const statusCounts = sampleOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  const donut = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const topProducts = getBestsellers(4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          A snapshot of your store&apos;s performance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total revenue" value={formatPrice(totalRevenue, siteConfig.currency)} delta="12.4%" />
        <StatCard icon={ShoppingCart} label="Orders" value={`${sampleOrders.length + 248}`} delta="8.1%" />
        <StatCard icon={Users} label="Customers" value={`${uniqueCustomers + 1240}`} delta="5.3%" />
        <StatCard icon={TrendingUp} label="Conversion" value="3.8%" delta="0.6%" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-semibold">Revenue</h2>
          <p className="text-sm text-muted">Last 6 months</p>
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

      {/* Recent orders + top products */}
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
                {sampleOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-medium">{o.number}</td>
                    <td className="py-3 text-ink-soft">{o.customerName}</td>
                    <td className="py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="py-3 text-right font-medium">
                      {formatPrice(o.total, siteConfig.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Top products</h2>
          <ul className="mt-4 space-y-4">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-4 text-sm font-semibold text-muted">{i + 1}</span>
                <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-paper-2">
                  <Image src={p.images[0]} alt={p.name} fill sizes="44px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted">{formatPrice(p.price, p.currency)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
