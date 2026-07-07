"use server";

import { getShopProducts, type ShopQuery } from "@/lib/catalog";
import type { Product } from "@/types";

// Client-callable wrapper so ShopView can fetch one page at a time from the
// server (pagination + filters + sort), keeping the storefront fast at scale.
export async function fetchShopProducts(
  query: ShopQuery,
): Promise<{ products: Product[]; total: number }> {
  return getShopProducts(query);
}
