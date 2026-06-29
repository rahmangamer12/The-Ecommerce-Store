"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/input";
import { ImageUploader } from "@/components/admin/image-uploader";
import { categories } from "@/data/categories";
import { createProduct } from "@/lib/product-actions";

const badges = ["", "New", "Bestseller", "Limited", "Sale", "Editor's Pick"];

export function ProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    categorySlug: categories[0].slug,
    price: "",
    compareAtPrice: "",
    stock: "",
    shortDescription: "",
    description: "",
    features: "",
    tags: "",
    badge: "",
    affiliateUrl: "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createProduct({
        name: form.name,
        brand: form.brand,
        categorySlug: form.categorySlug,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        stock: Number(form.stock || 0),
        shortDescription: form.shortDescription,
        description: form.description,
        images,
        features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        badge: form.badge || undefined,
        affiliateUrl: form.affiliateUrl.trim() || undefined,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Product published", { description: form.name });
      router.push("/admin/products");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      {/* Images */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Product images</h2>
        <p className="mt-1 text-sm text-muted">
          Upload real photos of your product (the first image is the main one).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {images.map((url) => (
            <div key={url} className="relative h-24 w-20 overflow-hidden rounded-lg border border-border">
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                onClick={() => setImages((arr) => arr.filter((u) => u !== url))}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-paper"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <ImageUploader onUploaded={(url) => setImages((arr) => [...arr, url])} />
        </div>
      </section>

      {/* Details */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Product name</Label>
            <Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Aether Pro Wireless Charger" />
          </div>
          <div>
            <Label>Brand</Label>
            <Input required value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <select
              value={form.categorySlug}
              onChange={(e) => set("categorySlug", e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-gold focus-visible:outline-none"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Price (USD)</Label>
            <Input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </div>
          <div>
            <Label>Compare-at price (optional)</Label>
            <Input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} />
          </div>
          <div>
            <Label>Stock</Label>
            <Input required type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </div>
          <div>
            <Label>Badge (optional)</Label>
            <select
              value={form.badge}
              onChange={(e) => set("badge", e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-gold focus-visible:outline-none"
            >
              {badges.map((b) => (
                <option key={b} value={b}>{b || "None"}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label>Short description</Label>
            <Input required value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Full description</Label>
            <Textarea required value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Highlights (comma separated)</Label>
            <Input value={form.features} onChange={(e) => set("features", e.target.value)} placeholder="Fast charging, Aluminium body, 2-year warranty" />
          </div>
          <div className="sm:col-span-2">
            <Label>Tags (comma separated)</Label>
            <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="charger, desk, gift" />
          </div>
          <div className="sm:col-span-2">
            <Label>Affiliate link (optional)</Label>
            <Input
              type="url"
              value={form.affiliateUrl}
              onChange={(e) => set("affiliateUrl", e.target.value)}
              placeholder="https://www.amazon.com/dp/XXXX?tag=youraffiliate-20"
            />
            <p className="mt-1 text-xs text-muted">
              If set, the buy button sends shoppers to this link (e.g. your Amazon
              affiliate URL) instead of using the cart — so you earn commission.
            </p>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-gold px-7 py-3 text-sm font-medium text-white shadow-gold transition-colors hover:bg-gold-strong disabled:opacity-60"
        >
          {loading ? "Publishing…" : "Publish product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-full border border-border px-7 py-3 text-sm font-medium hover:border-gold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
