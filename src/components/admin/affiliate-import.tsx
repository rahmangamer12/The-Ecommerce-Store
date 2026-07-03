"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Link2, Loader2, Search, ExternalLink, PackagePlus } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import type { Category } from "@/types";
import {
  previewAffiliate,
  importAffiliateProduct,
} from "@/lib/affiliate-actions";

type Preview = {
  title?: string;
  image?: string;
  description?: string;
  price?: number;
  host: string;
};

// Paste any product link (Amazon, AliExpress, …) → we pull its title/photo/
// price from the page, you set your price, and it's added as an affiliate
// product whose buy button links out to that URL (you earn the commission).
export function AffiliateImport({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [fetching, setFetching] = useState(false);
  const [importing, setImporting] = useState(false);

  async function onFetch() {
    if (!url.trim()) {
      toast.error("Paste a product link first.");
      return;
    }
    setFetching(true);
    setPreview(null);
    try {
      const res = await previewAffiliate(url.trim());
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setPreview(res.data);
      if (res.data.price) setPrice(String(res.data.price));
      toast.success("Details loaded — set your price and import.");
    } finally {
      setFetching(false);
    }
  }

  async function onImport() {
    if (!url.trim()) {
      toast.error("Paste a product link first.");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Enter the price you want to show.");
      return;
    }
    setImporting(true);
    try {
      const res = await importAffiliateProduct({
        url: url.trim(),
        categorySlug,
        price: Number(price),
        name: preview?.title,
        image: preview?.image,
        description: preview?.description,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Affiliate product added", { description: res.name });
      setUrl("");
      setPrice("");
      setPreview(null);
      router.refresh();
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <Link2 className="h-4 w-4 text-gold-strong" /> Affiliate product (any link)
      </h2>
      <p className="mt-1 text-sm text-muted">
        Paste a product link from Amazon, AliExpress or any store. We&apos;ll grab
        its photo, title and price. The buy button will send shoppers there so
        you earn the commission.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Product link</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.amazon.com/dp/XXXX?tag=youraffiliate-20"
              className="flex-1"
            />
            <button
              type="button"
              onClick={onFetch}
              disabled={fetching}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:border-gold disabled:opacity-60"
            >
              {fetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Fetch details
            </button>
          </div>
        </div>

        <div>
          <Label>Category</Label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-gold focus-visible:outline-none"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Price to show (USD)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 29.99"
          />
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="mt-5 flex gap-4 rounded-xl border border-border bg-paper-2/40 p-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-white">
            {preview.image ? (
              <Image
                src={preview.image}
                alt={preview.title ?? ""}
                fill
                sizes="96px"
                className="object-contain p-1"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium">
              {preview.title ?? "(no title found)"}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
              <ExternalLink className="h-3 w-3" /> {preview.host}
            </p>
            {preview.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted">
                {preview.description}
              </p>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onImport}
        disabled={importing}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white shadow-gold transition-colors hover:bg-gold-strong disabled:opacity-60"
      >
        {importing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PackagePlus className="h-4 w-4" />
        )}
        Add affiliate product
      </button>
    </section>
  );
}
