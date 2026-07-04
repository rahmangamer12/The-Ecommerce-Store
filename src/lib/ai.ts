import { aiApiKey, aiBaseUrl, aiModel, isAiConfigured } from "@/config/env";

// =============================================================
//  AI client (LongCat — Anthropic-compatible /v1/messages).
//  Same graceful philosophy as the CJ / PayPal clients: every
//  call returns null on failure so the store keeps working when
//  AI is down or not configured.
//
//  Auth quirk: LongCat wants `Authorization: Bearer <key>`
//  (verified via curl), not Anthropic's `x-api-key` header.
// =============================================================

export { isAiConfigured };

export type AiMessage = { role: "user" | "assistant"; content: string };

type ContentBlock = { type?: string; text?: string };

/** Low-level completion. Returns the assistant's text, or null on any failure. */
export async function aiComplete(opts: {
  system?: string;
  messages: AiMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  if (!isAiConfigured) return null;
  try {
    const res = await fetch(`${aiBaseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiApiKey}`,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
        max_tokens: opts.maxTokens ?? 600,
        ...(opts.temperature != null ? { temperature: opts.temperature } : {}),
        ...(opts.system ? { system: opts.system } : {}),
        messages: opts.messages,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { content?: ContentBlock[] };
    const text = Array.isArray(json.content)
      ? json.content
          .filter((b) => b?.type === "text" && b.text)
          .map((b) => b.text)
          .join("")
          .trim()
      : "";
    return text || null;
  } catch {
    return null;
  }
}

/**
 * Look at a product and pick the single best-fitting category SLUG from the
 * store's own category list. Returns null if AI is off or unsure (caller then
 * falls back to a default), so imports never fail because of this.
 */
export async function aiSuggestCategory(input: {
  name: string;
  description?: string;
  categories: { slug: string; name: string }[];
}): Promise<string | null> {
  if (!isAiConfigured || input.categories.length === 0) return null;
  const list = input.categories.map((c) => `- ${c.slug} (${c.name})`).join("\n");
  const system =
    "You are a precise product categoriser for an online store. From the given list, choose the ONE category slug that best fits the product. Reply with ONLY the slug — no words, no punctuation, no explanation.";
  const user = `Available categories:\n${list}\n\nProduct name: ${input.name}\nDescription: ${(input.description ?? "").slice(0, 300)}\n\nBest category slug:`;
  const out = await aiComplete({
    system,
    messages: [{ role: "user", content: user }],
    maxTokens: 16,
    temperature: 0,
  });
  if (!out) return null;
  const slug = out.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  return input.categories.find((c) => c.slug === slug)?.slug ?? null;
}
