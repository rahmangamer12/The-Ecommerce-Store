import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { buildMetadata } from "@/lib/seo";
import { isCardPaymentConfigured, isPaypalConfigured } from "@/config/env";

export const metadata: Metadata = buildMetadata({
  title: "Checkout",
  description: "Securely complete your Souq Empire order.",
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
        {/* Online options only appear once their keys are configured. */}
        <CheckoutView
          cardEnabled={isCardPaymentConfigured}
          paypalEnabled={isPaypalConfigured}
        />
      </div>
    </div>
  );
}
