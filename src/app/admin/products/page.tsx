import { ProductsTable } from "@/components/admin/products-table";
import { getAllProducts } from "@/data/products";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Products</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your catalogue — edit details, stock and pricing.
        </p>
      </div>
      <ProductsTable products={getAllProducts()} />
    </div>
  );
}
