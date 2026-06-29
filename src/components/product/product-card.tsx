"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, ExternalLink } from "lucide-react";
import type { Product } from "@/types";
import { cn, discountPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { useStore } from "@/components/providers/store-provider";
import { usePrefs } from "@/components/providers/prefs-provider";

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const { addItem, toggleWishlist, isWishlisted } = useStore();
  const { formatPrice } = usePrefs();
  const wished = isWishlisted(product.id);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 8;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    // Affiliate product → send the shopper to the partner link.
    if (product.affiliateUrl) {
      window.open(product.affiliateUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (outOfStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      maxStock: product.stock,
      variant: undefined,
    });
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn("group card-lift block", className)}
    >
      <div className="relative overflow-hidden rounded-xl bg-paper-2">
        {/* Image with hover crossfade to 2nd shot */}
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={priority}
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
          <Image
            src={product.images[1] ?? product.images[0]}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            aria-hidden
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </div>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && <Badge variant={product.badge}>{product.badge}</Badge>}
          {discount && !product.badge && <Badge variant="Sale">-{discount}%</Badge>}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass text-ink transition-colors hover:text-gold-strong"
        >
          <Heart className={cn("h-4 w-4", wished && "fill-danger text-danger")} />
        </button>

        {/* Quick add bar */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={quickAdd}
            disabled={!product.affiliateUrl && outOfStock}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-luxe transition-colors",
              !product.affiliateUrl && outOfStock
                ? "cursor-not-allowed bg-ink/40 text-paper"
                : "bg-ink text-paper hover:bg-gold hover:text-white",
            )}
          >
            {product.affiliateUrl ? (
              <>
                <ExternalLink className="h-4 w-4" />
                View deal
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                {outOfStock ? "Sold out" : "Add to cart"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3.5 px-0.5">
        <p className="text-[0.7rem] font-medium uppercase tracking-wider text-muted">
          {product.brand}
        </p>
        <h3 className="mt-1 line-clamp-1 font-medium text-ink transition-colors group-hover:text-gold-strong">
          {product.name}
        </h3>
        <div className="mt-1.5">
          <Rating value={product.rating} count={product.reviewCount} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-ink">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          {lowStock && (
            <span className="ml-auto text-xs font-medium text-danger">
              Only {product.stock} left
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
