"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// Image gallery with thumbnail rail and hover-to-zoom on the main image.
// `activeImage` lets a parent (e.g. the buy box) drive which photo shows —
// used to swap to a variant's own photo when a colour/option is picked.
export function ProductGallery({
  images,
  name,
  activeImage,
}: {
  images: string[];
  name: string;
  activeImage?: string | null;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!activeImage) return;
    const i = images.indexOf(activeImage);
    if (i >= 0) setActive(i);
  }, [activeImage, images]);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  }

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start">
      {/* Thumbnails — only when there's more than one photo to choose from. */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto sm:max-h-[520px] sm:flex-col sm:overflow-y-auto sm:overflow-x-visible">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors sm:h-20 sm:w-20",
                active === i ? "border-gold" : "border-transparent hover:border-border",
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill sizes="80px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div
        ref={ref}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-white p-3"
      >
        <Image
          src={images[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn(
            "object-contain transition-transform duration-200",
            zoom ? "scale-[1.8]" : "scale-100",
          )}
          style={zoom ? { transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
        />
      </div>
    </div>
  );
}
