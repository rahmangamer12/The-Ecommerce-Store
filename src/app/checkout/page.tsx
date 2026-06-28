import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Checkout",
  description: "Securely complete your Luxora order.",
  path: "/checkout",
  noindex: true,
});

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Checkout
      </h1>
      <div className="mt-10">
        <CheckoutView />
      </div>
    </div>
  );
}
