import type { Product, ProductReview } from "@/types";

const CUR = "USD";

// Build a 4-image gallery from a seed (stable placeholder photos).
function gallery(seed: string): string[] {
  return [1, 2, 3, 4].map(
    (n) => `https://picsum.photos/seed/${seed}-${n}/900/1100`,
  );
}

// A small pool of reviews reused across products for realism.
function sampleReviews(seed: string): ProductReview[] {
  return [
    {
      id: `${seed}-r1`,
      author: "Amelia R.",
      rating: 5,
      title: "Exceeded my expectations",
      body: "The quality is genuinely premium — feels far more expensive than it cost. Packaging was beautiful too.",
      date: "2026-05-18",
      verified: true,
    },
    {
      id: `${seed}-r2`,
      author: "Daniel K.",
      rating: 5,
      title: "Worth every penny",
      body: "Fast worldwide shipping and the product is flawless. This is my third order from Luxora.",
      date: "2026-04-30",
      verified: true,
    },
    {
      id: `${seed}-r3`,
      author: "Priya S.",
      rating: 4,
      title: "Beautiful, slightly smaller than I imagined",
      body: "Gorgeous finish and materials. Check the dimensions before ordering — otherwise perfect.",
      date: "2026-04-12",
      verified: true,
    },
  ];
}

export const products: Product[] = [
  // ---------------- Technology ----------------
  {
    id: "p1",
    name: "Aether Pro Wireless Charger",
    slug: "aether-pro-wireless-charger",
    brand: "Volt&Co",
    categorySlug: "technology",
    price: 79,
    compareAtPrice: 109,
    currency: CUR,
    shortDescription:
      "A machined-aluminium 3-in-1 charging stand for phone, watch and earbuds.",
    description:
      "The Aether Pro brings order to your nightstand with a single, sculptural charging station. CNC-machined aluminium, a soft vegan-leather deck and fast 15W charging keep all your devices powered and beautifully arranged.",
    features: [
      "15W fast wireless charging",
      "Charges 3 devices at once",
      "CNC-machined aluminium body",
      "Anti-slip vegan leather deck",
      "Temperature-safe charging",
    ],
    images: gallery("aether"),
    rating: 4.8,
    reviewCount: 214,
    stock: 32,
    badge: "Bestseller",
    variants: [{ name: "Finish", values: ["Graphite", "Silver", "Champagne"] }],
    tags: ["charger", "desk", "accessories", "gift"],
    featured: true,
    trending: true,
  },
  {
    id: "p2",
    name: "Nimbus Smart Mug",
    slug: "nimbus-smart-mug",
    brand: "Hearth",
    categorySlug: "technology",
    price: 129,
    currency: CUR,
    shortDescription:
      "Keeps your coffee at the perfect temperature, all day, via app control.",
    description:
      "Never sip a lukewarm coffee again. The Nimbus Smart Mug holds your drink at an exact temperature you set in the app, with a charging coaster that doubles as a desk piece.",
    features: [
      "Precise app temperature control",
      "90-minute battery + charging coaster",
      "Hand-glazed ceramic interior",
      "Auto-sleep when empty",
    ],
    images: gallery("nimbus"),
    rating: 4.6,
    reviewCount: 98,
    stock: 18,
    badge: "New",
    tags: ["coffee", "smart", "gift"],
    trending: true,
  },
  {
    id: "p3",
    name: "Orbit Mechanical Keyboard",
    slug: "orbit-mechanical-keyboard",
    brand: "Keyforge",
    categorySlug: "technology",
    price: 169,
    compareAtPrice: 199,
    currency: CUR,
    shortDescription:
      "A low-profile aluminium mechanical keyboard with a satisfying, quiet typing feel.",
    description:
      "Designed for people who type all day. Gasket-mounted switches, a CNC aluminium frame and hot-swappable keys make the Orbit a joy to use and easy to make your own.",
    features: [
      "Gasket-mounted quiet switches",
      "Hot-swappable keycaps",
      "Wireless + USB-C",
      "Aluminium unibody",
    ],
    images: gallery("orbit"),
    rating: 4.9,
    reviewCount: 342,
    stock: 12,
    badge: "Editor's Pick",
    variants: [{ name: "Layout", values: ["US", "UK", "Nordic"] }],
    tags: ["keyboard", "desk", "work"],
    featured: true,
  },

  // ---------------- Audio ----------------
  {
    id: "p4",
    name: "Halo Noise-Cancelling Headphones",
    slug: "halo-noise-cancelling-headphones",
    brand: "Sonora",
    categorySlug: "audio",
    price: 299,
    compareAtPrice: 379,
    currency: CUR,
    shortDescription:
      "Reference-grade sound with adaptive noise cancellation and 40-hour battery.",
    description:
      "The Halo wraps you in silence, then fills it with rich, balanced sound. Memory-foam ear cushions and a feather-light frame make hours disappear.",
    features: [
      "Adaptive active noise cancellation",
      "40-hour battery life",
      "Hi-Res certified drivers",
      "Multipoint Bluetooth",
      "Plush memory-foam cushions",
    ],
    images: gallery("halo"),
    rating: 4.8,
    reviewCount: 511,
    stock: 25,
    badge: "Bestseller",
    variants: [{ name: "Color", values: ["Midnight", "Ivory", "Sand"] }],
    tags: ["headphones", "travel", "music"],
    featured: true,
    trending: true,
  },
  {
    id: "p5",
    name: "Pebble Mini Speaker",
    slug: "pebble-mini-speaker",
    brand: "Sonora",
    categorySlug: "audio",
    price: 89,
    currency: CUR,
    shortDescription:
      "A pocket-sized speaker with a surprisingly big, room-filling sound.",
    description:
      "Small enough to slip in a bag, loud enough for the whole room. The Pebble is waterproof, rugged and lasts all day on a charge.",
    features: [
      "360° room-filling sound",
      "IPX7 waterproof",
      "20-hour battery",
      "Pair two for stereo",
    ],
    images: gallery("pebble"),
    rating: 4.5,
    reviewCount: 176,
    stock: 40,
    tags: ["speaker", "outdoor", "gift"],
  },
  {
    id: "p6",
    name: "Echo Air Earbuds",
    slug: "echo-air-earbuds",
    brand: "Sonora",
    categorySlug: "audio",
    price: 149,
    compareAtPrice: 179,
    currency: CUR,
    shortDescription:
      "Featherlight earbuds with crystal call clarity and wireless charging.",
    description:
      "Echo Air earbuds disappear in your ears and deliver clean, detailed audio with deep bass. The compact case charges wirelessly and tops you up for days.",
    features: [
      "Active noise cancellation",
      "Wireless charging case",
      "6h + 24h battery",
      "Crystal-clear calls",
    ],
    images: gallery("echo"),
    rating: 4.4,
    reviewCount: 233,
    stock: 0,
    badge: "Sale",
    tags: ["earbuds", "music", "travel"],
  },

  // ---------------- Home & Living ----------------
  {
    id: "p7",
    name: "Lumen Table Lamp",
    slug: "lumen-table-lamp",
    brand: "Atelier Noir",
    categorySlug: "home-living",
    price: 189,
    currency: CUR,
    shortDescription:
      "A sculptural, dimmable lamp that casts a warm, gallery-soft glow.",
    description:
      "Hand-finished in brushed brass with an opal glass shade, the Lumen is equal parts light source and art object. Touch-dim from a candle glow to a full reading light.",
    features: [
      "Stepless touch dimming",
      "Brushed brass + opal glass",
      "Warm 2700K LED",
      "Memory brightness",
    ],
    images: gallery("lumen"),
    rating: 4.9,
    reviewCount: 87,
    stock: 9,
    badge: "Editor's Pick",
    tags: ["lamp", "decor", "lighting"],
    featured: true,
  },
  {
    id: "p8",
    name: "Terra Stoneware Set",
    slug: "terra-stoneware-set",
    brand: "Maison Clay",
    categorySlug: "home-living",
    price: 145,
    compareAtPrice: 180,
    currency: CUR,
    shortDescription:
      "A 12-piece hand-glazed dinnerware set with an organic, artisanal finish.",
    description:
      "Each piece in the Terra set is thrown and glazed by hand, so no two are exactly alike. Microwave and dishwasher safe, made to be used every day.",
    features: [
      "12 pieces, service for 4",
      "Reactive hand-glaze",
      "Dishwasher + microwave safe",
      "Chip-resistant stoneware",
    ],
    images: gallery("terra"),
    rating: 4.7,
    reviewCount: 64,
    stock: 22,
    badge: "Limited",
    variants: [{ name: "Glaze", values: ["Clay", "Sage", "Charcoal"] }],
    tags: ["kitchen", "dining", "ceramics"],
    trending: true,
  },
  {
    id: "p9",
    name: "Cloud Weighted Throw",
    slug: "cloud-weighted-throw",
    brand: "Hearth",
    categorySlug: "home-living",
    price: 119,
    currency: CUR,
    shortDescription:
      "A breathable, weighted knit throw that turns any sofa into a retreat.",
    description:
      "The Cloud throw drapes with a gentle, grounding weight and a buttery hand-feel. Knitted from temperature-regulating cotton for year-round comfort.",
    features: [
      "Soothing even weight",
      "Breathable cotton knit",
      "Machine washable",
      "OEKO-TEX certified",
    ],
    images: gallery("cloud"),
    rating: 4.6,
    reviewCount: 142,
    stock: 30,
    tags: ["throw", "bedroom", "cozy", "gift"],
  },

  // ---------------- Fashion ----------------
  {
    id: "p10",
    name: "Heritage Leather Weekender",
    slug: "heritage-leather-weekender",
    brand: "Wren & Co",
    categorySlug: "fashion",
    price: 349,
    compareAtPrice: 429,
    currency: CUR,
    shortDescription:
      "A full-grain leather travel bag that ages beautifully with every trip.",
    description:
      "Cut from vegetable-tanned full-grain leather and built on solid brass hardware, the Heritage Weekender is a buy-it-for-life bag that only looks better with time.",
    features: [
      "Full-grain vegetable-tanned leather",
      "Solid brass hardware",
      "Fits a weekend + laptop",
      "Cotton-twill lining",
    ],
    images: gallery("weekender"),
    rating: 4.9,
    reviewCount: 121,
    stock: 7,
    badge: "Bestseller",
    variants: [{ name: "Color", values: ["Cognac", "Black", "Olive"] }],
    tags: ["bag", "travel", "leather", "gift"],
    featured: true,
    trending: true,
  },
  {
    id: "p11",
    name: "Cashmere Crew Sweater",
    slug: "cashmere-crew-sweater",
    brand: "Wren & Co",
    categorySlug: "fashion",
    price: 159,
    currency: CUR,
    shortDescription:
      "A grade-A Mongolian cashmere crewneck with a relaxed, modern fit.",
    description:
      "Spun from grade-A Mongolian cashmere, this crewneck is impossibly soft and warm without bulk. A wardrobe staple you'll reach for all season.",
    features: [
      "100% grade-A cashmere",
      "Relaxed modern fit",
      "Ribbed cuffs and hem",
      "Responsibly sourced",
    ],
    images: gallery("cashmere"),
    rating: 4.7,
    reviewCount: 203,
    stock: 28,
    variants: [
      { name: "Size", values: ["XS", "S", "M", "L", "XL"] },
      { name: "Color", values: ["Oatmeal", "Charcoal", "Camel"] },
    ],
    tags: ["sweater", "knitwear", "winter"],
  },
  {
    id: "p12",
    name: "Aviator Polarized Sunglasses",
    slug: "aviator-polarized-sunglasses",
    brand: "Solace",
    categorySlug: "fashion",
    price: 129,
    compareAtPrice: 159,
    currency: CUR,
    shortDescription:
      "Hand-polished acetate frames with crystal-clear polarized lenses.",
    description:
      "A modern take on a classic. Italian acetate frames, polarized scratch-resistant lenses and a spring hinge that fits like it was made for you.",
    features: [
      "Polarized UV400 lenses",
      "Italian acetate frame",
      "Spring-loaded hinges",
      "Includes leather case",
    ],
    images: gallery("aviator"),
    rating: 4.5,
    reviewCount: 156,
    stock: 19,
    badge: "Sale",
    tags: ["sunglasses", "summer", "accessories"],
  },

  // ---------------- Watches & Jewelry ----------------
  {
    id: "p13",
    name: "Meridian Automatic Watch",
    slug: "meridian-automatic-watch",
    brand: "Horizon",
    categorySlug: "watches-jewelry",
    price: 459,
    compareAtPrice: 599,
    currency: CUR,
    shortDescription:
      "A self-winding automatic timepiece with a sapphire crystal and exhibition back.",
    description:
      "The Meridian pairs a 40-hour automatic movement with a sunburst dial and 316L steel case. Sapphire crystal front and back showcases the mechanics within.",
    features: [
      "Automatic self-winding movement",
      "Scratch-proof sapphire crystal",
      "316L stainless steel case",
      "10 ATM water resistance",
      "Exhibition case back",
    ],
    images: gallery("meridian"),
    rating: 4.9,
    reviewCount: 89,
    stock: 6,
    badge: "Editor's Pick",
    variants: [{ name: "Strap", values: ["Steel", "Leather", "Mesh"] }],
    tags: ["watch", "luxury", "gift"],
    featured: true,
    trending: true,
  },
  {
    id: "p14",
    name: "Solitaire Gold Pendant",
    slug: "solitaire-gold-pendant",
    brand: "Aurelle",
    categorySlug: "watches-jewelry",
    price: 239,
    currency: CUR,
    shortDescription:
      "A delicate 18k gold-vermeil pendant with a single lab-grown stone.",
    description:
      "Understated and endlessly wearable, the Solitaire pendant catches the light with a single brilliant lab-grown stone on an 18k gold-vermeil chain.",
    features: [
      "18k gold vermeil",
      "Lab-grown brilliant stone",
      "Adjustable 16–18\" chain",
      "Hypoallergenic",
    ],
    images: gallery("solitaire"),
    rating: 4.8,
    reviewCount: 74,
    stock: 14,
    badge: "New",
    tags: ["necklace", "jewelry", "gift"],
  },
  {
    id: "p15",
    name: "Bond Leather Watch Strap",
    slug: "bond-leather-watch-strap",
    brand: "Horizon",
    categorySlug: "watches-jewelry",
    price: 49,
    currency: CUR,
    shortDescription:
      "A quick-release full-grain leather strap to refresh any 20mm watch.",
    description:
      "Hand-stitched from full-grain leather with quick-release pins, the Bond strap lets you transform your watch in seconds — no tools required.",
    features: [
      "Quick-release pins",
      "Full-grain leather",
      "Fits 20mm lugs",
      "Stainless buckle",
    ],
    images: gallery("bondstrap"),
    rating: 4.4,
    reviewCount: 58,
    stock: 50,
    tags: ["strap", "accessories"],
  },

  // ---------------- Beauty ----------------
  {
    id: "p16",
    name: "Velvet Glow Serum",
    slug: "velvet-glow-serum",
    brand: "Lumière",
    categorySlug: "beauty",
    price: 68,
    compareAtPrice: 84,
    currency: CUR,
    shortDescription:
      "A vitamin-C + hyaluronic serum for visibly brighter, plumper skin.",
    description:
      "Velvet Glow blends 15% vitamin C with multi-weight hyaluronic acid to brighten, hydrate and smooth. Lightweight, fast-absorbing and fragrance-free.",
    features: [
      "15% stable vitamin C",
      "Triple hyaluronic acid",
      "Fragrance-free",
      "Cruelty-free & vegan",
    ],
    images: gallery("velvet"),
    rating: 4.7,
    reviewCount: 412,
    stock: 60,
    badge: "Bestseller",
    tags: ["skincare", "serum", "self-care"],
    featured: true,
  },
  {
    id: "p17",
    name: "Noir Eau de Parfum",
    slug: "noir-eau-de-parfum",
    brand: "Lumière",
    categorySlug: "beauty",
    price: 110,
    currency: CUR,
    shortDescription:
      "An warm, woody unisex fragrance with amber, oud and vanilla.",
    description:
      "Noir opens with bergamot and pink pepper, settling into a sophisticated heart of oud, amber and vanilla. Long-lasting and unmistakably refined.",
    features: [
      "50ml eau de parfum",
      "Amber, oud & vanilla",
      "10–12 hour wear",
      "Clean, vegan formula",
    ],
    images: gallery("noir"),
    rating: 4.8,
    reviewCount: 167,
    stock: 21,
    badge: "Limited",
    tags: ["fragrance", "perfume", "gift"],
    trending: true,
  },
  {
    id: "p18",
    name: "Silk Press Hair Dryer",
    slug: "silk-press-hair-dryer",
    brand: "Lumière",
    categorySlug: "beauty",
    price: 199,
    compareAtPrice: 249,
    currency: CUR,
    shortDescription:
      "An ultra-quiet ionic dryer that cuts drying time and frizz in half.",
    description:
      "The Silk Press uses a high-speed brushless motor and ionic air to dry hair fast while protecting shine. Intelligent heat control prevents damage.",
    features: [
      "Brushless high-speed motor",
      "Ionic frizz control",
      "Intelligent heat sensor",
      "3 magnetic attachments",
    ],
    images: gallery("silkpress"),
    rating: 4.6,
    reviewCount: 93,
    stock: 16,
    badge: "Sale",
    tags: ["hair", "tools", "beauty"],
  },

  // ---------------- Outdoors ----------------
  {
    id: "p19",
    name: "Summit Insulated Bottle",
    slug: "summit-insulated-bottle",
    brand: "Northbound",
    categorySlug: "outdoors",
    price: 39,
    currency: CUR,
    shortDescription:
      "Keeps drinks cold for 24h or hot for 12h in a rugged, leakproof body.",
    description:
      "Triple-wall vacuum insulation, a powder-coated grip and a genuinely leakproof lid make the Summit the only bottle you'll want to carry.",
    features: [
      "24h cold / 12h hot",
      "Triple-wall vacuum insulation",
      "Leakproof lid",
      "BPA-free 750ml",
    ],
    images: gallery("summit"),
    rating: 4.7,
    reviewCount: 288,
    stock: 75,
    badge: "Bestseller",
    variants: [{ name: "Color", values: ["Forest", "Sand", "Slate", "Black"] }],
    tags: ["bottle", "hydration", "outdoor"],
  },
  {
    id: "p20",
    name: "Trailhead 28L Backpack",
    slug: "trailhead-28l-backpack",
    brand: "Northbound",
    categorySlug: "outdoors",
    price: 159,
    compareAtPrice: 189,
    currency: CUR,
    shortDescription:
      "A weatherproof daypack with a floating laptop sleeve and trail-ready harness.",
    description:
      "Built for the commute and the trail alike. Recycled weatherproof fabric, a ventilated back panel and smart organisation keep your gear safe and accessible.",
    features: [
      "Weatherproof recycled fabric",
      "Floating 16\" laptop sleeve",
      "Ventilated back panel",
      "28L expandable",
    ],
    images: gallery("trailhead"),
    rating: 4.6,
    reviewCount: 134,
    stock: 23,
    badge: "New",
    tags: ["backpack", "travel", "outdoor"],
    trending: true,
  },
  {
    id: "p21",
    name: "Ember Pocket Lantern",
    slug: "ember-pocket-lantern",
    brand: "Northbound",
    categorySlug: "outdoors",
    price: 54,
    currency: CUR,
    shortDescription:
      "A collapsible solar lantern that packs flat and glows for 100 hours.",
    description:
      "The Ember inflates into a soft, warm lantern and collapses to the size of a coaster. Solar and USB charging mean light wherever the day takes you.",
    features: [
      "100-hour runtime",
      "Solar + USB charging",
      "Collapsible & waterproof",
      "Doubles as a power bank",
    ],
    images: gallery("ember"),
    rating: 4.5,
    reviewCount: 76,
    stock: 41,
    tags: ["lantern", "camping", "outdoor"],
  },

  // ---------------- Wellness ----------------
  {
    id: "p22",
    name: "Serenity Aroma Diffuser",
    slug: "serenity-aroma-diffuser",
    brand: "Stillwell",
    categorySlug: "wellness",
    price: 72,
    currency: CUR,
    shortDescription:
      "A ceramic ultrasonic diffuser with ambient light and an 8-hour mist.",
    description:
      "Turn any space into a sanctuary. The Serenity diffuser pairs a hand-finished ceramic shell with a whisper-quiet mist and a warm, dimmable glow.",
    features: [
      "8-hour continuous mist",
      "Hand-finished ceramic",
      "Dimmable ambient light",
      "Auto shut-off",
    ],
    images: gallery("serenity"),
    rating: 4.7,
    reviewCount: 119,
    stock: 33,
    badge: "Editor's Pick",
    tags: ["diffuser", "aromatherapy", "self-care", "gift"],
    featured: true,
  },
  {
    id: "p23",
    name: "Restore Massage Gun",
    slug: "restore-massage-gun",
    brand: "Stillwell",
    categorySlug: "wellness",
    price: 149,
    compareAtPrice: 199,
    currency: CUR,
    shortDescription:
      "A quiet percussive massager that melts away tension in minutes.",
    description:
      "Five speeds, six heads and a brushless quiet motor make the Restore a physio in your bag. Perfect after workouts or a long day at the desk.",
    features: [
      "5 speeds, 6 heads",
      "Quiet brushless motor",
      "6-hour battery",
      "Travel case included",
    ],
    images: gallery("restore"),
    rating: 4.6,
    reviewCount: 205,
    stock: 17,
    badge: "Sale",
    tags: ["recovery", "fitness", "wellness"],
    trending: true,
  },
  {
    id: "p24",
    name: "Dawn Sunrise Alarm",
    slug: "dawn-sunrise-alarm",
    brand: "Stillwell",
    categorySlug: "wellness",
    price: 89,
    currency: CUR,
    shortDescription:
      "Wake gently to a simulated sunrise and drift off to a fading dusk.",
    description:
      "The Dawn alarm eases you awake with 30 minutes of gradual light and natural sound — no jarring alarms. A calmer start to every morning.",
    features: [
      "30-min sunrise simulation",
      "Sunset wind-down mode",
      "Natural wake sounds",
      "FM radio + tap snooze",
    ],
    images: gallery("dawn"),
    rating: 4.5,
    reviewCount: 98,
    stock: 26,
    badge: "New",
    tags: ["sleep", "wellness", "gift"],
  },
];

// Attach the shared review set to each product on demand.
export function getReviews(slug: string): ProductReview[] {
  return sampleReviews(slug);
}

// ---------------- Query helpers ----------------
export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getFeatured(limit = 8): Product[] {
  return products.filter((p) => p.featured).slice(0, limit);
}

export function getTrending(limit = 8): Product[] {
  return products.filter((p) => p.trending).slice(0, limit);
}

export function getBestsellers(limit = 8): Product[] {
  return products.filter((p) => p.badge === "Bestseller").slice(0, limit);
}

export function getOnSale(limit = 8): Product[] {
  return products
    .filter((p) => p.compareAtPrice && p.compareAtPrice > p.price)
    .slice(0, limit);
}

export function getRelated(product: Product, limit = 4): Product[] {
  return products
    .filter(
      (p) => p.id !== product.id && p.categorySlug === product.categorySlug,
    )
    .concat(
      products.filter(
        (p) =>
          p.id !== product.id &&
          p.categorySlug !== product.categorySlug &&
          p.tags.some((t) => product.tags.includes(t)),
      ),
    )
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) =>
    [p.name, p.brand, p.shortDescription, p.categorySlug, ...p.tags]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export function getProductsByIds(ids: string[]): Product[] {
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
}

export function getProductsBySlugs(slugs: string[]): Product[] {
  return slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}
