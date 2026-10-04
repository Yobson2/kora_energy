import { cn } from "@/app/lib/utils";

/**
 * Kora's mark: a sun on the horizon, with three receding lines below it that
 * read both as rows of panels and as the sun's reflection on the lagoon.
 * Original artwork; uses currentColor so it works on any surface.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden className={cn("size-7 shrink-0", className)}>
      <path d="M5 16a9 9 0 0 1 18 0Z" fill="var(--color-sun)" />
      <rect x="3" y="18.5" width="22" height="2" rx="1" fill="currentColor" />
      <rect x="6" y="22" width="16" height="2" rx="1" fill="currentColor" />
      <rect x="9.5" y="25.5" width="9" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[1.1875rem] leading-none font-semibold tracking-[-0.02em] [font-stretch:118%]">
        Kora<span className="font-normal"> Energy</span>
      </span>
    </span>
  );
}
