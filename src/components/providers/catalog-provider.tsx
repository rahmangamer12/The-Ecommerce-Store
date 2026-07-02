"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { Product } from "@/types";

// -------------------------------------------------------------
//  Client-side catalogue. Fetches the store's real products once
//  (from /api/catalog) and shares them with client features that
//  can't run server code: instant search, wishlist, recently
//  viewed and the cart upsell. This is what makes those surfaces
//  show real products instead of the built-in demo data.
// -------------------------------------------------------------

type CatalogState = {
  products: Product[];
  loaded: boolean;
  getById: (id: string) => Product | undefined;
  getByIds: (ids: string[]) => Product[];
  getBySlugs: (slugs: string[]) => Product[];
  search: (query: string, limit?: number) => Product[];
  featured: (limit?: number) => Product[];
};

const CatalogContext = createContext<CatalogState | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((d: { products?: Product[] }) => {
        if (!active) return;
        if (Array.isArray(d.products)) setProducts(d.products);
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const getById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );

  const getByIds = useCallback(
    (ids: string[]) =>
      ids
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [products],
  );

  const getBySlugs = useCallback(
    (slugs: string[]) =>
      slugs
        .map((s) => products.find((p) => p.slug === s))
        .filter((p): p is Product => Boolean(p)),
    [products],
  );

  const search = useCallback(
    (query: string, limit?: number) => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const hits = products.filter((p) =>
        [p.name, p.brand, p.shortDescription, p.categorySlug, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
      return limit ? hits.slice(0, limit) : hits;
    },
    [products],
  );

  const featured = useCallback(
    (limit = 6) => {
      const flagged = products.filter((p) => p.featured);
      return (flagged.length ? flagged : products).slice(0, limit);
    },
    [products],
  );

  const value = useMemo<CatalogState>(
    () => ({ products, loaded, getById, getByIds, getBySlugs, search, featured }),
    [products, loaded, getById, getByIds, getBySlugs, search, featured],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within <CatalogProvider>");
  return ctx;
}
