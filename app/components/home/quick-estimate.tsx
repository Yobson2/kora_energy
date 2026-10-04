"use client";

import { useId, useMemo, useState } from "react";
import { ButtonLink } from "@/app/components/primitives/button";
import { SelectField, TextField } from "@/app/components/forms/fields";
import { estimate, EstimateInputError } from "@/app/lib/solar/estimate";
import { SEGMENTS, SEGMENT_LABEL, type Segment } from "@/app/lib/solar/assumptions";
import { formatKwp, formatXof, formatYears } from "@/app/lib/format";
import { parseAmount } from "@/app/lib/parse";
import { toEstimateQuery } from "@/app/lib/estimate-query";

/**
 * Two questions, an answer as you type. The homepage version of the
 * calculator: it asks only what is needed for a first number, then hands the
 * same inputs to the full calculator through the URL.
 */
export function QuickEstimate() {
  const id = useId();
  const [segment, setSegment] = useState<Segment>("office");
  const [bill, setBill] = useState("1 500 000");

  const amount = parseAmount(bill);
  const result = useMemo(() => {
    if (!amount || amount < 5_000) return undefined;
    try {
      return estimate({
        segment,
        location: "abidjan",
        independence: "savings",
        monthlyBillXof: amount,
      });
    } catch (error) {
      if (error instanceof EstimateInputError) return undefined;
      throw error;
    }
  }, [segment, amount]);

  const href = `/calculator${toEstimateQuery({ segment, location: "abidjan", monthlyBillXof: amount })}`;

  return (
    <div className="ring-line grid overflow-hidden rounded-[var(--radius-md)] ring-1 lg:grid-cols-[1fr_1.15fr]">
      <form
        className="bg-paper flex flex-col gap-5 p-6 md:p-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <SelectField
          id={`${id}-segment`}
          label="Type of site"
          value={segment}
          onChange={(e) => setSegment(e.target.value as Segment)}
          options={SEGMENTS.map((s) => ({ value: s, label: SEGMENT_LABEL[s] }))}
        />
        <TextField
          id={`${id}-bill`}
          label="Average monthly electricity bill"
          inputMode="numeric"
          autoComplete="off"
          suffix="FCFA"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
          error={
            bill && (!amount || amount < 5_000)
              ? "Enter a monthly amount of at least 5 000 FCFA."
              : undefined
          }
        />
        <p className="type-small text-muted">
          Assumes a site in Abidjan and panels only. The full calculator adds location, storage,
          roof space and generator use.
        </p>
      </form>

      <div className="bg-plaster flex flex-col justify-between gap-8 p-6 md:p-8" aria-live="polite">
        {result ? (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-7">
            <div className="col-span-2">
              <dt className="type-small text-muted">Estimated saving per month</dt>
              <dd className="type-figure mt-2">{formatXof(result.monthlySavingsXof)}</dd>
            </div>
            <div>
              <dt className="type-small text-muted">Suggested system</dt>
              <dd className="type-figure-sm mt-1">{formatKwp(result.systemKwp)}</dd>
            </div>
            <div>
              <dt className="type-small text-muted">Payback</dt>
              <dd className="type-figure-sm mt-1">
                {formatYears(result.paybackYears.low, result.paybackYears.high)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-muted">Enter your monthly bill to see an estimate.</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href={href} variant="secondary">
            Refine in the full calculator
          </ButtonLink>
          <span className="type-small text-muted">Estimate only, not a quote.</span>
        </div>
      </div>
    </div>
  );
}
