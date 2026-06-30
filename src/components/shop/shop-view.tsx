"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X, Check, ChevronDown } from "lucide-react";
import type { Product } from "@/types";
import { categories as localCategories } from "@/data/categories";
import type { Category } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { usePrefs } from "@/components/providers/prefs-provider";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "popular";

const sortOptions: { key: SortKey; tk: string }[] = [
  { key: "featured", tk: "shop.sortFeatured" },
  { key: "newest", tk: "shop.sortNewest" },
  { key: "popular", tk: "shop.sortPopular" },
  { key: "price-asc", tk: "shop.sortPriceAsc" },
  { key: "price-desc", tk: "shop.sortPriceDesc" },
];

const PAGE_SIZE = 8;

export function ShopView({
  products,
  lockedCategory,
  initialSort = "featured",
  initialSale = false,
  categories = localCategories,
}: {
  products: Product[];
  lockedCategory?: string; // when used on a category page
  initialSort?: SortKey;
  initialSale?: boolean;
  categories?: Category[];
}) {
  const { t } = usePrefs();
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [onSale, setOnSale] = useState(initialSale);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCats.length)
      list = list.filter((p) => selectedCats.includes(p.categorySlug));
    list = list.filter((p) => p.price <= maxPrice);
    if (onSale) list = list.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    if (inStock) list = list.filter((p) => p.stock > 0);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
        break;
      default:
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return list;
  }, [products, selectedCats, maxPrice, onSale, inStock, sort]);

  const visible = filtered.slice(0, page * PAGE_SIZE);

  function toggleCat(slug: string) {
    setPage(1);
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  const filterPanel = (
    <div className="space-y-8">
      {!lockedCategory && (
        <FilterGroup title={t("shop.filterCategory")}>
          <div className="space-y-2.5">
            {categories.map((cat) => (
              <label
                key={cat.slug}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft"
              >
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-md border transition-colors",
                    selectedCats.includes(cat.slug)
                      ? "border-gold bg-gold text-white"
                      : "border-border",
                  )}
                >
                  {selectedCats.includes(cat.slug) && <Check className="h-3.5 w-3.5" />}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selectedCats.includes(cat.slug)}
                  onChange={() => toggleCat(cat.slug)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title={`${t("shop.filterMaxPrice")}: ${maxPrice}`}>
        <input
          type="range"
          min={20}
          max={500}
          step={10}
          value={maxPrice}
          onChange={(e) => {
            setPage(1);
            setMaxPrice(Number(e.target.value));
          }}
          className="w-full accent-[var(--gold)]"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>$20</span>
          <span>$500</span>
        </div>
      </FilterGroup>

      <FilterGroup title={t("shop.filterAvailability")}>
        <div className="space-y-2.5">
          <Toggle label={t("shop.onSale")} checked={onSale} onChange={() => { setPage(1); setOnSale((v) => !v); }} />
          <Toggle label={t("shop.inStockOnly")} checked={inStock} onChange={() => { setPage(1); setInStock((v) => !v); }} />
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">{filterPanel}</div>
      </aside>

      <div>
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{filtered.length}</span> {t("shop.products")}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFilters(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> {t("shop.filters")}
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 appearance-none rounded-full border border-border bg-card pl-4 pr-9 text-sm focus:border-gold focus-visible:outline-none"
                aria-label="Sort products"
              >
                {sortOptions.map((o) => (
                  <option key={o.key} value={o.key}>
                    {t(o.tk as never)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
          </div>
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-display text-xl font-semibold">{t("shop.noMatch")}</p>
            <p className="mt-2 text-sm text-muted">
              {t("shop.noMatchDesc")}
            </p>
            <button
              onClick={() => {
                setSelectedCats([]);
                setMaxPrice(500);
                setOnSale(false);
                setInStock(false);
              }}
              className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper"
            >
              {t("shop.clearFilters")}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 3} />
            ))}
          </div>
        )}

        {/* Load more */}
        {visible.length < filtered.length && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-ink/20 px-8 py-3 text-sm font-medium transition-colors hover:border-gold hover:text-gold-strong"
            >
              {t("shop.loadMore")}
            </button>
          </div>
        )}
      </div>

      {/* Mobile filters drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-paper p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">{t("shop.filters")}</h3>
              <button
                onClick={() => setMobileFilters(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
            <button
              onClick={() => setMobileFilters(false)}
              className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-medium text-paper"
            >
              {t("shop.showResults")} ({filtered.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-sm text-ink-soft">
      {label}
      <button
        type="button"
        onClick={onChange}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-gold" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
            checked ? "left-[1.4rem]" : "left-0.5",
          )}
        />
      </button>
    </label>
  );
}
