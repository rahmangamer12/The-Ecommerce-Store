import type { Product } from "@/types";
import { products as localProducts } from "@/data/products";
import { createAdminClient } from "@/lib/supabase/admin";

// -------------------------------------------------------------
//  Unified catalogue: merges products created in the admin
//  (stored in Supabase) with the built-in starter catalogue.
//  Falls back to the local catalogue when Supabase isn't set up.
// -------------------------------------------------------------

type Row = Record<string, unknown>;

function asArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

function mapRow(r: Row): Product {
  const images = asArray(r.images);
  return {
    id: String(r.id),
    name: String(r.name ?? ""),
    slug: String(r.slug ?? ""),
    brand: String(r.brand ?? ""),
    categorySlug: String(r.category_slug ?? ""),
    price: Number(r.price ?? 0),
    compareAtPrice: r.compare_at_price ? Number(r.compare_at_price) : undefined,
    currency: String(r.currency ?? "USD"),
    shortDescription: String(r.short_description ?? ""),
    description: String(r.description ?? ""),
    features: asArray(r.features),
    images: images.length
      ? images
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"],
    rating: Number(r.rating ?? 5),
    reviewCount: Number(r.review_count ?? 0),
    stock: Number(r.stock ?? 0),
    badge: (r.badge as Product["badge"]) || undefined,
    variants: Array.isArray(r.variants)
      ? (r.variants as Product["variants"])
      : undefined,
    tags: asArray(r.tags),
    featured: Boolean(r.featured),
    trending: Boolean(r.trending),
    affiliateUrl: r.affiliate_url ? String(r.affiliate_url) : undefined,
  };
}

/** Products created via the admin (from Supabase). Empty if not configured. */
export async function getDbProducts(): Promise<Product[]> {
  const admin = createAdminClient();
  if (!admin) return [];
  try {
    const { data, error } = await admin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

/** Full catalogue: DB products first, then the starter catalogue (deduped). */
export async function getCatalog(): Promise<Product[]> {
  const db = await getDbProducts();
  const seen = new Set(db.map((p) => p.slug));
  return [...db, ...localProducts.filter((p) => !seen.has(p.slug))];
}

export async function getCatalogProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const all = await getCatalog();
  return all.find((p) => p.slug === slug);
}

export async function getCatalogByCategory(
  categorySlug: string,
): Promise<Product[]> {
  const all = await getCatalog();
  return all.filter((p) => p.categorySlug === categorySlug);
}

export async function getCatalogRelated(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const all = await getCatalog();
  return all
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .concat(
      all.filter(
        (p) =>
          p.id !== product.id &&
          p.categorySlug !== product.categorySlug &&
          p.tags.some((t) => product.tags.includes(t)),
      ),
    )
    .slice(0, limit);
}
