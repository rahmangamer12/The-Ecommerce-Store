import type { Metadata } from "next";
import { CheckCircle2, Package, Mail, ArrowRight, Landmark, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogFeatured } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import { getT, getLocale } from "@/i18n/server";

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
  const t = getT(await getLocale());

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
        {awaitingPayment ? t("os.receivedTitle") : t("os.thankTitle")}
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-lg text-ink-soft">
        {isBank
          ? t("os.bankIntro")
          : isWhatsapp
            ? t("os.whatsappIntro")
            : t("os.defaultIntro")}
      </p>

      {order && (
        <div className="mt-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm">
            <span className="text-muted">{t("os.orderNumber")}</span>
            <span className="font-semibold tracking-wide">{order}</span>
          </div>
          <p className="mt-2 text-xs text-muted">
            {t("os.saveNumber")}
          </p>
        </div>
      )}

      {/* Bank transfer instructions */}
      {isBank && (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-gold/40 bg-gold/5 p-6 text-left">
          <div className="flex items-center gap-2 text-gold-strong">
            <Landmark className="h-5 w-5" />
            <h2 className="font-semibold">{t("os.completeTransfer")}</h2>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            {t("os.transferPre")}{" "}
            {total != null && (
              <span className="font-semibold text-ink">{formatPrice(total)}</span>
            )}{" "}
            {t("os.transferMid")}{" "}
            <span className="font-semibold text-ink">{order}</span> {t("os.transferPost")}
          </p>
          <dl className="mt-4 space-y-2 rounded-xl bg-card p-4 text-sm">
            {[
              [t("os.bankName"), siteConfig.bank.name],
              [t("os.accountName"), siteConfig.bank.accountName],
              [t("os.accountNo"), siteConfig.bank.accountNumber],
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
            {t("os.afterTransfer")}
          </p>
        </div>
      )}

      {/* WhatsApp note */}
      {isWhatsapp && (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-gold/40 bg-gold/5 p-6 text-left">
          <div className="flex items-center gap-2 text-gold-strong">
            <MessageCircle className="h-5 w-5" />
            <h2 className="font-semibold">{t("os.confirmWa")}</h2>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            {t("os.waMsgPre")}{" "}
            <span className="font-semibold text-ink">{siteConfig.whatsapp}</span>{" "}
            {t("os.waMsgPost")} <span className="font-semibold text-ink">{order}</span> {t("os.waMsgEnd")}
          </p>
        </div>
      )}

      {/* Next steps */}
      {!awaitingPayment && (
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Mail, title: t("os.confirmSent"), text: t("os.confirmSentText") },
            { icon: Package, title: t("os.onIt"), text: t("os.onItText") },
            { icon: CheckCircle2, title: t("os.trackingSoon"), text: t("os.trackingSoonText") },
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
          {t("os.trackOrder")}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button href="/shop" variant="outline" size="lg">
          {t("common.continueShopping")}
        </Button>
      </div>

      {/* Recommendations */}
      <div className="mt-20 text-left">
        <h2 className="text-center font-display text-2xl font-semibold">
          {t("os.alsoLove")}
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
