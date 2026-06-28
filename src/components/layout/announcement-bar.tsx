import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

const items = [
  { icon: Truck, text: "Complimentary worldwide shipping over $100" },
  { icon: ShieldCheck, text: "Secure checkout powered by Polar" },
  { icon: RefreshCw, text: "30-day easy returns" },
  { icon: Headphones, text: "24/7 dedicated support" },
];

// A quiet, premium scrolling trust strip above the navbar.
export function AnnouncementBar() {
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
