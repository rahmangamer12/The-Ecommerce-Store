import crypto from "crypto";
import { NextResponse } from "next/server";
import { polarWebhookSecret } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Verify a Standard Webhooks (Svix-style) signature, as used by Polar.
function verify(
  payload: string,
  headers: { id: string; timestamp: string; signature: string },
  secret: string,
): boolean {
  try {
    const key = secret.startsWith("whsec_") ? secret.slice(6) : secret;
    const keyBytes = Buffer.from(key, "base64");
    const signed = `${headers.id}.${headers.timestamp}.${payload}`;
    const expected = crypto
      .createHmac("sha256", keyBytes)
      .update(signed)
      .digest("base64");
    // The header may contain multiple space-separated "v1,<sig>" entries.
    return headers.signature
      .split(" ")
      .map((p) => p.split(",")[1] ?? p)
      .some((sig) => {
        try {
          return crypto.timingSafeEqual(
            Buffer.from(sig),
            Buffer.from(expected),
          );
        } catch {
          return false;
        }
      });
  } catch {
    return false;
  }
}

/**
 * POST /api/polar/webhook
 * Polar calls this after a successful payment. We verify the signature,
 * then mark the matching order as paid in Supabase.
 *
 * Set this URL in Polar → Settings → Webhooks, and put the signing secret
 * in POLAR_WEBHOOK_SECRET (.env.local + Vercel).
 */
export async function POST(request: Request) {
  const payload = await request.text();

  // No secret configured yet → acknowledge but do nothing (safe no-op).
  if (!polarWebhookSecret) {
    return NextResponse.json({ ok: true, note: "webhook secret not set" });
  }

  const id = request.headers.get("webhook-id") ?? "";
  const timestamp = request.headers.get("webhook-timestamp") ?? "";
  const signature = request.headers.get("webhook-signature") ?? "";

  if (!verify(payload, { id, timestamp, signature }, polarWebhookSecret)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  // Parse the event and find our order number from the metadata we set
  // when creating the checkout.
  let event: { type?: string; data?: { metadata?: { order_number?: string } } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const orderNumber = event.data?.metadata?.order_number;
  if (orderNumber) {
    const admin = createAdminClient();
    if (admin) {
      await admin
        .from("orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("number", orderNumber);
    }
  }

  return NextResponse.json({ ok: true });
}
