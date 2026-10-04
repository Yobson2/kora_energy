/**
 * The business vocabulary, shared by the public site, the API and the back
 * office. If a word means something to the Kora team ("lead", "site visit",
 * "proposal"), it is defined here once.
 */
import type { Independence, Location, Segment } from "@/app/lib/solar/assumptions";

export const SOLUTION_SLUGS = [
  "business",
  "commercial",
  "industrial",
  "residential",
  "backup",
  "monitoring",
] as const;
export type SolutionSlug = (typeof SOLUTION_SLUGS)[number];

export const TIMELINES = ["asap", "3-months", "6-months", "exploring"] as const;
export type Timeline = (typeof TIMELINES)[number];

export const TIMELINE_LABEL: Record<Timeline, string> = {
  asap: "As soon as possible",
  "3-months": "Within 3 months",
  "6-months": "Within 6 months",
  exploring: "Just exploring",
};

export const LEAD_SOURCES = ["quote", "contact", "calculator"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  quote: "Quote request",
  contact: "Contact form",
  calculator: "Calculator",
};

/**
 * The sales pipeline, in order. A lead moves forward through these; `lost`
 * can be reached from anywhere. `won` is what makes a lead a customer
 * there is no separate customer table to fall out of sync.
 */
export const LEAD_STATUSES = ["new", "contacted", "site-visit", "proposal", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  "site-visit": "Site visit",
  proposal: "Proposal sent",
  won: "Won",
  lost: "Lost",
};

export const OPEN_STATUSES: readonly LeadStatus[] = ["new", "contacted", "site-visit", "proposal"];

export const CONTACT_TOPICS = ["sales", "project", "support", "partnership", "other"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const CONTACT_TOPIC_LABEL: Record<ContactTopic, string> = {
  sales: "A new installation",
  project: "An installation in progress",
  support: "Support for an existing system",
  partnership: "Partnerships and suppliers",
  other: "Something else",
};

/** A frozen copy of the calculator result the visitor saw, recomputed server-side. */
export type EstimateSnapshot = {
  independence: Independence;
  systemKwp: number;
  batteryKwh: number;
  solarShare: number;
  monthlySavingsXof: number;
  investmentMidXof: number;
  paybackLowYears: number;
  paybackHighYears: number;
};

export type Activity = {
  id: string;
  at: string;
  kind: "created" | "status" | "note";
  text: string;
  by: string;
};

export type Lead = {
  id: string;
  /** Human-friendly, quotable on the phone: "KE-2610-4F7Q". */
  reference: string;
  createdAt: string;
  updatedAt: string;
  source: LeadSource;
  status: LeadStatus;
  contact: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  site: {
    segment?: Segment;
    location?: Location;
    solution?: SolutionSlug;
    timeline?: Timeline;
    monthlyKwh?: number;
    monthlyBillXof?: number;
    generatorHoursPerWeek?: number;
    roofAreaM2?: number;
  };
  topic?: ContactTopic;
  message?: string;
  estimate?: EstimateSnapshot;
  activity: Activity[];
  consentAt: string;
  /** Seeded demonstration data, shown with a marker in the back office. */
  demo?: boolean;
};

export type ProjectResult = { label: string; value: string };

/** The words of a case study, as opposed to its figures. */
export type ProjectCopy = {
  title: string;
  client: string;
  area: string;
  summary: string;
  challenge: string;
  approach: string;
  results: ProjectResult[];
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  /** Who it is for, without naming anyone: "Business hotel, 84 rooms". */
  client: string;
  segment: Segment;
  location: Location;
  /** District or area, for flavour. Never a street address. */
  area: string;
  year: number;
  systemKwp: number;
  batteryKwh: number;
  annualProductionKwh: number;
  solarShare: number;
  co2TonnesPerYear: number;
  summary: string;
  challenge: string;
  approach: string;
  results: ProjectResult[];
  /** Usable roof footprint, metres. Drives the generated roof-plan drawing. */
  roof: { width: number; depth: number };
  /**
   * The case study's words in other languages; the fields above are English.
   * Only seeded studies carry one, and editing the English in the back office
   * removes it (server/projects.ts), so a translation is never out of date.
   */
  translations?: { fr?: ProjectCopy };
  published: boolean;
  featured: boolean;
  updatedAt: string;
};
