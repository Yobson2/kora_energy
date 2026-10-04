import type { ElementType, ReactNode } from "react";
import { cn } from "@/app/lib/utils";

/**
 * The ONLY place the page container is expressed: centred, capped at
 * --container-page, with a gutter of 16px → 32px at md → 48px at xl.
 */
export function Container({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-[var(--container-page)] px-4 md:px-8 xl:px-12",
        className
      )}
    >
      {children}
    </Tag>
  );
}
