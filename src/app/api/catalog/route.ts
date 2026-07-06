import { NextResponse } from "next/server";
import { getCatalogLite } from "@/lib/catalog";

// Serves the live catalogue to client components (search, wishlist, recently
// viewed, cart upsell). We return a SLIM version — just the fields the cards &
// search need — so the payload stays small even with hundreds of products
// (dropping descriptions / variants / SEO cuts most of the weight). Cached for
// a few minutes at the edge so it isn't rebuilt on every page load.
export const revalidate = 300;

export async function GET() {
  const products = await getCatalogLite();

  const slim = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images.slice(0, 2), // cards only use the first two
    categorySlug: p.categorySlug,
    tags: p.tags,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.stock,
    badge: p.badge,
    affiliateUrl: p.affiliateUrl,
    shortDescription: p.shortDescription,
  }));

  return NextResponse.json(
    { products: slim },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
