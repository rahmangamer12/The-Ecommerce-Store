"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { getProductsByIds } from "@/data/products";
import { ProductCard } from "@/components/product/product-card";

export default function WishlistPage() {
  const { wishlist, mounted } = useStore();
  if (!mounted) return <div className="h-64" />;

  const products = getProductsByIds(wishlist);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-paper-2">
          <Heart className="h-7 w-7 text-muted" />
        </div>
        <h2 className="mt-5 font-display text-xl font-semibold">Your wishlist is empty</h2>
        <p className="mt-2 max-w-xs text-sm text-muted">
          Tap the heart on any product to save it here for later.
        </p>
        <Link
          href="/shop"
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper"
        >
          Explore products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">
        Saved items ({products.length})
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
