"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag } from "lucide-react";
import { useStore, variantKeyOf } from "@/components/providers/store-provider";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export function CartView() {
  const {
    items,
    updateQty,
    removeItem,
    totals,
    coupon,
    applyCoupon,
    removeCoupon,
    mounted,
  } = useStore();
  const [code, setCode] = useState("");

  if (!mounted) return <div className="h-96" />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-paper-2">
          <ShoppingBag className="h-10 w-10 text-muted" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-semibold">Your cart is empty</h2>
        <p className="mt-2 max-w-sm text-ink-soft">
          Looks like you haven&apos;t added anything yet. Let&apos;s change that.
        </p>
        <Button href="/shop" variant="gold" size="lg" className="mt-7">
          Start shopping
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      {/* Items */}
      <div>
        <ul className="divide-y divide-border border-y border-border">
          {items.map((item) => {
            const key = variantKeyOf(item.variant);
            return (
              <li key={`${item.productId}-${key}`} className="flex gap-4 py-6">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-paper-2"
                >
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-medium hover:text-gold-strong"
                      >
                        {item.name}
                      </Link>
                      {item.variant && (
                        <p className="mt-0.5 text-sm text-muted">
                          {Object.entries(item.variant)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold">
                      {formatPrice(item.price * item.quantity, siteConfig.currency)}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1, key)}
                        className="grid h-9 w-9 place-items-center hover:text-gold-strong"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1, key)}
                        className="grid h-9 w-9 place-items-center hover:text-gold-strong"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, key)}
                      className="flex items-center gap-1.5 text-sm text-muted hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
        >
          ← Continue shopping
        </Link>
      </div>

      {/* Summary */}
      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Order summary</h2>

          {/* Coupon */}
          <div className="mt-5">
            {coupon ? (
              <div className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 font-medium text-success">
                  <Tag className="h-4 w-4" /> {coupon.code}
                </span>
                <button onClick={removeCoupon} className="text-muted hover:text-danger">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Promo code"
                  className="h-11 flex-1 rounded-full border border-border bg-paper px-4 text-sm focus:border-gold focus-visible:outline-none"
                />
                <button
                  onClick={() => applyCoupon(code) && setCode("")}
                  className="rounded-full bg-ink px-5 text-sm font-medium text-paper hover:bg-gold hover:text-white"
                >
                  Apply
                </button>
              </div>
            )}
            <p className="mt-2 text-xs text-muted">
              Try <span className="font-medium">WELCOME10</span> or{" "}
              <span className="font-medium">FREESHIP</span>
            </p>
          </div>

          <div className="mt-6 space-y-2.5 text-sm">
            <Row label="Subtotal" value={formatPrice(totals.subtotal, siteConfig.currency)} />
            {totals.discount > 0 && (
              <Row
                label="Discount"
                value={`- ${formatPrice(totals.discount, siteConfig.currency)}`}
                accent="text-success"
              />
            )}
            <Row
              label="Shipping"
              value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping, siteConfig.currency)}
            />
            <Row label="Tax" value={formatPrice(totals.tax, siteConfig.currency)} />
            <div className="hairline my-3" />
            <Row label="Total" value={formatPrice(totals.total, siteConfig.currency)} bold />
          </div>

          <Button href="/checkout" variant="gold" size="lg" className="mt-6 w-full">
            Proceed to checkout
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            Secure checkout · Cash on Delivery available
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: string;
}) {
  return (
    <div className={cn("flex justify-between", bold && "text-base font-semibold")}>
      <span className={cn("text-ink-soft", bold && "text-ink")}>{label}</span>
      <span className={accent ?? "text-ink"}>{value}</span>
    </div>
  );
}
