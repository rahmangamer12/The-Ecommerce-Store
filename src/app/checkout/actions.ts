"use server";

import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { getCatalogProductById } from "@/lib/catalog";
import { findCoupon } from "@/data/coupons";
import { siteUrl } from "@/config/site";
import { ratesForCode } from "@/config/geo-rates";
import { toCountryCode } from "@/lib/countries";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCardPayment } from "@/lib/payments";
import { createPaypalOrder } from "@/lib/paypal";
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
    const product = await getCatalogProductById(item.productId);
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

  // Location-based tax & shipping — resolved from the shipping country.
  const rate = ratesForCode(toCountryCode(data.country));

  // Coupon
  let discount = 0;
  let freeShip = subtotal >= rate.freeShippingThreshold;
  const coupon = data.couponCode ? findCoupon(data.couponCode) : null;
  if (coupon && (!coupon.minSubtotal || subtotal >= coupon.minSubtotal)) {
    if (coupon.type === "percent") discount = (subtotal * coupon.value) / 100;
    else if (coupon.type === "fixed") discount = coupon.value;
    else if (coupon.type === "free_shipping") freeShip = true;
  }
  discount = Math.min(discount, subtotal);

  const shipping = subtotal === 0 ? 0 : freeShip ? 0 : rate.shipping;
  const taxable = Math.max(0, subtotal - discount);
  const tax = +(taxable * rate.taxRate).toFixed(2);
  const total = +(taxable + shipping + tax).toFixed(2);

  const orderNumber = generateOrderNumber(Math.floor(total * 100));
  const paymentMethod = data.paymentMethod || "cod";

  // Link the order to the signed-in shopper (if any), so it shows in their
  // account even if the checkout email differs from their account email.
  const user = await currentUser();
  const userId = user?.id ?? null;

  // Persist the order. Cash-on-Delivery orders start as "pending" (awaiting
  // delivery + payment); other methods can mark "paid" once confirmed.
  const admin = createAdminClient();
  if (admin) {
    const { data: order, error } = await admin
      .from("orders")
      .insert({
        number: orderNumber,
        clerk_user_id: userId,
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

  // PayPal → create a PayPal order and redirect to its approval page.
  if (paymentMethod === "paypal") {
    const payUrl = await createPaypalOrder({
      orderNumber,
      amount: total,
      returnUrl: `${siteUrl}/api/payments/paypal/return?order=${orderNumber}`,
      cancelUrl: `${siteUrl}/checkout?error=payment`,
    });
    if (payUrl) return { ok: true, orderNumber, redirectUrl: payUrl };
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
