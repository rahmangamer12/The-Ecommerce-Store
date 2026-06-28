import type { Category } from "@/types";

/** Top-level store categories. `icon` maps to a lucide-react icon. */
export const categories: Category[] = [
  {
    id: "c1",
    name: "Technology",
    slug: "technology",
    description:
      "Cutting-edge gadgets, smart devices and accessories engineered for modern living.",
    image: "https://picsum.photos/seed/luxora-tech/800/600",
    icon: "Cpu",
  },
  {
    id: "c2",
    name: "Audio",
    slug: "audio",
    description:
      "Studio-grade headphones, speakers and earbuds tuned for pure, immersive sound.",
    image: "https://picsum.photos/seed/luxora-audio/800/600",
    icon: "Headphones",
  },
  {
    id: "c3",
    name: "Home & Living",
    slug: "home-living",
    description:
      "Elevated essentials and decor that bring warmth and craft into every room.",
    image: "https://picsum.photos/seed/luxora-home/800/600",
    icon: "Lamp",
  },
  {
    id: "c4",
    name: "Fashion",
    slug: "fashion",
    description:
      "Timeless wardrobe pieces and accessories made from considered materials.",
    image: "https://picsum.photos/seed/luxora-fashion/800/600",
    icon: "Shirt",
  },
  {
    id: "c5",
    name: "Watches & Jewelry",
    slug: "watches-jewelry",
    description:
      "Precision timepieces and fine jewelry, finished by hand for a lifetime of wear.",
    image: "https://picsum.photos/seed/luxora-watch/800/600",
    icon: "Watch",
  },
  {
    id: "c6",
    name: "Beauty",
    slug: "beauty",
    description:
      "Clean, high-performance skincare and fragrance for an everyday ritual.",
    image: "https://picsum.photos/seed/luxora-beauty/800/600",
    icon: "Sparkles",
  },
  {
    id: "c7",
    name: "Outdoors",
    slug: "outdoors",
    description:
      "Durable, beautifully made gear for adventures near and far.",
    image: "https://picsum.photos/seed/luxora-outdoor/800/600",
    icon: "Mountain",
  },
  {
    id: "c8",
    name: "Wellness",
    slug: "wellness",
    description:
      "Thoughtful tools and rituals to help you rest, recover and feel your best.",
    image: "https://picsum.photos/seed/luxora-wellness/800/600",
    icon: "HeartPulse",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
