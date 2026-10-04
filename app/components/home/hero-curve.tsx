"use client";

import { useMemo, useState } from "react";
import { DayCurve } from "@/app/components/visuals/day-curve";
import { estimate } from "@/app/lib/solar/estimate";
import { SEGMENT_LABEL, type Independence, type Segment } from "@/app/lib/solar/assumptions";
import { formatKwp, formatNumber, formatXofCompact } from "@/app/lib/format";
import { cn } from "@/app/lib/utils";

/**
 * The homepage's one memorable element: a business's day against the sun.
 * Switching the site type re-runs the real estimator — the same code the
 * calculator and the API use — and redraws the curve. That redraw is the
 * page's single piece of orchestrated motion.
 */

type Example = { segment: Segment; label: string; bill: number; independence: Independence };

const EXAMPLES: Example[] = [
  { segment: "office", label: "Office", bill: 2_200_000, independence: "savings" },
  { segment: "hotel", label: "Hotel", bill: 4_500_000, independence: "balanced" },
  { segment: "school", label: "School", bill: 1_500_000, independence: "savings" },
  { segment: "clinic", label: "Clinic", bill: 1_800_000, independence: "maximum" },
  { segment: "household", label: "Home", bill: 150_000, independence: "balanced" },
];

const DESIGN_LABEL: Record<Independence, string> = {
  savings: "panels only",
  balanced: "panels and a battery",
  maximum: "panels and a large battery",
};

export function HeroCurve() {
  const [segment, setSegment] = useState<Segment>("hotel");
  const example = EXAMPLES.find((e) => e.segment === segment)!;

  const result = useMemo(
    () =>
      estimate({
        segment: example.segment,
        location: "abidjan",
        independence: example.independence,
        monthlyBillXof: example.bill,
      }),
    [example]
  );

  return (
    <div className="bg-ink-soft ring-ink-line flex flex-col gap-6 rounded-[var(--radius-md)] p-5 ring-1 md:p-7">
      <fieldset>
        <legend className="type-label text-paper mb-3">See an average day for a</legend>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((e) => {
            const checked = e.segment === segment;
            return (
              <label
                key={e.segment}
                className={cn(
                  "cursor-pointer rounded-[var(--radius-sm)] px-3.5 py-2 text-[0.9375rem] font-medium transition-colors",
                  "has-[:focus-visible]:outline-sun has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2",
                  checked
                    ? "bg-sun text-ink"
                    : "text-on-ink-muted hover:text-paper ring-ink-line ring-1 ring-inset"
                )}
              >
                <input
                  type="radio"
                  name="hero-segment"
                  value={e.segment}
                  checked={checked}
                  onChange={() => setSegment(e.segment)}
                  className="sr-only"
                />
                {e.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Keyed so the draw-in replays for each site type. */}
      <DayCurve
        key={segment}
        day={result.day}
        tone="dark"
        title={`Average day for a ${SEGMENT_LABEL[segment].toLowerCase()} in Abidjan`}
      />

      <dl className="border-ink-line grid grid-cols-3 gap-4 border-t pt-5" aria-live="polite">
        <div>
          <dt className="type-small text-on-ink-muted">Covered by solar</dt>
          <dd className="type-figure-sm text-sun mt-1">{Math.round(result.solarShare * 100)} %</dd>
        </div>
        <div>
          <dt className="type-small text-on-ink-muted">System</dt>
          <dd className="type-figure-sm mt-1">{formatKwp(result.systemKwp)}</dd>
        </div>
        <div>
          <dt className="type-small text-on-ink-muted">Saved per month</dt>
          <dd className="type-figure-sm mt-1">{formatXofCompact(result.monthlySavingsXof)}</dd>
        </div>
      </dl>

      <p className="type-small text-on-ink-muted">
        Illustrative estimate: a typical {SEGMENT_LABEL[segment].toLowerCase()} in Abidjan with a
        monthly bill of {formatNumber(example.bill)} FCFA, designed with{" "}
        {DESIGN_LABEL[example.independence]}
        {result.batteryKwh > 0 ? ` (${formatNumber(result.batteryKwh)} kWh)` : ""}.
      </p>
    </div>
  );
}
