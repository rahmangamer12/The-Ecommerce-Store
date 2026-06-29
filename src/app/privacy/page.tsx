import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your data.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="June 1, 2026"
      sections={[
        {
          heading: "Introduction",
          body: [
            `At ${siteConfig.name}, your privacy matters. This policy explains what information we collect, why we collect it, and how we keep it safe. By using our website you agree to the practices described here.`,
          ],
        },
        {
          heading: "Information we collect",
          body: [
            "We collect information you provide directly — such as your name, email, shipping address and order details — when you create an account or place an order.",
            "We also collect limited technical data automatically, like your device type and pages visited, to improve our service. This is done through privacy-respecting analytics.",
          ],
        },
        {
          heading: "How we use your information",
          body: [
            "We use your information to process and deliver orders, provide customer support, send important updates, and — only with your consent — share marketing you can opt out of at any time.",
          ],
        },
        {
          heading: "Payments",
          body: [
            "We offer Cash on Delivery, so you pay when your order arrives. If card payment is enabled, it is handled by a secure third-party provider and we never store your full card details.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You may request access to, correction of, or deletion of your personal data at any time. To exercise these rights, contact us at " + siteConfig.supportEmail + ".",
          ],
        },
        {
          heading: "Contact",
          body: [
            `Questions about this policy? Email us at ${siteConfig.supportEmail} and we'll be happy to help.`,
          ],
        },
      ]}
    />
  );
}
