import type { Metadata } from "next";
import { SearchView } from "@/components/search/search-view";
import { getShopProducts } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";
import { getT, getLocale } from "@/i18n/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search the Velcarro catalogue.",
  path: "/search",
  noindex: true,
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = ((await searchParams).q ?? "").trim();
  const t = getT(await getLocale());
  // Search the whole catalogue on the SERVER (reliable at any scale).
  const { products, total } = q
    ? await getShopProducts({ q, pageSize: 48, sort: "popular" })
    : { products: [], total: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-8 text-center">
        <p className="eyebrow">{t("search.findFast")}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("search.title")}
        </h1>
      </header>
      <SearchView initialQuery={q} products={products} total={total} />
    </div>
  );
}
