"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Tag, ArrowRight, Trash2 } from "lucide-react";
import { useStore, variantKeyOf } from "@/components/providers/store-provider";
import { usePrefs } from "@/components/providers/prefs-provider";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { getFeatured } from "@/data/products";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const {
    items,
    cartOpen,
    setCartOpen,
    updateQty,
    removeItem,
    totals,
    subtotal,
    coupon,
    applyCoupon,
    removeCoupon,
    addItem,
  } = useStore();
  const { formatPrice } = usePrefs();
  const [code, setCode] = useState("");

  const threshold = siteConfig.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);

  // Upsell: a featured product not already in the cart.
  const upsell = getFeatured(6).find(
    (p) => !items.some((i) => i.productId === p.id),
  );

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-paper shadow-luxe-lg"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="font-display text-lg font-semibold">Your Cart</h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <EmptyCart onClose={() => setCartOpen(false)} />
            ) : (
              <>
                {/* Free shipping progress */}
                <div className="border-b border-border px-5 py-3.5">
                  {remaining > 0 ? (
                    <p className="text-sm text-ink-soft">
                      You&apos;re{" "}
                      <span className="font-semibold text-ink">
                        {formatPrice(remaining)}
                      </span>{" "}
                      away from free shipping
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-success">
                      🎉 You&apos;ve unlocked free shipping!
                    </p>
                  )}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-2">
                    <div
                      className="h-full rounded-full bg-gold transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <ul className="space-y-4">
                    {items.map((item) => {
                      const key = variantKeyOf(item.variant);
                      return (
                        <li key={`${item.productId}-${key}`} className="flex gap-3">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={() => setCartOpen(false)}
                            className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-paper-2"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </Link>
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between gap-2">
                              <Link
                                href={`/products/${item.slug}`}
                                onClick={() => setCartOpen(false)}
                                className="line-clamp-1 text-sm font-medium hover:text-gold-strong"
                              >
                                {item.name}
                              </Link>
                              <button
                                onClick={() => removeItem(item.productId, key)}
                                aria-label="Remove item"
                                className="text-muted hover:text-danger"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            {item.variant && (
                              <p className="mt-0.5 text-xs text-muted">
                                {Object.values(item.variant).join(" · ")}
                              </p>
                            )}
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div className="flex items-center rounded-full border border-border">
                                <button
                                  onClick={() =>
                                    updateQty(item.productId, item.quantity - 1, key)
                                  }
                                  className="grid h-8 w-8 place-items-center hover:text-gold-strong"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-7 text-center text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQty(item.productId, item.quantity + 1, key)
                                  }
                                  className="grid h-8 w-8 place-items-center hover:text-gold-strong"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <span className="text-sm font-semibold">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Upsell */}
                  {upsell && (
                    <div className="mt-6 rounded-xl border border-border bg-card p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                        You may also like
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-paper-2">
                          <Image
                            src={upsell.images[0]}
                            alt={upsell.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium">{upsell.name}</p>
                          <p className="text-sm text-gold-strong">
                            {formatPrice(upsell.price)}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            addItem({
                              productId: upsell.id,
                              slug: upsell.slug,
                              name: upsell.name,
                              image: upsell.images[0],
                              price: upsell.price,
                              maxStock: upsell.stock,
                            })
                          }
                          className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-gold hover:text-white"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: coupon + totals + checkout */}
                <div className="border-t border-border px-5 py-4">
                  {/* Coupon */}
                  {coupon ? (
                    <div className="mb-3 flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-sm">
                      <span className="flex items-center gap-2 font-medium text-success">
                        <Tag className="h-4 w-4" /> {coupon.code} applied
                      </span>
                      <button onClick={removeCoupon} className="text-muted hover:text-danger">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3 flex gap-2">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Promo code (try WELCOME10)"
                        className="h-10 flex-1 rounded-full border border-border bg-card px-4 text-sm focus:border-gold focus-visible:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (applyCoupon(code)) setCode("");
                        }}
                        className="rounded-full bg-ink px-4 text-sm font-medium text-paper hover:bg-gold hover:text-white"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5 text-sm">
                    <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
                    {totals.discount > 0 && (
                      <Row
                        label="Discount"
                        value={`- ${formatPrice(totals.discount)}`}
                        accent="text-success"
                      />
                    )}
                    <Row
                      label="Shipping"
                      value={
                        totals.shipping === 0
                          ? "Free"
                          : formatPrice(totals.shipping)
                      }
                    />
                    <Row label="Tax" value={formatPrice(totals.tax)} />
                    <div className="hairline my-2" />
                    <Row
                      label="Total"
                      value={formatPrice(totals.total)}
                      bold
                    />
                  </div>

                  <Button
                    href="/checkout"
                    variant="gold"
                    size="lg"
                    className="mt-4 w-full"
                  >
                    Secure Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-2 w-full text-center text-sm text-muted hover:text-ink"
                  >
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
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
      <span className={cn(accent ?? "text-ink", bold && "text-ink")}>{value}</span>
    </div>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-paper-2">
        <ShoppingBag className="h-8 w-8 text-muted" />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold">Your cart is empty</h3>
      <p className="mt-2 text-sm text-muted">
        Discover something beautiful — your next favourite is a click away.
      </p>
      <Button href="/shop" variant="primary" className="mt-6" onClick={onClose}>
        Explore the shop
      </Button>
    </div>
  );
}
