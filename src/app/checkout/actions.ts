"use server";

import { z } from "zod";
import { getProductById } from "@/data/products";
import { findCoupon } from "@/data/coupons";
import { siteConfig, siteUrl } from "@/config/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCardPayment } from "@/lib/payments";
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
  paymentMethod: z.string().optional(),
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
  const paymentMethod = data.paymentMethod || "cod";

  // Persist the order. Cash-on-Delivery orders start as "pending" (awaiting
  // delivery + payment); other methods can mark "paid" once confirmed.
  const admin = createAdminClient();
  if (admin) {
    const { data: order, error } = await admin
      .from("orders")
      .insert({
        number: orderNumber,
        customer_name: data.fullName,
        customer_email: data.email.toLowerCase(),
        status: "pending",
        payment_method: paymentMethod,
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

  // Online card payment → create a hosted MyFatoorah payment and redirect.
  if (paymentMethod === "card") {
    const cardUrl = await createCardPayment({
      orderNumber,
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      amount: total,
      callbackUrl: `${siteUrl}/api/payments/myfatoorah/callback`,
      errorUrl: `${siteUrl}/checkout?error=payment`,
    });
    if (cardUrl) return { ok: true, orderNumber, redirectUrl: cardUrl };
  }

  // COD / bank transfer (or card not configured) → straight to confirmation.
  return { ok: true, orderNumber };
}
