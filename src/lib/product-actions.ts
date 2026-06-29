"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminEmails } from "@/config/env";
import { slugify } from "@/lib/utils";

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
