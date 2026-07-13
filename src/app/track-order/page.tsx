import type { Metadata } from "next";
import { TrackOrderView } from "@/components/track/track-order-view";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Track Your Order",
  description: "Track the status of your Velcarro order with your order number and email.",
  path: "/track-order",
});

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <header className="mb-10 text-center">
        <p className="eyebrow">Order status</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Track your order
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
          Enter your order number and the email you used at checkout to see where
          your order is.
        </p>
      </header>
      <TrackOrderView />
    </div>
  );
}
