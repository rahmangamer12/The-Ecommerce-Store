"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";

// Results are fetched SERVER-SIDE (getShopProducts) and passed in — reliable
// even with thousands of products (the old client-catalogue search returned
// nothing once the catalogue grew large).
export function SearchView({
  initialQuery,
  products,
  total,
}: {
  initialQuery: string;
  products: Product[];
  total: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div>
      <form
        onSubmit={submit}
        className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-border bg-card px-5 py-2"
      >
        <SearchIcon className="h-5 w-5 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands, categories…"
          className="h-10 flex-1 bg-transparent text-base focus-visible:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-gold hover:text-white"
        >
          Search
        </button>
      </form>

      {initialQuery && (
        <p className="mt-8 text-center text-ink-soft">
          {total > 0 ? (
            <>
              <span className="font-semibold text-ink">{total.toLocaleString()}</span>{" "}
              results for &ldquo;{initialQuery}&rdquo;
            </>
          ) : (
            <>No results for &ldquo;{initialQuery}&rdquo;. Try another search.</>
          )}
        </p>
      )}

      {products.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {!initialQuery && (
        <p className="mt-10 text-center text-muted">
          Start typing to discover something beautiful.
        </p>
      )}
    </div>
  );
}
