import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "./logo";
import { Newsletter } from "./newsletter";
import { siteConfig } from "@/config/site";
import { categories as localCategories } from "@/data/categories";
import type { Category } from "@/types";
import { getT, getLocale } from "@/i18n/server";
import type { TranslationKey } from "@/i18n/translations";

const shopLinks: { key: TranslationKey; href: string }[] = [
  { key: "footer.shopAll", href: "/shop" },
  { key: "footer.newArrivals", href: "/shop?sort=newest" },
  { key: "footer.bestSellers", href: "/shop?sort=popular" },
  { key: "footer.onSale", href: "/shop?sale=true" },
  { key: "footer.wishlist", href: "/account/wishlist" },
];

const companyLinks: { key: TranslationKey; href: string }[] = [
  { key: "footer.journal", href: "/blog" },
  { key: "footer.trackOrder", href: "/track-order" },
  { key: "footer.affiliate", href: "/affiliate" },
  { key: "footer.contactLink", href: "/contact" },
  { key: "footer.faq", href: "/faq" },
  { key: "footer.privacy", href: "/privacy" },
  { key: "footer.terms", href: "/terms" },
];

export async function Footer({ categories = localCategories }: { categories?: Category[] }) {
  const t = getT(await getLocale());
  return (
    <footer className="border-t border-border bg-paper-2">
      {/* Newsletter band */}
      <div className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow">{t("footer.newsEyebrow")}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
              {t("footer.newsTitle")}
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink-soft">
              {t("footer.newsDesc")}
            </p>
          </div>
          <Newsletter />
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
            {siteConfig.description}
          </p>
          <div className="mt-5 space-y-2 text-sm text-ink-soft">
            <a href={`mailto:${siteConfig.supportEmail}`} className="flex items-center gap-2 hover:text-gold-strong">
              <Mail className="h-4 w-4" /> {siteConfig.supportEmail}
            </a>
            <a href={`https://wa.me/${siteConfig.whatsappNumber}`} className="flex items-center gap-2 hover:text-gold-strong">
              <MessageCircle className="h-4 w-4" /> {siteConfig.whatsapp}
            </a>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {siteConfig.address.city},{" "}
              {siteConfig.address.country}
            </p>
          </div>
        </div>

        <FooterCol
          title={t("footer.shop")}
          links={shopLinks.map((l) => ({ label: t(l.key), href: l.href }))}
        />
        <FooterCol
          title={t("footer.categories")}
          links={categories.slice(0, 6).map((c) => ({
            label: c.name,
            href: `/categories/${c.slug}`,
          }))}
        />
        <FooterCol
          title={t("footer.company")}
          links={companyLinks.map((l) => ({ label: t(l.key), href: l.href }))}
        />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. {t("footer.rights")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {siteConfig.trustBadges.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-ink-soft transition-colors hover:text-gold-strong">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
