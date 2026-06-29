import { CheckCircle2, Circle } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  isSupabaseConfigured,
  isCloudinaryConfigured,
  isEmailConfigured,
  analytics,
} from "@/config/env";

// SERVER component — can safely read server-only env flags to show what's
// connected. Renders a status grid + a live Cloudinary upload test.
export function IntegrationStatus() {
  const rows = [
    { name: "Supabase (database + auth)", ok: isSupabaseConfigured, env: "NEXT_PUBLIC_SUPABASE_URL" },
    { name: "Cloudinary (images)", ok: isCloudinaryConfigured, env: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" },
    { name: "Email (Resend)", ok: isEmailConfigured, env: "RESEND_API_KEY" },
    { name: "Google Analytics 4", ok: Boolean(analytics.ga4), env: "NEXT_PUBLIC_GA4_ID" },
    { name: "Google Tag Manager", ok: Boolean(analytics.gtm), env: "NEXT_PUBLIC_GTM_ID" },
    { name: "Google Search Console", ok: Boolean(analytics.searchConsole), env: "NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION" },
    { name: "Meta Pixel", ok: Boolean(analytics.metaPixel), env: "NEXT_PUBLIC_META_PIXEL_ID" },
    { name: "TikTok Pixel", ok: Boolean(analytics.tiktokPixel), env: "NEXT_PUBLIC_TIKTOK_PIXEL_ID" },
    { name: "Microsoft Clarity", ok: Boolean(analytics.clarity), env: "NEXT_PUBLIC_CLARITY_ID" },
  ];

  const connected = rows.filter((r) => r.ok).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Integrations</h2>
          <p className="text-sm text-muted">
            Status is read live from your environment variables.
          </p>
        </div>
        <span className="rounded-full bg-paper-2 px-3 py-1 text-sm font-medium">
          {connected}/{rows.length} connected
        </span>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              {r.ok ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Circle className="h-5 w-5 text-muted" />
              )}
              <span className="text-sm font-medium">{r.name}</span>
            </div>
            <span
              className={`text-xs font-medium ${r.ok ? "text-success" : "text-muted"}`}
              title={r.env}
            >
              {r.ok ? "Connected" : "Not set"}
            </span>
          </div>
        ))}
      </div>

      {/* Live Cloudinary upload test */}
      <div className="mt-6 border-t border-border pt-5">
        <p className="mb-3 text-sm font-medium">Test product image upload (Cloudinary)</p>
        <ImageUploader />
      </div>

      <p className="mt-4 text-xs text-muted">
        Keys are configured in <code className="rounded bg-paper-2 px-1">.env.local</code>{" "}
        and on Vercel — never in the UI. See{" "}
        <code className="rounded bg-paper-2 px-1">docs/INTEGRATIONS.md</code>.
      </p>
    </section>
  );
}
