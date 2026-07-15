import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";
import { siteConfig } from "@/config/site";
import { buildMetadata, faqSchema, jsonLd } from "@/lib/seo";
import { getLocale, getT } from "@/i18n/server";
import type { TranslationKey } from "@/i18n/translations";

export const metadata: Metadata = buildMetadata({
  title: "FAQ",
  description: "Answers to common questions about shipping, returns, payments and more.",
  path: "/faq",
});

export default async function FaqPage() {
  const t = getT(await getLocale());
  const localizedFaqs = faqs.map((_, i) => ({
    question: t(`faq.q${i + 1}` as TranslationKey),
    answer: t(`faq.a${i + 1}` as TranslationKey),
  }));
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(faqSchema(faqs))}
      />
      <header className="text-center">
        <p className="eyebrow">{t("faq.eyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("faq.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">{t("faq.subtitle")}</p>
      </header>

      <div className="mt-12">
        <Accordion items={localizedFaqs} />
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
        <MessageCircle className="mx-auto h-7 w-7 text-gold-strong" />
        <h2 className="mt-3 font-display text-xl font-semibold">{t("faq.still")}</h2>
        <p className="mt-2 text-sm text-ink-soft">{t("faq.stillDesc")}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold hover:text-white">
            {t("faq.contactUs")}
          </Link>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:border-gold"
          >
            {siteConfig.supportEmail}
          </a>
        </div>
      </div>
    </div>
  );
}
