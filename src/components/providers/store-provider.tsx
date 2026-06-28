"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { toast } from "sonner";
import type { CartItem, Coupon } from "@/types";
import { siteConfig } from "@/config/site";
import { findCoupon } from "@/data/coupons";
import { analyticsEvents } from "@/lib/analytics";

// -------------------------------------------------------------
//  Client-side store: cart, wishlist, recently viewed, coupon.
//  Everything persists to localStorage so it survives refreshes
//  without needing the database. (DB sync can be added later.)
// -------------------------------------------------------------

type StoreState = {
  // cart
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string, variantKey?: string) => void;
  updateQty: (productId: string, qty: number, variantKey?: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  // cart drawer
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  // wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  // recently viewed (product slugs, newest first)
  recentlyViewed: string[];
  pushRecentlyViewed: (slug: string) => void;
  // coupon
  coupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  // totals
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  mounted: boolean;
};

const StoreContext = createContext<StoreState | null>(null);

const LS = {
  cart: "luxora.cart",
  wishlist: "luxora.wishlist",
  recent: "luxora.recent",
  coupon: "luxora.coupon",
};

function variantKeyOf(variant?: Record<string, string>) {
  if (!variant) return "";
  return Object.entries(variant)
    .map(([k, v]) => `${k}:${v}`)
    .sort()
    .join("|");
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage once on mount. This MUST run in an effect
  // (not a useState initializer) to avoid a server/client hydration mismatch,
  // so the set-state-in-effect rule is intentionally disabled here.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setItems(readLS<CartItem[]>(LS.cart, []));
    setWishlist(readLS<string[]>(LS.wishlist, []));
    setRecentlyViewed(readLS<string[]>(LS.recent, []));
    setCoupon(readLS<Coupon | null>(LS.coupon, null));
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist on change (after mount).
  useEffect(() => {
    if (mounted) window.localStorage.setItem(LS.cart, JSON.stringify(items));
  }, [items, mounted]);
  useEffect(() => {
    if (mounted) window.localStorage.setItem(LS.wishlist, JSON.stringify(wishlist));
  }, [wishlist, mounted]);
  useEffect(() => {
    if (mounted) window.localStorage.setItem(LS.recent, JSON.stringify(recentlyViewed));
  }, [recentlyViewed, mounted]);
  useEffect(() => {
    if (mounted) window.localStorage.setItem(LS.coupon, JSON.stringify(coupon));
  }, [coupon, mounted]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, qty = 1) => {
      setItems((prev) => {
        const key = variantKeyOf(item.variant);
        const idx = prev.findIndex(
          (i) => i.productId === item.productId && variantKeyOf(i.variant) === key,
        );
        if (idx >= 0) {
          const next = [...prev];
          const newQty = Math.min(next[idx].quantity + qty, item.maxStock);
          next[idx] = { ...next[idx], quantity: newQty };
          return next;
        }
        return [...prev, { ...item, quantity: Math.min(qty, item.maxStock) }];
      });
      toast.success("Added to cart", { description: item.name });
      // Forward to any configured analytics pixels (GA4/GTM/Meta/TikTok).
      analyticsEvents.addToCart(item.productId, item.name, item.price, qty);
      setCartOpen(true);
    },
    [],
  );

  const removeItem = useCallback((productId: string, variantKey = "") => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && variantKeyOf(i.variant) === variantKey),
      ),
    );
  }, []);

  const updateQty = useCallback(
    (productId: string, qty: number, variantKey = "") => {
      setItems((prev) =>
        prev
          .map((i) =>
            i.productId === productId && variantKeyOf(i.variant) === variantKey
              ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      );
    },
    [],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        toast("Removed from wishlist");
        return prev.filter((id) => id !== productId);
      }
      toast.success("Saved to wishlist");
      return [...prev, productId];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  const pushRecentlyViewed = useCallback((slug: string) => {
    setRecentlyViewed((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 8));
  }, []);

  const applyCoupon = useCallback((code: string) => {
    const found = findCoupon(code);
    if (found) {
      setCoupon(found);
      toast.success(`Coupon “${found.code}” applied`, {
        description: found.description,
      });
      return true;
    }
    toast.error("Invalid coupon code");
    return false;
  }, []);

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const cartCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const totals = useMemo(() => {
    let discount = 0;
    let freeShip = subtotal >= siteConfig.freeShippingThreshold;

    if (coupon && (!coupon.minSubtotal || subtotal >= coupon.minSubtotal)) {
      if (coupon.type === "percent") discount = (subtotal * coupon.value) / 100;
      else if (coupon.type === "fixed") discount = coupon.value;
      else if (coupon.type === "free_shipping") freeShip = true;
    }
    discount = Math.min(discount, subtotal);

    const shipping =
      subtotal === 0 ? 0 : freeShip ? 0 : siteConfig.shippingFlatRate;
    const taxable = Math.max(0, subtotal - discount);
    const tax = +(taxable * siteConfig.taxRate).toFixed(2);
    const total = +(taxable + shipping + tax).toFixed(2);

    return { subtotal, shipping, tax, discount, total };
  }, [subtotal, coupon]);

  const value: StoreState = {
    items,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    cartCount,
    subtotal,
    cartOpen,
    setCartOpen,
    wishlist,
    toggleWishlist,
    isWishlisted,
    recentlyViewed,
    pushRecentlyViewed,
    coupon,
    applyCoupon,
    removeCoupon,
    totals,
    mounted,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

export { variantKeyOf };
