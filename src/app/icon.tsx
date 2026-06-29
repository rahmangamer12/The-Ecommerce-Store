import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Branded favicon — a gold monogram on an ink background.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "serif",
          borderRadius: 7,
        }}
      >
        {siteConfig.logoMark}
      </div>
    ),
    { ...size },
  );
}
