import { getCatalog } from "@/lib/catalog";

// A quiet "as featured / our brands" marquee — a common trust signal on
// premium e-commerce stores. Reads the live catalogue so it shows your real
// brands once products are added.
export async function BrandStrip() {
  const catalog = await getCatalog();
  const brands = Array.from(new Set(catalog.map((p) => p.brand))).filter(Boolean);
  if (brands.length === 0) return null;
  const row = [...brands, ...brands]; // duplicate for a seamless loop

  return (
    <section className="border-y border-border bg-paper-2/60 py-7">
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Trusted brands we carry
      </p>
      <div className="relative overflow-hidden">
        <div className="flex w-max animate-marquee-slow items-center gap-12 px-6">
          {row.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="whitespace-nowrap font-display text-xl font-semibold text-ink/40 transition-colors hover:text-gold-strong"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
