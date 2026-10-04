"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { ButtonLink } from "@/app/components/primitives/button";
import { ChoiceGroup, SelectField, TextField } from "@/app/components/forms/fields";
import { DayCurve } from "@/app/components/visuals/day-curve";
import { useLocale } from "@/app/components/i18n/use-locale";
import { labels } from "@/app/content/labels";
import { estimate, EstimateInputError, type Estimate } from "@/app/lib/solar/estimate";
import {
  INDEPENDENCE,
  INDEPENDENCE_RULES,
  LOCATIONS,
  MIN_SYSTEM_KWP,
  SEGMENTS,
  type Independence,
  type Location,
  type Segment,
} from "@/app/lib/solar/assumptions";
import { fieldErrors, publicSchemas, type FieldErrors } from "@/app/lib/validation";
import { amountToInput, parseAmount } from "@/app/lib/parse";
import { fromEstimateQuery, toEstimateQuery } from "@/app/lib/estimate-query";
import { localizePath, type Locale } from "@/app/lib/i18n";
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

const en = {
  form: "Your site",
  segment: "Type of site",
  segmentHint: "Decides when in the day you use energy, which decides how much solar you can use.",
  location: "Location",
  consumption: "Your consumption",
  consumptionHint: "One is enough. Both together let us work out your actual tariff.",
  bill: "Average monthly bill",
  example: (n: string) => `e.g. ${n}`,
  kwh: "Average monthly consumption",
  kwhHint: "Printed on your bill as “consommation”.",
  roof: "Roof or ground space available",
  roofPlaceholder: "Not sure? Leave blank",
  roofHint: "Flat or gently sloping, unshaded area. Leave blank and we won't limit the size.",
  generator: "Generator use",
  perWeek: "h / week",
  generatorHint: "Roughly how many hours a week a generator runs during outages.",
  matters: "What matters most?",
  result: "Your estimate",
  emptyTitle: "Your estimate appears here.",
  emptyText:
    "Enter your monthly bill or consumption to see a suggested system, its cost, and how long it takes to pay for itself.",
  problems: {
    "no-consumption": "Enter a monthly bill or a monthly consumption.",
    "area-too-small": `The available area fits less than ${MIN_SYSTEM_KWP} kWp of panels. Enter a larger area, or leave it blank if you are not sure.`,
  } as Record<EstimateInputError["code"], string>,
  saving: "Estimated saving",
  perMonth: " / month",
  savingDetail: (year: string, share: string) =>
    `About ${year} a year, with ${share} of your electricity coming from the sun.`,
  capacity: "Solar capacity",
  panels: (n: string) => `${n} panels`,
  battery: "Battery",
  none: "None",
  usable: "usable storage",
  panelsOnly: "panels only",
  roofArea: "Roof area",
  walkways: "incl. walkways",
  payback: "Payback",
  roofLimited:
    "Your available space is the limit here: a larger area would let the system cover more of your load. A survey can often find more space, such as a carport or a second roof.",
  investment: "Investment",
  investmentNote: (battery: boolean) =>
    `Installed, including panels, inverter, ${battery ? "battery, " : ""}mounting and labour. The range is ±15 % because a desk estimate can't see your roof.`,
  day: "Your average day",
  dayTitle: (site: string, kwp: string) => `Average day for your ${site} with a ${kwp} system`,
  how: "How this estimate works",
  howConsumption: (tariff: number, derived: boolean) =>
    derived
      ? `We take your monthly consumption and your actual tariff of ${tariff} FCFA/kWh`
      : `We take your monthly consumption (worked out from your bill at a typical tariff of ${tariff} FCFA/kWh)`,
  howSimulate: (place: string, yieldKwh: string) =>
    `, spread it over a typical day for your type of site, and simulate it hour by hour against the sun in ${place}, where a kilowatt of panels produces about ${yieldKwh} kWh a year.`,
  howSizing: (share: string) =>
    `The system is sized as large as possible while at least ${share} of what it produces is used on site. Côte d'Ivoire has no general scheme that pays for exported solar, so panels beyond that point would mostly produce energy nobody pays for. Clear, hazy and overcast days are simulated separately and weighted across the year.`,
  howOutput: (kwh: string, co2: string) =>
    `The system would produce about ${kwh} a year and avoid about ${co2} tonnes of CO₂. Prices, tariffs and yields are planning assumptions, not quotes; tariff rises and panel ageing are not modelled.`,
  disclaimerStrong: "This is an estimate.",
  disclaimer: "A specialist can turn it into a fixed-price proposal after a site survey.",
  quote: "Request a quote with this estimate",
};

const fr: typeof en = {
  form: "Votre site",
  segment: "Type de site",
  segmentHint:
    "Détermine à quelles heures vous consommez, et donc quelle part de solaire vous pouvez utiliser.",
  location: "Ville",
  consumption: "Votre consommation",
  consumptionHint: "Un seul chiffre suffit. Les deux ensemble nous donnent votre tarif réel.",
  bill: "Facture mensuelle moyenne",
  example: (n) => `ex. ${n}`,
  kwh: "Consommation mensuelle moyenne",
  kwhHint: "Indiquée sur votre facture sous « consommation ».",
  roof: "Surface de toit ou de terrain disponible",
  roofPlaceholder: "Pas sûr ? Laissez vide",
  roofHint:
    "Surface plane ou peu inclinée, sans ombre. Laissez vide et nous ne limiterons pas la taille.",
  generator: "Groupe électrogène",
  perWeek: "h / sem.",
  generatorHint: "Environ combien d'heures par semaine un groupe tourne pendant les coupures.",
  matters: "Qu'est-ce qui compte le plus ?",
  result: "Votre estimation",
  emptyTitle: "Votre estimation s'affiche ici.",
  emptyText:
    "Saisissez votre facture ou votre consommation mensuelle pour voir un système proposé, son coût et le temps nécessaire pour le rentabiliser.",
  problems: {
    "no-consumption": "Saisissez une facture mensuelle ou une consommation mensuelle.",
    "area-too-small": `La surface disponible accueille moins de ${MIN_SYSTEM_KWP} kWc de panneaux. Saisissez une surface plus grande, ou laissez vide si vous n'êtes pas sûr.`,
  },
  saving: "Économie estimée",
  perMonth: " / mois",
  savingDetail: (year, share) =>
    `Environ ${year} par an, avec ${share} de votre électricité venant du soleil.`,
  capacity: "Puissance solaire",
  panels: (n) => `${n} panneaux`,
  battery: "Batterie",
  none: "Aucune",
  usable: "stockage utile",
  panelsOnly: "panneaux seuls",
  roofArea: "Surface de toit",
  walkways: "allées comprises",
  payback: "Retour sur investissement",
  roofLimited:
    "C'est la surface disponible qui limite ici : une surface plus grande permettrait de couvrir davantage de votre consommation. Une visite trouve souvent de la place en plus, comme une ombrière de parking ou un second toit.",
  investment: "Investissement",
  investmentNote: (battery) =>
    `Installé, panneaux, onduleur, ${battery ? "batterie, " : ""}structure et main-d'œuvre compris. La fourchette est de ±15 % car une estimation à distance ne voit pas votre toit.`,
  day: "Votre journée moyenne",
  dayTitle: (site, kwp) => `Journée moyenne de votre site (${site}) avec un système de ${kwp}`,
  how: "Comment cette estimation est calculée",
  howConsumption: (tariff, derived) =>
    derived
      ? `Nous prenons votre consommation mensuelle et votre tarif réel de ${tariff} FCFA/kWh`
      : `Nous prenons votre consommation mensuelle (déduite de votre facture avec un tarif type de ${tariff} FCFA/kWh)`,
  howSimulate: (place, yieldKwh) =>
    `, la répartissons sur une journée type pour votre activité, et la simulons heure par heure face au soleil de ${place}, où un kilowatt de panneaux produit environ ${yieldKwh} kWh par an.`,
  howSizing: (share) =>
    `Le système est dimensionné aussi grand que possible tant qu'au moins ${share} de sa production est consommée sur place. La Côte d'Ivoire n'a pas de dispositif général qui rémunère le solaire injecté sur le réseau : au-delà, les panneaux produiraient surtout une énergie que personne ne paie. Les jours clairs, brumeux et couverts sont simulés séparément et pondérés sur l'année.`,
  howOutput: (kwh, co2) =>
    `Le système produirait environ ${kwh} par an et éviterait environ ${co2} tonnes de CO₂. Les prix, tarifs et rendements sont des hypothèses de travail, pas des devis ; les hausses de tarif et le vieillissement des panneaux ne sont pas modélisés.`,
  disclaimerStrong: "Ceci est une estimation.",
  disclaimer:
    "Un conseiller peut en faire une proposition à prix ferme après une visite technique.",
  quote: "Demander un devis avec cette estimation",
};

const COPY: Record<Locale, typeof en> = { en, fr };

/**
 * The calculator, as a product feature rather than a widget:
 *  - results update as you type, from the same engine the API runs;
 *  - validation is the shared Zod schema, so it agrees with the server;
 *  - inputs live in the URL, so an estimate can be shared or bookmarked,
 *    and carries into the quote form (and across a language switch)
 *    without retyping.
 */
export function Calculator() {
  const params = useSearchParams();
  const locale = useLocale();
  const t = COPY[locale];
  const l = labels(locale);

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
    // trip or a history entry per keystroke; router.replace would refetch
    // the page on every character typed.
    window.history.replaceState(
      null,
      "",
      localizePath(`/calculator${toEstimateQuery(toInput(next))}`, locale)
    );
  };

  const input = toInput(draft);
  const hasEnergy = input.monthlyBillXof !== undefined || input.monthlyKwh !== undefined;

  const { result, errors, problem } = useMemo(() => {
    const parsed = publicSchemas(locale).estimateInputSchema.safeParse(input);
    if (!parsed.success) {
      return { result: undefined, errors: fieldErrors(parsed.error), problem: undefined };
    }
    try {
      return { result: estimate(parsed.data), errors: {}, problem: undefined };
    } catch (error) {
      if (error instanceof EstimateInputError) {
        return { result: undefined, errors: {}, problem: t.problems[error.code] };
      }
      throw error;
    }
    // `input` is derived from `draft` on every render; depend on the source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, locale]);

  // Only show "enter a bill" once the visitor has touched an energy field;
  // an empty form is an invitation, not a mistake.
  const visibleErrors: FieldErrors = hasEnergy || draft.roof || draft.generator ? errors : {};
  const quoteHref = `/quote${toEstimateQuery(input, { from: "calculator" })}`;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-14">
      <form
        aria-label={t.form}
        className="flex flex-col gap-7"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        <SelectField
          id="segment"
          label={t.segment}
          value={draft.segment}
          onChange={(e) => set("segment", e.target.value as Segment)}
          options={SEGMENTS.map((s) => ({ value: s, label: l.segment[s] }))}
          hint={t.segmentHint}
        />
        <SelectField
          id="location"
          label={t.location}
          value={draft.location}
          onChange={(e) => set("location", e.target.value as Location)}
          options={LOCATIONS.map((loc) => ({ value: loc, label: l.location[loc] }))}
        />

        <fieldset className="flex flex-col gap-4">
          <legend className="type-label mb-1">{t.consumption}</legend>
          <p className="type-small text-muted -mt-2">{t.consumptionHint}</p>
          <TextField
            id="monthlyBillXof"
            label={t.bill}
            inputMode="numeric"
            autoComplete="off"
            suffix="FCFA"
            placeholder={t.example("1 500 000")}
            value={draft.bill}
            onChange={(e) => set("bill", e.target.value)}
            error={visibleErrors.monthlyBillXof}
          />
          <TextField
            id="monthlyKwh"
            label={t.kwh}
            optional
            inputMode="numeric"
            autoComplete="off"
            suffix="kWh"
            placeholder={t.example("12 000")}
            value={draft.kwh}
            onChange={(e) => set("kwh", e.target.value)}
            error={visibleErrors.monthlyKwh}
            hint={t.kwhHint}
          />
        </fieldset>

        <TextField
          id="roofAreaM2"
          label={t.roof}
          optional
          inputMode="numeric"
          autoComplete="off"
          suffix="m²"
          placeholder={t.roofPlaceholder}
          value={draft.roof}
          onChange={(e) => set("roof", e.target.value)}
          error={visibleErrors.roofAreaM2}
          hint={t.roofHint}
        />

        <TextField
          id="generatorHoursPerWeek"
          label={t.generator}
          optional
          inputMode="numeric"
          autoComplete="off"
          suffix={t.perWeek}
          placeholder="0"
          value={draft.generator}
          onChange={(e) => set("generator", e.target.value)}
          error={visibleErrors.generatorHoursPerWeek}
          hint={t.generatorHint}
        />

        <ChoiceGroup
          name="independence"
          legend={t.matters}
          value={draft.independence}
          onChange={(v) => set("independence", v)}
          columns={1}
          options={INDEPENDENCE.map((i) => ({
            value: i,
            label: l.independence[i].label,
            description: l.independence[i].summary,
          }))}
        />
      </form>

      <section
        aria-labelledby="result-title"
        className="lg:sticky lg:top-[calc(var(--spacing-header)+24px)]"
      >
        <h2 id="result-title" className="sr-only">
          {t.result}
        </h2>
        {result ? (
          <Results result={result} draft={draft} quoteHref={quoteHref} locale={locale} />
        ) : (
          <div className="bg-plaster flex min-h-80 flex-col items-start justify-center gap-4 rounded-[var(--radius-md)] p-8">
            {problem ? (
              <p role="alert" className="text-danger flex gap-2 font-semibold">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
                {problem}
              </p>
            ) : (
              <>
                <p className="type-h3">{t.emptyTitle}</p>
                <p className="text-muted max-w-[44ch]">{t.emptyText}</p>
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
  locale,
}: {
  result: Estimate;
  draft: Draft;
  quoteHref: string;
  locale: Locale;
}) {
  const t = COPY[locale];
  const l = labels(locale);
  return (
    <div
      className="ring-line flex flex-col overflow-hidden rounded-[var(--radius-md)] ring-1"
      aria-live="polite"
    >
      <div className="bg-ink text-paper flex flex-col gap-8 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <p className="type-small text-on-ink-muted">{t.saving}</p>
          <p className="type-figure text-sun">
            {formatXof(result.monthlySavingsXof)}
            <span className="type-lead text-on-ink-muted font-normal">{t.perMonth}</span>
          </p>
          <p className="text-on-ink-muted">
            {t.savingDetail(formatXof(result.annualSavingsXof), formatPercent(result.solarShare))}
          </p>
        </div>

        <dl className="border-ink-line grid grid-cols-2 gap-x-6 gap-y-6 border-t pt-6 sm:grid-cols-4">
          <Figure
            label={t.capacity}
            value={formatKwp(result.systemKwp, locale)}
            detail={t.panels(formatNumber(result.panelCount))}
          />
          <Figure
            label={t.battery}
            value={result.batteryKwh ? `${formatNumber(result.batteryKwh)} kWh` : t.none}
            detail={result.batteryKwh ? t.usable : t.panelsOnly}
          />
          <Figure
            label={t.roofArea}
            value={`${formatNumber(result.roofAreaM2)} m²`}
            detail={t.walkways}
          />
          <Figure
            label={t.payback}
            value={formatYears(result.paybackYears.low, result.paybackYears.high, locale)}
          />
        </dl>

        {result.limitedByRoof && (
          <p className="bg-sun-soft text-ink type-small flex gap-2 rounded-[var(--radius-sm)] p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t.roofLimited}
          </p>
        )}
      </div>

      <div className="bg-paper flex flex-col gap-8 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h3 className="type-h3">{t.investment}</h3>
          <p>
            <span className="type-figure-sm">
              {formatXof(result.investmentXof.low)} – {formatXof(result.investmentXof.high)}
            </span>
          </p>
          <p className="type-small text-muted">{t.investmentNote(result.batteryKwh > 0)}</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="type-h3">{t.day}</h3>
          <DayCurve
            key={`${draft.segment}-${draft.independence}-${result.systemKwp}`}
            day={result.day}
            locale={locale}
            title={t.dayTitle(
              l.segment[draft.segment].toLowerCase(),
              formatKwp(result.systemKwp, locale)
            )}
          />
        </div>

        <details className="group border-line border-t pt-5">
          <summary className="cursor-pointer font-semibold">{t.how}</summary>
          <div className="type-small text-muted mt-4 flex flex-col gap-3">
            <p>
              {t.howConsumption(result.basis.tariffXof, result.basis.tariffSource !== "default")}
              {t.howSimulate(l.location[draft.location], formatNumber(result.basis.yieldKwhPerKwp))}
            </p>
            <p>{t.howSizing(formatPercent(INDEPENDENCE_RULES[draft.independence].minSelfUse))}</p>
            <p>
              {t.howOutput(
                formatKwh(result.annualProductionKwh),
                formatNumber(result.co2TonnesPerYear, 1)
              )}
            </p>
          </div>
        </details>

        <div className="bg-plaster flex flex-col gap-4 rounded-[var(--radius-sm)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[40ch]">
            <strong>{t.disclaimerStrong}</strong> {t.disclaimer}
          </p>
          <ButtonLink href={quoteHref} variant="primary">
            {t.quote}
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
