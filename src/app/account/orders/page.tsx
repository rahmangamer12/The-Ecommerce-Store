import Image from "next/image";
import Link from "next/link";
import { sampleOrders } from "@/data/orders";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export default function OrderHistoryPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold">Order history</h2>
      {sampleOrders.map((order) => (
        <div key={order.id} className="overflow-hidden rounded-2xl border border-border">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-paper-2 px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              <span>
                <span className="text-muted">Order </span>
                <span className="font-semibold">{order.number}</span>
              </span>
              <span className="text-muted">{formatDate(order.date)}</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <span className="text-sm font-semibold">
              {formatPrice(order.total, siteConfig.currency)}
            </span>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 px-5 py-4">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-paper-2"
                >
                  <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                </Link>
                <div className="flex-1">
                  <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:text-gold-strong">
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity, siteConfig.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
