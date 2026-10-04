"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { ButtonLink } from "@/app/components/primitives/button";
import { ChoiceGroup, SelectField, TextField } from "@/app/components/forms/fields";
import { DayCurve } from "@/app/components/visuals/day-curve";
import { estimate, EstimateInputError, type Estimate } from "@/app/lib/solar/estimate";
import {
  INDEPENDENCE,
  INDEPENDENCE_RULES,
  LOCATION,
  LOCATIONS,
  SEGMENTS,
  SEGMENT_LABEL,
  type Independence,
  type Location,
  type Segment,
} from "@/app/lib/solar/assumptions";
import { estimateInputSchema, fieldErrors, type FieldErrors } from "@/app/lib/validation";
import { amountToInput, parseAmount } from "@/app/lib/parse";
import { fromEstimateQuery, toEstimateQuery } from "@/app/lib/estimate-query";
import {
  formatKwh,
  formatKwp,
  formatNumber,
  formatPercent,
  formatXof,
  formatYears,
} from "@/app/lib/format";

type Draft = {
  segment: Segment;
  location: Location;
  independence: Independence;
  bill: string;
  kwh: string;
  roof: string;
  generator: string;
};

/**
 * The calculator, as a product feature rather than a widget:
 *  - results update as you type, from the same engine the API runs;
 *  - validation is the shared Zod schema, so it agrees with the server;
 *  - inputs live in the URL, so an estimate can be shared or bookmarked,
 *    and carries into the quote form without retyping.
 */
export function Calculator() {
  const params = useSearchParams();

  const [draft, setDraft] = useState<Draft>(() => {
    const q = fromEstimateQuery(params);
    return {
      segment: q.segment ?? "office",
      location: q.location ?? "abidjan",
      independence: q.independence ?? "savings",
      bill: q.monthlyBillXof !== undefined ? amountToInput(q.monthlyBillXof) : "",
      kwh: q.monthlyKwh !== undefined ? amountToInput(q.monthlyKwh) : "",
      roof: q.roofAreaM2 !== undefined ? amountToInput(q.roofAreaM2) : "",
      generator: q.generatorHoursPerWeek !== undefined ? String(q.generatorHoursPerWeek) : "",
    };
  });

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    // Keep the URL in step for sharing and bookmarking. The native History API
    // (which Next integrates with) changes the address without a server round
    // trip or a history entry per keystroke — router.replace would refetch
    // the page on every character typed.
    window.history.replaceState(null, "", `/calculator${toEstimateQuery(toInput(next))}`);
  };

  const input = toInput(draft);
  const hasEnergy = input.monthlyBillXof !== undefined || input.monthlyKwh !== undefined;

  const { result, errors, problem } = useMemo(() => {
    const parsed = estimateInputSchema.safeParse(input);
    if (!parsed.success) {
      return { result: undefined, errors: fieldErrors(parsed.error), problem: undefined };
    }
    try {
      return { result: estimate(parsed.data), errors: {}, problem: undefined };
    } catch (error) {
      if (error instanceof EstimateInputError) {
        return { result: undefined, errors: {}, problem: error.message };
      }
      throw error;
    }
    // `input` is derived from `draft` on every render; depend on the source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  // Only show "enter a bill" once the visitor has touched an energy field;
  // an empty form is an invitation, not a mistake.
  const visibleErrors: FieldErrors = hasEnergy || draft.roof || draft.generator ? errors : {};
  const quoteHref = `/quote${toEstimateQuery(input, { from: "calculator" })}`;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-14">
      <form
        aria-label="Your site"
        className="flex flex-col gap-7"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        <SelectField
          id="segment"
          label="Type of site"
          value={draft.segment}
          onChange={(e) => set("segment", e.target.value as Segment)}
          options={SEGMENTS.map((s) => ({ value: s, label: SEGMENT_LABEL[s] }))}
          hint="Decides when in the day you use energy, which decides how much solar you can use."
        />
        <SelectField
          id="location"
          label="Location"
          value={draft.location}
          onChange={(e) => set("location", e.target.value as Location)}
          options={LOCATIONS.map((l) => ({ value: l, label: LOCATION[l].label }))}
        />

        <fieldset className="flex flex-col gap-4">
          <legend className="type-label mb-1">Your consumption</legend>
          <p className="type-small text-muted -mt-2">
            One is enough. Both together let us work out your actual tariff.
          </p>
          <TextField
            id="monthlyBillXof"
            label="Average monthly bill"
            inputMode="numeric"
            autoComplete="off"
            suffix="FCFA"
            placeholder="e.g. 1 500 000"
            value={draft.bill}
            onChange={(e) => set("bill", e.target.value)}
            error={visibleErrors.monthlyBillXof}
          />
          <TextField
            id="monthlyKwh"
            label="Average monthly consumption"
            optional
            inputMode="numeric"
            autoComplete="off"
            suffix="kWh"
            placeholder="e.g. 12 000"
            value={draft.kwh}
            onChange={(e) => set("kwh", e.target.value)}
            error={visibleErrors.monthlyKwh}
            hint="Printed on your bill as “consommation”."
          />
        </fieldset>

        <TextField
          id="roofAreaM2"
          label="Roof or ground space available"
          optional
          inputMode="numeric"
          autoComplete="off"
          suffix="m²"
          placeholder="Not sure? Leave blank"
          value={draft.roof}
          onChange={(e) => set("roof", e.target.value)}
          error={visibleErrors.roofAreaM2}
          hint="Flat or gently sloping, unshaded area. Leave blank and we won't limit the size."
        />

        <TextField
          id="generatorHoursPerWeek"
          label="Generator use"
          optional
          inputMode="numeric"
          autoComplete="off"
          suffix="h / week"
          placeholder="0"
          value={draft.generator}
          onChange={(e) => set("generator", e.target.value)}
          error={visibleErrors.generatorHoursPerWeek}
          hint="Roughly how many hours a week a generator runs during outages."
        />

        <ChoiceGroup
          name="independence"
          legend="What matters most?"
          value={draft.independence}
          onChange={(v) => set("independence", v)}
          columns={1}
          options={INDEPENDENCE.map((i) => ({
            value: i,
            label: INDEPENDENCE_RULES[i].label,
            description: INDEPENDENCE_RULES[i].summary,
          }))}
        />
      </form>

      <section
        aria-labelledby="result-title"
        className="lg:sticky lg:top-[calc(var(--spacing-header)+24px)]"
      >
        <h2 id="result-title" className="sr-only">
          Your estimate
        </h2>
        {result ? (
          <Results result={result} draft={draft} quoteHref={quoteHref} />
        ) : (
          <div className="bg-plaster flex min-h-80 flex-col items-start justify-center gap-4 rounded-[var(--radius-md)] p-8">
            {problem ? (
              <p role="alert" className="text-danger flex gap-2 font-semibold">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
                {problem}
              </p>
            ) : (
              <>
                <p className="type-h3">Your estimate appears here.</p>
                <p className="text-muted max-w-[44ch]">
                  Enter your monthly bill or consumption to see a suggested system, its cost, and
                  how long it takes to pay for itself.
                </p>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function toInput(draft: Draft) {
  const generator = parseAmount(draft.generator);
  return {
    segment: draft.segment,
    location: draft.location,
    independence: draft.independence,
    monthlyBillXof: parseAmount(draft.bill),
    monthlyKwh: parseAmount(draft.kwh),
    roofAreaM2: parseAmount(draft.roof),
    generatorHoursPerWeek: generator ? generator : undefined,
  };
}

function Results({
  result,
  draft,
  quoteHref,
}: {
  result: Estimate;
  draft: Draft;
  quoteHref: string;
}) {
  return (
    <div
      className="ring-line flex flex-col overflow-hidden rounded-[var(--radius-md)] ring-1"
      aria-live="polite"
    >
      <div className="bg-ink text-paper flex flex-col gap-8 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <p className="type-small text-on-ink-muted">Estimated saving</p>
          <p className="type-figure text-sun">
            {formatXof(result.monthlySavingsXof)}
            <span className="type-lead text-on-ink-muted font-normal"> / month</span>
          </p>
          <p className="text-on-ink-muted">
            About {formatXof(result.annualSavingsXof)} a year, with{" "}
            {formatPercent(result.solarShare)} of your electricity coming from the sun.
          </p>
        </div>

        <dl className="border-ink-line grid grid-cols-2 gap-x-6 gap-y-6 border-t pt-6 sm:grid-cols-4">
          <Figure
            label="Solar capacity"
            value={formatKwp(result.systemKwp)}
            detail={`${formatNumber(result.panelCount)} panels`}
          />
          <Figure
            label="Battery"
            value={result.batteryKwh ? `${formatNumber(result.batteryKwh)} kWh` : "None"}
            detail={result.batteryKwh ? "usable storage" : "panels only"}
          />
          <Figure
            label="Roof area"
            value={`${formatNumber(result.roofAreaM2)} m²`}
            detail="incl. walkways"
          />
          <Figure
            label="Payback"
            value={formatYears(result.paybackYears.low, result.paybackYears.high)}
          />
        </dl>

        {result.limitedByRoof && (
          <p className="bg-sun-soft text-ink type-small flex gap-2 rounded-[var(--radius-sm)] p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            Your available space is the limit here: a larger area would let the system cover more of
            your load. A survey can often find more space — a carport or a second roof.
          </p>
        )}
      </div>

      <div className="bg-paper flex flex-col gap-8 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h3 className="type-h3">Investment</h3>
          <p>
            <span className="type-figure-sm">
              {formatXof(result.investmentXof.low)} – {formatXof(result.investmentXof.high)}
            </span>
          </p>
          <p className="type-small text-muted">
            Installed, including panels, inverter, {result.batteryKwh ? "battery, " : ""}mounting
            and labour. The range is ±15 % because a desk estimate can&apos;t see your roof.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="type-h3">Your average day</h3>
          <DayCurve
            key={`${draft.segment}-${draft.independence}-${result.systemKwp}`}
            day={result.day}
            title={`Average day for your ${SEGMENT_LABEL[draft.segment].toLowerCase()} with a ${formatKwp(result.systemKwp)} system`}
          />
        </div>

        <details className="group border-line border-t pt-5">
          <summary className="cursor-pointer font-semibold">How this estimate works</summary>
          <div className="type-small text-muted mt-4 flex flex-col gap-3">
            <p>
              We take your monthly consumption
              {result.basis.tariffSource === "default"
                ? ` (worked out from your bill at a typical tariff of ${result.basis.tariffXof} FCFA/kWh)`
                : ` and your actual tariff of ${result.basis.tariffXof} FCFA/kWh`}
              , spread it over a typical day for your type of site, and simulate it hour by hour
              against the sun in {LOCATION[draft.location].label}, where a kilowatt of panels
              produces about {formatNumber(result.basis.yieldKwhPerKwp)} kWh a year.
            </p>
            <p>
              The system is sized as large as possible while at least{" "}
              {formatPercent(INDEPENDENCE_RULES[draft.independence].minSelfUse)} of what it produces
              is used on site. Côte d&apos;Ivoire has no general scheme that pays for exported
              solar, so panels beyond that point would mostly produce energy nobody pays for. Clear,
              hazy and overcast days are simulated separately and weighted across the year.
            </p>
            <p>
              The system would produce about {formatKwh(result.annualProductionKwh)} a year and
              avoid about {formatNumber(result.co2TonnesPerYear, 1)} tonnes of CO₂. Prices, tariffs
              and yields are planning assumptions, not quotes; tariff rises and panel ageing are not
              modelled.
            </p>
          </div>
        </details>

        <div className="bg-plaster flex flex-col gap-4 rounded-[var(--radius-sm)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[40ch]">
            <strong>This is an estimate.</strong> A specialist can turn it into a fixed-price
            proposal after a site survey.
          </p>
          <ButtonLink href={quoteHref} variant="primary">
            Request a quote with this estimate
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function Figure({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="type-small text-on-ink-muted">{label}</dt>
      <dd className="text-[1.125rem] font-semibold [font-stretch:110%]">{value}</dd>
      {detail && <dd className="type-small text-on-ink-muted">{detail}</dd>}
    </div>
  );
}
