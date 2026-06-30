import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { getCatalog } from "@/lib/catalog";
import { getCategories } from "@/lib/categories";
import { buildMetadata } from "@/lib/seo";
import { getLocale, getT } from "@/i18n/server";

// Render at request time so admin-added products always appear.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Shop All",
  description:
    "Browse the full Luxora collection — premium products across tech, home, fashion, beauty and more, with worldwide shipping.",
  path: "/shop",
});

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "popular";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; sale?: string }>;
}) {
  const sp = await searchParams;
  const t = getT(await getLocale());
  const products = await getCatalog();
  const categories = await getCategories();
  const validSorts: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "popular"];
  const sort = (validSorts.includes(sp.sort as SortKey) ? sp.sort : "featured") as SortKey;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-10">
        <p className="eyebrow">{t("shop.eyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("shop.title")}
        </h1>
        <p className="mt-3 max-w-xl text-ink-soft">{t("shop.subtitle")}</p>
      </header>
      <ShopView products={products} categories={categories} initialSort={sort} initialSale={sp.sale === "true"} />
    </div>
  );
}
