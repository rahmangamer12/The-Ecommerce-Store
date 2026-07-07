import Link from "next/link";
import {
  Headphones,
  Watch,
  Car,
  Lightbulb,
  Gamepad2,
  Sparkles,
  Dumbbell,
  Home,
} from "lucide-react";

// Daraz/Alibaba-style "shop by collection" tile row. CJ products don't carry
// real brands, so instead of empty brand pages we link to popular product
// GROUPS (via search) — clean gradient tiles, no images to break.
const collections = [
  { label: "Wireless Audio", q: "earbuds", icon: Headphones, from: "#3b82f6", to: "#1e40af" },
  { label: "Smart Watches", q: "smart watch", icon: Watch, from: "#8b5cf6", to: "#5b21b6" },
  { label: "Car Accessories", q: "car", icon: Car, from: "#ef4444", to: "#991b1b" },
  { label: "LED & Lighting", q: "led", icon: Lightbulb, from: "#f59e0b", to: "#b45309" },
  { label: "Gaming Gear", q: "gaming", icon: Gamepad2, from: "#10b981", to: "#065f46" },
  { label: "Beauty & Care", q: "skincare", icon: Sparkles, from: "#ec4899", to: "#9d174d" },
  { label: "Fitness", q: "fitness", icon: Dumbbell, from: "#06b6d4", to: "#155e75" },
  { label: "Home Decor", q: "home decor", icon: Home, from: "#f97316", to: "#9a3412" },
];

export function CollectionTiles() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">
          Popular collections
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {collections.map((c) => (
          <Link
            key={c.q}
            href={`/search?q=${encodeURIComponent(c.q)}`}
            className="group relative flex h-24 items-center gap-3 overflow-hidden rounded-2xl p-4 text-white shadow-luxe transition-transform hover:-translate-y-0.5 sm:h-28"
            style={{ backgroundImage: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <c.icon className="h-6 w-6" />
            </span>
            <span className="font-display text-base font-semibold leading-tight sm:text-lg">
              {c.label}
            </span>
            <span className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10" />
          </Link>
        ))}
      </div>
    </section>
  );
}
