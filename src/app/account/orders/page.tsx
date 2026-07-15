import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { getOrdersForUser } from "@/lib/order-queries";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { getT, getLocale } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function OrderHistoryPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  const orders = await getOrdersForUser(user?.id, email);
  const t = getT(await getLocale());

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-paper-2">
          <Package className="h-7 w-7 text-muted" />
        </div>
        <h2 className="mt-5 font-display text-xl font-semibold">{t("acct.noOrdersTitle")}</h2>
        <p className="mt-2 max-w-xs text-sm text-muted">
          {t("acct.noOrdersDesc")}
        </p>
        <Link
          href="/shop"
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper"
        >
          {t("cart.startShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold">{t("acct.orderHistory")}</h2>
      {orders.map((order) => (
        <div key={order.id} className="overflow-hidden rounded-2xl border border-border">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-paper-2 px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              <span>
                <span className="text-muted">{t("acct.orderPrefix")} </span>
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
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                {item.image && (
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-paper-2">
                    <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted">{t("acct.qty")} {item.quantity}</p>
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
