import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { categories } from "@/data/categories";
import { getCategoryBySlug } from "@/lib/categories";
import { getShopProducts } from "@/lib/catalog";
import { ShopView } from "@/components/shop/shop-view";
import { buildMetadata, breadcrumbSchema, jsonLd } from "@/lib/seo";

// Render at request time so admin-added products appear in their category.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return buildMetadata({ title: "Category" });
  return buildMetadata({
    title: cat.name,
    description: cat.description,
    path: `/categories/${cat.slug}`,
    images: [cat.image],
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();
  const { products, total } = await getShopProducts({
    page: 1,
    pageSize: 24,
    category: slug,
    maxPrice: 500,
  });

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Categories", url: "/categories" },
            { name: cat.name, url: `/categories/${cat.slug}` },
          ]),
        )}
      />
      {/* Category hero */}
      <section className="relative overflow-hidden">
        <div className="relative h-56 w-full sm:h-72">
          <Image src={cat.image} alt={cat.name} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-ink/30" />
          <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 text-sm text-paper/80">
              <Link href="/" className="hover:text-paper">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/categories" className="hover:text-paper">Categories</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-paper">{cat.name}</span>
            </nav>
            <h1 className="mt-2 font-display text-4xl font-semibold text-paper sm:text-5xl">
              {cat.name}
            </h1>
            <p className="mt-2 max-w-xl text-paper/85">{cat.description}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ShopView
          initialProducts={products}
          initialTotal={total}
          lockedCategory={cat.slug}
        />
      </div>
    </div>
  );
}
