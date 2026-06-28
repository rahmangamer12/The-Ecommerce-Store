import { orderStatusMeta } from "@/data/orders";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: string }) {
  const meta = orderStatusMeta[status] ?? {
    label: status,
    className: "bg-paper-2 text-ink-soft",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}
