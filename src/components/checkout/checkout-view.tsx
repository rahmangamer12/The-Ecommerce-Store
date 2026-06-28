"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, ShieldCheck, ArrowRight, ShoppingBag } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { Input, Label } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { placeOrder } from "@/app/checkout/actions";

const initialForm = {
  email: "",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  phone: "",
};

export function CheckoutView() {
  const router = useRouter();
  const { items, totals, coupon, clearCart, mounted } = useStore();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  if (!mounted) return <div className="h-96" />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-paper-2">
          <ShoppingBag className="h-8 w-8 text-muted" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-semibold">
          Nothing to check out
        </h2>
        <p className="mt-2 text-ink-soft">Add a few things to your cart first.</p>
        <Link
          href="/shop"
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await placeOrder({
        ...form,
        couponCode: coupon?.code,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variant: i.variant,
        })),
      });

      if (!result.ok) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      clearCart();
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl; // hosted Polar checkout
      } else {
        router.push(`/order-success?order=${result.orderNumber}`);
      }
    } catch {
      toast.error("Could not place your order. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
      {/* Form */}
      <div className="space-y-8">
        {/* Contact */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Contact</h2>
            <Link href="/login" className="text-sm text-gold-strong hover:underline">
              Sign in for faster checkout
            </Link>
          </div>
          <div className="mt-4">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </section>

        {/* Shipping */}
        <section>
          <h2 className="font-display text-xl font-semibold">Shipping address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="line1">Address</Label>
              <Input id="line1" required value={form.line1} onChange={(e) => set("line1", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="line2">Apartment, suite (optional)</Label>
              <Input id="line2" value={form.line2} onChange={(e) => set("line2", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" required value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="state">State / Region</Label>
              <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="zip">Postal code</Label>
              <Input id="zip" required value={form.zip} onChange={(e) => set("zip", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" required value={form.country} onChange={(e) => set("country", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Payment note */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lock className="h-4 w-4 text-gold-strong" /> Secure payment
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            You&apos;ll complete payment securely via Polar. We never store your
            card details. Click &ldquo;Place order&rdquo; to continue to payment.
          </p>
        </section>
      </div>

      {/* Summary */}
      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Order summary</h2>
          <ul className="mt-5 space-y-4">
            {items.map((i) => (
              <li key={`${i.productId}-${JSON.stringify(i.variant)}`} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-paper-2">
                  <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.65rem] font-bold text-paper">
                    {i.quantity}
                  </span>
                </div>
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="line-clamp-2 text-sm">{i.name}</span>
                  <span className="text-sm font-medium">
                    {formatPrice(i.price * i.quantity, siteConfig.currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Subtotal</span>
              <span>{formatPrice(totals.subtotal, siteConfig.currency)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>- {formatPrice(totals.discount, siteConfig.currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink-soft">Shipping</span>
              <span>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping, siteConfig.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Tax</span>
              <span>{formatPrice(totals.tax, siteConfig.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(totals.total, siteConfig.currency)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 font-medium text-white shadow-gold transition-all hover:-translate-y-0.5 hover:bg-gold-strong disabled:translate-y-0 disabled:opacity-60"
          >
            {loading ? "Processing…" : "Place order"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
            <ShieldCheck className="h-3.5 w-3.5" /> 256-bit encrypted · Polar secure
          </p>
        </div>
      </aside>
    </form>
  );
}
