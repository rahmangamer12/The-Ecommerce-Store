import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Add a product
        </h1>
        <p className="mt-1 text-sm text-muted">
          Upload your own product with real photos. It goes live in your store
          instantly.
        </p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
