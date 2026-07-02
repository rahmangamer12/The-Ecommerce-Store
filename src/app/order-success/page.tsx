import type { Metadata } from "next";
import { CheckCircle2, Package, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogFeatured } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

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
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const recommended = await getCatalogFeatured(4);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-24">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="h-11 w-11" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Thank you for your order
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-lg text-ink-soft">
        Your order has been received and is now being prepared. A confirmation
        email is on its way.
      </p>

      {order && (
        <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm">
          <span className="text-muted">Order number</span>
          <span className="font-semibold tracking-wide">{order}</span>
        </div>
      )}

      {/* Next steps */}
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

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button href="/account/orders" variant="primary" size="lg">
          View my orders
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
