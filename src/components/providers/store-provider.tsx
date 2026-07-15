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
import { ratesForCode } from "@/config/geo-rates";
import { findCoupon } from "@/data/coupons";
import { analyticsEvents } from "@/lib/analytics";
import { usePrefs } from "@/components/providers/prefs-provider";

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
  // destination country (ISO alpha-2) — drives location-based tax & shipping
  shipCountry: string;
  setShipCountry: (code: string) => void;
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
  country: "luxora.country",
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
  const { t } = usePrefs();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Destination country for location-based tax & shipping. Defaults to the
  // store's default country until the shopper picks/detects one.
  const [shipCountry, setShipCountry] = useState<string>(
    siteConfig.defaultCountry,
  );

  // Hydrate from localStorage once on mount. This MUST run in an effect
  // (not a useState initializer) to avoid a server/client hydration mismatch,
  // so the set-state-in-effect rule is intentionally disabled here.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setItems(readLS<CartItem[]>(LS.cart, []));
    setWishlist(readLS<string[]>(LS.wishlist, []));
    setRecentlyViewed(readLS<string[]>(LS.recent, []));
    setCoupon(readLS<Coupon | null>(LS.coupon, null));
    setShipCountry(readLS<string>(LS.country, siteConfig.defaultCountry));
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
  useEffect(() => {
    if (mounted) window.localStorage.setItem(LS.country, JSON.stringify(shipCountry));
  }, [shipCountry, mounted]);

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
      toast.success(t("toast.addedToCart"), { description: item.name });
      // Forward to any configured analytics pixels (GA4/GTM/Meta/TikTok).
      analyticsEvents.addToCart(item.productId, item.name, item.price, qty);
      setCartOpen(true);
    },
    [t],
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
        toast(t("toast.removedWishlist"));
        return prev.filter((id) => id !== productId);
      }
      toast.success(t("toast.savedWishlist"));
      return [...prev, productId];
    });
  }, [t]);

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
      toast.success(`${t("toast.couponApplied")}: ${found.code}`, {
        description: found.description,
      });
      return true;
    }
    toast.error(t("toast.invalidCoupon"));
    return false;
  }, [t]);

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
    // Tax & shipping depend on the shopper's country.
    const rate = ratesForCode(shipCountry);
    let discount = 0;
    let freeShip = subtotal >= rate.freeShippingThreshold;

    if (coupon && (!coupon.minSubtotal || subtotal >= coupon.minSubtotal)) {
      if (coupon.type === "percent") discount = (subtotal * coupon.value) / 100;
      else if (coupon.type === "fixed") discount = coupon.value;
      else if (coupon.type === "free_shipping") freeShip = true;
    }
    discount = Math.min(discount, subtotal);

    const shipping = subtotal === 0 ? 0 : freeShip ? 0 : rate.shipping;
    const taxable = Math.max(0, subtotal - discount);
    const tax = +(taxable * rate.taxRate).toFixed(2);
    const total = +(taxable + shipping + tax).toFixed(2);

    return { subtotal, shipping, tax, discount, total };
  }, [subtotal, coupon, shipCountry]);

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
    shipCountry,
    setShipCountry,
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
