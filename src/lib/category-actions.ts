"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminEmails } from "@/config/env";
import { slugify } from "@/lib/utils";
import { categories as localCategories } from "@/data/categories";

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(5, "Add a short description"),
  image: z.string().url("Add an image (upload one or paste a URL)"),
  icon: z.string().min(1).default("Tag"),
});

async function requireAdmin(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  return !!email && adminEmails.includes(email);
}

// Refresh every surface that shows categories so changes appear instantly.
function refresh() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}

// ---------------- Create a category ----------------
export async function createCategory(
  input: unknown,
): Promise<{ ok: boolean; error?: string; slug?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database isn't connected." };

  // Make a unique slug (append a short suffix on collision).
  const { data: existing } = await admin.from("categories").select("slug");
  const taken = new Set((existing ?? []).map((r) => String(r.slug)));
  let slug = slugify(d.name);
  if (taken.has(slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const { error } = await admin.from("categories").insert({
    name: d.name,
    slug,
    description: d.description,
    image: d.image,
    icon: d.icon,
  });
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true, slug };
}

// ---------------- Update a category ----------------
export async function updateCategory(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };

  const updateSchema = categorySchema.extend({ slug: z.string().min(1) });
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database isn't connected." };

  const { error } = await admin
    .from("categories")
    .update({
      name: d.name,
      description: d.description,
      image: d.image,
      icon: d.icon,
    })
    .eq("slug", d.slug);
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true };
}

// ---------------- Delete a category ----------------
// Deleting a category also removes every product inside it, so the admin never
// has to empty a category by hand first. Products are deleted BEFORE the
// category itself to satisfy the products -> categories foreign key.
export async function deleteCategory(
  slug: string,
): Promise<{ ok: boolean; error?: string; deletedProducts?: number }> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database isn't connected." };

  // How many products this will take with it (for the confirmation message).
  const { count } = await admin
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_slug", slug);

  // 1) Remove the products in this category first (FK requires it).
  if ((count ?? 0) > 0) {
    const { error: prodError } = await admin
      .from("products")
      .delete()
      .eq("category_slug", slug);
    if (prodError) return { ok: false, error: prodError.message };
  }

  // 2) Then remove the category itself.
  const { error } = await admin.from("categories").delete().eq("slug", slug);
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true, deletedProducts: count ?? 0 };
}

// ---------------- Load the default categories into the DB ----------------
// Copies the built-in starter categories into Supabase so they become fully
// editable/removable. Existing slugs are updated (upsert), not duplicated.
export async function seedCategories(): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database isn't connected." };

  const { error } = await admin.from("categories").upsert(
    localCategories.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      icon: c.icon,
    })),
    { onConflict: "slug" },
  );
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true };
}
