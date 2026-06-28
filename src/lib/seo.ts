import type { Metadata } from "next";
import { siteConfig, siteUrl } from "@/config/site";

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  images?: string[];
  keywords?: string[];
  noindex?: boolean;
};

/**
 * Build consistent, SEO-rich metadata for any page.
 * Handles title templating, canonical URLs, OpenGraph and Twitter cards.
 */
export function buildMetadata(input: SeoInput = {}): Metadata {
  const title = input.title
    ? `${input.title} | ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`;
  const description = input.description ?? siteConfig.description;
  const url = `${siteUrl}${input.path ?? ""}`;
  const ogImage = input.images?.[0] ?? `${siteUrl}/opengraph-image`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords:
      input.keywords ?? [
        "online store",
        "premium ecommerce",
        "luxury shopping",
        "worldwide shipping",
        siteConfig.name,
      ],
    alternates: { canonical: url },
    robots: input.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// ---------------- JSON-LD structured data ----------------

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteUrl,
    logo: `${siteUrl}/opengraph-image`,
    email: siteConfig.supportEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.line1,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.zip,
      addressCountry: siteConfig.address.country,
    },
    sameAs: Object.values(siteConfig.social).filter(Boolean),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function productSchema(p: {
  name: string;
  description: string;
  images: string[];
  brand: string;
  slug: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images,
    brand: { "@type": "Brand", name: p.brand },
    sku: p.slug,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.reviewCount,
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${p.slug}`,
      priceCurrency: p.currency,
      price: p.price,
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  image: string;
  date: string;
  author: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };
}

/** Small helper component data: stringify safely for a <script> tag. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data) };
}
