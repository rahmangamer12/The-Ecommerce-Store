import { NextResponse } from "next/server";
import { aiComplete, isAiConfigured, type AiMessage } from "@/lib/ai";
import { getShopProducts } from "@/lib/catalog";
import { getCategoriesCached } from "@/lib/categories";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// -------------------------------------------------------------
//  Storefront AI assistant. Two-step "agentic" flow:
//    1. A tiny AI call turns the shopper's message (any language)
//       into ENGLISH search keywords.
//    2. Those keywords query the LIVE catalogue (5k+ products), and
//       the matches ground the real reply — with links the widget
//       renders as clickable products.
//  Fails soft at every step (never 500s the widget).
// -------------------------------------------------------------

type Body = { messages?: { role?: string; content?: string }[] };

/** Ask the model for catalogue search keywords. Null = not product-related. */
async function extractKeywords(lastMessage: string): Promise<string[] | null> {
  const out = await aiComplete({
    system:
      "You turn a shopper's message into product-search keywords for an online store. " +
      "Reply with ONLY 1-3 short ENGLISH keywords separated by commas (e.g. `smart watch, fitness tracker`). " +
      "Translate to English if the message is in another language. " +
      "If the message is NOT about finding/asking about a type of product (e.g. it's about shipping, returns, payment, tracking or chit-chat), reply exactly NONE.",
    messages: [{ role: "user", content: lastMessage.slice(0, 500) }],
    maxTokens: 30,
    temperature: 0,
  });
  if (!out || /^\s*NONE\s*$/i.test(out)) return null;
  const kws = out
    .split(/[,\n]/)
    .map((k) => k.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim())
    .filter((k) => k.length >= 3 && k.length <= 40)
    .slice(0, 3);
  return kws.length ? kws : null;
}

/** Search the live catalogue for each keyword and merge unique matches. */
async function searchCatalog(keywords: string[]): Promise<Product[]> {
  const results = await Promise.all(
    keywords.map((q) =>
      getShopProducts({ q, pageSize: 6, sort: "popular" }).then((r) => r.products),
    ),
  );
  const seen = new Set<string>();
  const merged: Product[] = [];
  for (const p of results.flat()) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    merged.push(p);
    if (merged.length >= 15) break;
  }
  return merged;
}

function productLine(p: Product): string {
  return `- [${p.name}](/products/${p.slug}) — ${formatPrice(p.price, p.currency)} — ${p.categorySlug}`;
}

function buildSystemPrompt(
  matchedLines: string,
  popularLines: string,
  categoryLines: string,
): string {
  return [
    `You are the AI shopping assistant for "${siteConfig.name}", a premium international online store that ships worldwide.`,
    "",
    "Your job: help shoppers find the right product, and answer questions about shipping, returns, payment and order tracking.",
    "",
    "Rules:",
    "- Be warm, friendly and CONCISE (usually 2-4 sentences).",
    "- ALWAYS reply in the SAME language the customer writes in (the store supports English, Arabic, Hindi, Urdu / Roman Urdu, Spanish, French, Chinese, Russian, Portuguese, German, Japanese and Turkish).",
    "- Only recommend products from the lists below. NEVER invent products, prices or specs.",
    "- When you mention a product, keep its markdown link exactly as given: [Name](/products/slug) — the chat renders it as a clickable link. Include the price.",
    "- You can also link category pages, e.g. [Watches & Jewelry](/categories/watches-jewelry).",
    "- If MATCHED PRODUCTS is empty for a product question, say you couldn't find an exact match and suggest the closest category link — the store has thousands of products, so never claim the store doesn't carry something.",
    "- Only discuss this store, its products and orders. Politely redirect anything unrelated.",
    "",
    "Store facts:",
    "- Shipping: worldwide; dispatched in 1-2 business days; typical delivery 5-9 days (up to 15 for remote areas). Free shipping over $100, otherwise $9 flat.",
    "- Payment: PayPal, credit/debit card, bank transfer, or order via WhatsApp (+974 3126 9934). No cash on delivery.",
    "- Returns: damaged or wrong items — report within 7 days with photos for a free replacement or full refund. Changed your mind — return unused within 14 days (buyer pays return shipping). Refunds arrive in 5-10 business days.",
    "- Track an order on the [Track Order](/track-order) page; other help via the [Contact](/contact) page.",
    "",
    "CATEGORIES:",
    categoryLines,
    "",
    "MATCHED PRODUCTS (live search results for this question):",
    matchedLines || "(none)",
    "",
    "POPULAR PRODUCTS (general suggestions):",
    popularLines || "(none)",
  ].join("\n");
}

export async function POST(req: Request) {
  if (!isAiConfigured) {
    return NextResponse.json(
      { error: "Assistant is not enabled." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // Sanitise + cap the conversation (keep it cheap and abuse-resistant).
  const messages: AiMessage[] = (body.messages ?? [])
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        (m?.role === "user" || m?.role === "assistant") &&
        typeof m?.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Say something first." }, { status: 400 });
  }

  // Ground the model in the LIVE catalogue (all best-effort).
  let matched: Product[] = [];
  let popular: Product[] = [];
  let categoryLines = "";
  try {
    const lastMessage = messages[messages.length - 1].content;
    const [keywords, categories, popularRes] = await Promise.all([
      extractKeywords(lastMessage),
      getCategoriesCached(),
      getShopProducts({ pageSize: 10, sort: "popular" }),
    ]);
    popular = popularRes.products;
    categoryLines = categories
      .map((c) => `- [${c.name}](/categories/${c.slug})`)
      .join("\n");
    if (keywords) matched = await searchCatalog(keywords);
  } catch {
    // grounding is best-effort
  }

  const reply = await aiComplete({
    system: buildSystemPrompt(
      matched.map(productLine).join("\n"),
      popular.map(productLine).join("\n"),
      categoryLines,
    ),
    messages,
    maxTokens: 500,
    temperature: 0.4,
  });

  if (!reply) {
    return NextResponse.json(
      { reply: "Sorry, I couldn't answer that just now. Please try again in a moment, or reach us via the Contact page." },
      { status: 200 },
    );
  }

  return NextResponse.json({ reply });
}
