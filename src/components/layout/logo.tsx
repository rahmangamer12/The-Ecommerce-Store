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
      className={cn("flex shrink-0 items-center gap-2 sm:gap-2.5", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink font-display text-base font-semibold text-paper sm:h-9 sm:w-9 sm:text-lg">
        {siteConfig.logoMark}
      </span>
      <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight text-ink sm:text-xl">
        {siteConfig.logoText}
      </span>
    </Link>
  );
}
