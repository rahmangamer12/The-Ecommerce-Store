"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X, Check, ChevronDown, Loader2 } from "lucide-react";
import type { Product, Category } from "@/types";
import type { ShopSort, ShopQuery } from "@/lib/catalog";
import { categories as localCategories } from "@/data/categories";
import { ProductCard } from "@/components/product/product-card";
import { usePrefs } from "@/components/providers/prefs-provider";
import { fetchShopProducts } from "@/app/shop/shop-actions";
import { cn } from "@/lib/utils";

const sortOptions: { key: ShopSort; tk: string }[] = [
  { key: "featured", tk: "shop.sortFeatured" },
  { key: "newest", tk: "shop.sortNewest" },
  { key: "popular", tk: "shop.sortPopular" },
  { key: "price-asc", tk: "shop.sortPriceAsc" },
  { key: "price-desc", tk: "shop.sortPriceDesc" },
];

const PAGE_SIZE = 24;

export function ShopView({
  initialProducts,
  initialTotal,
  lockedCategory,
  initialSort = "featured",
  initialSale = false,
  categories = localCategories,
}: {
  initialProducts: Product[];
  initialTotal: number;
  lockedCategory?: string;
  initialSort?: ShopSort;
  initialSale?: boolean;
  categories?: Category[];
}) {
  const { t } = usePrefs();
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [onSale, setOnSale] = useState(initialSale);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<ShopSort>(initialSort);
  const [mobileFilters, setMobileFilters] = useState(false);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const firstRender = useRef(true);

  function buildQuery(pageNum: number): ShopQuery {
    return {
      page: pageNum,
      pageSize: PAGE_SIZE,
      category: lockedCategory,
      categories: lockedCategory || !selectedCats.length ? undefined : selectedCats,
      sort,
      maxPrice,
      onSale: onSale || undefined,
      inStock: inStock || undefined,
    };
  }

  // Filters/sort changed → fetch a fresh page 1 from the server (replace list).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return; // initial data came from the server render already
    }
    let active = true;
    setLoading(true);
    fetchShopProducts(buildQuery(1))
      .then((res) => {
        if (!active) return;
        setProducts(res.products);
        setTotal(res.total);
        setPage(1);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCats, maxPrice, onSale, inStock, sort]);

  const hasMore = products.length < total;

  // Infinite scroll: fetch the next page from the server and append.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting) return;
        const next = page + 1;
        setLoading(true);
        try {
          const res = await fetchShopProducts(buildQuery(next));
          setProducts((prev) => [...prev, ...res.products]);
          setTotal(res.total);
          setPage(next);
        } finally {
          setLoading(false);
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, page]);

  function toggleCat(slug: string) {
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
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[var(--gold)]"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>$20</span>
          <span>$500</span>
        </div>
      </FilterGroup>

      <FilterGroup title={t("shop.filterAvailability")}>
        <div className="space-y-2.5">
          <Toggle label={t("shop.onSale")} checked={onSale} onChange={() => setOnSale((v) => !v)} />
          <Toggle label={t("shop.inStockOnly")} checked={inStock} onChange={() => setInStock((v) => !v)} />
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-24">{filterPanel}</div>
      </aside>

      <div>
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{total.toLocaleString()}</span>{" "}
            {t("shop.products")}
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
                onChange={(e) => setSort(e.target.value as ShopSort)}
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
        {products.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-display text-xl font-semibold">{t("shop.noMatch")}</p>
            <p className="mt-2 text-sm text-muted">{t("shop.noMatchDesc")}</p>
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
            {products.map((p, i) => (
              <ProductCard key={`${p.id}-${i}`} product={p} priority={i < 3} />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel + loading spinner */}
        {(hasMore || loading) && (
          <div ref={sentinelRef} className="mt-12 flex justify-center py-4 text-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
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
              {t("shop.showResults")} ({total.toLocaleString()})
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
