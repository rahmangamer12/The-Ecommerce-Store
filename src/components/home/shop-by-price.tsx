import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/sections/section-header";
import { Reveal } from "@/components/ui/reveal";

const tiers = [
  { label: "Under $50", note: "Everyday treats", href: "/shop?sort=price-asc" },
  { label: "Under $100", note: "Smart upgrades", href: "/shop?sort=price-asc" },
  { label: "Under $200", note: "Considered gifts", href: "/shop" },
  { label: "The Luxe Edit", note: "Investment pieces", href: "/shop?sort=price-desc" },
];

// "Shop by price" — helps shoppers (and gift-givers) browse by budget.
export function ShopByPrice() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeader eyebrow="Find your fit" title="Shop by price" />
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiers.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="card-lift group flex flex-col justify-between rounded-2xl border border-border bg-card p-6"
          >
            <p className="text-sm text-muted">{t.note}</p>
            <div className="mt-8 flex items-end justify-between">
              <span className="font-display text-2xl font-semibold text-ink">{t.label}</span>
              <ArrowRight className="h-5 w-5 text-gold-strong transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
