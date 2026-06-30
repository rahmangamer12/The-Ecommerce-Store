import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "./logo";
import { Newsletter } from "./newsletter";
import { siteConfig } from "@/config/site";
import { categories as localCategories } from "@/data/categories";
import type { Category } from "@/types";

const shopLinks = [
  { label: "All Products", href: "/shop" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Best Sellers", href: "/shop?sort=popular" },
  { label: "On Sale", href: "/shop?sale=true" },
  { label: "Wishlist", href: "/account/wishlist" },
];

const companyLinks = [
  { label: "Journal", href: "/blog" },
  { label: "Track Order", href: "/track-order" },
  { label: "Affiliate Program", href: "/affiliate" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function Footer({ categories = localCategories }: { categories?: Category[] }) {
  return (
    <footer className="border-t border-border bg-paper-2">
      {/* Newsletter band */}
      <div className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow">Stay in the know</p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
              Join the inner circle
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink-soft">
              Be first to access new arrivals, private sales and editorial stories.
              Plus 10% off your first order.
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

        <FooterCol title="Shop" links={shopLinks} />
        <FooterCol
          title="Categories"
          links={categories.slice(0, 6).map((c) => ({
            label: c.name,
            href: `/categories/${c.slug}`,
          }))}
        />
        <FooterCol title="Company" links={companyLinks} />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
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
