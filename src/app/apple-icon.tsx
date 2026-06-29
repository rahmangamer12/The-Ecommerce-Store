import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Apple touch icon (home screen) — branded monogram.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14120e",
          color: "#cba978",
          fontSize: 110,
          fontWeight: 700,
          fontFamily: "serif",
        }}
      >
        {siteConfig.logoMark}
      </div>
    ),
    { ...size },
  );
}
