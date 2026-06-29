"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sampleOrders } from "@/data/orders";

export type TrackedOrder = {
  number: string;
  status: string;
  date: string;
  total: number;
};

export type TrackResult =
  | { found: true; order: TrackedOrder }
  | { found: false; error?: string };

const schema = z.object({
  number: z.string().min(3),
  email: z.string().email(),
});

/** Look up an order by its number + the email used at checkout. */
export async function trackOrder(input: unknown): Promise<TrackResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { found: false, error: "Enter a valid order number and email." };
  }
  const number = parsed.data.number.trim().toUpperCase();
  const email = parsed.data.email.trim().toLowerCase();

  // 1) Try the live database (orders placed through checkout).
  const admin = createAdminClient();
  if (admin) {
    try {
      const { data } = await admin
        .from("orders")
        .select("number, status, created_at, total, customer_email")
        .eq("number", number)
        .maybeSingle();
      if (data && String(data.customer_email).toLowerCase() === email) {
        return {
          found: true,
          order: {
            number: String(data.number),
            status: String(data.status),
            date: String(data.created_at),
            total: Number(data.total),
          },
        };
      }
    } catch {
      // fall through to sample lookup
    }
  }

  // 2) Fall back to the sample orders (for demo/testing).
  const s = sampleOrders.find(
    (o) =>
      o.number.toUpperCase() === number &&
      o.customerEmail.toLowerCase() === email,
  );
  if (s) {
    return {
      found: true,
      order: { number: s.number, status: s.status, date: s.date, total: s.total },
    };
  }

  return { found: false, error: "No order found with those details." };
}
