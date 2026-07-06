"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Package,
  CreditCard,
  Cog,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Search,
} from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { trackOrder, type TrackedOrder } from "@/lib/order-actions";

const STEPS = [
  { key: "paid", label: "Payment confirmed", icon: CreditCard },
  { key: "processing", label: "Processing", icon: Cog },
  { key: "purchased", label: "Sourced from supplier", icon: ShoppingBag },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function stepIndex(status: string): number {
  if (status === "pending") return 0;
  const i = STEPS.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

export function TrackOrderView() {
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);

  // Pre-fill the order number when arriving from the order-success page
  // (…/track-order?order=LX-123), so guests just add their email.
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("order");
    if (n) setNumber(n.toUpperCase());
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await trackOrder({ number, email });
      if (res.found) {
        setOrder(res.order);
      } else {
        setOrder(null);
        toast.error(res.error ?? "Order not found");
      }
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  const cancelled = order?.status === "cancelled" || order?.status === "refunded";
  const current = order ? stepIndex(order.status) : 0;

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="number">Order number</Label>
            <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="LX-100248" required />
          </div>
          <div>
            <Label htmlFor="email">Email used at checkout</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-paper transition-colors hover:bg-gold hover:text-white disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {loading ? "Searching…" : "Track order"}
        </button>
        <p className="mt-3 text-xs text-muted">
          Your order number is in your confirmation email (e.g. LX-100xxx).
        </p>
      </form>

      {searched && !order && (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-ink-soft">
          <Package className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 font-medium">No order found</p>
          <p className="mt-1 text-sm">Double-check the order number and email.</p>
        </div>
      )}

      {order && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <p className="text-sm text-muted">Order</p>
              <p className="font-display text-xl font-semibold">{order.number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Placed</p>
              <p className="font-medium">{formatDate(order.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Total</p>
              <p className="font-medium">{formatPrice(order.total, siteConfig.currency)}</p>
            </div>
          </div>

          {cancelled ? (
            <div className="mt-6 rounded-xl bg-danger/10 p-4 text-center text-sm font-medium text-danger">
              This order was {order.status}.
            </div>
          ) : (
            <ol className="mt-8 space-y-6">
              {STEPS.map((step, i) => {
                const done = i <= current;
                const active = i === current;
                return (
                  <li key={step.key} className="flex items-start gap-4">
                    <div
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-colors",
                        done
                          ? "border-gold bg-gold text-white"
                          : "border-border bg-card text-muted",
                      )}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="pt-1.5">
                      <p className={cn("font-medium", done ? "text-ink" : "text-muted")}>
                        {step.label}
                      </p>
                      {active && (
                        <p className="text-sm text-gold-strong">In progress</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
