import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow optimized images from these hosts (sample images + Cloudinary).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "live.staticflickr.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      // CJ Dropshipping product images (imported products).
      { protocol: "https", hostname: "**.cjdropshipping.com" },
      { protocol: "https", hostname: "**.alicdn.com" },
      { protocol: "https", hostname: "**.aliyuncs.com" },
      // Affiliate products can link images from any store (Amazon, eBay, …),
      // so allow any https image host for imported product photos.
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
