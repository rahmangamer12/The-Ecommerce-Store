import {
  myfatoorahApiKey,
  myfatoorahBaseUrl,
  isCardPaymentConfigured,
} from "@/config/env";
import { siteConfig } from "@/config/site";

export { isCardPaymentConfigured };

/**
 * Create a hosted card-payment link via MyFatoorah and return its URL.
 * The customer is redirected there to pay with card / Apple Pay, then sent
 * back to `callbackUrl`. Returns null if MyFatoorah isn't configured.
 *
 * Docs: https://myfatoorah.readme.io/docs/send-payment
 */
export async function createCardPayment(input: {
  orderNumber: string;
  name: string;
  email: string;
  phone?: string;
  amount: number;
  callbackUrl: string;
  errorUrl: string;
}): Promise<string | null> {
  if (!isCardPaymentConfigured) return null;

  try {
    const res = await fetch(`${myfatoorahBaseUrl}/v2/SendPayment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${myfatoorahApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        NotificationOption: "LNK",
        CustomerName: input.name,
        InvoiceValue: input.amount,
        CustomerEmail: input.email,
        CustomerMobile: input.phone?.replace(/\D/g, "").slice(-11) || undefined,
        DisplayCurrencyIso: siteConfig.currency,
        CustomerReference: input.orderNumber,
        CallBackUrl: input.callbackUrl,
        ErrorUrl: input.errorUrl,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      IsSuccess?: boolean;
      Data?: { InvoiceURL?: string };
    };
    return data.IsSuccess ? data.Data?.InvoiceURL ?? null : null;
  } catch {
    return null;
  }
}

/** Check a payment's status after MyFatoorah redirects back. */
export async function getCardPaymentStatus(
  paymentId: string,
): Promise<{ paid: boolean; orderNumber?: string }> {
  if (!isCardPaymentConfigured) return { paid: false };
  try {
    const res = await fetch(`${myfatoorahBaseUrl}/v2/GetPaymentStatus`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${myfatoorahApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Key: paymentId, KeyType: "PaymentId" }),
    });
    if (!res.ok) return { paid: false };
    const data = (await res.json()) as {
      IsSuccess?: boolean;
      Data?: { InvoiceStatus?: string; CustomerReference?: string };
    };
    const paid = data.Data?.InvoiceStatus === "Paid";
    return { paid, orderNumber: data.Data?.CustomerReference };
  } catch {
    return { paid: false };
  }
}
