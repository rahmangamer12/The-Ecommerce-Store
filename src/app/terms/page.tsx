import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { getT, getLocale } from "@/i18n/server";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: `The terms and conditions for using ${siteConfig.name}.`,
  path: "/terms",
});

export default async function TermsPage() {
  const t = getT(await getLocale());
  return (
    <LegalLayout
      title={t("terms.title")}
      updated="June 1, 2026"
      sections={[
        {
          heading: t("terms.h1"),
          body: [t("terms.b1").replace("{name}", siteConfig.name)],
        },
        {
          heading: t("terms.h2"),
          body: [t("terms.b2")],
        },
        {
          heading: t("terms.h3"),
          body: [t("terms.b3")],
        },
        {
          heading: t("terms.h4"),
          body: [t("terms.b4")],
        },
        {
          heading: t("terms.h5"),
          body: [t("terms.b5").replace("{legal}", siteConfig.legalName)],
        },
        {
          heading: t("terms.h6"),
          body: [t("terms.b6")],
        },
        {
          heading: t("terms.h7"),
          body: [t("terms.b7").replace("{email}", siteConfig.supportEmail)],
        },
      ]}
    />
  );
}
