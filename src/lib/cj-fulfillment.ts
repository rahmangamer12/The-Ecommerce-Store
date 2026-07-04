"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminEmails, cjAutoFulfill, isCjConfigured } from "@/config/env";
import { createCjOrder, type CjOrderInput } from "@/lib/cj";
import { toCountryCode } from "@/lib/countries";

// =============================================================
//  Forward a paid order to CJ Dropshipping for fulfilment.
//
//  - fulfillPaidOrder(): called automatically right after a
//    payment is confirmed (PayPal/card). Internal — no admin gate.
//  - sendOrderToCj(): the manual "Send to CJ" fallback button in
//    the admin, for when the auto push failed or was skipped.
//
//  Every path is safe: if CJ isn't configured, or the order has
//  no CJ-linked items, we simply mark it and move on.
// =============================================================

type ShippingAddress = {
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
};

type OrderRow = {
  id: string;
  number: string;
  customer_email: string | null;
  shipping_address: ShippingAddress | null;
  fulfillment_status: string | null;
  cj_order_id: string | null;
};

async function requireAdmin(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  return !!email && adminEmails.includes(email);
}

export type FulfillResult = {
  ok: boolean;
  status: "sent" | "skipped" | "failed";
  cjOrderId?: string;
  error?: string;
};

/**
 * Core push: given an order row, gather its CJ-linked items and forward
 * them to CJ. Writes the outcome back onto the order.
 */
async function pushOrderToCj(order: OrderRow): Promise<FulfillResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, status: "failed", error: "No database." };

  // Already forwarded — don't double-order.
  if (order.cj_order_id) {
    return { ok: true, status: "sent", cjOrderId: order.cj_order_id };
  }

  if (!isCjConfigured) {
    return { ok: false, status: "skipped", error: "CJ not configured." };
  }

  // Load the order's line items, then the CJ variant id for each product.
  const { data: items } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", order.id);

  const productIds = (items ?? [])
    .map((i) => i.product_id)
    .filter((v): v is string => Boolean(v));

  let cjProducts: { vid: string; quantity: number }[] = [];
  if (productIds.length) {
    const { data: prods } = await admin
      .from("products")
      .select("id, cj_vid")
      .in("id", productIds);
    const vidById = new Map(
      (prods ?? [])
        .filter((p) => p.cj_vid)
        .map((p) => [String(p.id), String(p.cj_vid)]),
    );
    cjProducts = (items ?? [])
      .map((i) => {
        const vid = i.product_id ? vidById.get(String(i.product_id)) : undefined;
        return vid ? { vid, quantity: Number(i.quantity) || 1 } : null;
      })
      .filter((v): v is { vid: string; quantity: number } => Boolean(v));
  }

  // No CJ-linked items (e.g. a fully manual/affiliate order) — nothing to do.
  if (!cjProducts.length) {
    await admin
      .from("orders")
      .update({ fulfillment_status: "skipped" })
      .eq("id", order.id);
    return { ok: true, status: "skipped", error: "No CJ items in this order." };
  }

  const addr = order.shipping_address ?? {};
  const city = addr.city ?? "";
  const cjInput: CjOrderInput = {
    orderNumber: order.number,
    shipping: {
      name: addr.fullName ?? "",
      // CJ needs the 2-letter ISO code (checkout stores the full name).
      countryCode: toCountryCode(addr.country),
      // CJ requires a non-empty province — fall back to the city when the
      // checkout didn't capture a state/province.
      province: (addr.state && addr.state.trim()) || city,
      city,
      address: [addr.line1, addr.line2].filter(Boolean).join(", ") || city,
      zip: addr.zip ?? "",
      phone: addr.phone ?? "",
      email: order.customer_email ?? undefined,
    },
    products: cjProducts,
  };

  const result = await createCjOrder(cjInput);

  if (result.ok) {
    await admin
      .from("orders")
      .update({
        fulfillment_status: "sent",
        cj_order_id: result.cjOrderId ?? null,
        cj_order_num: result.cjOrderNum ?? null,
        fulfillment_error: null,
        status: "purchased",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);
    return { ok: true, status: "sent", cjOrderId: result.cjOrderId };
  }

  await admin
    .from("orders")
    .update({
      fulfillment_status: "failed",
      fulfillment_error: result.error ?? "Unknown CJ error.",
    })
    .eq("id", order.id);
  return { ok: false, status: "failed", error: result.error };
}

const ORDER_COLS =
  "id, number, customer_email, shipping_address, fulfillment_status, cj_order_id";

/**
 * Auto-fulfilment hook. Call this from a payment-success route once an order
 * is marked paid. Looks the order up by its number. Never throws.
 */
export async function fulfillPaidOrder(
  orderNumber: string,
): Promise<FulfillResult> {
  if (!cjAutoFulfill) return { ok: true, status: "skipped" };
  try {
    const admin = createAdminClient();
    if (!admin) return { ok: false, status: "failed", error: "No database." };
    const { data } = await admin
      .from("orders")
      .select(ORDER_COLS)
      .eq("number", orderNumber)
      .maybeSingle();
    if (!data) return { ok: false, status: "failed", error: "Order not found." };
    return await pushOrderToCj(data as OrderRow);
  } catch {
    return { ok: false, status: "failed", error: "Fulfilment crashed." };
  }
}

/** Admin "Send to CJ" manual fallback (by order id). */
export async function sendOrderToCj(orderId: string): Promise<FulfillResult> {
  if (!(await requireAdmin())) {
    return { ok: false, status: "failed", error: "Not authorised." };
  }
  const admin = createAdminClient();
  if (!admin) return { ok: false, status: "failed", error: "No database." };
  const { data } = await admin
    .from("orders")
    .select(ORDER_COLS)
    .eq("id", orderId)
    .maybeSingle();
  if (!data) return { ok: false, status: "failed", error: "Order not found." };

  const result = await pushOrderToCj(data as OrderRow);
  revalidatePath("/admin/orders");
  return result;
}
