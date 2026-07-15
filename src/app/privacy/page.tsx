import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { getT, getLocale } from "@/i18n/server";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your data.`,
  path: "/privacy",
});

export default async function PrivacyPage() {
  const t = getT(await getLocale());
  return (
    <LegalLayout
      title={t("privacy.title")}
      updated="June 1, 2026"
      sections={[
        {
          heading: t("privacy.h1"),
          body: [t("privacy.b1").replace("{name}", siteConfig.name)],
        },
        {
          heading: t("privacy.h2"),
          body: [t("privacy.b2a"), t("privacy.b2b")],
        },
        {
          heading: t("privacy.h3"),
          body: [t("privacy.b3")],
        },
        {
          heading: t("privacy.h4"),
          body: [t("privacy.b4")],
        },
        {
          heading: t("privacy.h5"),
          body: [t("privacy.b5").replace("{email}", siteConfig.supportEmail)],
        },
        {
          heading: t("privacy.h6"),
          body: [t("privacy.b6").replace("{email}", siteConfig.supportEmail)],
        },
      ]}
    />
  );
}
