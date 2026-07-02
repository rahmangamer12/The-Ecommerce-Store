import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { getCatalog } from "@/lib/catalog";
import { getCategories } from "@/lib/categories";
import { blogPosts } from "@/data/blog";

// Auto-generated sitemap covering all public, indexable routes.
// Uses the live catalogue/categories so real products are indexed (and demo
// products aren't listed once you've added your own).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getCatalog(),
    getCategories(),
  ]);
  const staticRoutes = ["", "/shop", "/categories", "/blog", "/contact", "/faq", "/privacy", "/terms"];

  const pages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/categories/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((b) => ({
    url: `${siteUrl}/blog/${b.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...pages, ...categoryPages, ...productPages, ...blogPages];
}
