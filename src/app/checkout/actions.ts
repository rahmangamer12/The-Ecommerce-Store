"use server";

import { z } from "zod";
import { getProductById } from "@/data/products";
import { findCoupon } from "@/data/coupons";
import { siteConfig, siteUrl } from "@/config/site";
import { createPolarCheckout } from "@/lib/polar";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOrderNumber } from "@/data/orders";

const checkoutSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  zip: z.string().min(2),
  country: z.string().min(2),
  phone: z.string().min(5),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(20),
        variant: z.record(z.string(), z.string()).optional(),
      }),
    )
    .min(1),
});

export type CheckoutResult =
  | { ok: true; orderNumber: string; redirectUrl?: string }
  | { ok: false; error: string };

export async function placeOrder(raw: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Please check your details and try again." };
  }
  const data = parsed.data;

  // Recompute prices SERVER-SIDE from trusted product data (never trust the client).
  let subtotal = 0;
  const lineItems = [];
  for (const item of data.items) {
    const product = getProductById(item.productId);
    if (!product) return { ok: false, error: "One of the products is unavailable." };
    subtotal += product.price * item.quantity;
    lineItems.push({
      product_id: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: item.quantity,
      variant: item.variant ?? null,
    });
  }

  // Coupon
  let discount = 0;
  let freeShip = subtotal >= siteConfig.freeShippingThreshold;
  const coupon = data.couponCode ? findCoupon(data.couponCode) : null;
  if (coupon && (!coupon.minSubtotal || subtotal >= coupon.minSubtotal)) {
    if (coupon.type === "percent") discount = (subtotal * coupon.value) / 100;
    else if (coupon.type === "fixed") discount = coupon.value;
    else if (coupon.type === "free_shipping") freeShip = true;
  }
  discount = Math.min(discount, subtotal);

  const shipping = subtotal === 0 ? 0 : freeShip ? 0 : siteConfig.shippingFlatRate;
  const taxable = Math.max(0, subtotal - discount);
  const tax = +(taxable * siteConfig.taxRate).toFixed(2);
  const total = +(taxable + shipping + tax).toFixed(2);

  const orderNumber = generateOrderNumber(Math.floor(total * 100));

  // Persist the order if a database is configured (otherwise it's a
  // successful demo order — the manual-fulfilment flow still works:
  // the order would appear in the admin dashboard once DB is connected).
  const admin = createAdminClient();
  if (admin) {
    const { data: order, error } = await admin
      .from("orders")
      .insert({
        number: orderNumber,
        customer_name: data.fullName,
        customer_email: data.email.toLowerCase(),
        status: "paid",
        subtotal,
        shipping,
        tax,
        discount,
        total,
        coupon_code: coupon?.code ?? null,
        shipping_address: {
          fullName: data.fullName,
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
          phone: data.phone,
        },
      })
      .select("id")
      .single();

    if (!error && order) {
      await admin.from("order_items").insert(
        lineItems.map((li) => ({ ...li, order_id: order.id })),
      );
    }
  }

  // Try Polar for live payment; falls back to the success page if not set up.
  const successUrl = `${siteUrl}/order-success?order=${orderNumber}`;
  const polarUrl = await createPolarCheckout({
    orderNumber,
    email: data.email,
    successUrl,
  });

  return { ok: true, orderNumber, redirectUrl: polarUrl ?? undefined };
}
