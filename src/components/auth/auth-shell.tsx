import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ShieldCheck, Truck, Star } from "lucide-react";

// Premium split-screen shell for auth pages.
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-7rem)] lg:grid-cols-2">
      {/* Form side */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Logo />
          <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-ink-soft">{footer}</div>}
        </div>
      </div>

      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="absolute inset-0 bg-aura opacity-70" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-paper">
          <blockquote className="mt-auto max-w-md">
            <div className="flex gap-1 text-gold-soft">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="mt-5 font-display text-2xl leading-snug">
              “The most beautiful online store I&apos;ve shopped with. It feels
              effortless, premium and personal.”
            </p>
            <footer className="mt-4 text-sm text-paper/70">
              Sofia M. — Verified customer
            </footer>
          </blockquote>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-paper/80">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold-soft" /> Secure & private
            </span>
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gold-soft" /> Worldwide shipping
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-gold-strong hover:underline">
      {children}
    </Link>
  );
}
