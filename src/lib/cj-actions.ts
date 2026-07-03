"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminEmails, cjDefaultMarkup, isCjConfigured } from "@/config/env";
import { slugify } from "@/lib/utils";
import {
  cjSearchProducts,
  cjGetProduct,
  type CjListItem,
  type CjProductDetail,
} from "@/lib/cj";

// =============================================================
//  Admin actions to bring CJ products into your own catalogue.
//  Search CJ, or paste a CJ product URL/id, then import — the
//  product is copied into your Supabase catalogue (with your
//  markup applied) and linked back to CJ so orders can be
//  auto-forwarded for fulfilment.
// =============================================================

async function requireAdmin(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  return !!email && adminEmails.includes(email);
}

export type CjSearchResult =
  | { ok: true; items: CjListItem[] }
  | { ok: false; error: string };

export async function searchCjProducts(
  keyword: string,
  page = 1,
): Promise<CjSearchResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  if (!isCjConfigured) {
    return { ok: false, error: "CJ isn't connected. Add your CJ API key first." };
  }
  const term = keyword.trim();
  if (term.length < 2) return { ok: false, error: "Type at least 2 characters." };
  try {
    const items = await cjSearchProducts(term, page);
    return { ok: true, items };
  } catch {
    return { ok: false, error: "CJ search failed. Try again in a moment." };
  }
}

/** Preview a CJ product (by pid or URL) before importing. */
export type CjPreviewResult =
  | { ok: true; product: CjProductDetail }
  | { ok: false; error: string };

export async function previewCjProduct(
  pidOrUrl: string,
): Promise<CjPreviewResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  if (!isCjConfigured) {
    return { ok: false, error: "CJ isn't connected. Add your CJ API key first." };
  }
  const detail = await cjGetProduct(pidOrUrl);
  if (!detail || !detail.name) {
    return { ok: false, error: "Couldn't find that product on CJ." };
  }
  return { ok: true, product: detail };
}

const importSchema = z.object({
  pidOrUrl: z.string().min(3),
  categorySlug: z.string().min(1),
  // Multiplier over the CJ cost, e.g. 2 = sell at double your cost.
  markup: z.number().positive().optional(),
  // Optional explicit variant to fulfil (defaults to the first/cheapest).
  vid: z.string().optional(),
});

export type ImportCjResult =
  | { ok: true; slug: string; name: string }
  | { ok: false; error: string };

export async function importCjProduct(input: unknown): Promise<ImportCjResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  if (!isCjConfigured) {
    return { ok: false, error: "CJ isn't connected. Add your CJ API key first." };
  }

  const parsed = importSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const { pidOrUrl, categorySlug, vid } = parsed.data;
  const markup = parsed.data.markup && parsed.data.markup > 0
    ? parsed.data.markup
    : cjDefaultMarkup || 2;

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database isn't connected." };

  const detail = await cjGetProduct(pidOrUrl);
  if (!detail || !detail.name) {
    return { ok: false, error: "Couldn't find that product on CJ." };
  }

  // Pick the variant we'll actually order from CJ. Default: cheapest one.
  const chosen =
    (vid && detail.variants.find((v) => v.vid === vid)) ||
    detail.variants
      .slice()
      .sort((a, b) => a.price - b.price)
      .find((v) => v.price > 0) ||
    detail.variants[0];

  const cost = chosen?.price || detail.price || 0;
  if (cost <= 0) {
    return { ok: false, error: "This product has no usable price from CJ." };
  }
  const price = Math.max(0.99, Math.round(cost * markup * 100) / 100);

  // Don't import the same CJ product twice.
  const { data: dupe } = await admin
    .from("products")
    .select("slug")
    .eq("cj_pid", detail.pid)
    .maybeSingle();
  if (dupe?.slug) {
    return { ok: false, error: "You've already imported this CJ product." };
  }

  const slug = `${slugify(detail.name).slice(0, 60)}-${Date.now()
    .toString(36)
    .slice(-4)}`;

  // Map CJ variants (if any) into the store's simple variant options.
  const variantValues = detail.variants
    .map((v) => v.name)
    .filter(Boolean);
  const variants = variantValues.length
    ? [{ name: "Option", values: Array.from(new Set(variantValues)) }]
    : [];

  const { error } = await admin.from("products").insert({
    name: detail.name,
    slug,
    brand: "CJ",
    category_slug: categorySlug,
    price,
    compare_at_price: Math.round(price * 1.4 * 100) / 100, // a natural "was" price
    currency: "USD",
    short_description: detail.name.slice(0, 140),
    description: detail.description || detail.name,
    features: [],
    images: detail.images.length ? detail.images : [],
    variants,
    tags: detail.categoryName ? [detail.categoryName.toLowerCase()] : [],
    stock: 100,
    badge: null,
    rating: 5,
    review_count: 0,
    source: "cj",
    cost,
    cj_pid: detail.pid,
    cj_vid: chosen?.vid ?? null,
    cj_sku: chosen?.sku ?? null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);
  return { ok: true, slug, name: detail.name };
}
