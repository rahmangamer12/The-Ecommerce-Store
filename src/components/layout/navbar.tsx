"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  Search,
  Heart,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useStore } from "@/components/providers/store-provider";
import { categories as localCategories } from "@/data/categories";
import type { Category, Product } from "@/types";
import { fetchShopProducts } from "@/app/shop/shop-actions";
import { usePrefs } from "@/components/providers/prefs-provider";
import { PrefsSwitcher } from "@/components/layout/prefs-switcher";

const navLinks = [
  { label: "Shop", href: "/shop", k: "nav.shop" },
  { label: "Categories", href: "/categories", k: "nav.categories" },
  { label: "Journal", href: "/blog", k: "nav.journal" },
  { label: "Contact", href: "/contact", k: "nav.contact" },
] as const;

export function Navbar({ categories = localCategories }: { categories?: Category[] }) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { t, formatPrice } = usePrefs();
  const { cartCount, wishlist, setCartOpen, mounted } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  // Lock the page behind the mobile drawer so the body doesn't scroll under it
  // (otherwise the hero shows "through" the open menu on phones).
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Live search preview — fetched from the SERVER (reliable at any catalogue
  // size), debounced so we don't fire on every keystroke.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    const id = setTimeout(() => {
      fetchShopProducts({ q, pageSize: 5, sort: "popular" })
        .then((r) => active && setResults(r.products))
        .catch(() => {});
    }, 250);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [query]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-border glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        {/* Left: logo */}
        <div className="flex items-center gap-2">
          <Logo />
        </div>

        {/* Center: desktop nav with mega menu */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) =>
            link.label === "Categories" ? (
              <div key={link.href} className="group relative">
                <Link
                  href={link.href}
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  {t(link.k)}
                </Link>
                {/* Mega menu */}
                <div className="invisible absolute left-1/2 top-full w-[640px] -translate-x-1/2 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
                  <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-3 shadow-luxe-lg">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/categories/${cat.slug}`}
                        className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-ink/5"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper-2">
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">{cat.name}</p>
                          <p className="line-clamp-1 text-xs text-muted">
                            {cat.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {t(link.k)}
              </Link>
            ),
          )}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center gap-0.5">
          <button
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5 sm:h-10 sm:w-10"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <Search className="h-[1.1rem] w-[1.1rem]" />
          </button>
          {/* Currency/language: desktop only — it lives in the mobile drawer so
              the phone top bar stays uncluttered. */}
          <div className="hidden lg:block">
            <PrefsSwitcher />
          </div>
          <ThemeToggle className="hidden sm:grid" />
          <Link
            href="/account/wishlist"
            className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5 sm:h-10 sm:w-10"
            aria-label="Wishlist"
          >
            <Heart className="h-[1.1rem] w-[1.1rem]" />
            {mounted && wishlist.length > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[0.6rem] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>
          {isSignedIn ? (
            // Account avatar — shown on every size once signed in.
            <div className="ml-1 flex h-10 items-center">
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My account"
                    labelIcon={<User className="h-4 w-4" />}
                    href="/account"
                  />
                  <UserButton.Link
                    label="Admin dashboard"
                    labelIcon={<LayoutDashboard className="h-4 w-4" />}
                    href="/admin"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          ) : (
            <>
              {/* Desktop: full Sign In button. On mobile, sign-in lives in the
                  drawer (prominent) so the top bar stays clean. */}
              <Link
                href="/login"
                className="ml-1 hidden rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-gold hover:text-white sm:inline-flex"
              >
                {t("nav.signin")}
              </Link>
            </>
          )}
          <button
            onClick={() => setCartOpen(true)}
            className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5 sm:h-10 sm:w-10"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />
            {mounted && cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          {/* Hamburger — RIGHT side, mobile only */}
          <button
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5 sm:h-10 sm:w-10 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search panel */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-card"
          >
            <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
              <form onSubmit={submitSearch} className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, brands, categories…"
                  className="h-10 flex-1 bg-transparent text-base focus-visible:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </form>

              {results.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink/5"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper-2">
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted">{p.brand}</p>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatPrice(p.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={submitSearch}
                      className="flex w-full items-center justify-center gap-1 rounded-xl py-2 text-sm font-medium text-gold-strong hover:bg-ink/5"
                    >
                      See all results <ChevronRight className="h-4 w-4" />
                    </button>
                  </li>
                </ul>
              )}
              {query.trim() && results.length === 0 && (
                <p className="mt-4 text-center text-sm text-muted">
                  No products found for “{query}”.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </header>

      {/* Mobile drawer — rendered OUTSIDE the .glass header on purpose. The
          header's backdrop-filter would otherwise become the containing block
          for this position:fixed panel on iOS/WebKit, collapsing it to the
          header's height (the menu then spilled over the page / looked
          see-through on iPhone). */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Literal hex backgrounds (not CSS-var utilities) so the drawer is
                guaranteed OPAQUE on iOS Safari, which was rendering it see-through. */}
            <motion.div
              className="fixed right-0 top-0 z-[61] flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto overscroll-contain bg-[#fbfaf8] p-5 shadow-luxe-lg lg:hidden dark:bg-[#161513]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
            >
              <div className="flex items-center justify-between">
                <Logo onClick={() => setMobileOpen(false)} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between border-b border-border py-3.5 text-base font-medium"
                  >
                    {t(link.k)}
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </Link>
                ))}
              </nav>
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  Categories
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-ink/5"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mt-auto border-t border-border pt-4">
                {isSignedIn ? (
                  <div className="space-y-1">
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-ink/5"
                    >
                      <User className="h-4 w-4" /> My account
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-ink/5"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Admin dashboard
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper"
                  >
                    <User className="h-4 w-4" /> Sign In / Register
                  </Link>
                )}
                {/* Currency / language + theme — always available in the drawer
                    on mobile (the top bar hides them to stay uncluttered).
                    Rendered inline (not a popover) so it can never open off a
                    small phone screen; it scrolls with the drawer. */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Theme
                  </p>
                  <ThemeToggle />
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <PrefsSwitcher inline />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
