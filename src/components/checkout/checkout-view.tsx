"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Banknote, Landmark, CreditCard, Wallet, MessageCircle, ShieldCheck, ArrowRight, ShoppingBag } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { usePrefs } from "@/components/providers/prefs-provider";
import { Input, Label } from "@/components/ui/input";
import { SearchSelect } from "@/components/ui/search-select";
import { siteConfig } from "@/config/site";
import { placeOrder } from "@/app/checkout/actions";
import { COUNTRIES, STATES } from "@/data/geo";

// Country dropdown options (with flags). CJ ships to virtually every country,
// so we list them all — the rare unsupported route is caught by CJ's freight
// lookup at fulfilment with a clear message.
const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({
  value: c.name,
  label: `${c.flag} ${c.name}`,
}));

const initialForm = {
  email: "",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  phone: "",
};

export function CheckoutView({
  cardEnabled = false,
  paypalEnabled = false,
}: {
  cardEnabled?: boolean;
  paypalEnabled?: boolean;
}) {
  const router = useRouter();
  const { items, totals, coupon, clearCart, mounted, setShipCountry } =
    useStore();
  const { formatPrice, t } = usePrefs();
  const [form, setForm] = useState(initialForm);

  // Regions for the chosen country (empty list → free-text fallback).
  const countryCode = COUNTRIES.find((c) => c.name === form.country)?.code ?? "";
  const stateOptions = (STATES[countryCode] ?? []).map((s) => ({
    value: s,
    label: s,
  }));

  // Build the list of payment methods enabled in config (card also needs a
  // configured gateway). COD is off by default for dropshipping.
  const methods = [
    paypalEnabled && siteConfig.payments.paypal && {
      key: "paypal",
      icon: Wallet,
      title: t("checkout.paypalT"),
      desc: t("checkout.paypalD"),
    },
    cardEnabled && siteConfig.payments.card && {
      key: "card",
      icon: CreditCard,
      title: t("checkout.cardT"),
      desc: t("checkout.cardD"),
    },
    siteConfig.payments.whatsapp && {
      key: "whatsapp",
      icon: MessageCircle,
      title: t("checkout.whatsappT"),
      desc: t("checkout.whatsappD"),
    },
    siteConfig.payments.bank && {
      key: "bank",
      icon: Landmark,
      title: t("checkout.bankT"),
      desc: t("checkout.bankD"),
    },
    siteConfig.payments.cod && {
      key: "cod",
      icon: Banknote,
      title: t("checkout.codT"),
      desc: t("checkout.codD"),
    },
  ].filter(Boolean) as {
    key: string;
    icon: typeof CreditCard;
    title: string;
    desc: string;
  }[];

  const [paymentMethod, setPaymentMethod] = useState(methods[0]?.key ?? "whatsapp");
  const [loading, setLoading] = useState(false);

  if (!mounted) return <div className="h-96" />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-paper-2">
          <ShoppingBag className="h-8 w-8 text-muted" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-semibold">
          {t("co.emptyTitle")}
        </h2>
        <p className="mt-2 text-ink-soft">{t("co.emptyDesc")}</p>
        <Link
          href="/shop"
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper"
        >
          {t("co.browseShop")}
        </Link>
      </div>
    );
  }

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.country.trim()) {
      toast.error(t("co.errCountry"));
      return;
    }
    if (stateOptions.length > 0 && !form.state.trim()) {
      toast.error(t("co.errRegion"));
      return;
    }
    setLoading(true);
    try {
      const result = await placeOrder({
        ...form,
        couponCode: coupon?.code,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variant: i.variant,
        })),
      });

      if (!result.ok) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      // WhatsApp order → open a pre-filled message to the store.
      if (paymentMethod === "whatsapp") {
        const lines = items
          .map(
            (i) =>
              `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`,
          )
          .join("\n");
        const msg =
          `${t("co.waHi")} ${result.orderNumber}.\n\n${lines}\n\n` +
          `${t("co.waTotal")} ${formatPrice(totals.total)}\n` +
          `${t("co.waName")} ${form.fullName}\n` +
          `${t("co.waAddress")} ${form.line1}, ${form.city}, ${form.country}\n` +
          `${t("co.waPhone")} ${form.phone}`;
        window.open(
          `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(msg)}`,
          "_blank",
        );
      }

      clearCart();
      if (result.redirectUrl) {
        // Card payment → hosted gateway page.
        window.location.href = result.redirectUrl;
      } else {
        router.push(
          `/order-success?order=${result.orderNumber}&method=${paymentMethod}`,
        );
      }
    } catch {
      toast.error(t("co.errPlace"));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
      {/* Form */}
      <div className="space-y-8">
        {/* Contact */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">{t("checkout.contact")}</h2>
            <Link href="/login" className="text-sm text-gold-strong hover:underline">
              {t("co.signInFaster")}
            </Link>
          </div>
          <div className="mt-4">
            <Label htmlFor="email">{t("checkout.emailAddr")}</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </section>

        {/* Shipping */}
        <section>
          <h2 className="font-display text-xl font-semibold">{t("checkout.shippingAddress")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">{t("checkout.fullName")}</Label>
              <Input id="fullName" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="line1">{t("checkout.addressLine")}</Label>
              <Input id="line1" required value={form.line1} onChange={(e) => set("line1", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="line2">{t("co.apartment")}</Label>
              <Input id="line2" value={form.line2} onChange={(e) => set("line2", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="country">{t("checkout.country")}</Label>
              <SearchSelect
                id="country"
                value={form.country}
                onChange={(v) => {
                  // Changing country clears the region and updates the
                  // location-based tax & shipping in the order summary.
                  setForm((f) => ({ ...f, country: v, state: "" }));
                  const code = COUNTRIES.find((c) => c.name === v)?.code ?? "";
                  setShipCountry(code);
                }}
                options={COUNTRY_OPTIONS}
                placeholder={t("co.selectCountry")}
              />
            </div>
            <div>
              <Label htmlFor="state">{t("checkout.stateRegion")}</Label>
              {stateOptions.length > 0 ? (
                <SearchSelect
                  id="state"
                  value={form.state}
                  onChange={(v) => set("state", v)}
                  options={stateOptions}
                  placeholder={t("co.selectRegion")}
                  disabled={!form.country}
                />
              ) : (
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  placeholder={form.country ? t("co.regionState") : t("co.selectCountryFirst")}
                />
              )}
            </div>
            <div>
              <Label htmlFor="city">{t("checkout.city")}</Label>
              <Input id="city" required value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="zip">{t("checkout.zip")}</Label>
              <Input id="zip" required value={form.zip} onChange={(e) => set("zip", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="phone">{t("checkout.phone")}</Label>
              <Input id="phone" required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Payment method */}
        <section>
          <h2 className="font-display text-xl font-semibold">{t("checkout.paymentMethod")}</h2>
          <div className="mt-4 grid gap-3">
            {methods.map((m) => {
              const selected = paymentMethod === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setPaymentMethod(m.key)}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                    selected ? "border-gold bg-gold/5" : "border-border hover:border-ink/30"
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                      selected ? "bg-gold text-white" : "bg-paper-2 text-ink-soft"
                    }`}
                  >
                    <m.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">{m.title}</span>
                    <span className="block text-sm text-muted">{m.desc}</span>
                  </span>
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
                      selected ? "border-gold" : "border-border"
                    }`}
                  >
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Extra details for the selected method */}
          {paymentMethod === "bank" && (
            <div className="mt-4 rounded-2xl border border-border bg-paper-2 p-4 text-sm">
              <p className="font-medium">{t("co.bankTitle")}</p>
              <div className="mt-2 space-y-0.5 text-ink-soft">
                <p>{t("co.bankLabel")} {siteConfig.bank.name}</p>
                <p>{t("co.accountName")} {siteConfig.bank.accountName}</p>
                <p>{t("co.accountNo")} {siteConfig.bank.accountNumber}</p>
                <p>IBAN: {siteConfig.bank.iban}</p>
                <p>SWIFT: {siteConfig.bank.swift}</p>
              </div>
              <p className="mt-2 text-xs text-muted">
                {t("co.bankNote")}
              </p>
            </div>
          )}
          {paymentMethod === "whatsapp" && (
            <div className="mt-4 rounded-2xl border border-border bg-paper-2 p-4 text-sm text-ink-soft">
              {t("co.waNote")}
            </div>
          )}
        </section>
      </div>

      {/* Summary */}
      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">{t("cart.orderSummary")}</h2>
          <ul className="mt-5 space-y-4">
            {items.map((i) => (
              <li key={`${i.productId}-${JSON.stringify(i.variant)}`} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-paper-2">
                  <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.65rem] font-bold text-paper">
                    {i.quantity}
                  </span>
                </div>
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="line-clamp-2 text-sm">{i.name}</span>
                  <span className="text-sm font-medium">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">{t("cart.subtotal")}</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>{t("cart.discount")}</span>
                <span>- {formatPrice(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink-soft">
                {t("cart.shipping")}{form.country ? ` ${t("co.shipTo")} ${form.country}` : ""}
              </span>
              <span>{totals.shipping === 0 ? t("cart.free") : formatPrice(totals.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">{t("cart.tax")}</span>
              <span>{formatPrice(totals.tax)}</span>
            </div>
            {!form.country && (
              <p className="text-xs text-muted">
                {t("co.selectForRates")}
              </p>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>{t("cart.total")}</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 font-medium text-white shadow-gold transition-all hover:-translate-y-0.5 hover:bg-gold-strong disabled:translate-y-0 disabled:opacity-60"
          >
            {loading
              ? t("co.placing")
              : paymentMethod === "paypal"
                ? t("co.continuePaypal")
              : paymentMethod === "card"
                ? t("co.continuePayment")
                : paymentMethod === "whatsapp"
                  ? t("co.placeWa")
                  : paymentMethod === "cod"
                    ? t("co.placeCod")
                    : t("checkout.placeOrder")}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
            <ShieldCheck className="h-3.5 w-3.5" /> {t("co.privacyNote")}
          </p>
        </div>
      </aside>
    </form>
  );
}
