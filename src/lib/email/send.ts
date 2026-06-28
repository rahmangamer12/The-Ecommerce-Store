import { resendApiKey, isEmailConfigured } from "@/config/env";
import { siteConfig } from "@/config/site";

/**
 * Sends an email via Resend if RESEND_API_KEY is set. Otherwise it just
 * logs and returns false (no crash). Swap in Mailchimp/ConvertKit as needed.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!isEmailConfigured || !resendApiKey) {
    // No provider configured — safe no-op so the app keeps working.
    return false;
  }

  const from = process.env.EMAIL_FROM || `${siteConfig.name} <onboarding@resend.dev>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
