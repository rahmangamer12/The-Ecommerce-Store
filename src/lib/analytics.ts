"use client";

/**
 * Unified analytics event helper. Safely forwards events to whichever
 * pixels are loaded (GA4 via gtag, GTM dataLayer, Meta Pixel, TikTok).
 * No-ops on the server or when no pixel is present — never throws.
 */

type Props = Record<string, unknown>;

// Minimal typings for the global trackers we may have loaded.
type W = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  fbq?: (...args: unknown[]) => void;
  ttq?: { track?: (event: string, props?: Props) => void };
};

export function trackEvent(event: string, props: Props = {}): void {
  if (typeof window === "undefined") return;
  const w = window as W;

  // Google Analytics 4
  w.gtag?.("event", event, props);

  // Google Tag Manager
  w.dataLayer?.push({ event, ...props });

  // Meta Pixel — map common ecommerce events to its standard names
  const metaMap: Record<string, string> = {
    view_item: "ViewContent",
    add_to_cart: "AddToCart",
    begin_checkout: "InitiateCheckout",
    purchase: "Purchase",
    add_to_wishlist: "AddToWishlist",
    search: "Search",
  };
  if (w.fbq && metaMap[event]) w.fbq("track", metaMap[event], props);

  // TikTok Pixel
  w.ttq?.track?.(event, props);
}

// Convenience wrappers for the common ecommerce funnel.
export const analyticsEvents = {
  viewItem: (id: string, name: string, price: number) =>
    trackEvent("view_item", { item_id: id, item_name: name, value: price }),
  addToCart: (id: string, name: string, price: number, quantity = 1) =>
    trackEvent("add_to_cart", { item_id: id, item_name: name, value: price, quantity }),
  beginCheckout: (value: number) => trackEvent("begin_checkout", { value }),
  purchase: (orderId: string, value: number) =>
    trackEvent("purchase", { transaction_id: orderId, value }),
  search: (query: string) => trackEvent("search", { search_term: query }),
};
