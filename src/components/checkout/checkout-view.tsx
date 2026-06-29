"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Banknote, Landmark, CreditCard, MessageCircle, ShieldCheck, ArrowRight, ShoppingBag } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { usePrefs } from "@/components/providers/prefs-provider";
import { Input, Label } from "@/components/ui/input";
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

export function CheckoutView({ cardEnabled = false }: { cardEnabled?: boolean }) {
  const router = useRouter();
  const { items, totals, coupon, clearCart, mounted } = useStore();
  const { formatPrice } = usePrefs();
  const [form, setForm] = useState(initialForm);

  // Build the list of payment methods enabled in config (card also needs a
  // configured gateway). COD is off by default for dropshipping.
  const methods = [
    cardEnabled && siteConfig.payments.card && {
      key: "card",
      icon: CreditCard,
      title: "Card / Apple Pay",
      desc: "Pay securely online — you'll be taken to our payment page.",
    },
    siteConfig.payments.whatsapp && {
      key: "whatsapp",
      icon: MessageCircle,
      title: "Order on WhatsApp",
      desc: "Send your order to us on WhatsApp and pay however suits you.",
    },
    siteConfig.payments.bank && {
      key: "bank",
      icon: Landmark,
      title: "Bank Transfer",
      desc: "Transfer to our account, then we ship your order.",
    },
    siteConfig.payments.cod && {
      key: "cod",
      icon: Banknote,
      title: "Cash on Delivery",
      desc: "Pay with cash when your order is delivered.",
    },
  ].filter(Boolean) as {
    key: string;
    icon: typeof CreditCard;
    title: string;
    desc: string;
  }[];

  const [paymentMethod, setPaymentMethod] = useState(methods[0]?.key ?? "whatsapp");
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
        paymentMethod,
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

      // WhatsApp order → open a pre-filled message to the store.
      if (paymentMethod === "whatsapp") {
        const lines = items
          .map(
            (i) =>
              `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`,
          )
          .join("\n");
        const msg =
          `Hi! I'd like to confirm my order ${result.orderNumber}.\n\n${lines}\n\n` +
          `Total: ${formatPrice(totals.total)}\n` +
          `Name: ${form.fullName}\n` +
          `Address: ${form.line1}, ${form.city}, ${form.country}\n` +
          `Phone: ${form.phone}`;
        window.open(
          `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(msg)}`,
          "_blank",
        );
      }

      clearCart();
      if (result.redirectUrl) {
        // Card payment → hosted gateway page.
        window.location.href = result.redirectUrl;
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

        {/* Payment method */}
        <section>
          <h2 className="font-display text-xl font-semibold">Payment method</h2>
          <div className="mt-4 grid gap-3">
            {methods.map((m) => {
              const selected = paymentMethod === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setPaymentMethod(m.key)}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                    selected ? "border-gold bg-gold/5" : "border-border hover:border-ink/30"
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                      selected ? "bg-gold text-white" : "bg-paper-2 text-ink-soft"
                    }`}
                  >
                    <m.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">{m.title}</span>
                    <span className="block text-sm text-muted">{m.desc}</span>
                  </span>
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
                      selected ? "border-gold" : "border-border"
                    }`}
                  >
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Extra details for the selected method */}
          {paymentMethod === "bank" && (
            <div className="mt-4 rounded-2xl border border-border bg-paper-2 p-4 text-sm">
              <p className="font-medium">Bank transfer details</p>
              <div className="mt-2 space-y-0.5 text-ink-soft">
                <p>Bank: {siteConfig.bank.name}</p>
                <p>Account name: {siteConfig.bank.accountName}</p>
                <p>IBAN: {siteConfig.bank.iban}</p>
              </div>
              <p className="mt-2 text-xs text-muted">
                Use your order number as the transfer reference. We ship once the
                transfer is received.
              </p>
            </div>
          )}
          {paymentMethod === "whatsapp" && (
            <div className="mt-4 rounded-2xl border border-border bg-paper-2 p-4 text-sm text-ink-soft">
              When you place the order, WhatsApp will open with your order details
              pre-filled. Send it to us and we&apos;ll confirm payment & delivery.
            </div>
          )}
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
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>- {formatPrice(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink-soft">Shipping</span>
              <span>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Tax</span>
              <span>{formatPrice(totals.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 font-medium text-white shadow-gold transition-all hover:-translate-y-0.5 hover:bg-gold-strong disabled:translate-y-0 disabled:opacity-60"
          >
            {loading
              ? "Placing order…"
              : paymentMethod === "card"
                ? "Continue to payment"
                : paymentMethod === "whatsapp"
                  ? "Place order & open WhatsApp"
                  : paymentMethod === "cod"
                    ? "Place order (Cash on Delivery)"
                    : "Place order"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
            <ShieldCheck className="h-3.5 w-3.5" /> Your details are kept private &amp; secure
          </p>
        </div>
      </aside>
    </form>
  );
}
