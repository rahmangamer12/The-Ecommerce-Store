import { getT, getLocale } from "@/i18n/server";

export async function LegalLayout({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
}) {
  const t = getT(await getLocale());
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="eyebrow">{t("legal.eyebrow")}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-muted">{t("legal.updated")} {updated}</p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-xl font-semibold">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-3 leading-relaxed text-ink-soft">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
