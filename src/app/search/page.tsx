import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/search/search-view";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search the Souq Empire catalogue.",
  path: "/search",
  noindex: true,
});

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-8 text-center">
        <p className="eyebrow">Find it fast</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Search
        </h1>
      </header>
      <Suspense fallback={<div className="h-40" />}>
        <SearchView />
      </Suspense>
    </div>
  );
}
