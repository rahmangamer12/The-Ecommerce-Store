"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronDown, Truck, Loader2, CheckCircle2, AlertTriangle, Phone, MessageCircle } from "lucide-react";
import type { OrderView } from "@/lib/order-queries";
import { updateOrderStatus } from "@/lib/order-actions";
import { sendOrderToCj } from "@/lib/cj-fulfillment";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const statuses = [
  "pending",
  "paid",
  "processing",
  "purchased",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

// Human labels for how the customer chose to pay.
const PAYMENT_LABELS: Record<string, string> = {
  bank: "Bank transfer",
  whatsapp: "WhatsApp",
  cod: "Cash on Delivery",
  paypal: "PayPal",
  card: "Card (online)",
};

/** Digits-only phone for tel:/wa.me links. */
function cleanPhone(p?: string) {
  return (p ?? "").replace(/[^\d]/g, "");
}

// One order row with an expandable panel + a real status updater (Supabase).
export function AdminOrderRow({ order }: { order: OrderView }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [fulfillment, setFulfillment] = useState(order.fulfillmentStatus);
  const [cjOrderId, setCjOrderId] = useState(order.cjOrderId);
  const [sending, setSending] = useState(false);

  async function onStatusChange(next: string) {
    setStatus(next);
    setSaving(true);
    const res = await updateOrderStatus(order.id, next);
    setSaving(false);
    if (res.ok) toast.success(`Order ${order.number} → ${next}`);
    else {
      toast.error(res.error ?? "Could not update");
      setStatus(order.status);
    }
  }

  async function onSendToCj() {
    setSending(true);
    const res = await sendOrderToCj(order.id);
    setSending(false);
    setFulfillment(res.status);
    if (res.ok && res.status === "sent") {
      setCjOrderId(res.cjOrderId);
      if (res.cjOrderId) setStatus("purchased");
      toast.success(`Sent to CJ — order ${res.cjOrderId ?? ""}`.trim());
    } else if (res.status === "skipped") {
      toast.info(res.error ?? "No CJ items in this order.");
    } else {
      toast.error(res.error ?? "Could not send to CJ.");
    }
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
              <div className="lg:col-span-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Items</p>
                <ul className="space-y-3">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {item.image && (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-paper-2">
                          <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                        </div>
                      )}
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

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Ship to</p>
                <div className="text-sm text-ink-soft">
                  <p className="font-medium text-ink">{order.address?.fullName ?? order.customerName}</p>
                  {order.address?.line1 && <p>{order.address.line1}</p>}
                  {order.address?.city && <p>{order.address.city}, {order.address.zip}</p>}
                  {order.address?.country && <p>{order.address.country}</p>}
                  <p className="mt-1">{order.customerEmail}</p>
                </div>

                {/* Payment method — so you can spot bank/WhatsApp orders that
                    need you to confirm payment before shipping. */}
                {order.paymentMethod && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
                    Paid via {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                  </p>
                )}

                {/* Phone — call or WhatsApp the customer directly. Essential for
                    bank transfer & WhatsApp orders. */}
                {order.address?.phone && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-ink">{order.address.phone}</p>
                    <div className="mt-1.5 flex gap-2">
                      <a
                        href={`tel:${cleanPhone(order.address.phone)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-gold"
                      >
                        <Phone className="h-3.5 w-3.5" /> Call
                      </a>
                      <a
                        href={`https://wa.me/${cleanPhone(order.address.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
                  Update status {saving && "…"}
                </p>
                <select
                  value={status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onStatusChange(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-gold focus-visible:outline-none"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-muted">
                  Manual fulfilment: buy from supplier, then set “Purchased” → “Shipped”.
                </p>

                {/* CJ Dropshipping fulfilment */}
                <div className="mt-5 rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      CJ Dropshipping
                    </p>
                    {fulfillment === "sent" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                      </span>
                    ) : fulfillment === "failed" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-danger">
                        <AlertTriangle className="h-3.5 w-3.5" /> Failed
                      </span>
                    ) : fulfillment === "skipped" ? (
                      <span className="text-xs text-muted">No CJ items</span>
                    ) : (
                      <span className="text-xs text-muted">Not sent</span>
                    )}
                  </div>

                  {cjOrderId && (
                    <p className="mt-2 text-xs text-ink-soft">
                      CJ order: <span className="font-medium">{cjOrderId}</span>
                    </p>
                  )}
                  {order.trackingNumber && (
                    <p className="mt-1 text-xs text-ink-soft">
                      Tracking: <span className="font-medium">{order.trackingNumber}</span>
                    </p>
                  )}

                  {fulfillment !== "sent" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendToCj();
                      }}
                      disabled={sending}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-gold-strong disabled:opacity-60"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Truck className="h-4 w-4" />
                      )}
                      {fulfillment === "failed" ? "Retry send to CJ" : "Send to CJ"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
