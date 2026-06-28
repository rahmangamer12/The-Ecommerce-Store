import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ChevronRight } from "lucide-react";
import { blogPosts, getPostBySlug, getRelatedPosts } from "@/data/blog";
import { ShareButtons } from "@/components/blog/share-buttons";
import { formatDate, readingTime, slugify } from "@/lib/utils";
import {
  buildMetadata,
  articleSchema,
  breadcrumbSchema,
  jsonLd,
} from "@/lib/seo";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return buildMetadata({ title: "Article" });
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    images: [post.cover],
    keywords: post.tags,
  });
}

// Parse the simple markdown-ish content into headings + paragraphs.
function parseContent(content: string) {
  return content.split("\n\n").map((block) => {
    if (block.startsWith("## ")) {
      const text = block.replace("## ", "").trim();
      return { type: "heading" as const, text, id: slugify(text) };
    }
    return { type: "paragraph" as const, text: block.trim() };
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const blocks = parseContent(post.content);
  const toc = blocks.filter((b) => b.type === "heading") as {
    type: "heading";
    text: string;
    id: string;
  }[];
  const related = getRelatedPosts(post, 3);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          articleSchema({
            title: post.title,
            description: post.excerpt,
            image: post.cover,
            date: post.date,
            author: post.author.name,
            slug: post.slug,
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Journal", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ]),
        ])}
      />

      {/* Header */}
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-ink">Journal</Link>
        </nav>
        <p className="eyebrow mt-6">{post.category}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image src={post.author.avatar} alt={post.author.name} fill sizes="40px" className="object-cover" />
            </span>
            <div>
              <p className="text-sm font-semibold">{post.author.name}</p>
              <p className="text-xs text-muted">{post.author.role}</p>
            </div>
          </div>
          <span className="text-muted">·</span>
          <span className="text-sm text-muted">{formatDate(post.date)}</span>
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <Clock className="h-4 w-4" /> {readingTime(post.content)} min read
          </span>
        </div>
      </div>

      {/* Cover */}
      <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl">
          <Image src={post.cover} alt={post.title} fill priority sizes="(max-width: 1024px) 100vw, 64rem" className="object-cover" />
        </div>
      </div>

      {/* Body + TOC */}
      <div className="mx-auto mt-12 max-w-5xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
          <div className="max-w-2xl">
            {blocks.map((b, i) =>
              b.type === "heading" ? (
                <h2
                  key={i}
                  id={b.id}
                  className="mt-10 scroll-mt-28 font-display text-2xl font-semibold"
                >
                  {b.text}
                </h2>
              ) : (
                <p key={i} className="mt-5 leading-[1.8] text-ink-soft">
                  {b.text}
                </p>
              ),
            )}

            <div className="mt-10 border-t border-border pt-6">
              <ShareButtons title={post.title} path={`/blog/${post.slug}`} />
            </div>
          </div>

          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                On this page
              </p>
              <ul className="mt-4 space-y-2.5 border-l border-border">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className="-ml-px block border-l-2 border-transparent pl-4 text-sm text-ink-soft transition-colors hover:border-gold hover:text-ink"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-border bg-paper-2">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold">Keep reading</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="card-lift group block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                    <Image src={p.cover} alt={p.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="eyebrow mt-4">{p.category}</p>
                  <h3 className="mt-2 font-display text-lg font-semibold group-hover:text-gold-strong">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
