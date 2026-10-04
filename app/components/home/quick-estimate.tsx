"use client";

import { useId, useMemo, useState } from "react";
import { ButtonLink } from "@/app/components/primitives/button";
import { SelectField, TextField } from "@/app/components/forms/fields";
import { useLocale } from "@/app/components/i18n/use-locale";
import { labels } from "@/app/content/labels";
import { estimate, EstimateInputError } from "@/app/lib/solar/estimate";
import { SEGMENTS, type Segment } from "@/app/lib/solar/assumptions";
import type { Locale } from "@/app/lib/i18n";
import { formatKwp, formatXof, formatYears } from "@/app/lib/format";
import { parseAmount } from "@/app/lib/parse";
import { toEstimateQuery } from "@/app/lib/estimate-query";

const COPY: Record<
  Locale,
  {
    segment: string;
    bill: string;
    tooLow: string;
    assumes: string;
    saving: string;
    system: string;
    payback: string;
    empty: string;
    refine: string;
    disclaimer: string;
  }
> = {
  en: {
    segment: "Type of site",
    bill: "Average monthly electricity bill",
    tooLow: "Enter a monthly amount of at least 5 000 FCFA.",
    assumes:
      "Assumes a site in Abidjan and panels only. The full calculator adds location, storage, roof space and generator use.",
    saving: "Estimated saving per month",
    system: "Suggested system",
    payback: "Payback",
    empty: "Enter your monthly bill to see an estimate.",
    refine: "Refine in the full calculator",
    disclaimer: "Estimate only, not a quote.",
  },
  fr: {
    segment: "Type de site",
    bill: "Facture d'électricité mensuelle moyenne",
    tooLow: "Saisissez un montant mensuel d'au moins 5 000 FCFA.",
    assumes:
      "Hypothèse : un site à Abidjan, panneaux seuls. Le simulateur complet ajoute la ville, le stockage, la surface de toit et le groupe électrogène.",
    saving: "Économie estimée par mois",
    system: "Système proposé",
    payback: "Retour sur investissement",
    empty: "Saisissez votre facture mensuelle pour voir une estimation.",
    refine: "Affiner dans le simulateur complet",
    disclaimer: "Simple estimation, pas un devis.",
  },
};

/**
 * Two questions, an answer as you type. The homepage version of the
 * calculator: it asks only what is needed for a first number, then hands the
 * same inputs to the full calculator through the URL.
 */
export function QuickEstimate() {
  const locale = useLocale();
  const t = COPY[locale];
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
          label={t.segment}
          value={segment}
          onChange={(e) => setSegment(e.target.value as Segment)}
          options={SEGMENTS.map((s) => ({ value: s, label: labels(locale).segment[s] }))}
        />
        <TextField
          id={`${id}-bill`}
          label={t.bill}
          inputMode="numeric"
          autoComplete="off"
          suffix="FCFA"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
          error={bill && (!amount || amount < 5_000) ? t.tooLow : undefined}
        />
        <p className="type-small text-muted">{t.assumes}</p>
      </form>

      <div className="bg-plaster flex flex-col justify-between gap-8 p-6 md:p-8" aria-live="polite">
        {result ? (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-7">
            <div className="col-span-2">
              <dt className="type-small text-muted">{t.saving}</dt>
              <dd className="type-figure mt-2">{formatXof(result.monthlySavingsXof)}</dd>
            </div>
            <div>
              <dt className="type-small text-muted">{t.system}</dt>
              <dd className="type-figure-sm mt-1">{formatKwp(result.systemKwp, locale)}</dd>
            </div>
            <div>
              <dt className="type-small text-muted">{t.payback}</dt>
              <dd className="type-figure-sm mt-1">
                {formatYears(result.paybackYears.low, result.paybackYears.high, locale)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-muted">{t.empty}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href={href} variant="secondary">
            {t.refine}
          </ButtonLink>
          <span className="type-small text-muted">{t.disclaimer}</span>
        </div>
      </div>
    </div>
  );
}
