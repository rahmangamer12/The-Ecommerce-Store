"use client";

import { orderStatusMeta } from "@/data/orders";
import { cn } from "@/lib/utils";
import { usePrefs } from "@/components/providers/prefs-provider";
import type { TranslationKey } from "@/i18n/translations";

export function OrderStatusBadge({ status }: { status: string }) {
  const { t } = usePrefs();
  const meta = orderStatusMeta[status] ?? {
    label: status,
    className: "bg-paper-2 text-ink-soft",
  };
  const label = orderStatusMeta[status]
    ? t(`status.${status}` as TranslationKey)
    : meta.label;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        meta.className,
      )}
    >
      {label}
    </span>
  );
}
