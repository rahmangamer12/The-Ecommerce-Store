import { isPolarConfigured, polarAccessToken, polarServer } from "@/config/env";

/**
 * Creates a Polar checkout session and returns the hosted checkout URL.
 *
 * NOTE: Polar checkouts are based on Products you create in the Polar
 * dashboard. Set POLAR_PRODUCT_ID in your env to the product you want to
 * use for orders. Without it (or without a token), this returns `null`
 * and the app falls back to its manual order flow — which is exactly the
 * dropshipping model: the order lands in the admin dashboard for you to
 * fulfil manually.
 *
 * Docs: https://docs.polar.sh/api-reference/checkouts/create-session
 */
export async function createPolarCheckout(input: {
  orderNumber: string;
  email: string;
  successUrl: string;
}): Promise<string | null> {
  const productId = process.env.POLAR_PRODUCT_ID;
  if (!isPolarConfigured || !productId) return null;

  const base =
    polarServer === "production"
      ? "https://api.polar.sh"
      : "https://sandbox-api.polar.sh";

  try {
    const res = await fetch(`${base}/v1/checkouts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${polarAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: [productId],
        success_url: input.successUrl,
        customer_email: input.email,
        metadata: { order_number: input.orderNumber },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    return data.url ?? null;
  } catch {
    return null;
  }
}

export { isPolarConfigured };
