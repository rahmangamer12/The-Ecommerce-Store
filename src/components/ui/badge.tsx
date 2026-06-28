import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  New: "bg-ink text-paper",
  Bestseller: "bg-gold text-white",
  Limited: "bg-danger/90 text-white",
  Sale: "bg-success text-white",
  "Editor's Pick": "bg-paper text-ink border border-ink/15",
  default: "bg-ink/80 text-paper",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof styles | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider",
        styles[variant] ?? styles.default,
        className,
      )}
    >
      {children}
    </span>
  );
}
