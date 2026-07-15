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
import { getT, getLocale } from "@/i18n/server";
import type { TranslationKey } from "@/i18n/translations";

// Daraz/Alibaba-style "shop by collection" tile row. CJ products don't carry
// real brands, so instead of empty brand pages we link to popular product
// GROUPS (via search) — clean gradient tiles, no images to break.
const collections: {
  key: TranslationKey;
  q: string;
  icon: typeof Headphones;
  from: string;
  to: string;
}[] = [
  { key: "coll.audio", q: "earbuds", icon: Headphones, from: "#3b82f6", to: "#1e40af" },
  { key: "coll.watches", q: "smart watch", icon: Watch, from: "#8b5cf6", to: "#5b21b6" },
  { key: "coll.car", q: "car", icon: Car, from: "#ef4444", to: "#991b1b" },
  { key: "coll.led", q: "led", icon: Lightbulb, from: "#f59e0b", to: "#b45309" },
  { key: "coll.gaming", q: "gaming", icon: Gamepad2, from: "#10b981", to: "#065f46" },
  { key: "coll.beauty", q: "skincare", icon: Sparkles, from: "#ec4899", to: "#9d174d" },
  { key: "coll.fitness", q: "fitness", icon: Dumbbell, from: "#06b6d4", to: "#155e75" },
  { key: "coll.homeDecor", q: "home decor", icon: Home, from: "#f97316", to: "#9a3412" },
];

export async function CollectionTiles() {
  const t = getT(await getLocale());
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">
          {t("home.popularCollections")}
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
              {t(c.key)}
            </span>
            <span className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10" />
          </Link>
        ))}
      </div>
    </section>
  );
}
