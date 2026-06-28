import type { Category } from "@/types";

/** Top-level store categories. `icon` maps to a lucide-react icon. */
export const categories: Category[] = [
  {
    id: "c1",
    name: "Technology",
    slug: "technology",
    description:
      "Cutting-edge gadgets, smart devices and accessories engineered for modern living.",
    image: "https://loremflickr.com/800/600/electronics?lock=21",
    icon: "Cpu",
  },
  {
    id: "c2",
    name: "Audio",
    slug: "audio",
    description:
      "Studio-grade headphones, speakers and earbuds tuned for pure, immersive sound.",
    image: "https://loremflickr.com/800/600/headphones?lock=22",
    icon: "Headphones",
  },
  {
    id: "c3",
    name: "Home & Living",
    slug: "home-living",
    description:
      "Elevated essentials and decor that bring warmth and craft into every room.",
    image: "https://loremflickr.com/800/600/interior?lock=23",
    icon: "Lamp",
  },
  {
    id: "c4",
    name: "Fashion",
    slug: "fashion",
    description:
      "Timeless wardrobe pieces and accessories made from considered materials.",
    image: "https://loremflickr.com/800/600/fashion?lock=24",
    icon: "Shirt",
  },
  {
    id: "c5",
    name: "Watches & Jewelry",
    slug: "watches-jewelry",
    description:
      "Precision timepieces and fine jewelry, finished by hand for a lifetime of wear.",
    image: "https://loremflickr.com/800/600/watch?lock=25",
    icon: "Watch",
  },
  {
    id: "c6",
    name: "Beauty",
    slug: "beauty",
    description:
      "Clean, high-performance skincare and fragrance for an everyday ritual.",
    image: "https://loremflickr.com/800/600/cosmetics?lock=26",
    icon: "Sparkles",
  },
  {
    id: "c7",
    name: "Outdoors",
    slug: "outdoors",
    description:
      "Durable, beautifully made gear for adventures near and far.",
    image: "https://loremflickr.com/800/600/mountain?lock=27",
    icon: "Mountain",
  },
  {
    id: "c8",
    name: "Wellness",
    slug: "wellness",
    description:
      "Thoughtful tools and rituals to help you rest, recover and feel your best.",
    image: "https://loremflickr.com/800/600/spa?lock=28",
    icon: "HeartPulse",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
