"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { ProductCard } from "@/components/product/product-card";

export function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const { search } = useCatalog();
  const q = params.get("q") ?? "";
  const [query, setQuery] = useState(q);
  const results = search(q);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
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

      {q && (
        <p className="mt-8 text-center text-ink-soft">
          {results.length > 0 ? (
            <>
              <span className="font-semibold text-ink">{results.length}</span> results
              for &ldquo;{q}&rdquo;
            </>
          ) : (
            <>No results for &ldquo;{q}&rdquo;. Try another search.</>
          )}
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {!q && (
        <p className="mt-10 text-center text-muted">
          Start typing to discover something beautiful.
        </p>
      )}
    </div>
  );
}
