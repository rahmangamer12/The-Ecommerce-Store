import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";
import { getT, getLocale } from "@/i18n/server";

// Daraz / SHEIN-style category quick-grid: compact tappable tiles shown high
// on the homepage so shoppers jump straight into a category.
export async function CategoryGrid({
  categories,
  title,
}: {
  categories: Category[];
  title?: string;
}) {
  const t = getT(await getLocale());
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">
          {title ?? t("home.catTitle")}
        </h2>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-sm font-medium text-gold-strong hover:underline"
        >
          {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 sm:gap-4 lg:grid-cols-8">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center gap-2.5 text-center"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-full border border-border bg-paper-2 ring-2 ring-transparent transition-all group-hover:ring-gold/40 group-hover:shadow-luxe">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 15vw, 12vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <span className="line-clamp-1 w-full text-xs font-medium text-ink-soft group-hover:text-ink sm:text-sm">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
