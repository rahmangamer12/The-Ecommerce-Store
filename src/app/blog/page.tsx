import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getAllPosts, blogCategories } from "@/data/blog";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { formatDate, readingTime, cn } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "The Journal",
  description: "Stories, guides and considered reading on style, living and buying well.",
  path: "/blog",
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const all = getAllPosts();
  const posts = category
    ? all.filter((p) => p.category.toLowerCase() === category.toLowerCase())
    : all;
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <header className="text-center">
        <p className="eyebrow">The Journal</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Stories &amp; guides
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
          Thoughtful reading on design, living well and making things last.
        </p>
      </header>

      {/* Category pills */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <CategoryPill href="/blog" label="All" active={!category} />
        {blogCategories.map((c) => (
          <CategoryPill
            key={c}
            href={`/blog?category=${encodeURIComponent(c)}`}
            label={c}
            active={category?.toLowerCase() === c.toLowerCase()}
          />
        ))}
      </div>

      {/* Featured */}
      {featured && (
        <Reveal className="mt-12">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] lg:aspect-auto">
              <Image
                src={featured.cover}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
              <p className="eyebrow">{featured.category}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight group-hover:text-gold-strong">
                {featured.title}
              </h2>
              <p className="mt-3 text-ink-soft">{featured.excerpt}</p>
              <div className="mt-5 flex items-center gap-4 text-sm text-muted">
                <span>{formatDate(featured.date)}</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {readingTime(featured.content)} min read
                </span>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gold-strong">
                Read story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </Reveal>
      )}

      {/* Grid */}
      <Stagger className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
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
              <h3 className="mt-2 font-display text-xl font-semibold leading-snug group-hover:text-gold-strong">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{post.excerpt}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                <span>{formatDate(post.date)}</span>
                <span>·</span>
                <span>{readingTime(post.content)} min read</span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

function CategoryPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-ink bg-ink text-paper"
          : "border-border text-ink-soft hover:border-gold hover:text-gold-strong",
      )}
    >
      {label}
    </Link>
  );
}
