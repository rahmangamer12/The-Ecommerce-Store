import { cn } from "@/lib/utils";

// Shimmering placeholder block (uses the .skeleton style from globals.css).
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}
