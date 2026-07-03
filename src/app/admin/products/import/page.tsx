import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CjImport } from "@/components/admin/cj-import";
import { getCategories } from "@/lib/categories";
import { isCjConfigured } from "@/config/env";

export const dynamic = "force-dynamic";

export default async function ImportFromCjPage() {
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
          Import from CJ Dropshipping
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pull products straight from CJ into your store. Once imported, paid
          orders for these products are forwarded to CJ automatically.
        </p>
      </div>
      <CjImport categories={categories} connected={isCjConfigured} />
    </div>
  );
}
