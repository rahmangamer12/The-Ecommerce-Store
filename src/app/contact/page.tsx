import type { Metadata } from "next";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { getLocale, getT } from "@/i18n/server";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with the ${siteConfig.name} team. We're here 24/7 to help.`,
  path: "/contact",
});

export default async function ContactPage() {
  const t = getT(await getLocale());
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Info */}
        <div>
          <p className="eyebrow">{t("contact.eyebrow")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("contact.title")}
          </h1>
          <p className="mt-4 max-w-md text-ink-soft">{t("contact.subtitle")}</p>

          <div className="mt-8 space-y-4">
            {[
              { icon: Mail, title: t("contact.emailL"), value: siteConfig.supportEmail, href: `mailto:${siteConfig.supportEmail}` },
              { icon: MessageCircle, title: t("contact.whatsappL"), value: siteConfig.whatsapp, href: `https://wa.me/${siteConfig.whatsappNumber}` },
              { icon: MapPin, title: t("contact.addressL"), value: `${siteConfig.address.line1}, ${siteConfig.address.city}, ${siteConfig.address.country}` },
              { icon: Clock, title: t("contact.hoursL"), value: t("contact.hoursV") },
            ].map((c) => (
              <div key={c.title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper-2 text-gold-strong">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{c.title}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm text-ink-soft hover:text-gold-strong">
                      {c.value}
                    </a>
                  ) : (
                    <p className="text-sm text-ink-soft">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-luxe">
          <h2 className="font-display text-2xl font-semibold">{t("contact.sendTitle")}</h2>
          <p className="mt-1 text-sm text-ink-soft">{t("contact.sendDesc")}</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
