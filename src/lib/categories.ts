import { unstable_cache } from "next/cache";
import type { Category } from "@/types";
import { categories as localCategories } from "@/data/categories";
import { createAdminClient } from "@/lib/supabase/admin";

// -------------------------------------------------------------
//  Categories source of truth.
//  Once categories are seeded into Supabase, the DATABASE becomes
//  authoritative — so admins can add and remove categories and the
//  change reflects across the whole storefront. When the DB is empty
//  (or not configured), we fall back to the built-in starter list.
// -------------------------------------------------------------

type Row = Record<string, unknown>;

function mapCatRow(r: Row): Category {
  return {
    id: String(r.id),
    name: String(r.name ?? ""),
    slug: String(r.slug ?? ""),
    description: String(r.description ?? ""),
    image: String(r.image ?? ""),
    icon: String(r.icon ?? "Tag"),
  };
}

/** All categories — DB ones if seeded, otherwise the built-in list. */
export async function getCategories(): Promise<Category[]> {
  const admin = createAdminClient();
  if (!admin) return localCategories;
  try {
    const { data, error } = await admin
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) return localCategories;
    return data.map(mapCatRow);
  } catch {
    return localCategories;
  }
}

/**
 * Cached categories for the storefront chrome (navbar/footer render on every
 * page, so this saves one DB round-trip per view). 5-minute freshness; admin
 * screens keep calling getCategories() directly so edits show up instantly.
 */
export const getCategoriesCached = unstable_cache(getCategories, ["categories"], {
  revalidate: 300,
});

/** Find a single category by slug (DB-aware). */
export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug);
}

/**
 * Whether the database currently holds any categories. The admin UI uses
 * this to decide whether to show the "Load default categories" button.
 */
export async function categoriesInDb(): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  try {
    const { count } = await admin
      .from("categories")
      .select("*", { count: "exact", head: true });
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}
