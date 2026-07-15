import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import { getT, getLocale } from "@/i18n/server";

// A quiet, premium scrolling trust strip above the navbar.
export async function AnnouncementBar() {
  const t = getT(await getLocale());
  const items = [
    { icon: Truck, text: t("ann.shipping") },
    { icon: ShieldCheck, text: t("ann.secure") },
    { icon: RefreshCw, text: t("ann.protection") },
    { icon: Headphones, text: t("ann.support") },
  ];
  return (
    <div className="overflow-hidden border-b border-border bg-ink text-paper">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
            {items.map((item, i) => (
              <span
                key={`${dup}-${i}`}
                className="flex items-center gap-2 px-8 py-2.5 text-xs font-medium tracking-wide"
              >
                <item.icon className="h-3.5 w-3.5 text-gold-soft" />
                {item.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
