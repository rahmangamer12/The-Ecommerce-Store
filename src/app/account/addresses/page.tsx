import { MapPin, Plus } from "lucide-react";
import { getT, getLocale } from "@/i18n/server";

export default async function AddressesPage() {
  // Addresses are collected at checkout. A saved-address book can be added
  // later; for now new accounts start with none (no demo data).
  const t = getT(await getLocale());
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">{t("acct.savedAddresses")}</h2>
        <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold hover:text-white">
          <Plus className="h-4 w-4" /> {t("acct.addAddress")}
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-paper-2">
          <MapPin className="h-7 w-7 text-muted" />
        </div>
        <h3 className="mt-5 font-display text-lg font-semibold">{t("acct.noAddresses")}</h3>
        <p className="mt-2 max-w-xs text-sm text-muted">
          {t("acct.noAddressesDesc")}
        </p>
      </div>
    </div>
  );
}
