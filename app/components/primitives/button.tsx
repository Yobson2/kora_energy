import { Link } from "@/app/components/primitives/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/app/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "on-ink" | "ghost";
type Size = "md" | "lg";

/**
 * primary    sun fill, ink text  the one action that matters on a screen
 * secondary  ink fill  strong but not the headline action
 * outline    hairline  the alternative path
 * on-ink     outline for dark sections
 * ghost      text-weight, for toolbars and tables
 */
const VARIANTS: Record<Variant, string> = {
  primary: "on-sun bg-sun text-ink hover:bg-sun-bright",
  secondary: "bg-ink text-paper hover:bg-ink-soft",
  outline: "bg-paper text-ink ring-1 ring-inset ring-line hover:ring-ink",
  "on-ink": "bg-transparent text-paper ring-1 ring-inset ring-on-ink-muted/50 hover:ring-paper",
  ghost: "bg-transparent text-ink hover:bg-plaster",
};

const SIZES: Record<Size, string> = {
  md: "h-11 px-4.5 text-[0.9375rem]",
  lg: "h-13 px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: Omit<CommonProps, "children">) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold whitespace-nowrap",
    "transition-[background-color,box-shadow,color] duration-150 ease-[var(--ease-standard)]",
    "disabled:opacity-55 aria-disabled:opacity-55",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

/**
 * A link styled as a button. Navigation is always a link, never a button.
 * Internal paths are language-free; Link keeps the visitor in their language.
 */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "href" | "className"
  >) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & Omit<ComponentPropsWithoutRef<"button">, "className">) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}
