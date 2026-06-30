/**
 * =============================================================
 *  ENVIRONMENT VARIABLES (read here, used everywhere)
 * =============================================================
 *  Put the actual values in `.env.local` (see `.env.example`).
 *  The app is built to RUN even when these are empty — it falls
 *  back to local sample data and disables live features safely.
 * =============================================================
 */

// ---- Supabase (database + auth) ----
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// ---- Card payments (MyFatoorah — works for physical goods in GCC) ----
export const myfatoorahApiKey = process.env.MYFATOORAH_API_KEY ?? "";
// Sandbox: https://apitest.myfatoorah.com  |  Qatar live: https://api.myfatoorah.com
export const myfatoorahBaseUrl =
  process.env.MYFATOORAH_BASE_URL ?? "https://apitest.myfatoorah.com";

// ---- PayPal (global checkout — PayPal balance + any card) ----
export const paypalClientId =
  process.env.PAYPAL_CLIENT_ID ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
export const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET ?? "";
// "sandbox" for testing, "live" once your PayPal app is approved.
export const paypalEnv = (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase();
export const paypalBaseUrl =
  paypalEnv === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// ---- Cloudinary (image hosting / upload) ----
export const cloudinaryCloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
export const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY ?? "";
export const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET ?? "";
export const cloudinaryUploadPreset =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

// ---- Email (choose one provider) ----
export const resendApiKey = process.env.RESEND_API_KEY ?? "";
export const mailchimpApiKey = process.env.MAILCHIMP_API_KEY ?? "";
export const convertkitApiKey = process.env.CONVERTKIT_API_KEY ?? "";

// ---- Admin bootstrap ----
// Comma-separated list of emails that get admin access automatically.
export const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// ---- Analytics / marketing pixels (all optional) ----
export const analytics = {
  ga4: process.env.NEXT_PUBLIC_GA4_ID ?? "",
  gtm: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  tiktokPixel: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? "",
  clarity: process.env.NEXT_PUBLIC_CLARITY_ID ?? "",
  searchConsole: process.env.NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION ?? "",
};

// -------------------------------------------------------------
//  "isConfigured" flags — used across the app to decide whether
//  a live integration is available or we should use a fallback.
// -------------------------------------------------------------
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isCardPaymentConfigured = Boolean(myfatoorahApiKey);
export const isPaypalConfigured = Boolean(paypalClientId && paypalClientSecret);
export const isCloudinaryConfigured = Boolean(cloudinaryCloudName);
export const isEmailConfigured = Boolean(
  resendApiKey || mailchimpApiKey || convertkitApiKey,
);
