import { NextResponse } from "next/server";
import { aiComplete, isAiConfigured, type AiMessage } from "@/lib/ai";
import { getCatalog } from "@/lib/catalog";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// -------------------------------------------------------------
//  Storefront AI assistant. Takes the chat so far, grounds the
//  model in the LIVE catalogue + store policies, and returns a
//  short helpful reply. Fails soft (never 500s the widget).
// -------------------------------------------------------------

type Body = { messages?: { role?: string; content?: string }[] };

function buildSystemPrompt(catalogLines: string): string {
  return [
    `You are the shopping assistant for "${siteConfig.name}", a premium international online store that ships worldwide.`,
    "",
    "Your job: help shoppers find the right product, and answer questions about shipping, returns, sizing and payment.",
    "",
    "Rules:",
    "- Be warm, friendly and CONCISE (usually 2–4 sentences).",
    "- Reply in the SAME language the customer writes in (English, Arabic, or Roman Urdu / Hindi).",
    "- Only recommend products that appear in the CATALOG below. NEVER invent products, prices or specs.",
    "- When you suggest a product, include its name and price.",
    "- Only discuss this store, its products and orders. Politely redirect anything unrelated.",
    "- Shipping: worldwide, dispatched in 1–2 business days, delivered in ~5–9 days. Free over $100.",
    "- Returns: 30 days in original packaging for a full refund.",
    "- For a specific order's status, tell them to use the ‘Track order’ page or Contact — you cannot look up orders.",
    "- If you don't know, say so honestly and point them to the Contact page.",
    "",
    "CATALOG (name — price — category):",
    catalogLines || "(no products loaded)",
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

  // Ground the model in the live catalogue.
  let catalogLines = "";
  try {
    const catalog = await getCatalog();
    catalogLines = catalog
      .slice(0, 60)
      .map(
        (p) =>
          `- ${p.name} — ${formatPrice(p.price, p.currency)} — ${p.categorySlug}`,
      )
      .join("\n");
  } catch {
    // grounding is best-effort
  }

  const reply = await aiComplete({
    system: buildSystemPrompt(catalogLines),
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
