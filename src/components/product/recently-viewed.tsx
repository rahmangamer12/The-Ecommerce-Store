"use client";

import { useEffect } from "react";
import { useStore } from "@/components/providers/store-provider";
import { useCatalog } from "@/components/providers/catalog-provider";
import { usePrefs } from "@/components/providers/prefs-provider";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/sections/section-header";

// Records the current product as "recently viewed" and shows the rest.
export function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const { recentlyViewed, pushRecentlyViewed, mounted } = useStore();
  const { getBySlugs } = useCatalog();
  const { t } = usePrefs();

  useEffect(() => {
    pushRecentlyViewed(currentSlug);
  }, [currentSlug, pushRecentlyViewed]);

  if (!mounted) return null;
  const products = getBySlugs(
    recentlyViewed.filter((s) => s !== currentSlug),
  ).slice(0, 4);
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow={t("product.recentlyViewedEyebrow")}
        title={t("product.recentlyViewed")}
      />
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
