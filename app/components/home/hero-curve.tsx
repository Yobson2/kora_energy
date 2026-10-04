"use client";

import { useMemo, useState } from "react";
import { DayCurve } from "@/app/components/visuals/day-curve";
import { useLocale } from "@/app/components/i18n/use-locale";
import { labels } from "@/app/content/labels";
import { estimate } from "@/app/lib/solar/estimate";
import type { Independence, Segment } from "@/app/lib/solar/assumptions";
import type { Locale } from "@/app/lib/i18n";
import { formatKwp, formatNumber, formatXofCompact } from "@/app/lib/format";
import { cn } from "@/app/lib/utils";

/**
 * The homepage's one memorable element: a business's day against the sun.
 * Switching the site type re-runs the real estimator (the same code the
 * calculator and the API use) and redraws the curve. That redraw is the
 * page's single piece of orchestrated motion.
 */

type Example = { segment: Segment; bill: number; independence: Independence };

const EXAMPLES: Example[] = [
  { segment: "office", bill: 2_200_000, independence: "savings" },
  { segment: "hotel", bill: 4_500_000, independence: "balanced" },
  { segment: "school", bill: 1_500_000, independence: "savings" },
  { segment: "clinic", bill: 1_800_000, independence: "maximum" },
  { segment: "household", bill: 150_000, independence: "balanced" },
];

type Copy = {
  short: Partial<Record<Segment, string>>;
  legend: string;
  design: Record<Independence, string>;
  title: (site: string) => string;
  covered: string;
  system: string;
  saved: string;
  note: (site: string, bill: string, design: string, battery: string) => string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    short: {
      office: "Office",
      hotel: "Hotel",
      school: "School",
      clinic: "Clinic",
      household: "Home",
    },
    legend: "See an average day for a",
    design: {
      savings: "panels only",
      balanced: "panels and a battery",
      maximum: "panels and a large battery",
    },
    title: (site) => `Average day for ${site} in Abidjan`,
    covered: "Covered by solar",
    system: "System",
    saved: "Saved per month",
    note: (site, bill, design, battery) =>
      `Illustrative estimate: a typical ${site} in Abidjan with a monthly bill of ${bill} FCFA, designed with ${design}${battery}.`,
  },
  fr: {
    short: {
      office: "Bureaux",
      hotel: "Hôtel",
      school: "École",
      clinic: "Clinique",
      household: "Maison",
    },
    legend: "Voir une journée moyenne pour",
    design: {
      savings: "des panneaux seuls",
      balanced: "des panneaux et une batterie",
      maximum: "des panneaux et une grande batterie",
    },
    title: (site) => `Journée moyenne pour ${site} à Abidjan`,
    covered: "Couvert par le solaire",
    system: "Système",
    saved: "Économisé par mois",
    note: (site, bill, design, battery) =>
      `Estimation indicative pour ${site} à Abidjan avec une facture mensuelle de ${bill} FCFA, équipé ${design}${battery}.`,
  },
};

export function HeroCurve() {
  const locale = useLocale();
  const t = COPY[locale];
  const l = labels(locale);
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

  // English reads "a typical hotel or guesthouse"; French needs the article
  // that agrees with the noun ("une école"), so it takes the article form.
  const site = locale === "fr" ? l.segmentWithArticle[segment] : l.segment[segment].toLowerCase();

  return (
    <div className="bg-ink-soft ring-ink-line flex flex-col gap-6 rounded-[var(--radius-md)] p-5 ring-1 md:p-7">
      <fieldset>
        <legend className="type-label text-paper mb-3">{t.legend}</legend>
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
                {t.short[e.segment]}
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
        locale={locale}
        title={t.title(l.segmentWithArticle[segment])}
      />

      <dl className="border-ink-line grid grid-cols-3 gap-4 border-t pt-5" aria-live="polite">
        <div>
          <dt className="type-small text-on-ink-muted">{t.covered}</dt>
          <dd className="type-figure-sm text-sun mt-1">{Math.round(result.solarShare * 100)} %</dd>
        </div>
        <div>
          <dt className="type-small text-on-ink-muted">{t.system}</dt>
          <dd className="type-figure-sm mt-1">{formatKwp(result.systemKwp, locale)}</dd>
        </div>
        <div>
          <dt className="type-small text-on-ink-muted">{t.saved}</dt>
          <dd className="type-figure-sm mt-1">{formatXofCompact(result.monthlySavingsXof)}</dd>
        </div>
      </dl>

      <p className="type-small text-on-ink-muted">
        {t.note(
          site,
          formatNumber(example.bill),
          t.design[example.independence],
          result.batteryKwh > 0 ? ` (${formatNumber(result.batteryKwh)} kWh)` : ""
        )}
      </p>
    </div>
  );
}
