import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/categories";
import { getCatalog } from "@/lib/catalog";
import { CategoryIcon } from "@/components/category-icon";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { buildMetadata } from "@/lib/seo";
import { getLocale, getT } from "@/i18n/server";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description: "Explore every Velcarro category — from technology and audio to fashion, beauty and wellness.",
  path: "/categories",
});

// Render at request time so counts reflect real (admin-added) products.
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const t = getT(await getLocale());
  const categories = await getCategories();
  // Count products per category from the live catalogue.
  const catalog = await getCatalog();
  const counts = catalog.reduce<Record<string, number>>((acc, p) => {
    acc[p.categorySlug] = (acc[p.categorySlug] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-12 text-center">
        <p className="eyebrow">{t("cats.eyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("cats.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">{t("cats.subtitle")}</p>
      </header>

      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const count = counts[cat.slug] ?? 0;
          return (
            <StaggerItem key={cat.slug}>
              <Link
                href={`/categories/${cat.slug}`}
                className="card-lift group relative block aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-paper">
                  <CategoryIcon name={cat.icon} className="h-6 w-6 text-gold-soft" />
                  <h2 className="mt-3 font-display text-2xl font-semibold">{cat.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-paper/80">{cat.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gold-soft">
                    {count} {t("cats.products")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
      <Reveal>
        <span className="sr-only">All categories listed above</span>
      </Reveal>
    </div>
  );
}
