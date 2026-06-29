import { NextResponse } from "next/server";
import { getCardPaymentStatus } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/config/site";

export const runtime = "nodejs";

/**
 * MyFatoorah redirects the customer here after they pay (?paymentId=...).
 * We verify the payment, mark the order paid, and send them to the
 * order-success page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");

  if (!paymentId) {
    return NextResponse.redirect(`${siteUrl}/checkout?error=payment`);
  }

  const { paid, orderNumber } = await getCardPaymentStatus(paymentId);

  if (paid && orderNumber) {
    const admin = createAdminClient();
    if (admin) {
      await admin
        .from("orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("number", orderNumber);
    }
    return NextResponse.redirect(`${siteUrl}/order-success?order=${orderNumber}`);
  }

  // Not paid (cancelled / failed)
  return NextResponse.redirect(`${siteUrl}/checkout?error=payment`);
}
