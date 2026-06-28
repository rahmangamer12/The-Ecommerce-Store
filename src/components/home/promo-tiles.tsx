import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const tiles = [
  {
    title: "Sound, perfected",
    subtitle: "Up to 20% off Audio",
    href: "/categories/audio",
    image: "https://loremflickr.com/800/600/headphones?lock=901",
  },
  {
    title: "Timeless on the wrist",
    subtitle: "New-season Watches",
    href: "/categories/watches-jewelry",
    image: "https://loremflickr.com/800/600/watch?lock=902",
  },
];

// Two large promotional tiles — a staple of premium store homepages.
export function PromoTiles() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-5 md:grid-cols-2">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="card-lift group relative block aspect-[16/8] overflow-hidden rounded-3xl"
          >
            <Image
              src={tile.image}
              alt={tile.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-8 text-paper sm:p-10">
              <p className="text-sm font-medium text-gold-soft">{tile.subtitle}</p>
              <h3 className="mt-2 max-w-xs font-display text-2xl font-semibold sm:text-3xl">
                {tile.title}
              </h3>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
                Shop now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
