import type { Metadata } from "next";
import { DollarSign, Link2, BarChart3, Wallet, Sparkles } from "lucide-react";
import { AffiliateForm } from "@/components/affiliate/affiliate-form";
import { Reveal } from "@/components/ui/reveal";
import { buildMetadata } from "@/lib/seo";
import { getT, getLocale } from "@/i18n/server";
import type { TranslationKey } from "@/i18n/translations";

export const metadata: Metadata = buildMetadata({
  title: "Affiliate Program",
  description:
    "Earn generous commission promoting Velcarro. Join our affiliate program and get paid for every sale you refer.",
  path: "/affiliate",
});

const perks: { icon: typeof DollarSign; title: TranslationKey; text: TranslationKey }[] = [
  { icon: DollarSign, title: "aff.perk1Title", text: "aff.perk1Desc" },
  { icon: Link2, title: "aff.perk2Title", text: "aff.perk2Desc" },
  { icon: BarChart3, title: "aff.perk3Title", text: "aff.perk3Desc" },
  { icon: Wallet, title: "aff.perk4Title", text: "aff.perk4Desc" },
];

const steps: { n: string; title: TranslationKey; text: TranslationKey }[] = [
  { n: "01", title: "aff.step1Title", text: "aff.step1Desc" },
  { n: "02", title: "aff.step2Title", text: "aff.step2Desc" },
  { n: "03", title: "aff.step3Title", text: "aff.step3Desc" },
];

export default async function AffiliatePage() {
  const t = getT(await getLocale());
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 bg-aura opacity-60" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <p className="eyebrow text-gold-soft">
            <Sparkles className="mr-1 inline h-4 w-4" /> {t("aff.eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
            {t("aff.heroTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-paper/80">
            {t("aff.heroDesc")}
          </p>
          <a
            href="#apply"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 font-medium text-white shadow-gold transition-transform hover:-translate-y-0.5"
          >
            {t("aff.becomeCta")}
          </a>
        </div>
      </section>

      {/* Perks */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <Reveal key={p.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-paper-2 text-gold-strong">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{t(p.title)}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{t(p.text)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-paper-2">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("aff.howTitle")}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <Reveal key={s.n}>
                <div className="rounded-2xl border border-border bg-card p-7">
                  <span className="font-display text-4xl font-bold text-gold/40">{s.n}</span>
                  <h3 className="mt-3 text-lg font-semibold">{t(s.title)}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{t(s.text)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Apply */}
      <section id="apply" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="text-center">
          <p className="eyebrow">{t("aff.joinEyebrow")}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("aff.applyTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">
            {t("aff.applyDesc")}
          </p>
        </div>
        <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-luxe sm:p-8">
          <AffiliateForm />
        </div>
      </section>
    </div>
  );
}
