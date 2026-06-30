import {
  paypalBaseUrl,
  paypalClientId,
  paypalClientSecret,
  isPaypalConfigured,
} from "@/config/env";
import { siteConfig } from "@/config/site";

export { isPaypalConfigured };

// PayPal charges in the store's base currency (USD by default).
const CURRENCY = siteConfig.currency;

/** Get a short-lived OAuth access token from PayPal. */
async function getAccessToken(): Promise<string | null> {
  if (!isPaypalConfigured) return null;
  try {
    const auth = Buffer.from(
      `${paypalClientId}:${paypalClientSecret}`,
    ).toString("base64");
    const res = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Create a PayPal order and return the approval URL to redirect the customer
 * to. The customer pays on PayPal, then PayPal sends them back to `returnUrl`
 * with a `?token=<paypalOrderId>` we use to capture the payment.
 *
 * Docs: https://developer.paypal.com/docs/api/orders/v2/
 */
export async function createPaypalOrder(input: {
  orderNumber: string;
  amount: number;
  returnUrl: string;
  cancelUrl: string;
}): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: input.orderNumber,
            custom_id: input.orderNumber,
            amount: {
              currency_code: CURRENCY,
              value: input.amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: siteConfig.name,
          user_action: "PAY_NOW",
          shipping_preference: "GET_FROM_FILE",
          // Show the card / billing form FIRST so shoppers without a PayPal
          // account can pay by debit/credit card without logging in.
          landing_page: "BILLING",
          return_url: input.returnUrl,
          cancel_url: input.cancelUrl,
        },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      links?: { rel: string; href: string }[];
    };
    return data.links?.find((l) => l.rel === "approve")?.href ?? null;
  } catch {
    return null;
  }
}

/**
 * Capture a previously-approved PayPal order. Returns whether it completed
 * and the store order number we stored on it (custom_id).
 */
export async function capturePaypalOrder(
  paypalOrderId: string,
): Promise<{ paid: boolean; orderNumber?: string }> {
  const token = await getAccessToken();
  if (!token) return { paid: false };

  try {
    const res = await fetch(
      `${paypalBaseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!res.ok) return { paid: false };
    const data = (await res.json()) as {
      status?: string;
      purchase_units?: { custom_id?: string; reference_id?: string }[];
    };
    const unit = data.purchase_units?.[0];
    const paid = data.status === "COMPLETED";
    return { paid, orderNumber: unit?.custom_id ?? unit?.reference_id };
  } catch {
    return { paid: false };
  }
}
