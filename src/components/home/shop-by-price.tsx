import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/sections/section-header";
import { Reveal } from "@/components/ui/reveal";
import { getT, getLocale } from "@/i18n/server";
import type { TranslationKey } from "@/i18n/translations";

const tiers: { labelKey: TranslationKey; noteKey: TranslationKey; href: string }[] = [
  { labelKey: "price.under50", noteKey: "price.under50Note", href: "/shop?sort=price-asc" },
  { labelKey: "price.under100", noteKey: "price.under100Note", href: "/shop?sort=price-asc" },
  { labelKey: "price.under200", noteKey: "price.under200Note", href: "/shop" },
  { labelKey: "price.luxe", noteKey: "price.luxeNote", href: "/shop?sort=price-desc" },
];

// "Shop by price" — helps shoppers (and gift-givers) browse by budget.
export async function ShopByPrice() {
  const t = getT(await getLocale());
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeader eyebrow={t("home.priceEyebrow")} title={t("home.priceTitle")} />
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiers.map((tier) => (
          <Link
            key={tier.labelKey}
            href={tier.href}
            className="card-lift group flex flex-col justify-between rounded-2xl border border-border bg-card p-6"
          >
            <p className="text-sm text-muted">{t(tier.noteKey)}</p>
            <div className="mt-8 flex items-end justify-between">
              <span className="font-display text-2xl font-semibold text-ink">{t(tier.labelKey)}</span>
              <ArrowRight className="h-5 w-5 text-gold-strong transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
