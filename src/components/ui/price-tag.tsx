"use client";

import { usePrefs } from "@/components/providers/prefs-provider";

// Renders a price in the shopper's SELECTED currency (converted + formatted).
// Use this anywhere a price is shown outside a ProductCard so the currency
// switcher actually updates it.
export function PriceTag({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const { formatPrice } = usePrefs();
  return <span className={className}>{formatPrice(value)}</span>;
}
