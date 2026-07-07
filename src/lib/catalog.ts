import type { Product } from "@/types";
import { products as localProducts } from "@/data/products";
import { createAdminClient } from "@/lib/supabase/admin";
import { regroupVariants } from "@/lib/variant-utils";

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

  // Normalise variants for display: split CJ's combined "Black-14 inches"
  // style options into clean, separate Color / Size groups (like the sample
  // products). Runs at render time so already-imported products benefit too.
  const variants = Array.isArray(r.variants)
    ? regroupVariants(r.variants as Record<string, unknown>[])
    : undefined;

  // Variant option → its own photo, so picking a colour swaps the main image.
  const variantImages: Record<string, string> = {};
  for (const v of variants ?? []) {
    if (v.valueImages) {
      for (const [key, val] of Object.entries(v.valueImages)) {
        if (typeof val === "string" && val) variantImages[key] = val;
      }
    }
  }

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
    variants: variants as Product["variants"],
    tags: asArray(r.tags),
    featured: Boolean(r.featured),
    trending: Boolean(r.trending),
    variantImages: Object.keys(variantImages).length ? variantImages : undefined,
    affiliateUrl: r.affiliate_url ? String(r.affiliate_url) : undefined,
    source: (r.source as Product["source"]) || undefined,
    cost: r.cost != null ? Number(r.cost) : undefined,
    cjPid: r.cj_pid ? String(r.cj_pid) : undefined,
    cjVid: r.cj_vid ? String(r.cj_vid) : undefined,
    cjSku: r.cj_sku ? String(r.cj_sku) : undefined,
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

// Only the columns product CARDS + listing filters need — NOT the heavy
// description / variants / SEO JSON. Used by the homepage, shop and the client
// catalogue so pages stay fast even with hundreds of products.
const CARD_COLUMNS =
  "id,name,slug,brand,category_slug,price,compare_at_price,currency,short_description,images,rating,review_count,stock,badge,tags,featured,trending,affiliate_url,source,created_at";

/**
 * Lightweight catalogue for lists/cards: same products as getCatalog() but only
 * the card-level columns (skips descriptions/variants), so the DB transfer and
 * payload are a fraction of the size. Falls back to the demo catalogue.
 */
export async function getCatalogLite(limit?: number): Promise<Product[]> {
  const admin = createAdminClient();
  const fallback = () => (limit ? localProducts.slice(0, limit) : localProducts);
  if (!admin) return fallback();
  try {
    let q = admin
      .from("products")
      .select(CARD_COLUMNS)
      .order("created_at", { ascending: false });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error || !data || data.length === 0) return fallback();
    return data.map(mapRow);
  } catch {
    return fallback();
  }
}

// -------------------------------------------------------------
//  Server-side paginated + filtered shop query (Daraz-style).
//  The browser only ever loads ONE page, so the storefront stays
//  fast no matter how many thousands of products exist.
// -------------------------------------------------------------

export type ShopSort = "featured" | "newest" | "price-asc" | "price-desc" | "popular";

export type ShopQuery = {
  page?: number;
  pageSize?: number;
  category?: string; // a single locked category (category page)
  categories?: string[]; // multi-select filter (shop page)
  sort?: ShopSort;
  maxPrice?: number;
  onSale?: boolean;
  inStock?: boolean;
  q?: string;
};

function sortLocal(list: Product[], sort?: ShopSort) {
  switch (sort) {
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "popular": list.sort((a, b) => b.rating - a.rating); break;
    case "newest": break; // localProducts order
    default: list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
}

export async function getShopProducts(
  query: ShopQuery = {},
): Promise<{ products: Product[]; total: number }> {
  const pageSize = Math.min(60, Math.max(1, query.pageSize ?? 24));
  const page = Math.max(1, query.page ?? 1);
  const from = (page - 1) * pageSize;
  const admin = createAdminClient();

  // Fallback: filter/sort/paginate the demo catalogue in memory.
  if (!admin) {
    let list = [...localProducts];
    if (query.category) list = list.filter((p) => p.categorySlug === query.category);
    if (query.categories?.length) list = list.filter((p) => query.categories!.includes(p.categorySlug));
    if (query.maxPrice != null) list = list.filter((p) => p.price <= query.maxPrice!);
    if (query.onSale) list = list.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    if (query.inStock) list = list.filter((p) => p.stock > 0);
    if (query.q) {
      const s = query.q.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.brand} ${p.tags.join(" ")}`.toLowerCase().includes(s));
    }
    sortLocal(list, query.sort);
    return { products: list.slice(from, from + pageSize), total: list.length };
  }

  let qb = admin.from("products").select(CARD_COLUMNS, { count: "exact" });
  if (query.category) qb = qb.eq("category_slug", query.category);
  if (query.categories?.length) qb = qb.in("category_slug", query.categories);
  if (query.maxPrice != null) qb = qb.lte("price", query.maxPrice);
  if (query.onSale) qb = qb.not("compare_at_price", "is", null);
  if (query.inStock) qb = qb.gt("stock", 0);
  if (query.q) {
    const s = query.q.replace(/[%,()]/g, " ").trim();
    if (s) qb = qb.or(`name.ilike.%${s}%,brand.ilike.%${s}%`);
  }
  switch (query.sort) {
    case "price-asc": qb = qb.order("price", { ascending: true }); break;
    case "price-desc": qb = qb.order("price", { ascending: false }); break;
    case "popular": qb = qb.order("rating", { ascending: false }).order("review_count", { ascending: false }); break;
    case "newest": qb = qb.order("created_at", { ascending: false }); break;
    // Default "featured": featured first, then a stable mixed order (by id, a
    // uuid) so categories are interleaved instead of clumped.
    default: qb = qb.order("featured", { ascending: false }).order("id", { ascending: true });
  }
  qb = qb.range(from, from + pageSize - 1);

  const { data, count, error } = await qb;
  if (error || !data) return { products: [], total: 0 };
  return { products: data.map(mapRow), total: count ?? 0 };
}

/** True once the store has at least one real product in the DB. */
export async function hasDbProducts(): Promise<boolean> {
  const db = await getDbProducts();
  return db.length > 0;
}

export async function getCatalogProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const admin = createAdminClient();
  if (admin) {
    // Query the SINGLE row (not the whole 3k+ catalogue) — fast and reliable,
    // so product pages don't intermittently 404 under DB load.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { data, error } = await admin
          .from("products")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (!error && data) return mapRow(data);
        if (!error) break; // query ok, just no such slug
      } catch {
        /* transient — retry once */
      }
    }
  }
  return localProducts.find((p) => p.slug === slug);
}

/** Look a product up by id (single-row query, with retry + demo fallback). */
export async function getCatalogProductById(
  id: string,
): Promise<Product | undefined> {
  const admin = createAdminClient();
  if (admin) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { data, error } = await admin
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!error && data) return mapRow(data);
        if (!error) break;
      } catch {
        /* transient — retry once */
      }
    }
  }
  return localProducts.find((p) => p.id === id);
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
  // Efficient: query a small page from the same category (not the whole
  // catalogue) so product pages stay fast and don't strain the DB.
  const { products } = await getShopProducts({
    category: product.categorySlug,
    pageSize: limit + 1,
    sort: "popular",
  });
  return products.filter((p) => p.id !== product.id).slice(0, limit);
}
