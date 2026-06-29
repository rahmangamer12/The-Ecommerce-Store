"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminEmails } from "@/config/env";
import { slugify } from "@/lib/utils";
import { products as localProducts } from "@/data/products";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  categorySlug: z.string().min(1, "Choose a category"),
  price: z.number().positive("Price must be greater than 0"),
  compareAtPrice: z.number().optional(),
  stock: z.number().int().min(0),
  shortDescription: z.string().min(5),
  description: z.string().min(5),
  images: z.array(z.string().url()).min(1, "Add at least one image"),
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  badge: z.string().optional(),
  affiliateUrl: z.string().url().optional().or(z.literal("")),
});

export type CreateProductResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

async function requireAdmin(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  return !!email && adminEmails.includes(email);
}

export async function createProduct(input: unknown): Promise<CreateProductResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "You don't have permission to do this." };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;

  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      error: "Database isn't connected. Add your Supabase keys to enable saving.",
    };
  }

  // Unique slug (append a short suffix to avoid collisions).
  const slug = `${slugify(d.name)}-${Date.now().toString(36).slice(-4)}`;

  const { error } = await admin.from("products").insert({
    name: d.name,
    slug,
    brand: d.brand,
    category_slug: d.categorySlug,
    price: d.price,
    compare_at_price: d.compareAtPrice ?? null,
    currency: "USD",
    short_description: d.shortDescription,
    description: d.description,
    features: d.features,
    images: d.images,
    tags: d.tags,
    stock: d.stock,
    badge: d.badge || null,
    affiliate_url: d.affiliateUrl || null,
    rating: 5,
    review_count: 0,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // Refresh the storefront + admin list so the new product appears.
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);

  return { ok: true, slug };
}

function refreshStore() {
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath("/");
}

// ---------------- Update an existing product ----------------
export async function updateProduct(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };

  const updateSchema = productSchema.extend({ id: z.string().min(1) });
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database not connected." };

  const { error } = await admin
    .from("products")
    .update({
      name: d.name,
      brand: d.brand,
      category_slug: d.categorySlug,
      price: d.price,
      compare_at_price: d.compareAtPrice ?? null,
      short_description: d.shortDescription,
      description: d.description,
      features: d.features,
      images: d.images,
      tags: d.tags,
      stock: d.stock,
      badge: d.badge || null,
      affiliate_url: d.affiliateUrl || null,
    })
    .eq("id", d.id);

  if (error) return { ok: false, error: error.message };
  refreshStore();
  return { ok: true };
}

// ---------------- Delete a product ----------------
export async function deleteProduct(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database not connected." };

  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshStore();
  return { ok: true };
}

// ---------------- Import the starter catalogue into the DB ----------------
// Copies the built-in sample products into Supabase so they become fully
// editable/deletable. Skips any product whose slug is already in the DB.
export async function importStarterProducts(): Promise<{
  ok: boolean;
  imported?: number;
  error?: string;
}> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database not connected." };

  const { data: existing } = await admin.from("products").select("slug");
  const have = new Set((existing ?? []).map((r) => String(r.slug)));

  const rows = localProducts
    .filter((p) => !have.has(p.slug))
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      category_slug: p.categorySlug,
      price: p.price,
      compare_at_price: p.compareAtPrice ?? null,
      currency: p.currency,
      short_description: p.shortDescription,
      description: p.description,
      features: p.features,
      images: p.images,
      variants: p.variants ?? [],
      tags: p.tags,
      stock: p.stock,
      badge: p.badge || null,
      featured: p.featured ?? false,
      trending: p.trending ?? false,
      rating: p.rating,
      review_count: p.reviewCount,
    }));

  if (rows.length === 0) return { ok: true, imported: 0 };

  const { error } = await admin.from("products").insert(rows);
  if (error) return { ok: false, error: error.message };

  refreshStore();
  return { ok: true, imported: rows.length };
}
