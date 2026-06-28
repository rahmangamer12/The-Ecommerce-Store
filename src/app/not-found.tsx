import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-semibold text-gradient-gold">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s
        get you back to something beautiful.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold hover:text-white"
        >
          <Home className="h-4 w-4" /> Back home
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:border-gold"
        >
          <Search className="h-4 w-4" /> Browse the shop
        </Link>
      </div>
    </div>
  );
}
