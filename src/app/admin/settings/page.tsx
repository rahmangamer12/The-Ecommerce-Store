import { IntegrationStatus } from "@/components/admin/integration-status";
import { SettingsForm } from "@/components/admin/settings-form";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Configure your store, SEO defaults, and view integration status. (Edit{" "}
          <code className="rounded bg-paper-2 px-1">src/config/site.ts</code> for
          permanent defaults.)
        </p>
      </div>

      <IntegrationStatus />
      <SettingsForm />
    </div>
  );
}
