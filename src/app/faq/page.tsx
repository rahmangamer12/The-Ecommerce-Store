import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";
import { siteConfig } from "@/config/site";
import { buildMetadata, faqSchema, jsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "FAQ",
  description: "Answers to common questions about shipping, returns, payments and more.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(faqSchema(faqs))}
      />
      <header className="text-center">
        <p className="eyebrow">Help center</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
          Everything you need to know. Can&apos;t find an answer? We&apos;re a
          message away.
        </p>
      </header>

      <div className="mt-12">
        <Accordion items={faqs} />
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center">
        <MessageCircle className="mx-auto h-7 w-7 text-gold-strong" />
        <h2 className="mt-3 font-display text-xl font-semibold">Still have questions?</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Our support team replies within a couple of hours.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold hover:text-white">
            Contact us
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
