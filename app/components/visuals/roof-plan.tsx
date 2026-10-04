import { PANEL_WATTS } from "@/app/lib/solar/assumptions";
import { layoutPanels, PANEL, panelCount } from "@/app/lib/solar/panel-layout";
import { formatNumber } from "@/app/lib/format";
import type { Locale } from "@/app/lib/i18n";
import { cn } from "@/app/lib/utils";

const CAPTION: Record<Locale, (panels: string, watts: number, w: string, d: string) => string> = {
  en: (panels, watts, w, d) =>
    `Illustrative layout: ${panels} panels of ${watts} W on a ${w} × ${d} m roof, with walkways for cleaning.`,
  fr: (panels, watts, w, d) =>
    `Implantation indicative : ${panels} panneaux de ${watts} W sur un toit de ${w} × ${d} m, avec allées de nettoyage.`,
};

/**
 * A plan view of the array, generated from the project's own numbers: roof
 * footprint in metres and the panel count implied by its capacity.
 *
 * This replaces photography deliberately. The projects are concepts; a stock
 * photo of somebody else's roof would be a small lie, while a drawing derived
 * from the data is exactly as true as the data.
 */
export function RoofPlan({
  roof,
  systemKwp,
  className,
  label,
  caption = true,
  fill = false,
  locale,
}: {
  locale: Locale;
  roof: { width: number; depth: number };
  systemKwp: number;
  className?: string;
  label: string;
  caption?: boolean;
  /** Fill a fixed-size parent, letterboxed, so drawings of different roofs align in a grid. */
  fill?: boolean;
}) {
  const { panels } = layoutPanels(roof, panelCount(systemKwp));

  // Scale bar: the largest round length that fits a quarter of the width.
  const scale = [50, 20, 10, 5, 2].find((m) => m <= roof.width / 4) ?? 1;
  const margin = Math.max(roof.width, roof.depth) * 0.06;
  const vb = `${-margin} ${-margin} ${roof.width + margin * 2} ${roof.depth + margin * 3.2}`;
  const stroke = Math.max(roof.width, roof.depth) / 260;

  return (
    <figure className={cn("flex flex-col gap-3", fill && "h-full", className)}>
      <svg
        viewBox={vb}
        role="img"
        aria-label={label}
        className={fill ? "h-full w-full" : "h-auto w-full"}
      >
        <rect
          x={0}
          y={0}
          width={roof.width}
          height={roof.depth}
          fill="var(--color-plaster-deep)"
          stroke="var(--color-muted)"
          strokeWidth={stroke}
        />
        {panels.map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width={PANEL.w} height={PANEL.d} fill="var(--color-ink)" />
        ))}
        <g transform={`translate(0 ${roof.depth + margin * 1.1})`}>
          <rect x={0} y={0} width={scale} height={margin * 0.32} fill="var(--color-ink)" />
          <text
            x={scale + margin * 0.4}
            y={margin * 0.4}
            fontSize={margin * 0.9}
            fill="var(--color-muted)"
          >
            {scale} m
          </text>
        </g>
      </svg>
      {caption && (
        <figcaption className="type-small text-muted">
          {CAPTION[locale](
            formatNumber(panels.length),
            PANEL_WATTS,
            formatNumber(roof.width),
            formatNumber(roof.depth)
          )}
        </figcaption>
      )}
    </figure>
  );
}
