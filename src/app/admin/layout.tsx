import { Info } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured, adminEmails } from "@/config/env";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- Access control ---
  // When Supabase is configured, only signed-in admins (by ADMIN_EMAILS or
  // the `admin` role) should reach this area. While keys are NOT configured,
  // we allow access in "demo mode" so you can preview the dashboard.
  const user = await getCurrentUser();
  const isAdmin =
    !!user &&
    (adminEmails.includes(user.email?.toLowerCase() ?? "") ||
      user.user_metadata?.role === "admin");
  const demoMode = !isSupabaseConfigured;

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-8 sm:px-6 lg:px-8">
      {demoMode && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-ink-soft">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-strong" />
          <p>
            <span className="font-semibold text-ink">Demo mode.</span> Connect
            Supabase and set <code className="rounded bg-paper-2 px-1">ADMIN_EMAILS</code>{" "}
            in <code className="rounded bg-paper-2 px-1">.env.local</code> to lock
            this dashboard to admin accounts only.
          </p>
        </div>
      )}
      {!demoMode && !isAdmin && (
        <div className="mb-6 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          You don&apos;t have admin access. Sign in with an admin account.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="mb-4">
            <p className="font-display text-lg font-semibold">Admin</p>
            <p className="text-xs text-muted">Store management</p>
          </div>
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
