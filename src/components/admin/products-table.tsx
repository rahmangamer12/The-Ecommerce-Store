"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";

export function ProductsTable({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const filtered = products.filter((p) =>
    `${p.name} ${p.brand} ${p.categorySlug}`.toLowerCase().includes(q.toLowerCase()),
  );

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
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-gold hover:text-white"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

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
            {filtered.map((p) => (
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
                  {p.stock === 0 ? (
                    <Badge variant="Limited">Sold out</Badge>
                  ) : p.badge ? (
                    <Badge variant={p.badge}>{p.badge}</Badge>
                  ) : (
                    <span className="text-xs text-success">Active</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => toast("Edit product", { description: p.name })}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-ink/5"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toast.error("Delete product", { description: p.name })}
                      className="grid h-8 w-8 place-items-center rounded-lg text-danger hover:bg-danger/10"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted">{filtered.length} products</p>
    </div>
  );
}
