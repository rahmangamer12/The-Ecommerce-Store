import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("flex items-center gap-2.5", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink font-display text-lg font-semibold text-paper">
        {siteConfig.logoMark}
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-ink">
        {siteConfig.logoText}
      </span>
    </Link>
  );
}
