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

/**
 * Full catalogue. Once you've added your own products in the admin, ONLY those
 * real products are shown — the built-in sample catalogue is used solely as a
 * starter/demo while the DB is still empty. (Same pattern as categories.) This
 * means the demo products disappear automatically the moment you add a real one.
 */
export async function getCatalog(): Promise<Product[]> {
  const db = await getDbProducts();
  if (db.length > 0) return db;
  return localProducts;
}

/** True once the store has at least one real product in the DB. */
export async function hasDbProducts(): Promise<boolean> {
  const db = await getDbProducts();
  return db.length > 0;
}

export async function getCatalogProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const all = await getCatalog();
  return all.find((p) => p.slug === slug);
}

/** Look a product up by id across the live catalogue (DB or demo fallback). */
export async function getCatalogProductById(
  id: string,
): Promise<Product | undefined> {
  const all = await getCatalog();
  return all.find((p) => p.id === id);
}

export async function getCatalogByCategory(
  categorySlug: string,
): Promise<Product[]> {
  const all = await getCatalog();
  return all.filter((p) => p.categorySlug === categorySlug);
}

// ---------------- Homepage query helpers (DB-first) ----------------
// These mirror the local data helpers but read the live catalogue, so the
// homepage shows the store owner's real products once they've been added.
// Each falls back to "any products" when nothing is flagged, so a brand-new
// store never shows empty sections.

export async function getCatalogFeatured(limit = 8): Promise<Product[]> {
  const all = await getCatalog();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getCatalogTrending(limit = 8): Promise<Product[]> {
  const all = await getCatalog();
  const trending = all.filter((p) => p.trending);
  return (trending.length ? trending : all).slice(0, limit);
}

export async function getCatalogOnSale(limit = 8): Promise<Product[]> {
  const all = await getCatalog();
  return all
    .filter((p) => p.compareAtPrice && p.compareAtPrice > p.price)
    .slice(0, limit);
}

export async function getCatalogNewArrivals(limit = 8): Promise<Product[]> {
  const all = await getCatalog();
  const tagged = all.filter((p) => p.badge === "New");
  // DB products are already newest-first; fall back to that ordering.
  return (tagged.length ? tagged : all).slice(0, limit);
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
