import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { getShopProducts, type ShopSort } from "@/lib/catalog";
import { getCategories } from "@/lib/categories";
import { buildMetadata } from "@/lib/seo";
import { getLocale, getT } from "@/i18n/server";

// Render at request time so admin-added products always appear.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Shop All",
  description:
    "Browse the full Souq Empire collection — premium products across tech, home, fashion, beauty and more, with worldwide shipping.",
  path: "/shop",
});

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; sale?: string }>;
}) {
  const sp = await searchParams;
  const t = getT(await getLocale());
  const validSorts: ShopSort[] = ["featured", "newest", "price-asc", "price-desc", "popular"];
  const sort = (validSorts.includes(sp.sort as ShopSort) ? sp.sort : "featured") as ShopSort;
  const onSale = sp.sale === "true";

  // Only the FIRST page is fetched on the server — the rest load on scroll.
  const { products, total } = await getShopProducts({
    page: 1,
    pageSize: 24,
    sort,
    onSale: onSale || undefined,
    maxPrice: 500,
  });
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-10">
        <p className="eyebrow">{t("shop.eyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("shop.title")}
        </h1>
        <p className="mt-3 max-w-xl text-ink-soft">{t("shop.subtitle")}</p>
      </header>
      <ShopView
        initialProducts={products}
        initialTotal={total}
        categories={categories}
        initialSort={sort}
        initialSale={onSale}
      />
    </div>
  );
}
