"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { usePrefs } from "@/components/providers/prefs-provider";

const links = [
  { href: "/account", tk: "acct.dashboard", icon: LayoutDashboard },
  { href: "/account/orders", tk: "acct.orders", icon: Package },
  { href: "/account/wishlist", tk: "acct.wishlist", icon: Heart },
  { href: "/account/addresses", tk: "acct.addresses", icon: MapPin },
  { href: "/account/settings", tk: "acct.settings", icon: Settings },
] as const;

export function AccountNav() {
  const pathname = usePathname();
  const { t } = usePrefs();
  const { signOut } = useClerk();

  function handleSignOut() {
    signOut({ redirectUrl: "/" });
  }

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-1.5">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/5",
            )}
          >
            <link.icon className="h-4 w-4" />
            {t(link.tk)}
          </Link>
        );
      })}
      <button
        onClick={handleSignOut}
        className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
      >
        <LogOut className="h-4 w-4" />
        {t("acct.signOut")}
      </button>
    </nav>
  );
}
