import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product, Category } from "@/types";
import { ProductCard } from "@/components/product/product-card";

// Daraz / Alibaba-style category row: a titled band of products from ONE
// category with a "See all" link. Several of these stacked make the homepage
// feel like a real marketplace.
export function CategoryShowcase({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-4 border-b border-border bg-paper-2/50 px-4 py-3.5 sm:px-6">
          <h2 className="font-display text-lg font-semibold sm:text-xl">
            {category.name}
          </h2>
          <Link
            href={`/categories/${category.slug}`}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-gold-strong hover:underline"
          >
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 md:grid-cols-4 lg:grid-cols-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
