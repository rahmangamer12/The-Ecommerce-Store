import Link from "next/link";
import { Package, Heart, MapPin, ArrowRight } from "lucide-react";
import { sampleOrders } from "@/data/orders";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export default function AccountOverview() {
  const recent = sampleOrders.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Package, label: "Total orders", value: sampleOrders.length },
          { icon: Heart, label: "Wishlist items", value: "—", note: "View" },
          { icon: MapPin, label: "Saved addresses", value: 2 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <s.icon className="h-5 w-5 text-gold-strong" />
            <p className="mt-3 font-display text-2xl font-semibold">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent orders</h2>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-strong hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-2 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((o) => (
                <tr key={o.id} className="hover:bg-ink/[0.02]">
                  <td className="px-5 py-4 font-medium">{o.number}</td>
                  <td className="px-5 py-4 text-ink-soft">{formatDate(o.date)}</td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-4 text-right font-medium">
                    {formatPrice(o.total, siteConfig.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
