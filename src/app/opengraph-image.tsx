import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamically generated social-share image (no external asset needed).
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background:
            "linear-gradient(135deg, #14120e 0%, #1f1a12 55%, #2a2012 100%)",
          color: "#fbfaf8",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: "#b08a4f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
              color: "#14120e",
            }}
          >
            {siteConfig.logoMark}
          </div>
          <div style={{ fontSize: 30, fontWeight: 600 }}>{siteConfig.name}</div>
        </div>

        <div
          style={{
            marginTop: 50,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          Modern luxury, delivered worldwide
        </div>

        <div style={{ marginTop: 28, fontSize: 30, color: "#d9bd92", maxWidth: 820 }}>
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
