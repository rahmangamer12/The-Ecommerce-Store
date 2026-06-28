import { Logo } from "@/components/layout/logo";
import { ShieldCheck, Truck, Star } from "lucide-react";

// Premium split-screen frame that wraps the Clerk sign-in / sign-up widget.
export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-7rem)] lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="mb-8">
          <Logo />
        </div>
        {children}
      </div>

      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="absolute inset-0 bg-aura opacity-70" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-end p-12 text-paper">
          <blockquote className="max-w-md">
            <div className="flex gap-1 text-gold-soft">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="mt-5 font-display text-2xl leading-snug">
              “The most beautiful online store I&apos;ve shopped with — effortless,
              premium and personal.”
            </p>
            <footer className="mt-4 text-sm text-paper/70">
              Sofia M. — Verified customer
            </footer>
          </blockquote>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-paper/80">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold-soft" /> Secure &amp; private
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

// Brand-matched look for the Clerk components.
export const clerkAppearance = {
  variables: {
    colorPrimary: "#b08a4f",
    colorText: "#14120e",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    card: "shadow-none border-0 bg-transparent",
    headerTitle: "font-display",
    formButtonPrimary:
      "bg-ink hover:bg-gold text-paper hover:text-white normal-case",
    footerActionLink: "text-gold-strong hover:text-gold",
  },
} as const;
