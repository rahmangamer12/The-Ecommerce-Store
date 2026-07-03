import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CjImport } from "@/components/admin/cj-import";
import { AffiliateImport } from "@/components/admin/affiliate-import";
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
          Import products
        </h1>
        <p className="mt-1 text-sm text-muted">
          Two ways to add products: dropship from CJ (paid orders are forwarded
          to CJ automatically), or add any product as an affiliate link (you earn
          the commission when shoppers buy on the partner site).
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Dropshipping — from CJ
        </h2>
        <CjImport categories={categories} connected={isCjConfigured} />
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Affiliate — from any link
        </h2>
        <AffiliateImport categories={categories} />
      </div>
    </div>
  );
}
