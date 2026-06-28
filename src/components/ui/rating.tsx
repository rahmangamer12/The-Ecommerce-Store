import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Star rating display. Supports half-ish rounding for visual accuracy.
export function Rating({
  value,
  count,
  size = 14,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(value);
          return (
            <Star
              key={i}
              width={size}
              height={size}
              className={cn(
                filled ? "fill-gold text-gold" : "fill-transparent text-ink/25",
              )}
            />
          );
        })}
      </div>
      <span className="text-xs text-muted">
        {value.toFixed(1)}
        {typeof count === "number" && ` (${count})`}
      </span>
    </div>
  );
}
