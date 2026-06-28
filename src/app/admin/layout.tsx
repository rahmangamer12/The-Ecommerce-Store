import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { adminEmails } from "@/config/env";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware ensures the user is signed in. Here we additionally require
  // their email to be listed in ADMIN_EMAILS for admin access.
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  const isAdmin = !!email && adminEmails.includes(email);

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-danger/10 text-danger">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold">Access restricted</h1>
        <p className="mt-2 text-ink-soft">
          This area is for store administrators only. Your account
          {email ? ` (${email})` : ""} doesn&apos;t have admin access.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold hover:text-white"
        >
          Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-8 sm:px-6 lg:px-8">
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
