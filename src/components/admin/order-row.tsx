"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const statuses: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "purchased",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

// One order row with an expandable panel + a status updater.
// (Updates are local/demo; wire to a server action + Supabase to persist.)
export function AdminOrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order.status);

  function updateStatus(next: OrderStatus) {
    setStatus(next);
    toast.success(`Order ${order.number} → ${next}`);
  }

  return (
    <>
      <tr className="cursor-pointer hover:bg-ink/[0.02]" onClick={() => setOpen((v) => !v)}>
        <td className="px-4 py-3 font-medium">{order.number}</td>
        <td className="px-4 py-3 text-ink-soft">{order.customerName}</td>
        <td className="px-4 py-3 text-ink-soft">{formatDate(order.date)}</td>
        <td className="px-4 py-3"><OrderStatusBadge status={status} /></td>
        <td className="px-4 py-3 text-right font-medium">
          {formatPrice(order.total, siteConfig.currency)}
        </td>
        <td className="px-4 py-3 text-right">
          <ChevronDown className={`inline h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </td>
      </tr>
      {open && (
        <tr className="bg-paper-2/50">
          <td colSpan={6} className="px-4 py-5">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Items */}
              <div className="lg:col-span-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  Items
                </p>
                <ul className="space-y-3">
                  {order.items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-paper-2">
                        <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted">Qty {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity, siteConfig.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ship to + status control */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  Ship to
                </p>
                <div className="text-sm text-ink-soft">
                  <p className="font-medium text-ink">{order.address.fullName}</p>
                  <p>{order.address.line1}</p>
                  <p>{order.address.city}, {order.address.zip}</p>
                  <p>{order.address.country}</p>
                </div>

                <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
                  Update status
                </p>
                <select
                  value={status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateStatus(e.target.value as OrderStatus)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-gold focus-visible:outline-none"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-muted">
                  Manual fulfilment: buy from supplier, then set “Purchased” →
                  “Shipped”.
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
