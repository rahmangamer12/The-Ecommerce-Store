import type { Category } from "@/types";

/** Top-level store categories. `icon` maps to a lucide-react icon. */
export const categories: Category[] = [
  {
    id: "c1",
    name: "Technology",
    slug: "technology",
    description:
      "Cutting-edge gadgets, smart devices and accessories engineered for modern living.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    icon: "Cpu",
  },
  {
    id: "c2",
    name: "Audio",
    slug: "audio",
    description:
      "Studio-grade headphones, speakers and earbuds tuned for pure, immersive sound.",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
    icon: "Headphones",
  },
  {
    id: "c3",
    name: "Home & Living",
    slug: "home-living",
    description:
      "Elevated essentials and decor that bring warmth and craft into every room.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    icon: "Lamp",
  },
  {
    id: "c4",
    name: "Fashion",
    slug: "fashion",
    description:
      "Timeless wardrobe pieces and accessories made from considered materials.",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    icon: "Shirt",
  },
  {
    id: "c5",
    name: "Watches & Jewelry",
    slug: "watches-jewelry",
    description:
      "Precision timepieces and fine jewelry, finished by hand for a lifetime of wear.",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    icon: "Watch",
  },
  {
    id: "c6",
    name: "Beauty",
    slug: "beauty",
    description:
      "Clean, high-performance skincare and fragrance for an everyday ritual.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    icon: "Sparkles",
  },
  {
    id: "c7",
    name: "Outdoors",
    slug: "outdoors",
    description:
      "Durable, beautifully made gear for adventures near and far.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    icon: "Mountain",
  },
  {
    id: "c8",
    name: "Wellness",
    slug: "wellness",
    description:
      "Thoughtful tools and rituals to help you rest, recover and feel your best.",
    image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80",
    icon: "HeartPulse",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
