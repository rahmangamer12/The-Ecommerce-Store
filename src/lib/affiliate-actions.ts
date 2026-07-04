"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminEmails } from "@/config/env";
import { slugify } from "@/lib/utils";
import { featuresFromText } from "@/lib/cj";
import { aiSuggestCategory } from "@/lib/ai";
import { getCategories } from "@/lib/categories";

// =============================================================
//  Affiliate product import.
//  Paste any product link (Amazon, AliExpress, …) and we pull
//  its title / image / description from the page's Open Graph
//  tags, then create a product whose buy button links out to
//  that URL (so you earn the affiliate commission).
//
//  Best-effort: unlike CJ there's no API, so some sites block
//  bots or omit tags — you can always edit the product after.
// =============================================================

async function requireAdmin(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  return !!email && adminEmails.includes(email);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#3[49];/g, "'")
    .replace(/&#x27;/gi, "'")
    .trim();
}

/** Find a <meta property|name="..."> content value (order-independent). */
function meta(html: string, keys: string[]): string | undefined {
  for (const key of keys) {
    const a = html.match(
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`,
        "i",
      ),
    );
    if (a?.[1]) return decodeEntities(a[1]);
    const b = html.match(
      new RegExp(
        `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
        "i",
      ),
    );
    if (b?.[1]) return decodeEntities(b[1]);
  }
  return undefined;
}

type Scraped = {
  title?: string;
  image?: string;
  description?: string;
  price?: number;
};

/** Fetch a URL and pull out Open Graph / basic product details. */
async function scrape(url: string): Promise<Scraped> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    cache: "no-store",
  });
  const html = (await res.text()).slice(0, 500_000);

  const title =
    meta(html, ["og:title", "twitter:title"]) ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

  const image = meta(html, [
    "og:image:secure_url",
    "og:image",
    "twitter:image",
    "twitter:image:src",
  ]);

  const description = meta(html, [
    "og:description",
    "twitter:description",
    "description",
  ]);

  // Price: OG/product meta, else a "price":<n> in embedded JSON-LD.
  let price: number | undefined;
  const priceMeta = meta(html, [
    "product:price:amount",
    "og:price:amount",
    "twitter:data1",
  ]);
  if (priceMeta) {
    const n = Number(priceMeta.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(n) && n > 0) price = n;
  }
  if (!price) {
    const ld = html.match(/"price"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)"?/i);
    if (ld) {
      const n = Number(ld[1]);
      if (Number.isFinite(n) && n > 0) price = n;
    }
  }

  return {
    title: title ? decodeEntities(title) : undefined,
    image,
    description: description ? decodeEntities(description) : undefined,
    price,
  };
}

const urlSchema = z.string().url("Enter a valid product link.");

export type AffiliatePreview =
  | { ok: true; data: Scraped & { host: string } }
  | { ok: false; error: string };

/** Preview what we can pull from an affiliate link before importing. */
export async function previewAffiliate(url: string): Promise<AffiliatePreview> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const parsed = urlSchema.safeParse(url.trim());
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    const data = await scrape(parsed.data);
    const host = new URL(parsed.data).hostname.replace(/^www\./, "");
    if (!data.title && !data.image) {
      return {
        ok: false,
        error:
          "Couldn't read that page (the site may block bots). You can still import it and fill the details by hand.",
      };
    }
    return { ok: true, data: { ...data, host } };
  } catch {
    return { ok: false, error: "Couldn't reach that link. Check it and retry." };
  }
}

const importSchema = z.object({
  url: urlSchema,
  categorySlug: z.string().min(1, "Choose a category"),
  price: z.number().positive("Enter the price to show"),
  name: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  compareAtPrice: z.number().optional(),
});

export type ImportAffiliateResult =
  | { ok: true; slug: string; name: string }
  | { ok: false; error: string };

export async function importAffiliateProduct(
  input: unknown,
): Promise<ImportAffiliateResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorised." };
  const parsed = importSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database isn't connected." };

  const host = new URL(d.url).hostname.replace(/^www\./, "");

  // Fill any missing details straight from the page.
  let name = d.name?.trim();
  let image = d.image?.trim();
  let description = d.description?.trim();
  if (!name || !image) {
    try {
      const s = await scrape(d.url);
      name = name || s.title;
      image = image || s.image;
      description = description || s.description;
    } catch {
      // best-effort — fall through to defaults below
    }
  }
  name = (name || host).slice(0, 140);

  // Let the AI pick the best category when the admin chose "Auto".
  let resolvedCategory = d.categorySlug;
  if (d.categorySlug === "__auto__") {
    const cats = await getCategories();
    const picked = await aiSuggestCategory({
      name,
      description,
      categories: cats,
    });
    resolvedCategory = picked ?? cats[0]?.slug ?? "technology";
  }

  const features = description ? featuresFromText(description, 5) : [];

  const slug = `${slugify(name).slice(0, 60)}-${Date.now()
    .toString(36)
    .slice(-4)}`;

  const { error } = await admin.from("products").insert({
    name,
    slug,
    brand: host,
    category_slug: resolvedCategory,
    price: d.price,
    compare_at_price: d.compareAtPrice ?? null,
    currency: "USD",
    short_description: (description || name).slice(0, 150),
    description: description || name,
    features,
    images: image ? [image] : [],
    tags: ["affiliate"],
    stock: 100,
    rating: 5,
    review_count: 0,
    source: "affiliate",
    affiliate_url: d.url,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);
  return { ok: true, slug, name };
}
