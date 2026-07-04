import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/sections/section-header";
import { ProductCard } from "@/components/product/product-card";
import { CategoryIcon } from "@/components/category-icon";
import { BrandStrip } from "@/components/home/brand-strip";
import { PromoTiles } from "@/components/home/promo-tiles";
import { FlashDeal } from "@/components/home/flash-deal";
import { ShopByPrice } from "@/components/home/shop-by-price";
import { getCategories } from "@/lib/categories";
import {
  getCatalogFeatured,
  getCatalogTrending,
  getCatalogOnSale,
  getCatalogNewArrivals,
  getCatalogByCategory,
  getCatalog,
} from "@/lib/catalog";
import { testimonials } from "@/data/testimonials";
import { getAllPosts } from "@/data/blog";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/utils";
import { jsonLd, websiteSchema, organizationSchema } from "@/lib/seo";
import { getLocale, getT } from "@/i18n/server";

export default async function HomePage() {
  const t = getT(await getLocale());
  const categories = await getCategories();
  const featured = await getCatalogFeatured(8);
  const trending = await getCatalogTrending(4);
  const onSale = await getCatalogOnSale(4);
  const newArrivals = await getCatalogNewArrivals(4);
  const posts = getAllPosts().slice(0, 3);
  // Use a real product image for the hero (first watch, else any product).
  const heroProduct =
    (await getCatalogByCategory("watches-jewelry"))[0] ??
    (await getCatalog())[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([websiteSchema(), organizationSchema()])}
      />

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-aura">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-24 lg:pt-20">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-gold-strong" />
              <span className="text-ink-soft">{t("home.heroBadge")}</span>
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-6xl sm:leading-[1.05] lg:text-7xl">
              {t("home.heroTitlePre")}{" "}
              <span className="text-gradient-gold">{t("home.heroTitleGold")}</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
              {t("home.heroSubtitle")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/shop" variant="gold" size="lg">
                {t("home.shopCollection")}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/categories" variant="outline" size="lg">
                {t("home.browseCategories")}
              </Button>
            </div>
            {/* Trust row */}
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-3">
                {testimonials.slice(0, 4).map((t) => (
                  <span
                    key={t.id}
                    className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-paper"
                  >
                    <Image src={t.avatar} alt={t.name} fill sizes="40px" className="object-cover" />
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-0.5 text-sm text-ink-soft">{t("home.lovedBy")}</p>
              </div>
            </div>
          </Reveal>

          {/* Hero visual */}
          <Reveal delay={0.15} className="relative">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-gold-soft/40 to-transparent blur-2xl" />
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-border shadow-luxe-lg">
                {heroProduct && (
                  <Image
                    src={heroProduct.images[0]}
                    alt={heroProduct.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 28rem"
                    className="object-cover"
                  />
                )}
              </div>
              {/* Floating price card */}
              {heroProduct && (
                <div className="animate-float absolute -bottom-5 -left-5 w-52 rounded-2xl border border-border glass p-4 shadow-luxe">
                  <p className="text-xs text-muted">{heroProduct.brand}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm font-semibold">
                    {heroProduct.name}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-display text-lg font-semibold text-gold-strong">
                      {siteConfig.currencySymbol}
                      {heroProduct.price}
                    </span>
                    <Link
                      href={`/products/${heroProduct.slug}`}
                      className="grid h-8 w-8 place-items-center rounded-full bg-ink text-paper"
                      aria-label="View product"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== BENEFITS ===================== */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Truck, title: t("home.benefitShipT"), text: t("home.benefitShipD") },
            { icon: ShieldCheck, title: t("home.benefitCodT"), text: t("home.benefitCodD") },
            { icon: RefreshCw, title: t("home.benefitReturnT"), text: t("home.benefitReturnD") },
            { icon: Headphones, title: t("home.benefitSupportT"), text: t("home.benefitSupportD") },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3 py-6">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper-2 text-gold-strong">
                <b.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{b.title}</p>
                <p className="text-xs text-muted">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== BRAND STRIP ===================== */}
      <BrandStrip />

      {/* ===================== CATEGORIES ===================== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            eyebrow={t("home.catEyebrow")}
            title={t("home.catTitle")}
            description={t("home.catDesc")}
            href="/categories"
          />
        </Reveal>
        <Stagger className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <StaggerItem key={cat.slug}>
              <Link
                href={`/categories/${cat.slug}`}
                className="card-lift group relative block aspect-square overflow-hidden rounded-2xl"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-paper">
                  <CategoryIcon name={cat.icon} className="h-5 w-5 text-gold-soft" />
                  <p className="mt-2 font-display text-lg font-semibold">{cat.name}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ===================== PROMO TILES ===================== */}
      <PromoTiles />

      {/* ===================== FEATURED PRODUCTS ===================== */}
      <section className="bg-paper-2">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow={t("home.featEyebrow")}
              title={t("home.featTitle")}
              description={t("home.featDesc")}
              href="/shop"
            />
          </Reveal>
          <Stagger className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} priority={i < 4} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ===================== FLASH DEAL ===================== */}
      <FlashDeal products={onSale} />

      {/* ===================== NEW ARRIVALS ===================== */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow={t("home.newEyebrow")}
              title={t("home.newTitle")}
              description={t("home.newDesc")}
              href="/shop?sort=newest"
            />
          </Reveal>
          <Stagger className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {newArrivals.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* ===================== EDITORIAL CTA ===================== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-paper sm:px-16 sm:py-24">
            <div className="absolute inset-0 bg-aura opacity-60" aria-hidden />
            <div className="relative max-w-xl">
              <p className="eyebrow text-gold-soft">{siteConfig.name}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-5xl">
                {t("home.ctaTitle")}
              </h2>
              <p className="mt-5 text-lg text-paper/80">{t("home.ctaDesc")}</p>
              <Button href="/shop" variant="gold" size="lg" className="mt-8">
                {t("home.ctaButton")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===================== TRENDING ===================== */}
      <section className="bg-paper-2">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow={t("home.trendEyebrow")}
              title={t("home.trendTitle")}
              href="/shop?sort=popular"
            />
          </Reveal>
          <Stagger className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {trending.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ===================== SHOP BY PRICE ===================== */}
      <ShopByPrice />

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            eyebrow={t("home.testiEyebrow")}
            title={t("home.testiTitle")}
            center
          />
        </Reveal>
        <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <StaggerItem key={t.id}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-luxe">
                <div className="flex items-center gap-1 text-gold">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image src={t.avatar} alt={t.name} fill sizes="40px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{t.name}</span>
                    <span className="block text-xs text-muted">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ===================== JOURNAL ===================== */}
      <section className="bg-paper-2">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow={t("home.journalEyebrow")}
              title={t("home.journalTitle")}
              description={t("home.journalDesc")}
              href="/blog"
            />
          </Reveal>
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <StaggerItem key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="card-lift group block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                    <Image
                      src={post.cover}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="eyebrow mt-4">{post.category}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-gold-strong">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{post.excerpt}</p>
                  <p className="mt-3 text-xs text-muted">{formatDate(post.date)}</p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
