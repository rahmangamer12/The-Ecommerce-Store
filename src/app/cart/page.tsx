import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Shopping Cart",
  description: "Review the items in your cart and proceed to a secure checkout.",
  path: "/cart",
  noindex: true,
});

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Your cart
      </h1>
      <div className="mt-10">
        <CartView />
      </div>
    </div>
  );
}
