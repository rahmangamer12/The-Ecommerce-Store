import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

// Local sample products have ids like "p3"; database products use UUIDs.
function isDbProduct(id: string) {
  return !/^p\d+$/.test(id);
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getCatalog()).find((p) => p.id === id);

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
          Edit product
        </h1>
      </div>

      {!product ? (
        <p className="text-ink-soft">Product not found.</p>
      ) : !isDbProduct(product.id) ? (
        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-6 text-sm text-ink-soft">
          This is a built-in <strong>starter</strong> product. To edit it, first
          click <strong>“Import starter products”</strong> on the Products page —
          that copies them into your database so you can edit and delete them.
        </div>
      ) : (
        <ProductForm product={product} />
      )}
    </div>
  );
}
