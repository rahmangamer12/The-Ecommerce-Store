"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminEmails } from "@/config/env";

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

async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  return !!email && adminEmails.includes(email);
}

/** Look up an order by its number + the email used at checkout. */
export async function trackOrder(input: unknown): Promise<TrackResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { found: false, error: "Enter a valid order number and email." };
  }
  const number = parsed.data.number.trim().toUpperCase();
  const email = parsed.data.email.trim().toLowerCase();

  const admin = createAdminClient();
  if (!admin) {
    return { found: false, error: "Order tracking isn't available yet." };
  }
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
    // ignore
  }
  return { found: false, error: "No order found with those details." };
}

const STATUSES = [
  "pending",
  "paid",
  "processing",
  "purchased",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

/** Admin: update an order's fulfilment status (persists to Supabase). */
export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Not authorised." };
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { ok: false, error: "Invalid status." };
  }
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database not connected." };

  const { error } = await admin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/orders");
  return { ok: true };
}
