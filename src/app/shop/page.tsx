import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { getCatalog } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

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
  const products = await getCatalog();
  const validSorts: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "popular"];
  const sort = (validSorts.includes(sp.sort as SortKey) ? sp.sort : "featured") as SortKey;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-10">
        <p className="eyebrow">The collection</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Shop everything
        </h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          Every piece is chosen for quality, design and the way it makes everyday
          life feel a little more considered.
        </p>
      </header>
      <ShopView products={products} initialSort={sort} initialSale={sp.sale === "true"} />
    </div>
  );
}
