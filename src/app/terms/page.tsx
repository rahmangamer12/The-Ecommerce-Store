import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: `The terms and conditions for using ${siteConfig.name}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="June 1, 2026"
      sections={[
        {
          heading: "Agreement",
          body: [
            `These terms govern your use of ${siteConfig.name}. By accessing our website or placing an order, you agree to be bound by them. Please read them carefully.`,
          ],
        },
        {
          heading: "Orders & pricing",
          body: [
            "All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order. Prices are shown in your selected currency and may change without notice, though changes won't affect orders already placed.",
          ],
        },
        {
          heading: "Shipping & delivery",
          body: [
            "We aim to dispatch orders within 1–2 business days. Delivery times are estimates and may vary by destination. Risk of loss passes to you upon delivery to the carrier.",
          ],
        },
        {
          heading: "Returns & refunds",
          body: [
            "If an item arrives damaged, faulty, or significantly not as described, notify us within 7 days of delivery with photos and we will provide a free replacement or a full refund. Change-of-mind returns may be requested within 14 days for unused items in their original packaging; return shipping is the customer's responsibility. Certain items, such as personal care products, may be exempt for hygiene reasons. Approved refunds are issued to your original payment method within 5–10 business days.",
          ],
        },
        {
          heading: "Intellectual property",
          body: [
            `All content on this site — including text, images, logos and design — is the property of ${siteConfig.legalName} and may not be reproduced without permission.`,
          ],
        },
        {
          heading: "Limitation of liability",
          body: [
            "To the fullest extent permitted by law, our liability for any claim arising from your use of the site is limited to the amount you paid for the relevant order.",
          ],
        },
        {
          heading: "Contact",
          body: [`For questions about these terms, contact ${siteConfig.supportEmail}.`],
        },
      ]}
    />
  );
}
