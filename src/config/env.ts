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

// ---- Polar (payments) ----
export const polarAccessToken = process.env.POLAR_ACCESS_TOKEN ?? "";
export const polarWebhookSecret = process.env.POLAR_WEBHOOK_SECRET ?? "";
export const polarSuccessUrl = process.env.POLAR_SUCCESS_URL ?? "";
// "sandbox" or "production"
export const polarServer =
  (process.env.POLAR_SERVER as "sandbox" | "production") ?? "sandbox";

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
export const isPolarConfigured = Boolean(polarAccessToken);
export const isCloudinaryConfigured = Boolean(cloudinaryCloudName);
export const isEmailConfigured = Boolean(
  resendApiKey || mailchimpApiKey || convertkitApiKey,
);
