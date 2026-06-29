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
  };
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
