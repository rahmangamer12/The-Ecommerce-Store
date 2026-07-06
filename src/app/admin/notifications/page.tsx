import { NotificationsForm } from "@/components/admin/notifications-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPushConfigured } from "@/config/env";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  // How many browsers are subscribed right now.
  let subscribers = 0;
  const admin = createAdminClient();
  if (admin) {
    const { count } = await admin
      .from("push_subscriptions")
      .select("*", { count: "exact", head: true });
    subscribers = count ?? 0;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-muted">
          Push deals &amp; updates to shoppers who allowed notifications.{" "}
          <span className="font-medium text-ink">{subscribers}</span> subscriber
          {subscribers === 1 ? "" : "s"} right now.
        </p>
      </div>

      <NotificationsForm configured={isPushConfigured} />
    </div>
  );
}
