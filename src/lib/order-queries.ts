import { createAdminClient } from "@/lib/supabase/admin";

// A simplified order shape for displaying in account + admin.
export type OrderView = {
  id: string;
  number: string;
  date: string;
  status: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: { name: string; image: string; price: number; quantity: number; slug?: string }[];
  address?: {
    fullName?: string;
    line1?: string;
    city?: string;
    zip?: string;
    country?: string;
    phone?: string;
  };
  // How the customer chose to pay: "bank" | "whatsapp" | "cod" | "paypal" | "card"
  paymentMethod?: string;
  // CJ Dropshipping fulfilment
  fulfillmentStatus?: string;
  cjOrderId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
};

type Row = Record<string, unknown>;

function mapOrder(r: Row): OrderView {
  const items = Array.isArray(r.order_items)
    ? (r.order_items as Row[]).map((i) => ({
        name: String(i.name ?? ""),
        image: String(i.image ?? ""),
        price: Number(i.price ?? 0),
        quantity: Number(i.quantity ?? 1),
      }))
    : [];
  return {
    id: String(r.id),
    number: String(r.number ?? ""),
    date: String(r.created_at ?? ""),
    status: String(r.status ?? "pending"),
    customerName: String(r.customer_name ?? ""),
    customerEmail: String(r.customer_email ?? ""),
    total: Number(r.total ?? 0),
    items,
    address: (r.shipping_address as OrderView["address"]) ?? undefined,
    paymentMethod: r.payment_method ? String(r.payment_method) : undefined,
    fulfillmentStatus: r.fulfillment_status ? String(r.fulfillment_status) : undefined,
    cjOrderId: r.cj_order_id ? String(r.cj_order_id) : undefined,
    trackingNumber: r.tracking_number ? String(r.tracking_number) : undefined,
    trackingUrl: r.tracking_url ? String(r.tracking_url) : undefined,
  };
}

/** All orders (admin). Empty array if DB not configured or no orders yet. */
export async function getAllOrders(): Promise<OrderView[]> {
  const admin = createAdminClient();
  if (!admin) return [];
  try {
    const { data, error } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapOrder);
  } catch {
    return [];
  }
}

/** Orders for one customer (by the email used at checkout). */
export async function getOrdersForEmail(email?: string | null): Promise<OrderView[]> {
  if (!email) return [];
  const admin = createAdminClient();
  if (!admin) return [];
  try {
    const { data, error } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_email", email.toLowerCase())
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapOrder);
  } catch {
    return [];
  }
}

/**
 * Orders for a signed-in shopper: matched by their Clerk user id OR the account
 * email — so orders show up even if a different email was typed at checkout.
 */
export async function getOrdersForUser(
  userId?: string | null,
  email?: string | null,
): Promise<OrderView[]> {
  const admin = createAdminClient();
  if (!admin) return [];
  const conds: string[] = [];
  if (userId) conds.push(`user_id.eq.${userId}`);
  if (email) conds.push(`customer_email.eq.${email.toLowerCase()}`);
  if (!conds.length) return [];
  try {
    const { data, error } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .or(conds.join(","))
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapOrder);
  } catch {
    return [];
  }
}
