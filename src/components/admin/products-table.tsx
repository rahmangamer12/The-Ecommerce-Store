"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, DownloadCloud, PackagePlus } from "lucide-react";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { deleteProduct, importStarterProducts } from "@/lib/product-actions";

// Local sample products have ids like "p3"; database products use UUIDs.
function isDbProduct(id: string) {
  return !/^p\d+$/.test(id);
}

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = products.filter((p) =>
    `${p.name} ${p.brand} ${p.categorySlug}`.toLowerCase().includes(q.toLowerCase()),
  );
  const hasSamples = products.some((p) => !isDbProduct(p.id));

  async function onImport() {
    setBusy(true);
    const res = await importStarterProducts();
    setBusy(false);
    if (res.ok) {
      toast.success(
        res.imported ? `Imported ${res.imported} products` : "Already imported",
        { description: "Starter products are now editable." },
      );
      router.refresh();
    } else {
      toast.error(res.error ?? "Import failed");
    }
  }

  async function onDelete(p: Product) {
    if (!isDbProduct(p.id)) {
      toast("Sample product", {
        description:
          "Samples vanish automatically once you add your first real product — just click “Add product”.",
      });
      return;
    }
    if (!window.confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    const res = await deleteProduct(p.id);
    if (res.ok) {
      toast.success("Product deleted", { description: p.name });
      router.refresh();
    } else {
      toast.error(res.error ?? "Delete failed");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="h-10 w-56 bg-transparent text-sm focus-visible:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {hasSamples && (
            <button
              onClick={onImport}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:border-gold disabled:opacity-60"
            >
              <DownloadCloud className="h-4 w-4" />
              {busy ? "Importing…" : "Import starter products"}
            </button>
          )}
          <Link
            href="/admin/products/import"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:border-gold"
          >
            <PackagePlus className="h-4 w-4" /> Import from CJ
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-gold hover:text-white"
          >
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </div>
      </div>

      {hasSamples && (
        <p className="mt-3 text-xs text-muted">
          These are built-in <span className="font-medium">sample</span> products.
          They disappear automatically the moment you{" "}
          <span className="font-medium">add your first real product</span> — or
          click <span className="font-medium">Import starter products</span> to
          keep and edit them.
        </p>
      )}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-paper-2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => {
              const editable = isDbProduct(p.id);
              return (
                <tr key={p.id} className="hover:bg-ink/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-paper-2">
                        <Image src={p.images[0]} alt={p.name} fill sizes="44px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/products/${p.slug}`} className="line-clamp-1 font-medium hover:text-gold-strong">
                          {p.name}
                        </Link>
                        <p className="text-xs text-muted">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink-soft">
                    {p.categorySlug.replace("-", " ")}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(p.price, p.currency)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(p.stock === 0 ? "text-danger" : p.stock <= 8 ? "text-gold-strong" : "text-ink-soft")}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!editable ? (
                      <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-xs font-medium text-muted">
                        Sample
                      </span>
                    ) : p.stock === 0 ? (
                      <Badge variant="Limited">Sold out</Badge>
                    ) : p.badge ? (
                      <Badge variant={p.badge}>{p.badge}</Badge>
                    ) : (
                      <span className="text-xs text-success">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-ink/5"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => onDelete(p)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-danger hover:bg-danger/10"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted">{filtered.length} products</p>
    </div>
  );
}
