"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductBuyBox } from "@/components/product/product-buy-box";

// Ties the gallery and the buy box together so that picking a variant
// (e.g. a colour) swaps the main gallery image to that variant's own photo.
export function ProductViewer({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  function onVariantChange(value: string) {
    const img = product.variantImages?.[value];
    if (img) setActiveImage(img);
  }

  return (
    <div className="grid items-start gap-8 md:grid-cols-2 md:gap-8 lg:gap-16">
      <ProductGallery
        images={product.images}
        name={product.name}
        activeImage={activeImage}
      />
      <ProductBuyBox product={product} onVariantChange={onVariantChange} />
    </div>
  );
}
