/**
 * Input schemas. Imported by BOTH the browser forms (instant field errors) and
 * the API routes (the authoritative check). One definition means the client
 * and server can never disagree about what "valid" means.
 */
import { z } from "zod";
import { INDEPENDENCE, LOCATIONS, SEGMENTS } from "@/app/lib/solar/assumptions";
import { CONTACT_TOPICS, LEAD_STATUSES, SOLUTION_SLUGS, TIMELINES } from "@/app/lib/domain";

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);

const name = text(80).min(2, "Enter your name.");
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .pipe(z.email("Enter an email address like name@company.com."));

/** International format, lenient on spacing: "+225 07 00 00 00 00". */
const phone = z
  .string()
  .trim()
  .regex(
    /^\+?[0-9 ().-]{8,20}$/,
    "Enter a phone number with its country code, like +225 07 00 00 00 00."
  );

const optionalText = (max: number) =>
  text(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const amount = (label: string, min: number, max: number) =>
  z
    .number({ error: `Enter ${label} as a number.` })
    .finite()
    .min(min, `${label[0]!.toUpperCase()}${label.slice(1)} looks too low — check the figure.`)
    .max(max, `${label[0]!.toUpperCase()}${label.slice(1)} looks too high — check the figure.`);

/**
 * Honeypot. Hidden from people with CSS and from assistive tech with
 * aria-hidden; bots that fill every field reveal themselves. Accepted as any
 * string so a bot gets a normal-looking success and learns nothing.
 */
const honeypot = z.string().max(200).optional();

/* ── calculator ─────────────────────────────────────────────────────────── */

export const estimateInputSchema = z
  .object({
    segment: z.enum(SEGMENTS, { error: "Choose the type of site." }),
    location: z.enum(LOCATIONS, { error: "Choose a location." }),
    independence: z.enum(INDEPENDENCE, { error: "Choose what matters most." }),
    monthlyBillXof: amount("the monthly bill", 5_000, 500_000_000).optional(),
    monthlyKwh: amount("monthly consumption", 30, 5_000_000).optional(),
    roofAreaM2: amount("the available area", 5, 200_000).optional(),
    generatorHoursPerWeek: z
      .number()
      .min(0)
      .max(168, "There are only 168 hours in a week.")
      .optional(),
  })
  .refine((v) => v.monthlyBillXof !== undefined || v.monthlyKwh !== undefined, {
    message: "Enter your monthly bill, your monthly consumption, or both.",
    path: ["monthlyBillXof"],
  });

export type EstimateInputData = z.infer<typeof estimateInputSchema>;

/* ── quote request (multi-step) ─────────────────────────────────────────── */

export const quoteSiteSchema = z.object({
  segment: z.enum(SEGMENTS, { error: "Choose the type of site." }),
  location: z.enum(LOCATIONS, { error: "Choose where the site is." }),
  solution: z.enum(SOLUTION_SLUGS, { error: "Choose the solution closest to what you need." }),
  timeline: z.enum(TIMELINES, { error: "Choose a timeline." }),
});

export const quoteEnergySchema = z
  .object({
    monthlyBillXof: amount("the monthly bill", 5_000, 500_000_000).optional(),
    monthlyKwh: amount("monthly consumption", 30, 5_000_000).optional(),
    generatorHoursPerWeek: z
      .number()
      .min(0)
      .max(168, "There are only 168 hours in a week.")
      .optional(),
    roofAreaM2: amount("the available area", 5, 200_000).optional(),
  })
  .refine((v) => v.monthlyBillXof !== undefined || v.monthlyKwh !== undefined, {
    message: "Enter your monthly bill, your consumption, or both — a recent bill has both.",
    path: ["monthlyBillXof"],
  });

export const quoteContactSchema = z.object({
  name,
  company: optionalText(120),
  email,
  phone,
  message: optionalText(2000),
  consent: z.literal(true, { error: "Tick the box so we can use these details to reply." }),
});

export const quoteRequestSchema = z.object({
  site: quoteSiteSchema,
  energy: quoteEnergySchema,
  contact: quoteContactSchema,
  independence: z.enum(INDEPENDENCE).optional(),
  /** Where the visitor started, so the team knows the calculator brought them. */
  origin: z.enum(["quote", "calculator"]).optional(),
  website: honeypot,
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

/* ── contact ────────────────────────────────────────────────────────────── */

export const contactSchema = z.object({
  name,
  email,
  phone: phone.optional().or(z.literal("").transform(() => undefined)),
  company: optionalText(120),
  topic: z.enum(CONTACT_TOPICS, { error: "Choose what your message is about." }),
  message: text(2000).min(20, "Tell us a little more — at least 20 characters."),
  consent: z.literal(true, { error: "Tick the box so we can use these details to reply." }),
  website: honeypot,
});

export type ContactRequest = z.infer<typeof contactSchema>;

/* ── back office ────────────────────────────────────────────────────────── */

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
