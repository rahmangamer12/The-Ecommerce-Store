import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PrefsProvider } from "@/components/providers/prefs-provider";
import { StoreProvider } from "@/components/providers/store-provider";
import { CatalogProvider } from "@/components/providers/catalog-provider";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AssistantWidget } from "@/components/ai/assistant-widget";
import { PermissionPrompt } from "@/components/site/permission-prompt";
import { CookieConsent } from "@/components/site/cookie-consent";
import { VisitTracker } from "@/components/visit-tracker";
import { Analytics } from "@/components/analytics";
import { buildMetadata } from "@/lib/seo";
import { analytics, isAiConfigured } from "@/config/env";
import { getCategories } from "@/lib/categories";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = buildMetadata();

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCategories();
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${sans.variable} ${mono.variable} ${display.variable}`}
      >
        <body className="min-h-screen antialiased">
        {/* Google Tag Manager (noscript) — only rendered when GTM ID is set */}
        {analytics.gtm && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${analytics.gtm}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        )}
        <ThemeProvider>
          <PrefsProvider>
          <StoreProvider>
            <CatalogProvider>
            <AnnouncementBar />
            <Navbar categories={categories} />
            <main>{children}</main>
            <Footer categories={categories} />
            <CartDrawer />
            <AssistantWidget enabled={isAiConfigured} />
            <CookieConsent />
            <PermissionPrompt />
            <VisitTracker />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--card)",
                  color: "var(--ink)",
                  border: "1px solid var(--border)",
                },
              }}
            />
            </CatalogProvider>
          </StoreProvider>
          </PrefsProvider>
        </ThemeProvider>
        <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
