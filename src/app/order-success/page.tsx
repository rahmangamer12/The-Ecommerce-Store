import type { Metadata } from "next";
import { CheckCircle2, Package, Mail, ArrowRight, Landmark, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogFeatured } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Order Confirmed",
  path: "/order-success",
  noindex: true,
});

// Recommendations come from the live catalogue, so real products show here too.
export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; method?: string }>;
}) {
  const { order, method } = await searchParams;
  const recommended = await getCatalogFeatured(4);

  // Look up the order so we can show the exact amount + payment method (more
  // reliable than trusting the URL). Best-effort — falls back to the URL param.
  let paymentMethod = method ?? "";
  let total: number | null = null;
  if (order) {
    try {
      const admin = createAdminClient();
      if (admin) {
        const { data } = await admin
          .from("orders")
          .select("payment_method, total")
          .eq("number", order)
          .maybeSingle();
        if (data) {
          paymentMethod = String(data.payment_method ?? paymentMethod);
          total = data.total != null ? Number(data.total) : null;
        }
      }
    } catch {
      // ignore — we'll use the URL param
    }
  }

  const isBank = paymentMethod === "bank";
  const isWhatsapp = paymentMethod === "whatsapp";
  const awaitingPayment = isBank || isWhatsapp;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-24">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="h-11 w-11" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {awaitingPayment ? "Order received!" : "Thank you for your order"}
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-lg text-ink-soft">
        {isBank
          ? "One more step — please complete your bank transfer below. We ship as soon as the payment arrives."
          : isWhatsapp
            ? "We've opened WhatsApp so you can confirm your order with us. We'll take it from there."
            : "Your order has been received and is now being prepared. A confirmation email is on its way."}
      </p>

      {order && (
        <div className="mt-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm">
            <span className="text-muted">Order number</span>
            <span className="font-semibold tracking-wide">{order}</span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Save this number — you can track your order anytime (even without an
            account) using it and your email.
          </p>
        </div>
      )}

      {/* Bank transfer instructions */}
      {isBank && (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-gold/40 bg-gold/5 p-6 text-left">
          <div className="flex items-center gap-2 text-gold-strong">
            <Landmark className="h-5 w-5" />
            <h2 className="font-semibold">Complete your bank transfer</h2>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Transfer{" "}
            {total != null && (
              <span className="font-semibold text-ink">{formatPrice(total)}</span>
            )}{" "}
            to the account below, using your order number{" "}
            <span className="font-semibold text-ink">{order}</span> as the payment
            reference.
          </p>
          <dl className="mt-4 space-y-2 rounded-xl bg-card p-4 text-sm">
            {[
              ["Bank", siteConfig.bank.name],
              ["Account name", siteConfig.bank.accountName],
              ["Account no.", siteConfig.bank.accountNumber],
              ["IBAN", siteConfig.bank.iban],
              ["SWIFT", siteConfig.bank.swift],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">
            After transferring, your order moves from “Pending” to “Paid” and is
            shipped. Keep your transfer receipt in case we need it.
          </p>
        </div>
      )}

      {/* WhatsApp note */}
      {isWhatsapp && (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-gold/40 bg-gold/5 p-6 text-left">
          <div className="flex items-center gap-2 text-gold-strong">
            <MessageCircle className="h-5 w-5" />
            <h2 className="font-semibold">Confirm on WhatsApp</h2>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            If WhatsApp didn&apos;t open automatically, message us at{" "}
            <span className="font-semibold text-ink">{siteConfig.whatsapp}</span>{" "}
            with your order number <span className="font-semibold text-ink">{order}</span> to arrange payment and delivery.
          </p>
        </div>
      )}

      {/* Next steps */}
      {!awaitingPayment && (
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Mail, title: "Confirmation sent", text: "Check your inbox for details" },
            { icon: Package, title: "We're on it", text: "Your order is being prepared" },
            { icon: CheckCircle2, title: "Tracking soon", text: "You'll get a shipping link" },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-5">
              <s.icon className="mx-auto h-6 w-6 text-gold-strong" />
              <p className="mt-3 text-sm font-semibold">{s.title}</p>
              <p className="mt-1 text-xs text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          href={order ? `/track-order?order=${encodeURIComponent(order)}` : "/track-order"}
          variant="primary"
          size="lg"
        >
          Track your order
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button href="/shop" variant="outline" size="lg">
          Continue shopping
        </Button>
      </div>

      {/* Recommendations */}
      <div className="mt-20 text-left">
        <h2 className="text-center font-display text-2xl font-semibold">
          You might also love
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {recommended.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
