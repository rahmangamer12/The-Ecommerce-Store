"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// A flash-sale section with a live countdown (resets at end of day) and the
// products currently on sale. Classic high-converting e-commerce block.
export function FlashDeal({ products }: { products: Product[] }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    function tick() {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      setTime({
        h: Math.floor(diff / 3.6e6),
        m: Math.floor((diff % 3.6e6) / 6e4),
        s: Math.floor((diff % 6e4) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-gold to-gold-strong px-5 py-4 text-white shadow-gold sm:px-8 sm:py-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20">
            <Zap className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Limited time
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Flash Sale
            </h2>
          </div>
        </div>
        {/* Countdown */}
        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium text-white/90 sm:inline">
            Ends in
          </span>
          {[time.h, time.m, time.s].map((v, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 font-mono text-lg font-semibold text-white backdrop-blur">
                {pad(v)}
              </span>
              {i < 2 && <span className="font-semibold text-white/80">:</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {products.slice(0, 5).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
