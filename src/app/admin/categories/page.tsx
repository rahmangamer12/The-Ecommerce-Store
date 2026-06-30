import { CategoriesManager } from "@/components/admin/categories-manager";
import { getCategories, categoriesInDb } from "@/lib/categories";
import { getCatalog } from "@/lib/catalog";

// Always fresh so newly added/removed categories show immediately.
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [cats, products, inDb] = await Promise.all([
    getCategories(),
    getCatalog(),
    categoriesInDb(),
  ]);

  // Count how many products sit in each category (for the "in use" badge).
  const counts: Record<string, number> = {};
  for (const p of products) {
    counts[p.categorySlug] = (counts[p.categorySlug] ?? 0) + 1;
  }
  const categories = cats.map((c) => ({
    ...c,
    productCount: counts[c.slug] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Categories
        </h1>
        <p className="mt-1 text-sm text-muted">
          Add, edit or remove the categories shoppers browse. Changes appear
          across your store instantly.
        </p>
      </div>
      <CategoriesManager categories={categories} inDb={inDb} />
    </div>
  );
}
