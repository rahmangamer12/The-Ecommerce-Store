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
  images: string[];
  description?: string;
  price?: number;
  host: string;
};

// Paste any product link (Amazon, AliExpress, …) → we pull its title/photo/
// price from the page, you set your price, and it's added as an affiliate
// product whose buy button links out to that URL (you earn the commission).
export function AffiliateImport({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [categorySlug, setCategorySlug] = useState("__auto__");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [fetching, setFetching] = useState(false);
  const [importing, setImporting] = useState(false);
  // Editable fields (prefilled from fetch, but the admin can fix / fill them —
  // needed for sites like Alibaba that block auto-import).
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagesText, setImagesText] = useState("");

  function parseImages(text: string): string[] {
    return text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => /^https?:\/\//i.test(s))
      .slice(0, 8);
  }

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
      setName(res.data.title ?? "");
      setDescription(res.data.description ?? "");
      setImagesText((res.data.images ?? []).join("\n"));
      if (res.data.price) setPrice(String(res.data.price));
      if (res.note) {
        toast.warning("Fill the details by hand", { description: res.note });
      } else {
        toast.success("Details loaded — check them and import.");
      }
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
    const images = parseImages(imagesText);
    if (images.length === 0) {
      toast.error("Add at least one image URL (copy it from the product page).");
      return;
    }
    setImporting(true);
    try {
      const res = await importAffiliateProduct({
        url: url.trim(),
        categorySlug,
        price: Number(price),
        name: name.trim() || undefined,
        images,
        description: description.trim() || undefined,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Affiliate product added", { description: res.name });
      setUrl("");
      setPrice("");
      setName("");
      setDescription("");
      setImagesText("");
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
            <option value="__auto__">✨ Auto — let AI choose</option>
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

      {/* Editable details — prefilled from fetch, fix anything by hand */}
      {preview && (
        <div className="mt-5 space-y-4 rounded-xl border border-border bg-paper-2/40 p-4">
          <p className="inline-flex items-center gap-1 text-xs text-muted">
            <ExternalLink className="h-3 w-3" /> {preview.host}
          </p>

          <div>
            <Label>Product title</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Magnetic Camera Frame Holder"
            />
          </div>

          <div>
            <Label>Image URLs (one per line)</Label>
            <textarea
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              rows={3}
              placeholder={"https://…/photo-1.jpg\nhttps://…/photo-2.jpg"}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-gold focus-visible:outline-none"
            />
            <p className="mt-1 text-xs text-muted">
              Product page pe image par right-click → “Copy image address”, phir
              yahan paste karo (har line pe ek). Pehli image cover banegi.
            </p>
            {/* Live thumbnails */}
            {parseImages(imagesText).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {parseImages(imagesText).map((src, i) => (
                  <div
                    key={i}
                    className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-white"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short product description…"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-gold focus-visible:outline-none"
            />
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
