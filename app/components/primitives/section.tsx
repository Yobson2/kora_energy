import type { ReactNode } from "react";
import { Container } from "@/app/components/primitives/container";
import { cn } from "@/app/lib/utils";

type Tone = "paper" | "plaster" | "ink";

const TONE: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  plaster: "bg-plaster text-ink",
  ink: "bg-ink text-paper",
};

/**
 * A page band. Vertical rhythm is defined HERE and nowhere else, so sections
 * never stack competing paddings.
 */
export function Section({
  tone = "paper",
  id,
  labelledBy,
  className,
  containerClassName,
  children,
}: {
  tone?: Tone;
  id?: string;
  labelledBy?: string;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(TONE[tone], "py-16 md:py-24", className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/** Heading block for a section: an h2 and an optional short intro. */
export function SectionHeading({
  id,
  title,
  intro,
  tone = "light",
  className,
  children,
}: {
  id: string;
  title: string;
  intro?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10",
        className
      )}
    >
      <div className="flex max-w-2xl flex-col gap-4">
        <h2 id={id} className="type-h2 text-balance">
          {title}
        </h2>
        {intro && (
          <p className={cn("type-lead", tone === "dark" ? "text-on-ink-muted" : "text-muted")}>
            {intro}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

/** Marks fictional content in place, next to the thing it qualifies. */
export function ConceptTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "type-small bg-sun-soft text-ink inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-0.5 font-semibold",
        className
      )}
    >
      <span aria-hidden className="bg-sun-deep size-1.5 rounded-full" />
      {children}
    </span>
  );
}
