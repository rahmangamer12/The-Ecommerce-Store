import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import { getCatalogProductBySlug, getCatalogRelated } from "@/lib/catalog";
import { getCategoryBySlug } from "@/lib/categories";
import { ProductViewer } from "@/components/product/product-viewer";
import { Reviews } from "@/components/product/reviews";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/sections/section-header";
import {
  buildMetadata,
  productSchema,
  breadcrumbSchema,
  jsonLd,
} from "@/lib/seo";
import { getLocale, getT } from "@/i18n/server";
import { cn } from "@/lib/utils";
import { parseDescription } from "@/lib/product-specs";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) return buildMetadata({ title: "Product" });
  return buildMetadata({
    title: product.seo?.title ?? product.name,
    description: product.seo?.description ?? product.shortDescription,
    path: `/products/${product.slug}`,
    images: product.seo?.ogImage ? [product.seo.ogImage] : product.images,
    keywords: product.seo?.keywords ?? product.tags,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();

  const t = getT(await getLocale());
  const category = await getCategoryBySlug(product.categorySlug);
  const related = await getCatalogRelated(product, 4);

  // Split the description into prose + a specs table. When a product is really
  // a spec sheet (CJ imports), we show a clean two-column table instead of a
  // wall of "Label: value" text — and skip the redundant highlights list.
  const { intro, specs } = parseDescription(product.description);
  const isSpecSheet = specs.length >= 3;

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          productSchema({
            name: product.name,
            description: product.description,
            images: product.images,
            brand: product.brand,
            slug: product.slug,
            price: product.price,
            currency: product.currency,
            rating: product.rating,
            reviewCount: product.reviewCount,
            inStock: product.stock > 0,
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Shop", url: "/shop" },
            ...(category
              ? [{ name: category.name, url: `/categories/${category.slug}` }]
              : []),
            { name: product.name, url: `/products/${product.slug}` },
          ]),
        ])}
      />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          {category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/categories/${category.slug}`} className="hover:text-ink">
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      {/* Gallery + buy box */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductViewer product={product} />
      </div>

      {/* Description */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isSpecSheet ? (
          /* Spec-sheet layout (CJ / supplier imports): intro + clean table. */
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 lg:p-12">
            <h2 className="font-display text-2xl font-semibold">{t("product.about")}</h2>
            {intro && (
              <p className="mt-4 max-w-3xl leading-relaxed text-ink-soft">{intro}</p>
            )}
            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted">
              {t("product.specifications")}
            </h3>
            <dl className="mt-4 grid gap-x-12 sm:grid-cols-2">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="flex items-baseline justify-between gap-4 border-b border-border/60 py-3"
                >
                  <dt className="shrink-0 text-sm text-muted">{s.label}</dt>
                  <dd className="text-right text-sm font-medium text-ink">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          /* Editorial layout (hand-written products): prose + highlights. */
          <div
            className={cn(
              "grid gap-8 rounded-3xl border border-border bg-card p-6 sm:gap-10 sm:p-8 lg:p-12",
              product.features.length > 0 && "lg:grid-cols-2",
            )}
          >
            <div>
              <h2 className="font-display text-2xl font-semibold">{t("product.about")}</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-soft">{product.description}</p>
            </div>
            {product.features.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                  {t("product.highlights")}
                </h3>
                <ul className="mt-4 space-y-3">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-ink-soft">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviews */}
      <Reviews product={product} />

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-paper-2">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeader eyebrow={t("product.related")} title={t("product.completeLook")} />
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently viewed */}
      <RecentlyViewed currentSlug={product.slug} />
    </div>
  );
}
