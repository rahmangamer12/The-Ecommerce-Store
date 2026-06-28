import { ProductsTable } from "@/components/admin/products-table";
import { getCatalog } from "@/lib/catalog";

// Always fresh so newly added products show immediately.
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getCatalog();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Products</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your catalogue — add new products, edit details, stock and pricing.
        </p>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
