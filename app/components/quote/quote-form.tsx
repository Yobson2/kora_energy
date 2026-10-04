"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, CheckCircle2 } from "lucide-react";
import type { z } from "zod";
import { Button, ButtonLink } from "@/app/components/primitives/button";
import { Link } from "@/app/components/primitives/link";
import {
  CheckboxField,
  ChoiceGroup,
  FormAlert,
  Honeypot,
  SelectField,
  Spinner,
  TextField,
  TextareaField,
} from "@/app/components/forms/fields";
import { useLocale } from "@/app/components/i18n/use-locale";
import { getSolutions } from "@/app/content/solutions";
import { labels } from "@/app/content/labels";
import { TIMELINES, type SolutionSlug, type Timeline } from "@/app/lib/domain";
import {
  LOCATIONS,
  SEGMENTS,
  type Independence,
  type Location,
  type Segment,
} from "@/app/lib/solar/assumptions";
import { fieldErrors, publicSchemas, type FieldErrors } from "@/app/lib/validation";
import { apiRequest } from "@/app/lib/api-client";
import { amountToInput, parseAmount } from "@/app/lib/parse";
import { fromEstimateQuery } from "@/app/lib/estimate-query";
import { formatNumber } from "@/app/lib/format";
import type { Locale } from "@/app/lib/i18n";
import { cn } from "@/app/lib/utils";
import { useFocusFirstError } from "@/app/components/forms/use-focus-first-error";

/**
 * Multi-step quote request.
 *
 * Design decisions:
 *  - Easy questions first (what and where), personal details last, so the
 *    visitor has invested a little before being asked for a phone number.
 *  - Each step validates against a slice of the SAME schema the API uses,
 *    built with messages in the page language.
 *  - On step change, focus moves to the new step's heading so screen-reader
 *    and keyboard users land where sighted users look.
 *  - The draft survives a reload (sessionStorage), and a language switch, so
 *    an accidental refresh on step 3 costs nothing. It is cleared on success.
 *  - Arriving from the calculator pre-fills everything already known.
 */

type Values = {
  segment?: Segment;
  location?: Location;
  solution?: SolutionSlug;
  timeline?: Timeline;
  bill: string;
  kwh: string;
  generator: string;
  roof: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  website: string;
};

const EMPTY: Values = {
  bill: "",
  kwh: "",
  generator: "",
  roof: "",
  name: "",
  company: "",
  email: "",
  phone: "",
  message: "",
  consent: false,
  website: "",
};

const STEP_KEYS = ["site", "energy", "contact", "review"] as const;

const en = {
  steps: {
    site: "Your site",
    energy: "Your energy use",
    contact: "Your details",
    review: "Review and send",
  } as Record<(typeof STEP_KEYS)[number], string>,
  progress: "Quote request progress",
  stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
  completed: " (completed)",
  prefilled: "We've filled in what you entered in the calculator. Check it and carry on.",
  rateLimited: "Too many requests",
  notSent: "Your request wasn't sent",
  segment: "What kind of site is it?",
  location: "Where is it?",
  chooseCity: "Choose a city",
  solution: "Which solution is closest to what you need?",
  chooseSolution: "Choose a solution",
  solutionHint: "Not sure? Pick the nearest one, and we'll advise after the call.",
  timeline: "When would you like it installed?",
  energyIntro: "A recent bill has both figures. If you only know one, that's fine.",
  bill: "Average monthly electricity bill",
  example: (n: string) => `e.g. ${n}`,
  kwh: "Average monthly consumption",
  generator: "Generator use",
  perWeek: "h / week",
  roof: "Roof space",
  name: "Full name",
  company: "Company or organisation",
  email: "Email",
  phone: "Phone",
  phoneHint: "We call before we email. WhatsApp is fine.",
  message: "Anything else we should know?",
  messagePlaceholder: "Outages you deal with, equipment that must stay on, roof type…",
  consentBefore:
    "Kora Energy may use these details to prepare and discuss my quote, as described in the ",
  privacy: "privacy notice",
  back: "Back",
  sending: "Sending your request…",
  sendingStatus: "Sending your request",
  continue: "Continue",
  send: "Send quote request",
  review: {
    segment: "Type of site",
    location: "Location",
    solution: "Solution",
    timeline: "Timeline",
    bill: "Monthly bill",
    kwh: "Monthly consumption",
    generator: "Generator",
    generatorValue: (h: number) => `${h} h a week`,
    roof: "Roof space",
    name: "Name",
    company: "Company",
    email: "Email",
    phone: "Phone",
    message: "Message",
    change: "Change",
  },
  success: {
    title: (first: string) => `Request received${first ? `, ${first}` : ""}.`,
    refBefore: "Your reference is ",
    refAfter: ". Quote it if you contact us about this request.",
    next: [
      ["Within one working day", "An energy specialist calls to go through your needs."],
      ["Within about a week", "If solar makes sense for your site, we arrange a survey."],
      ["After the survey", "You receive a written proposal with a fixed price."],
    ] as Array<[string, string]>,
    concept:
      "Kora Energy is a concept project, so no one will actually call. Your request has been saved to the demonstration back office, where it appears as a new lead.",
    projects: "Browse concept projects",
    home: "Back to the homepage",
  },
};

const fr: typeof en = {
  steps: {
    site: "Votre site",
    energy: "Votre consommation",
    contact: "Vos coordonnées",
    review: "Vérifier et envoyer",
  },
  progress: "Progression de la demande de devis",
  stepOf: (n, total) => `Étape ${n} sur ${total}`,
  completed: " (terminée)",
  prefilled: "Nous avons repris ce que vous avez saisi dans le simulateur. Vérifiez et continuez.",
  rateLimited: "Trop de demandes",
  notSent: "Votre demande n'a pas été envoyée",
  segment: "De quel type de site s'agit-il ?",
  location: "Où se trouve-t-il ?",
  chooseCity: "Choisissez une ville",
  solution: "Quelle solution est la plus proche de votre besoin ?",
  chooseSolution: "Choisissez une solution",
  solutionHint: "Pas sûr ? Choisissez la plus proche, nous vous conseillerons après l'appel.",
  timeline: "Quand souhaitez-vous l'installation ?",
  energyIntro:
    "Une facture récente indique les deux chiffres. Si vous n'en connaissez qu'un, ce n'est pas grave.",
  bill: "Facture d'électricité mensuelle moyenne",
  example: (n) => `ex. ${n}`,
  kwh: "Consommation mensuelle moyenne",
  generator: "Groupe électrogène",
  perWeek: "h / sem.",
  roof: "Surface de toit",
  name: "Nom complet",
  company: "Entreprise ou organisation",
  email: "E-mail",
  phone: "Téléphone",
  phoneHint: "Nous appelons avant d'écrire. WhatsApp convient aussi.",
  message: "Autre chose à nous signaler ?",
  messagePlaceholder:
    "Coupures que vous subissez, équipements qui doivent rester allumés, type de toit…",
  consentBefore:
    "Kora Energy peut utiliser ces informations pour préparer et discuter de mon devis, comme décrit dans la ",
  privacy: "politique de confidentialité",
  back: "Retour",
  sending: "Envoi de votre demande…",
  sendingStatus: "Envoi de votre demande",
  continue: "Continuer",
  send: "Envoyer la demande de devis",
  review: {
    segment: "Type de site",
    location: "Ville",
    solution: "Solution",
    timeline: "Délai",
    bill: "Facture mensuelle",
    kwh: "Consommation mensuelle",
    generator: "Groupe électrogène",
    generatorValue: (h) => `${h} h par semaine`,
    roof: "Surface de toit",
    name: "Nom",
    company: "Entreprise",
    email: "E-mail",
    phone: "Téléphone",
    message: "Message",
    change: "Modifier",
  },
  success: {
    title: (first) => `Demande reçue${first ? `, ${first}` : ""}.`,
    refBefore: "Votre référence est ",
    refAfter: ". Indiquez-la si vous nous contactez au sujet de cette demande.",
    next: [
      [
        "Sous un jour ouvré",
        "Un conseiller en énergie vous appelle pour faire le point sur vos besoins.",
      ],
      [
        "Sous une semaine environ",
        "Si le solaire a du sens pour votre site, nous organisons une visite.",
      ],
      ["Après la visite", "Vous recevez une proposition écrite à prix ferme."],
    ],
    concept:
      "Kora Energy est un projet fictif : personne ne vous appellera réellement. Votre demande a été enregistrée dans le back-office de démonstration, où elle apparaît comme un nouveau prospect.",
    projects: "Voir les projets fictifs",
    home: "Retour à l'accueil",
  },
};

const COPY: Record<Locale, typeof en> = { en, fr };

const DRAFT_KEY = "kora.quote-draft.v1";

/** Form field → schema field, where the names differ. */
const ERROR_KEY: Partial<Record<keyof Values, string>> = {
  bill: "monthlyBillXof",
  kwh: "monthlyKwh",
  generator: "generatorHoursPerWeek",
  roof: "roofAreaM2",
};

type Status =
  | { kind: "editing" }
  | { kind: "submitting" }
  | { kind: "error"; title: string; message: string }
  | { kind: "success"; reference: string };

function sitePayload(v: Values) {
  return { segment: v.segment, location: v.location, solution: v.solution, timeline: v.timeline };
}
function energyPayload(v: Values) {
  const gen = parseAmount(v.generator);
  return {
    monthlyBillXof: parseAmount(v.bill),
    monthlyKwh: parseAmount(v.kwh),
    generatorHoursPerWeek: gen ? gen : undefined,
    roofAreaM2: parseAmount(v.roof),
  };
}
function contactPayload(v: Values) {
  return {
    name: v.name,
    company: v.company,
    email: v.email,
    phone: v.phone,
    message: v.message,
    consent: v.consent,
  };
}

function stepSchemas(
  locale: Locale
): Array<{ schema: z.ZodType; payload: (v: Values) => unknown; prefix: string }> {
  const s = publicSchemas(locale);
  return [
    { schema: s.quoteSiteSchema, payload: sitePayload, prefix: "site" },
    { schema: s.quoteEnergySchema, payload: energyPayload, prefix: "energy" },
    { schema: s.quoteContactSchema, payload: contactPayload, prefix: "contact" },
  ];
}

/** Which step owns a server error key like "contact.email". */
function stepOf(key: string): number {
  if (key.startsWith("site.")) return 0;
  if (key.startsWith("energy.")) return 1;
  return 2;
}

export function QuoteForm() {
  const params = useSearchParams();
  const locale = useLocale();
  const t = COPY[locale];
  const l = labels(locale);
  const solutions = getSolutions(locale);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "editing" });
  const [independence, setIndependence] = useState<Independence | undefined>();
  const [fromCalculator, setFromCalculator] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const firstRender = useRef(true);
  const formRef = useRef<HTMLFormElement | null>(null);
  const focusFirstError = useFocusFirstError(formRef);

  // Restore a saved draft, then layer calculator inputs from the URL on top.
  // Runs once after mount: sessionStorage does not exist during prerender.
  useEffect(() => {
    let draft: Partial<Values> = {};
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) draft = JSON.parse(saved) as Partial<Values>;
    } catch {
      // Private mode or blocked storage: start fresh.
    }
    const q = fromEstimateQuery(params);
    const fromUrl: Partial<Values> = {
      segment: q.segment,
      location: q.location,
      solution: q.solution,
      bill: q.monthlyBillXof !== undefined ? amountToInput(q.monthlyBillXof) : undefined,
      kwh: q.monthlyKwh !== undefined ? amountToInput(q.monthlyKwh) : undefined,
      roof: q.roofAreaM2 !== undefined ? amountToInput(q.roofAreaM2) : undefined,
      generator:
        q.generatorHoursPerWeek !== undefined ? String(q.generatorHoursPerWeek) : undefined,
    };
    const defined = Object.fromEntries(Object.entries(fromUrl).filter(([, v]) => v !== undefined));
    setValues((current) => ({ ...current, ...draft, ...defined, website: "", consent: false }));
    setIndependence(q.independence);
    setFromCalculator(params.get("from") === "calculator");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the draft (never the consent tick or the honeypot).
  useEffect(() => {
    if (status.kind === "success") return;
    try {
      const { consent: _c, website: _w, ...rest } = values;
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    } catch {
      // Storage unavailable: the form still works, it just won't survive a reload.
    }
  }, [values, status.kind]);

  // Move focus to the step heading whenever the step changes (not on load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, status.kind]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear a field's error as soon as the visitor works on it.
    const errorKey = ERROR_KEY[key] ?? key;
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(next)) if (k.endsWith(`.${errorKey}`)) delete next[k];
      return next;
    });
  };

  function validateStep(index: number): boolean {
    const spec = stepSchemas(locale)[index];
    if (!spec) return true;
    const result = spec.schema.safeParse(spec.payload(values));
    if (result.success) {
      setErrors({});
      return true;
    }
    const prefixed = Object.fromEntries(
      Object.entries(fieldErrors(result.error)).map(([k, m]) => [`${spec.prefix}.${k}`, m])
    );
    setErrors(prefixed);
    // Focus the first invalid control so the error is announced with it.
    focusFirstError();
    return false;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));
  }

  async function submit() {
    // Re-validate everything: a draft restored from storage skipped the steps.
    for (let i = 0; i < stepSchemas(locale).length; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }

    const payload = {
      site: sitePayload(values),
      energy: energyPayload(values),
      contact: contactPayload(values),
      independence,
      origin: fromCalculator ? "calculator" : "quote",
      website: values.website,
    };
    // Belt and braces: the full schema, exactly as the server will run it.
    const check = publicSchemas(locale).quoteRequestSchema.safeParse(payload);
    if (!check.success) {
      const errs = fieldErrors(check.error);
      setErrors(errs);
      setStep(stepOf(Object.keys(errs)[0] ?? "contact."));
      return;
    }

    setStatus({ kind: "submitting" });
    const result = await apiRequest<{ reference: string }>("/api/quotes", {
      body: payload,
      locale,
    });

    if (result.ok) {
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      setStatus({ kind: "success", reference: result.data.reference });
      return;
    }

    if (result.code === "validation_failed" && result.fields) {
      setErrors(result.fields);
      setStep(stepOf(Object.keys(result.fields)[0] ?? "contact."));
      setStatus({ kind: "editing" });
      focusFirstError();
      return;
    }

    setStatus({
      kind: "error",
      title: result.code === "rate_limited" ? t.rateLimited : t.notSent,
      message: result.message,
    });
  }

  if (status.kind === "success") {
    return (
      <Success
        reference={status.reference}
        name={values.name}
        headingRef={headingRef}
        locale={locale}
      />
    );
  }

  const submitting = status.kind === "submitting";
  const total = STEP_KEYS.length;

  return (
    <div className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
      <nav aria-label={t.progress}>
        <ol className="flex gap-2 lg:flex-col lg:gap-0">
          {STEP_KEYS.map((key, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li
                key={key}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-3 lg:py-3",
                  "lg:border-line lg:border-l-2 lg:pl-4",
                  active && "lg:border-ink"
                )}
              >
                <span
                  className={cn(
                    "h-1 rounded-full lg:hidden",
                    done || active ? "bg-ink" : "bg-line"
                  )}
                  aria-hidden
                />
                <span
                  aria-hidden
                  className={cn(
                    "hidden size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold lg:flex",
                    done
                      ? "bg-ink text-paper"
                      : active
                        ? "bg-sun text-ink"
                        : "bg-plaster text-muted"
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "type-small",
                    active ? "font-semibold" : "text-muted",
                    !active && "max-lg:sr-only"
                  )}
                >
                  <span className="sr-only">
                    {t.stepOf(i + 1, total)}
                    {locale === "fr" ? " : " : ": "}
                  </span>
                  {t.steps[key]}
                  {done && <span className="sr-only">{t.completed}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <form
        ref={formRef}
        noValidate
        aria-labelledby="step-title"
        aria-busy={submitting}
        onSubmit={(e) => {
          e.preventDefault();
          if (step < total - 1) next();
          else void submit();
        }}
        className="flex max-w-2xl flex-col gap-8"
      >
        <div className="flex flex-col gap-2">
          <p className="type-small text-muted">{t.stepOf(step + 1, total)}</p>
          <h2 id="step-title" ref={headingRef} tabIndex={-1} className="type-h2 outline-none">
            {t.steps[STEP_KEYS[step]!]}
          </h2>
          {fromCalculator && step === 0 && (
            <p className="type-small bg-sun-soft w-fit rounded-[var(--radius-sm)] px-3 py-2">
              {t.prefilled}
            </p>
          )}
        </div>

        {status.kind === "error" && (
          <FormAlert tone="error" title={status.title}>
            {status.message}
          </FormAlert>
        )}

        <Honeypot value={values.website} onChange={(v) => set("website", v)} />

        {step === 0 && (
          <>
            <ChoiceGroup
              name="segment"
              legend={t.segment}
              value={values.segment}
              onChange={(v) => set("segment", v)}
              error={errors["site.segment"]}
              columns={2}
              options={SEGMENTS.map((s) => ({ value: s, label: l.segment[s] }))}
            />
            <SelectField
              id="location"
              label={t.location}
              placeholder={t.chooseCity}
              value={values.location ?? ""}
              onChange={(e) => set("location", e.target.value as Location)}
              error={errors["site.location"]}
              options={LOCATIONS.map((loc) => ({ value: loc, label: l.location[loc] }))}
            />
            <SelectField
              id="solution"
              label={t.solution}
              placeholder={t.chooseSolution}
              hint={t.solutionHint}
              value={values.solution ?? ""}
              onChange={(e) => set("solution", e.target.value as SolutionSlug)}
              error={errors["site.solution"]}
              options={solutions.map((s) => ({ value: s.slug, label: s.name }))}
            />
            <ChoiceGroup
              name="timeline"
              legend={t.timeline}
              value={values.timeline}
              onChange={(v) => set("timeline", v)}
              error={errors["site.timeline"]}
              columns={2}
              options={TIMELINES.map((tl) => ({ value: tl, label: l.timeline[tl] }))}
            />
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-muted -mt-4">{t.energyIntro}</p>
            <TextField
              id="bill"
              label={t.bill}
              inputMode="numeric"
              autoComplete="off"
              suffix="FCFA"
              placeholder={t.example("1 500 000")}
              value={values.bill}
              onChange={(e) => set("bill", e.target.value)}
              error={errors["energy.monthlyBillXof"]}
            />
            <TextField
              id="kwh"
              label={t.kwh}
              optional
              inputMode="numeric"
              autoComplete="off"
              suffix="kWh"
              placeholder={t.example("12 000")}
              value={values.kwh}
              onChange={(e) => set("kwh", e.target.value)}
              error={errors["energy.monthlyKwh"]}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                id="generator"
                label={t.generator}
                optional
                inputMode="numeric"
                autoComplete="off"
                suffix={t.perWeek}
                value={values.generator}
                onChange={(e) => set("generator", e.target.value)}
                error={errors["energy.generatorHoursPerWeek"]}
              />
              <TextField
                id="roof"
                label={t.roof}
                optional
                inputMode="numeric"
                autoComplete="off"
                suffix="m²"
                value={values.roof}
                onChange={(e) => set("roof", e.target.value)}
                error={errors["energy.roofAreaM2"]}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                id="name"
                label={t.name}
                autoComplete="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                error={errors["contact.name"]}
              />
              <TextField
                id="company"
                label={t.company}
                optional
                autoComplete="organization"
                value={values.company}
                onChange={(e) => set("company", e.target.value)}
                error={errors["contact.company"]}
              />
              <TextField
                id="email"
                label={t.email}
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors["contact.email"]}
              />
              <TextField
                id="phone"
                label={t.phone}
                type="tel"
                autoComplete="tel"
                placeholder="+225 07 00 00 00 00"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                error={errors["contact.phone"]}
                hint={t.phoneHint}
              />
            </div>
            <TextareaField
              id="message"
              label={t.message}
              optional
              placeholder={t.messagePlaceholder}
              value={values.message}
              onChange={(e) => set("message", e.target.value)}
              error={errors["contact.message"]}
            />
            <CheckboxField
              id="consent"
              checked={values.consent}
              onChange={(v) => set("consent", v)}
              error={errors["contact.consent"]}
            >
              {t.consentBefore}
              <Link href="/privacy" className="underline underline-offset-2">
                {t.privacy}
              </Link>
              .
            </CheckboxField>
          </>
        )}

        {step === 3 && <Review values={values} onEdit={setStep} locale={locale} />}

        <div className="border-line flex flex-wrap items-center gap-3 border-t pt-6">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
              {t.back}
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className="ml-auto"
          >
            {submitting ? (
              <>
                <Spinner /> {t.sending}
              </>
            ) : step < total - 1 ? (
              t.continue
            ) : (
              t.send
            )}
          </Button>
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {submitting ? t.sendingStatus : ""}
        </p>
      </form>
    </div>
  );
}

function Review({
  values,
  onEdit,
  locale,
}: {
  values: Values;
  onEdit: (step: number) => void;
  locale: Locale;
}) {
  const t = COPY[locale];
  const r = t.review;
  const l = labels(locale);
  const energy = energyPayload(values);
  const groups: Array<{ step: number; title: string; rows: Array<[string, string | undefined]> }> =
    [
      {
        step: 0,
        title: t.steps.site,
        rows: [
          [r.segment, values.segment && l.segment[values.segment]],
          [r.location, values.location && l.location[values.location]],
          [r.solution, getSolutions(locale).find((s) => s.slug === values.solution)?.name],
          [r.timeline, values.timeline && l.timeline[values.timeline]],
        ],
      },
      {
        step: 1,
        title: t.steps.energy,
        rows: [
          [
            r.bill,
            energy.monthlyBillXof !== undefined
              ? `${formatNumber(energy.monthlyBillXof)} FCFA`
              : undefined,
          ],
          [
            r.kwh,
            energy.monthlyKwh !== undefined ? `${formatNumber(energy.monthlyKwh)} kWh` : undefined,
          ],
          [
            r.generator,
            energy.generatorHoursPerWeek
              ? r.generatorValue(energy.generatorHoursPerWeek)
              : undefined,
          ],
          [
            r.roof,
            energy.roofAreaM2 !== undefined ? `${formatNumber(energy.roofAreaM2)} m²` : undefined,
          ],
        ],
      },
      {
        step: 2,
        title: t.steps.contact,
        rows: [
          [r.name, values.name],
          [r.company, values.company || undefined],
          [r.email, values.email],
          [r.phone, values.phone],
          [r.message, values.message || undefined],
        ],
      },
    ];

  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <section
          key={g.step}
          aria-labelledby={`review-${g.step}`}
          className="ring-line rounded-[var(--radius-md)] ring-1"
        >
          <div className="border-line flex items-center justify-between border-b px-5 py-3">
            <h3 id={`review-${g.step}`} className="font-semibold">
              {g.title}
            </h3>
            <button
              type="button"
              onClick={() => onEdit(g.step)}
              className="type-small rounded-[var(--radius-xs)] font-semibold underline underline-offset-2"
            >
              {r.change}
              <span className="sr-only"> {g.title.toLowerCase()}</span>
            </button>
          </div>
          <dl className="divide-line divide-y px-5">
            {g.rows
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]">
                  <dt className="type-small text-muted">{label}</dt>
                  <dd className="break-words whitespace-pre-line">{value}</dd>
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function Success({
  reference,
  name,
  headingRef,
  locale,
}: {
  reference: string;
  name: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  locale: Locale;
}) {
  const s = COPY[locale].success;
  const first = name.trim().split(/\s+/)[0] ?? "";
  return (
    <div className="animate-fade-up mx-auto flex max-w-2xl flex-col gap-8" role="status">
      <CheckCircle2 className="text-success size-12" aria-hidden />
      <div className="flex flex-col gap-3">
        <h2 ref={headingRef} tabIndex={-1} className="type-h2 outline-none">
          {s.title(first)}
        </h2>
        <p className="type-lead text-muted">
          {s.refBefore}
          <strong className="text-ink tabular">{reference}</strong>
          {s.refAfter}
        </p>
      </div>
      <ol className="border-line flex flex-col border-t">
        {s.next.map(([when, what]) => (
          <li key={when} className="border-line grid gap-1 border-b py-4 sm:grid-cols-[13rem_1fr]">
            <span className="font-semibold">{when}</span>
            <span className="text-muted">{what}</span>
          </li>
        ))}
      </ol>
      <p className="type-small text-muted bg-plaster rounded-[var(--radius-sm)] p-4">{s.concept}</p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/projects" variant="secondary">
          {s.projects}
        </ButtonLink>
        <ButtonLink href="/" variant="outline">
          {s.home}
        </ButtonLink>
      </div>
    </div>
  );
}
