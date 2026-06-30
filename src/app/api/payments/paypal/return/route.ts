import { NextResponse } from "next/server";
import { capturePaypalOrder } from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/config/site";

export const runtime = "nodejs";

/**
 * PayPal redirects the customer here after they approve the payment
 * (?token=<paypalOrderId>&order=<orderNumber>). We capture the payment,
 * mark the order paid, and send them to the order-success page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paypalOrderId = searchParams.get("token");
  const orderParam = searchParams.get("order");

  if (!paypalOrderId) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=payment`);
  }

  const { paid, orderNumber } = await capturePaypalOrder(paypalOrderId);
  const finalOrder = orderNumber || orderParam;

  if (paid && finalOrder) {
    const admin = createAdminClient();
    if (admin) {
      await admin
        .from("orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("number", finalOrder);
    }
    return NextResponse.redirect(`${siteUrl}/order-success?order=${finalOrder}`);
  }

  // Not completed (cancelled / failed)
  return NextResponse.redirect(`${siteUrl}/checkout?error=payment`);
}
