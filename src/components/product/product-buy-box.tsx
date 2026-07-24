"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Truck,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type { Product } from "@/types";
import { useStore } from "@/components/providers/store-provider";
import { usePrefs } from "@/components/providers/prefs-provider";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { discountPercent, cn } from "@/lib/utils";

export function ProductBuyBox({
  product,
  onVariantChange,
}: {
  product: Product;
  onVariantChange?: (value: string) => void;
}) {
  const router = useRouter();
  const { addItem, toggleWishlist, isWishlisted, setCartOpen } = useStore();
  const { formatPrice, t } = usePrefs();
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<Record<string, string>>(() =>
    Object.fromEntries((product.variants ?? []).map((v) => [v.name, v.values[0]])),
  );
  const [openInfo, setOpenInfo] = useState<string | null>("shipping");

  const wished = isWishlisted(product.id);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 8;

  function buildItem() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      maxStock: product.stock,
      variant: product.variants?.length ? variant : undefined,
    };
  }

  function add() {
    if (outOfStock) return;
    addItem(buildItem(), qty);
  }

  function buyNow() {
    if (outOfStock) return;
    addItem(buildItem(), qty);
    setCartOpen(false);
    router.push("/checkout");
  }

  return (
    <div className="min-w-0">
      {/* Brand + badges */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium uppercase tracking-wider text-muted">
          {product.brand}
        </span>
        {product.badge && <Badge variant={product.badge}>{product.badge}</Badge>}
      </div>

      <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {product.name}
      </h1>

      <div className="mt-3 flex items-center gap-4">
        <Rating value={product.rating} count={product.reviewCount} size={16} />
      </div>

      {/* Price */}
      <div className="mt-5 flex items-end gap-3">
        <span className="font-display text-3xl font-semibold text-ink">
          {formatPrice(product.price)}
        </span>
        {product.compareAtPrice && (
          <span className="pb-1 text-lg text-muted line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
        {discount && (
          <span className="mb-1 rounded-full bg-success/15 px-2 py-0.5 text-sm font-semibold text-success">
            {t("product.save")} {discount}%
          </span>
        )}
      </div>

      {product.shortDescription &&
        !/^[A-Za-z][A-Za-z0-9 /&()'-]{1,32}:\s/.test(product.shortDescription) && (
          <p className="mt-5 leading-relaxed text-ink-soft">
            {product.shortDescription}
          </p>
        )}

      {/* Variants */}
      {product.variants?.map((v) => (
        <div key={v.name} className="mt-6">
          <p className="mb-2 text-sm font-medium text-ink">
            {v.name}: <span className="text-ink-soft">{variant[v.name]}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {v.values.map((val) => (
              <button
                key={val}
                onClick={() => {
                  setVariant((prev) => ({ ...prev, [v.name]: val }));
                  onVariantChange?.(val);
                }}
                className={cn(
                  "max-w-full break-words rounded-full border px-4 py-2 text-sm transition-colors",
                  variant[v.name] === val
                    ? "border-gold bg-gold/10 text-gold-strong"
                    : "border-border hover:border-ink/40",
                )}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Stock note */}
      <div className="mt-6 flex items-center gap-2 text-sm">
        {outOfStock ? (
          <span className="font-medium text-danger">{t("product.soldOut")}</span>
        ) : lowStock ? (
          <span className="font-medium text-danger">
            {t("buybox.lowStockPre")} {product.stock} {t("buybox.lowStockPost")}
          </span>
        ) : (
          <span className="font-medium text-success">{t("product.inStock")}</span>
        )}
      </div>

      {/* Quantity + actions */}
      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center rounded-full border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-12 w-12 place-items-center hover:text-gold-strong"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}
            className="grid h-12 w-12 place-items-center hover:text-gold-strong"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => toggleWishlist(product.id)}
          className={cn(
            "grid h-12 w-12 place-items-center rounded-full border border-border transition-colors hover:border-danger",
            wished && "border-danger text-danger",
          )}
          aria-label="Add to wishlist"
        >
          <Heart className={cn("h-5 w-5", wished && "fill-danger")} />
        </button>
      </div>

      {product.affiliateUrl ? (
        <div className="mt-4">
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 font-medium text-white shadow-gold transition-all hover:-translate-y-0.5 hover:bg-gold-strong"
          >
            <ExternalLink className="h-5 w-5" />
            {t("product.buyNowExt")}
          </a>
          <p className="mt-2 text-center text-xs text-muted">
            {t("buybox.affiliateNote")}
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={add}
            disabled={outOfStock}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-medium text-paper shadow-luxe transition-all hover:-translate-y-0.5 hover:bg-gold hover:text-white disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="h-5 w-5" />
            {t("common.addToCart")}
          </button>
          <button
            onClick={buyNow}
            disabled={outOfStock}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 font-medium text-white shadow-gold transition-all hover:-translate-y-0.5 hover:bg-gold-strong disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Zap className="h-5 w-5" />
            {t("common.buyNow")}
          </button>
        </div>
      )}

      {/* Trust row */}
      <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-4 text-center">
        {[
          { icon: Truck, text: t("product.freeShipping") },
          { icon: RefreshCw, text: t("product.returns30") },
          { icon: ShieldCheck, text: t("product.secureCheckout") },
        ].map((t) => (
          <div key={t.text} className="flex flex-col items-center gap-1.5">
            <t.icon className="h-5 w-5 text-gold-strong" />
            <span className="text-xs text-ink-soft">{t.text}</span>
          </div>
        ))}
      </div>

      {/* Ask the AI assistant about this exact product */}
      <button
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent("velcarro:ask-ai", {
              detail: { question: `${t("ai.askProduct")}: ${product.name}` },
            }),
          )
        }
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-6 py-3 text-sm font-medium text-gold-strong transition-colors hover:border-gold hover:bg-gold/10"
      >
        <Sparkles className="h-4 w-4" />
        {t("ai.askProduct")}
      </button>

      {/* Info accordions */}
      <div className="mt-6 divide-y divide-border border-y border-border">
        <InfoRow
          id="shipping"
          title={t("product.shippingInfo")}
          open={openInfo === "shipping"}
          onToggle={(id) => setOpenInfo(openInfo === id ? null : id)}
        >
          {t("buybox.shippingBody")}
        </InfoRow>
        <InfoRow
          id="returns"
          title={t("product.returnsInfo")}
          open={openInfo === "returns"}
          onToggle={(id) => setOpenInfo(openInfo === id ? null : id)}
        >
          {t("buybox.returnsBody")}
        </InfoRow>
        {product.features.length > 0 && (
          <InfoRow
            id="details"
            title={t("product.productDetails")}
            open={openInfo === "details"}
            onToggle={(id) => setOpenInfo(openInfo === id ? null : id)}
          >
            <ul className="list-inside list-disc space-y-1">
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </InfoRow>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="pb-4 text-sm leading-relaxed text-ink-soft">{children}</div>}
    </div>
  );
}
