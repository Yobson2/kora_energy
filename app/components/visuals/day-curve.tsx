import type { HourPoint } from "@/app/lib/solar/estimate";
import { formatNumber } from "@/app/lib/format";
import type { Locale } from "@/app/lib/i18n";
import { cn } from "@/app/lib/utils";

/**
 * A site's average day, hour by hour: how much of the load the sun covers
 * directly, how much the battery carries after dark, and what isstill bought
 * from the grid. This chart is the visual signature of the site — the same
 * three colours mean the same three things everywhere.
 *
 * Pure SVG, no chart library, server-renderable. Keyed by its caller to
 * replay the draw animation when the data changes.
 */

const W = 640;
const H = 260;
const PAD = { top: 18, right: 8, bottom: 30, left: 8 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

const x = (hour: number) => PAD.left + (hour / 24) * plotW;

function area(top: number[], bottom: number[], y: (v: number) => number) {
  // Points sit at hour midpoints, with flat ends so the shape meets the edges.
  const xs = [0, ...top.map((_, h) => h + 0.5), 24];
  const pad = (values: number[]) => [values[0]!, ...values, values[values.length - 1]!];
  const t = pad(top);
  const b = pad(bottom);
  const upper = xs.map((h, i) => `${x(h).toFixed(1)},${y(t[i]!).toFixed(1)}`);
  const lower = xs.map((h, i) => `${x(h).toFixed(1)},${y(b[i]!).toFixed(1)}`).reverse();
  return `M${upper.join("L")}L${lower.join("L")}Z`;
}

function line(values: number[], y: (v: number) => number) {
  const xs = [0, ...values.map((_, h) => h + 0.5), 24];
  const v = [values[0]!, ...values, values[values.length - 1]!];
  return `M${xs.map((h, i) => `${x(h).toFixed(1)},${y(v[i]!).toFixed(1)}`).join("L")}`;
}

const SWATCH = { direct: "bg-sun", battery: "bg-lagoon", grid: "bg-laterite" } as const;
type Series = keyof typeof SWATCH;

const COPY: Record<
  Locale,
  { series: Record<Series, string>; demand: string; summary: (share: number) => string }
> = {
  en: {
    series: {
      direct: "Solar, used directly",
      battery: "From the battery",
      grid: "Still from the grid",
    },
    demand: "Site demand",
    summary: (share) =>
      `Over an average day, solar and storage cover ${share} percent of the load; the rest comes from the grid.`,
  },
  fr: {
    series: {
      direct: "Solaire, consommé directement",
      battery: "Depuis la batterie",
      grid: "Toujours depuis le réseau",
    },
    demand: "Demande du site",
    summary: (share) =>
      `Sur une journée moyenne, le solaire et le stockage couvrent ${share} pour cent de la consommation ; le reste vient du réseau.`,
  },
};

export function DayCurve({
  day,
  title,
  className,
  tone = "light",
  showLegend = true,
  locale,
}: {
  locale: Locale;
  day: HourPoint[];
  title: string;
  className?: string;
  tone?: "light" | "dark";
  showLegend?: boolean;
}) {
  const peak = Math.max(...day.map((p) => Math.max(p.load, p.solar))) * 1.08 || 1;
  const y = (v: number) => PAD.top + plotH - (v / peak) * plotH;

  const zero = day.map(() => 0);
  const direct = day.map((p) => p.direct);
  const withBattery = day.map((p) => p.direct + p.battery);
  const load = day.map((p) => p.load);

  const totals = {
    direct: day.reduce((t, p) => t + p.direct, 0),
    battery: day.reduce((t, p) => t + p.battery, 0),
    grid: day.reduce((t, p) => t + p.grid, 0),
  };
  const totalLoad = totals.direct + totals.battery + totals.grid;
  const share = totalLoad ? (totals.direct + totals.battery) / totalLoad : 0;

  const t = COPY[locale];
  const dark = tone === "dark";
  const axis = dark ? "var(--color-on-ink-muted)" : "var(--color-muted)";

  return (
    <figure className={cn("flex flex-col gap-4", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${title}. ${t.summary(Math.round(share * 100))}`}
        className="h-auto w-full overflow-visible"
      >
        {/* Night bands: the hours the sun cannot help. */}
        <rect
          x={x(0)}
          y={PAD.top}
          width={x(6.2) - x(0)}
          height={plotH}
          fill={dark ? "var(--color-paper)" : "var(--color-ink)"}
          opacity={dark ? 0.04 : 0.035}
        />
        <rect
          x={x(18.4)}
          y={PAD.top}
          width={x(24) - x(18.4)}
          height={plotH}
          fill={dark ? "var(--color-paper)" : "var(--color-ink)"}
          opacity={dark ? 0.04 : 0.035}
        />

        <g className="curve-fill">
          <path d={area(load, withBattery, y)} fill="var(--color-laterite)" opacity={0.85} />
          <path d={area(withBattery, direct, y)} fill="var(--color-lagoon)" />
          <path d={area(direct, zero, y)} fill="var(--color-sun)" />
        </g>

        {/* What the panels produce, including what the site cannot use. */}
        <path
          d={line(
            day.map((p) => p.solar),
            y
          )}
          fill="none"
          stroke={dark ? "var(--color-sun-soft)" : "var(--color-sun-deep)"}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <path
          d={line(load, y)}
          fill="none"
          stroke={dark ? "var(--color-paper)" : "var(--color-ink)"}
          strokeWidth={2.25}
          strokeLinejoin="round"
          className="curve-draw"
          pathLength={1200}
          style={{ ["--len" as string]: 1200 }}
        />

        <line
          x1={x(0)}
          x2={x(24)}
          y1={y(0)}
          y2={y(0)}
          stroke={axis}
          strokeWidth={1}
          opacity={0.6}
        />
        {[0, 6, 12, 18, 24].map((h) => (
          <text
            key={h}
            x={x(h)}
            y={H - 8}
            fill={axis}
            fontSize={12}
            textAnchor={h === 0 ? "start" : h === 24 ? "end" : "middle"}
            className="tabular"
          >
            {String(h % 24).padStart(2, "0")}:00
          </text>
        ))}
      </svg>

      {showLegend && (
        <figcaption>
          <ul className="type-small grid gap-x-5 gap-y-1.5 sm:grid-cols-2">
            {(Object.keys(SWATCH) as Series[]).map((key) => (
              <li key={key} className="flex items-center gap-2">
                <span aria-hidden className={cn("size-3 shrink-0 rounded-[2px]", SWATCH[key])} />
                <span className={dark ? "text-on-ink-muted" : "text-muted"}>{t.series[key]}</span>
                <span className="tabular ml-auto font-semibold sm:ml-0">
                  {formatNumber(totals[key])} kWh
                </span>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn("h-0 w-3 shrink-0 border-t-2", dark ? "border-paper" : "border-ink")}
              />
              <span className={dark ? "text-on-ink-muted" : "text-muted"}>{t.demand}</span>
              <span className="tabular ml-auto font-semibold sm:ml-0">
                {formatNumber(totalLoad)} kWh
              </span>
            </li>
          </ul>
        </figcaption>
      )}
    </figure>
  );
}
