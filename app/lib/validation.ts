/**
 * Input schemas. Imported by BOTH the browser forms (instant field errors) and
 * the API routes (the authoritative check). One definition means the client
 * and server can never disagree about what "valid" means.
 *
 * The public forms speak the visitor's language, so their schemas are built
 * once per locale from a message table: same rules, different words. The
 * plain exports (`quoteRequestSchema`…) are the English build; forms and
 * public routes use `publicSchemas(locale)`. The back office is English.
 */
import { z } from "zod";
import { INDEPENDENCE, LOCATIONS, SEGMENTS } from "@/app/lib/solar/assumptions";
import { CONTACT_TOPICS, LEAD_STATUSES, SOLUTION_SLUGS, TIMELINES } from "@/app/lib/domain";
import { LOCALES, type Locale } from "@/app/lib/i18n";

type Amount = "bill" | "consumption" | "area";

type Messages = {
  tooLong: (max: number) => string;
  name: string;
  email: string;
  phone: string;
  amountLabel: Record<Amount, string>;
  notNumber: (label: string) => string;
  tooLow: (label: string) => string;
  tooHigh: (label: string) => string;
  hours: string;
  negativeHours: string;
  segment: string;
  location: string;
  siteLocation: string;
  independence: string;
  solution: string;
  timeline: string;
  estimateEnergy: string;
  quoteEnergy: string;
  consent: string;
  topic: string;
  message: string;
};

const capitalise = (text: string) => `${text[0]!.toUpperCase()}${text.slice(1)}`;

const MESSAGES: Record<Locale, Messages> = {
  en: {
    tooLong: (max) => `Keep this under ${max} characters.`,
    name: "Enter your name.",
    email: "Enter an email address like name@company.com.",
    phone: "Enter a phone number with its country code, like +225 07 00 00 00 00.",
    amountLabel: {
      bill: "the monthly bill",
      consumption: "monthly consumption",
      area: "the available area",
    },
    notNumber: (label) => `Enter ${label} as a number.`,
    tooLow: (label) => `${capitalise(label)} looks too low. Check the figure.`,
    tooHigh: (label) => `${capitalise(label)} looks too high. Check the figure.`,
    hours: "There are only 168 hours in a week.",
    negativeHours: "Enter a number of hours, or leave it blank.",
    segment: "Choose the type of site.",
    location: "Choose a location.",
    siteLocation: "Choose where the site is.",
    independence: "Choose what matters most.",
    solution: "Choose the solution closest to what you need.",
    timeline: "Choose a timeline.",
    estimateEnergy: "Enter your monthly bill, your monthly consumption, or both.",
    quoteEnergy: "Enter your monthly bill, your consumption, or both. A recent bill has both.",
    consent: "Tick the box so we can use these details to reply.",
    topic: "Choose what your message is about.",
    message: "Tell us a little more: at least 20 characters.",
  },
  fr: {
    tooLong: (max) => `Restez sous ${max} caractères.`,
    name: "Saisissez votre nom.",
    email: "Saisissez une adresse e-mail comme nom@entreprise.com.",
    phone: "Saisissez un numéro avec l'indicatif du pays, comme +225 07 00 00 00 00.",
    amountLabel: {
      bill: "la facture mensuelle",
      consumption: "la consommation mensuelle",
      area: "la surface disponible",
    },
    notNumber: (label) => `Saisissez ${label} en chiffres.`,
    // All three labels are feminine, so the agreement is fixed.
    tooLow: (label) => `${capitalise(label)} semble trop faible. Vérifiez le chiffre.`,
    tooHigh: (label) => `${capitalise(label)} semble trop élevée. Vérifiez le chiffre.`,
    hours: "Une semaine ne compte que 168 heures.",
    negativeHours: "Saisissez un nombre d'heures, ou laissez le champ vide.",
    segment: "Choisissez le type de site.",
    location: "Choisissez un lieu.",
    siteLocation: "Choisissez où se trouve le site.",
    independence: "Choisissez ce qui compte le plus.",
    solution: "Choisissez la solution la plus proche de votre besoin.",
    timeline: "Choisissez un délai.",
    estimateEnergy: "Saisissez votre facture mensuelle, votre consommation mensuelle, ou les deux.",
    quoteEnergy:
      "Saisissez votre facture mensuelle, votre consommation, ou les deux. Une facture récente indique les deux.",
    consent: "Cochez la case pour que nous puissions utiliser ces informations pour vous répondre.",
    topic: "Choisissez l'objet de votre message.",
    message: "Dites-nous en un peu plus : au moins 20 caractères.",
  },
};

/** Field rules shared by the public forms and the back office. */
function fields(m: Messages) {
  const text = (max: number) => z.string().trim().max(max, m.tooLong(max));
  const optionalText = (max: number) =>
    text(max)
      .optional()
      .transform((v) => (v ? v : undefined));
  const email = z.string().trim().toLowerCase().max(120, m.tooLong(120)).pipe(z.email(m.email));
  /** International format, lenient on spacing: "+225 07 00 00 00 00". */
  const phone = z
    .string()
    .trim()
    .regex(/^\+?[0-9 ().-]{8,20}$/, m.phone);
  const amount = (kind: Amount, min: number, max: number) => {
    const label = m.amountLabel[kind];
    return z
      .number({ error: m.notNumber(label) })
      .finite()
      .min(min, m.tooLow(label))
      .max(max, m.tooHigh(label));
  };
  const generatorHours = z.number().min(0, m.negativeHours).max(168, m.hours);
  const name = text(80).min(2, m.name);
  return { text, optionalText, email, phone, amount, generatorHours, name };
}

/**
 * Honeypot. Hidden from people with CSS and from assistive tech with
 * aria-hidden; bots that fill every field reveal themselves. Accepted as any
 * string so a bot gets a normal-looking success and learns nothing.
 */
const honeypot = z.string().max(200).optional();

function buildPublicSchemas(m: Messages) {
  const f = fields(m);

  /* ── calculator ─────────────────────────────────────────────────────── */

  const estimateInputSchema = z
    .object({
      segment: z.enum(SEGMENTS, { error: m.segment }),
      location: z.enum(LOCATIONS, { error: m.location }),
      independence: z.enum(INDEPENDENCE, { error: m.independence }),
      monthlyBillXof: f.amount("bill", 5_000, 500_000_000).optional(),
      monthlyKwh: f.amount("consumption", 30, 5_000_000).optional(),
      roofAreaM2: f.amount("area", 5, 200_000).optional(),
      generatorHoursPerWeek: f.generatorHours.optional(),
    })
    .refine((v) => v.monthlyBillXof !== undefined || v.monthlyKwh !== undefined, {
      message: m.estimateEnergy,
      path: ["monthlyBillXof"],
    });

  /* ── quote request (multi-step) ─────────────────────────────────────── */

  const quoteSiteSchema = z.object({
    segment: z.enum(SEGMENTS, { error: m.segment }),
    location: z.enum(LOCATIONS, { error: m.siteLocation }),
    solution: z.enum(SOLUTION_SLUGS, { error: m.solution }),
    timeline: z.enum(TIMELINES, { error: m.timeline }),
  });

  const quoteEnergySchema = z
    .object({
      monthlyBillXof: f.amount("bill", 5_000, 500_000_000).optional(),
      monthlyKwh: f.amount("consumption", 30, 5_000_000).optional(),
      generatorHoursPerWeek: f.generatorHours.optional(),
      roofAreaM2: f.amount("area", 5, 200_000).optional(),
    })
    .refine((v) => v.monthlyBillXof !== undefined || v.monthlyKwh !== undefined, {
      message: m.quoteEnergy,
      path: ["monthlyBillXof"],
    });

  const quoteContactSchema = z.object({
    name: f.name,
    company: f.optionalText(120),
    email: f.email,
    phone: f.phone,
    message: f.optionalText(2000),
    consent: z.literal(true, { error: m.consent }),
  });

  const quoteRequestSchema = z.object({
    site: quoteSiteSchema,
    energy: quoteEnergySchema,
    contact: quoteContactSchema,
    independence: z.enum(INDEPENDENCE).optional(),
    /** Where the visitor started, so the team knows the calculator brought them. */
    origin: z.enum(["quote", "calculator"]).optional(),
    website: honeypot,
  });

  /* ── contact ────────────────────────────────────────────────────────── */

  const contactSchema = z.object({
    name: f.name,
    email: f.email,
    phone: f.phone.optional().or(z.literal("").transform(() => undefined)),
    company: f.optionalText(120),
    topic: z.enum(CONTACT_TOPICS, { error: m.topic }),
    message: f.text(2000).min(20, m.message),
    consent: z.literal(true, { error: m.consent }),
    website: honeypot,
  });

  return {
    estimateInputSchema,
    quoteSiteSchema,
    quoteEnergySchema,
    quoteContactSchema,
    quoteRequestSchema,
    contactSchema,
  };
}

const PUBLIC_SCHEMAS = Object.fromEntries(
  LOCALES.map((l) => [l, buildPublicSchemas(MESSAGES[l])])
) as Record<Locale, ReturnType<typeof buildPublicSchemas>>;

/** The public forms' schemas, with messages in `locale`. */
export function publicSchemas(locale: Locale) {
  return PUBLIC_SCHEMAS[locale];
}

export const {
  estimateInputSchema,
  quoteSiteSchema,
  quoteEnergySchema,
  quoteContactSchema,
  quoteRequestSchema,
  contactSchema,
} = PUBLIC_SCHEMAS.en;

export type EstimateInputData = z.infer<typeof estimateInputSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type ContactRequest = z.infer<typeof contactSchema>;

/* ── back office ────────────────────────────────────────────────────────── */

const { text, email } = fields(MESSAGES.en);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(200),
});

export const leadPatchSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});

export const leadNoteSchema = z.object({
  text: text(2000).min(1, "Write a note first."),
});

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  title: text(120).min(4, "Give the project a title."),
  client: text(120).min(2, "Describe the client without naming them."),
  segment: z.enum(SEGMENTS),
  location: z.enum(LOCATIONS),
  area: text(80).min(2, "Enter a district or area."),
  year: z.number().int().min(2020).max(2035),
  systemKwp: z.number().positive().max(100_000),
  batteryKwh: z.number().min(0).max(100_000),
  annualProductionKwh: z.number().min(0),
  solarShare: z.number().min(0).max(1),
  co2TonnesPerYear: z.number().min(0),
  summary: text(280).min(20, "Write a one- or two-sentence summary."),
  challenge: text(2000).min(20, "Describe the problem the client had."),
  approach: text(2000).min(20, "Describe what was designed."),
  results: z.array(z.object({ label: text(60).min(1), value: text(40).min(1) })).max(6),
  roof: z.object({
    width: z.number().min(4).max(400),
    depth: z.number().min(4).max(400),
  }),
  published: z.boolean(),
  featured: z.boolean(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

/* ── helpers ────────────────────────────────────────────────────────────── */

export type FieldErrors = Record<string, string>;

/** Flattens Zod issues to `{ "contact.email": "Enter an email…" }`, first message per field. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
