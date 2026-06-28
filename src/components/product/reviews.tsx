import { BadgeCheck } from "lucide-react";
import type { Product } from "@/types";
import { getReviews } from "@/data/products";
import { Rating } from "@/components/ui/rating";
import { formatDate } from "@/lib/utils";

// Static review summary + list (sample data; wire to Supabase `reviews` later).
export function Reviews({ product }: { product: Product }) {
  const reviews = getReviews(product.slug);
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct:
      star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 6 : star === 2 ? 1 : 1,
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">
        Customer reviews
      </h2>
      <div className="mt-8 grid gap-10 lg:grid-cols-[300px_1fr]">
        {/* Summary */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-semibold">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-sm text-muted">/ 5</span>
          </div>
          <div className="mt-2">
            <Rating value={product.rating} size={16} />
          </div>
          <p className="mt-1 text-sm text-muted">
            Based on {product.reviewCount} reviews
          </p>
          <div className="mt-5 space-y-2">
            {breakdown.map((b) => (
              <div key={b.star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted">{b.star}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-2">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${b.pct}%` }} />
                </div>
                <span className="w-8 text-right text-muted">{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-6">
          {reviews.map((r) => (
            <article key={r.id} className="border-b border-border pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-paper-2 font-semibold text-ink">
                    {r.author.charAt(0)}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      {r.author}
                      {r.verified && (
                        <BadgeCheck className="h-4 w-4 text-success" />
                      )}
                    </p>
                    <p className="text-xs text-muted">{formatDate(r.date)}</p>
                  </div>
                </div>
                <Rating value={r.rating} size={14} />
              </div>
              <h3 className="mt-3 font-medium">{r.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{r.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
