import type { BlogPost } from "@/types";

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-build-a-considered-wardrobe",
    title: "How to Build a Considered Wardrobe That Lasts",
    excerpt:
      "Quality over quantity isn't a cliché — it's a strategy. Here's how to invest in pieces that earn their place for years.",
    cover: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80",
    category: "Style",
    tags: ["fashion", "guides", "sustainability"],
    author: {
      name: "Eleanor Vance",
      role: "Style Editor",
      avatar: "https://i.pravatar.cc/120?img=47",
    },
    date: "2026-06-10",
    featured: true,
    content: `A considered wardrobe begins with a simple shift in mindset: buy less, but buy better. The goal is a small collection of pieces you genuinely love and reach for again and again.

## Start with the essentials

Before chasing trends, anchor your wardrobe in timeless essentials — a well-cut coat, a cashmere crew, a pair of versatile boots. These are the pieces you'll build everything else around, so it's worth investing in quality here first.

## Choose materials that age well

Natural fibres like full-grain leather, cashmere and organic cotton don't just feel better — they develop character with wear. A leather bag that patinas or a knit that softens over time tells a story synthetic materials never can.

## Buy for the long term

Ask one question before any purchase: will I still want this in five years? If the answer is yes, it's rarely a mistake. If you hesitate, wait. The best wardrobes are edited, not accumulated.

## Care for what you own

Quality pieces reward a little maintenance. Store knitwear folded, condition your leather, and rotate your shoes. Treat your things well and they'll serve you far longer than fast fashion ever could.`,
  },
  {
    slug: "the-art-of-the-gift",
    title: "The Art of the Gift: A Guide to Giving Well",
    excerpt:
      "Great gifts aren't about price. They're about attention. A short guide to choosing presents people actually treasure.",
    cover: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    category: "Living",
    tags: ["gifts", "guides"],
    author: {
      name: "Marcus Reed",
      role: "Lifestyle Writer",
      avatar: "https://i.pravatar.cc/120?img=15",
    },
    date: "2026-05-28",
    content: `The best gift you've ever received probably wasn't the most expensive. It was the one that proved someone was paying attention. That's the whole art of it.

## Listen before you shop

People tell you what they want all year — in passing comments, small frustrations, quiet wishes. The most thoughtful gifts come from remembering those moments, not from a last-minute scroll.

## Favour the everyday

A beautifully made object someone uses daily — a smart mug, a perfect lamp, a soft throw — brings more joy than a grand gesture that gathers dust. Elevate the ordinary.

## Presentation matters

Half the delight of a gift is the unwrapping. Premium packaging and a handwritten note transform even a small item into an occasion.`,
  },
  {
    slug: "designing-a-calm-home",
    title: "Designing a Calm Home in a Busy World",
    excerpt:
      "Your space shapes your mood more than you think. Small, intentional choices can turn any room into a retreat.",
    cover: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    category: "Home",
    tags: ["home", "wellness", "guides"],
    author: {
      name: "Priya Anand",
      role: "Interiors Contributor",
      avatar: "https://i.pravatar.cc/120?img=48",
    },
    date: "2026-05-12",
    content: `Calm isn't expensive, and it isn't about minimalism for its own sake. It's about removing friction and adding warmth — making a home that lets you exhale.

## Lead with light

Harsh overhead lighting is the enemy of calm. Layer warm, dimmable lamps at different heights and let the evening feel softer than the day.

## Reduce visual noise

Clutter is quietly exhausting. Give your most-used items a beautiful home and let surfaces breathe. A single considered object says more than ten.

## Engage the senses

A warm throw, the glow of a diffuser, the weight of a well-made mug — calm is built from small sensory pleasures that remind you to slow down.`,
  },
  {
    slug: "why-quality-pays-for-itself",
    title: "Why Buying Quality Pays for Itself",
    excerpt:
      "The cheapest option is rarely the most affordable. A look at the real math behind buying things that last.",
    cover: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80",
    category: "Living",
    tags: ["guides", "sustainability"],
    author: {
      name: "Eleanor Vance",
      role: "Style Editor",
      avatar: "https://i.pravatar.cc/120?img=47",
    },
    date: "2026-04-22",
    content: `"Buy it nice or buy it twice" is more than a saying — it's arithmetic. When you factor in replacements, the premium option is often the budget option in disguise.

## Cost per use

A $300 bag you carry for ten years costs pennies a day. A $60 bag you replace yearly costs more over the same decade — and never feels as good. Divide price by use, not by sticker.

## The hidden costs of cheap

Fast goods carry costs that don't show on the price tag: the frustration of things breaking, the waste, the time spent rebuying. Quality removes that friction entirely.

## Invest where it counts

You don't need everything to be premium — just the things you touch every day. Spend there, save elsewhere, and your daily life quietly gets better.`,
  },
];

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return blogPosts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      const aShared = a.tags.filter((t) => post.tags.includes(t)).length;
      const bShared = b.tags.filter((t) => post.tags.includes(t)).length;
      return bShared - aShared;
    })
    .slice(0, limit);
}

export const blogCategories = Array.from(
  new Set(blogPosts.map((p) => p.category)),
);
