"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Link2, Loader2, PackagePlus } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import type { Category } from "@/types";
import {
  searchCjProducts,
  importCjProduct,
  type CjSearchResult,
} from "@/lib/cj-actions";
import type { CjListItem } from "@/lib/cj";

// Admin panel to bring CJ Dropshipping products into your catalogue.
// Two ways to add: paste a CJ product link/ID, or search CJ's catalogue.
// A shared "category" + "markup" applies to whatever you import.
export function CjImport({
  categories,
  connected,
}: {
  categories: Category[];
  connected: boolean;
}) {
  const router = useRouter();
  const [categorySlug, setCategorySlug] = useState("__auto__");
  const [markup, setMarkup] = useState("2");

  // Paste-a-link flow
  const [pidOrUrl, setPidOrUrl] = useState("");
  const [importing, setImporting] = useState(false);

  // Search flow
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<CjListItem[]>([]);
  const [busyPid, setBusyPid] = useState<string | null>(null);

  async function doImport(value: string) {
    if (!value.trim()) {
      toast.error("Paste a CJ product link or ID first.");
      return;
    }
    const result = await importCjProduct({
      pidOrUrl: value.trim(),
      categorySlug,
      markup: Number(markup) || undefined,
    });
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success("Imported from CJ", { description: result.name });
    router.refresh();
    return true;
  }

  async function handlePasteImport() {
    setImporting(true);
    try {
      const ok = await doImport(pidOrUrl);
      if (ok) setPidOrUrl("");
    } finally {
      setImporting(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) {
      toast.error("Type at least 2 characters to search.");
      return;
    }
    setSearching(true);
    setResults([]);
    try {
      const res: CjSearchResult = await searchCjProducts(query.trim());
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setResults(res.items);
      if (res.items.length === 0) toast.info("No products found on CJ.");
    } finally {
      setSearching(false);
    }
  }

  async function importFromSearch(item: CjListItem) {
    setBusyPid(item.pid);
    try {
      await doImport(item.pid);
    } finally {
      setBusyPid(null);
    }
  }

  return (
    <div className="space-y-8">
      {!connected && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <b>CJ isn&apos;t connected yet.</b> Add <code>CJ_EMAIL</code> and{" "}
          <code>CJ_API_KEY</code> to your environment (locally in{" "}
          <code>.env.local</code>, and in Vercel → Settings → Environment
          Variables), then redeploy. Importing will work once it&apos;s set.
        </div>
      )}

      {/* Shared controls */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Import settings</h2>
        <p className="mt-1 text-sm text-muted">
          These apply to everything you import below.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            <p className="mt-1 text-xs text-muted">
              AI reads each product and files it under the best category.
            </p>
          </div>
          <div>
            <Label>Markup (×)</Label>
            <Input
              type="number"
              min="1"
              step="0.1"
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">
              2 = sell at double what CJ charges you (your profit margin).
            </p>
          </div>
        </div>
      </section>

      {/* Paste a link / ID */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <Link2 className="h-4 w-4 text-gold-strong" /> Paste a CJ link or ID
        </h2>
        <p className="mt-1 text-sm text-muted">
          Open a product on CJ, copy its link (or product ID), and paste it here.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={pidOrUrl}
            onChange={(e) => setPidOrUrl(e.target.value)}
            placeholder="https://cjdropshipping.com/product/...  or  a product ID"
            className="flex-1"
          />
          <button
            type="button"
            onClick={handlePasteImport}
            disabled={importing || !connected}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white shadow-gold transition-colors hover:bg-gold-strong disabled:opacity-60"
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PackagePlus className="h-4 w-4" />
            )}
            Import
          </button>
        </div>
      </section>

      {/* Search CJ */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <Search className="h-4 w-4 text-gold-strong" /> Search CJ catalogue
        </h2>
        <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. wireless earbuds, watch, phone case"
            className="flex-1"
          />
          <button
            type="submit"
            disabled={searching || !connected}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-gold disabled:opacity-60"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </form>

        {results.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((item) => (
              <div
                key={item.pid}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-paper-2/40"
              >
                <div className="relative aspect-square bg-paper-2">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="line-clamp-2 text-xs font-medium">{item.name}</p>
                  <p className="mt-1 text-sm font-semibold text-gold-strong">
                    ${item.price.toFixed(2)}{" "}
                    <span className="text-[10px] font-normal text-muted">
                      CJ cost
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => importFromSearch(item)}
                    disabled={busyPid === item.pid}
                    className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-gold px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-gold-strong disabled:opacity-60"
                  >
                    {busyPid === item.pid ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <PackagePlus className="h-3.5 w-3.5" />
                    )}
                    Import
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
