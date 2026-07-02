import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";

// Serves the live catalogue to client components (search, wishlist, recently
// viewed, cart upsell) so they show the store's real products — not the demo
// data. Always fresh so admin changes appear right away.
export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getCatalog();
  return NextResponse.json({ products });
}
