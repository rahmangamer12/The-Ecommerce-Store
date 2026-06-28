"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Store, Search, Globe } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/input";
import { siteConfig } from "@/config/site";

export default function AdminSettingsPage() {
  const [general, setGeneral] = useState<Record<string, string>>({
    name: siteConfig.name,
    email: siteConfig.supportEmail,
    whatsapp: siteConfig.whatsapp,
    currency: siteConfig.currency,
    shipping: String(siteConfig.shippingFlatRate),
    freeOver: String(siteConfig.freeShippingThreshold),
    tax: String(siteConfig.taxRate * 100),
  });
  const [seo, setSeo] = useState<{
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    index: boolean;
    sitemap: boolean;
  }>({
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    keywords: "premium ecommerce, luxury shopping, worldwide shipping",
    ogImage: "/opengraph-image",
    index: true,
    sitemap: true,
  });

  function save(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Settings saved", {
      description: "In production, persist these to the `settings` table.",
    });
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Configure your store and default SEO. (Edit{" "}
          <code className="rounded bg-paper-2 px-1">src/config/site.ts</code> for
          permanent defaults.)
        </p>
      </div>

      {/* General */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <Store className="h-4 w-4 text-gold-strong" /> Store details
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Store name" value={general.name} onChange={(v) => setGeneral((g) => ({ ...g, name: v }))} />
          <Field label="Support email" value={general.email} onChange={(v) => setGeneral((g) => ({ ...g, email: v }))} />
          <Field label="WhatsApp" value={general.whatsapp} onChange={(v) => setGeneral((g) => ({ ...g, whatsapp: v }))} />
          <Field label="Currency" value={general.currency} onChange={(v) => setGeneral((g) => ({ ...g, currency: v }))} />
          <Field label="Flat shipping ($)" value={general.shipping} onChange={(v) => setGeneral((g) => ({ ...g, shipping: v }))} />
          <Field label="Free shipping over ($)" value={general.freeOver} onChange={(v) => setGeneral((g) => ({ ...g, freeOver: v }))} />
          <Field label="Tax rate (%)" value={general.tax} onChange={(v) => setGeneral((g) => ({ ...g, tax: v }))} />
        </div>
      </section>

      {/* SEO */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <Search className="h-4 w-4 text-gold-strong" /> SEO defaults
        </h2>
        <div className="mt-5 space-y-4">
          <Field label="Meta title" value={seo.title} onChange={(v) => setSeo((s) => ({ ...s, title: v }))} />
          <div>
            <Label>Meta description</Label>
            <Textarea
              value={seo.description}
              onChange={(e) => setSeo((s) => ({ ...s, description: e.target.value }))}
            />
          </div>
          <Field label="Keywords (comma separated)" value={seo.keywords} onChange={(v) => setSeo((s) => ({ ...s, keywords: v }))} />
          <Field label="Default OG image URL" value={seo.ogImage} onChange={(v) => setSeo((s) => ({ ...s, ogImage: v }))} />

          <div className="grid gap-3 sm:grid-cols-2">
            <SwitchRow
              label="Allow search indexing"
              hint="robots: index, follow"
              checked={seo.index}
              onChange={() => setSeo((s) => ({ ...s, index: !s.index }))}
            />
            <SwitchRow
              label="Include in sitemap.xml"
              hint="Auto-generated at /sitemap.xml"
              checked={seo.sitemap}
              onChange={() => setSeo((s) => ({ ...s, sitemap: !s.sitemap }))}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <Globe className="h-4 w-4 text-gold-strong" /> Integrations
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          API keys (Supabase, Polar, Cloudinary, analytics) are configured via{" "}
          <code className="rounded bg-paper-2 px-1">.env.local</code> for security —
          never in the UI.
        </p>
      </section>

      <button
        type="submit"
        className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold hover:text-white"
      >
        Save settings
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SwitchRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-gold" : "bg-border"}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[1.4rem]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
