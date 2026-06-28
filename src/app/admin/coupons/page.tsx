import { Ticket } from "lucide-react";
import { coupons } from "@/data/coupons";
import { AddCouponButton } from "@/components/admin/add-coupon-button";

function describe(type: string, value: number) {
  if (type === "percent") return `${value}% off`;
  if (type === "fixed") return `$${value} off`;
  return "Free shipping";
}

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Coupons</h1>
          <p className="mt-1 text-sm text-muted">Create and manage discount codes.</p>
        </div>
        <AddCouponButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.code} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-paper-2 text-gold-strong">
                <Ticket className="h-5 w-5" />
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  c.active ? "bg-success/15 text-success" : "bg-muted/20 text-muted"
                }`}
              >
                {c.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-4 font-mono text-lg font-semibold tracking-wide">{c.code}</p>
            <p className="text-sm text-ink-soft">{describe(c.type, c.value)}</p>
            <p className="mt-2 text-xs text-muted">{c.description}</p>
            {c.minSubtotal && (
              <p className="mt-1 text-xs text-muted">Min. spend ${c.minSubtotal}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
