import { Logo } from "@/components/layout/logo";
import { ShieldCheck, Truck, Star } from "lucide-react";

// Premium split-screen frame that wraps the Clerk sign-in / sign-up widget.
export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    // 100dvh (dynamic viewport height) avoids the iOS Safari 100vh bug where the
    // address bar leaves a gap / pushes content off-screen.
    <div className="grid min-h-[calc(100dvh-7rem)] lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6">
          <Logo />
        </div>
        {/* Wrap the Clerk widget in a real card so it looks polished & clearly
            framed on every device (iPhone included), not floating on the page. */}
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-luxe sm:p-8">
          {children}
        </div>
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

// Brand-matched look for the Clerk components. Colours reference our CSS theme
// variables so the widget is READABLE in both light AND dark mode (previously
// the text colour was hard-coded near-black, invisible on the dark theme).
export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--gold-strong)",
    colorText: "var(--ink)",
    colorTextSecondary: "var(--muted)",
    colorBackground: "var(--card)",
    colorInputText: "var(--ink)",
    colorInputBackground: "var(--paper-2)",
    colorTextOnPrimaryBackground: "#ffffff",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    rootBox: "w-full",
    card: "shadow-none border-0 bg-transparent w-full px-0",
    headerTitle: "font-display text-2xl",
    headerSubtitle: "text-muted",
    // Google / Facebook / social buttons — clear border, readable in both themes.
    socialButtonsBlockButton:
      "border border-border bg-card text-ink hover:bg-paper-2 h-11",
    socialButtonsBlockButtonText: "font-medium text-ink",
    socialButtonsProviderIcon: "h-5 w-5",
    dividerLine: "bg-border",
    dividerText: "text-muted",
    formFieldLabel: "text-ink-soft",
    formFieldInput:
      "bg-paper-2 border border-border text-ink focus:border-gold h-11",
    formButtonPrimary:
      "bg-ink hover:bg-gold text-paper hover:text-white normal-case h-11 text-sm font-medium",
    footerActionText: "text-muted",
    footerActionLink: "text-gold-strong hover:text-gold font-medium",
    identityPreviewText: "text-ink",
    identityPreviewEditButton: "text-gold-strong",
    formFieldInputShowPasswordButton: "text-muted hover:text-ink",
    otpCodeFieldInput: "text-ink border-border",
    formResendCodeLink: "text-gold-strong hover:text-gold",
  },
} as const;
