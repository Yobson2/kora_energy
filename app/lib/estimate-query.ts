import {
  INDEPENDENCE,
  LOCATIONS,
  SEGMENTS,
  type Independence,
  type Location,
  type Segment,
} from "@/app/lib/solar/assumptions";
import { SOLUTION_SLUGS, type SolutionSlug } from "@/app/lib/domain";
import { parseAmount } from "@/app/lib/parse";

/**
 * Carries a visitor's inputs between the homepage preview, the calculator and
 * the quote form as URL parameters. Shareable, bookmarkable, and the back
 * button works  no hidden client state to lose. Everything read back is
 * validated against the known values; anything unexpected is dropped.
 */

export type EstimateQuery = {
  segment?: Segment;
  location?: Location;
  independence?: Independence;
  solution?: SolutionSlug;
  monthlyBillXof?: number;
  monthlyKwh?: number;
  roofAreaM2?: number;
  generatorHoursPerWeek?: number;
};

const KEYS = {
  monthlyBillXof: "bill",
  monthlyKwh: "kwh",
  roofAreaM2: "roof",
  generatorHoursPerWeek: "gen",
} as const;

function oneOf<T extends string>(values: readonly T[], raw: string | null): T | undefined {
  return raw && (values as readonly string[]).includes(raw) ? (raw as T) : undefined;
}

export function toEstimateQuery(query: EstimateQuery, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams();
  if (query.segment) params.set("segment", query.segment);
  if (query.location) params.set("location", query.location);
  if (query.independence) params.set("independence", query.independence);
  if (query.solution) params.set("solution", query.solution);
  for (const [field, key] of Object.entries(KEYS) as Array<[keyof typeof KEYS, string]>) {
    const value = query[field];
    if (value !== undefined) params.set(key, String(value));
  }
  for (const [k, v] of Object.entries(extra)) params.set(k, v);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function fromEstimateQuery(params: { get(key: string): string | null }): EstimateQuery {
  const positive = (key: string) => {
    const value = parseAmount(params.get(key));
    return value !== undefined && value >= 0 ? value : undefined;
  };
  return {
    segment: oneOf(SEGMENTS, params.get("segment")),
    location: oneOf(LOCATIONS, params.get("location")),
    independence: oneOf(INDEPENDENCE, params.get("independence")),
    solution: oneOf(SOLUTION_SLUGS, params.get("solution")),
    monthlyBillXof: positive(KEYS.monthlyBillXof),
    monthlyKwh: positive(KEYS.monthlyKwh),
    roofAreaM2: positive(KEYS.roofAreaM2),
    generatorHoursPerWeek: positive(KEYS.generatorHoursPerWeek),
  };
}
