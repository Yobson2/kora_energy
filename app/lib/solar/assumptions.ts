/**
 * Every number the estimator depends on, in one place, with its reasoning.
 *
 * These are planning assumptions for a CONCEPT product, deliberately
 * conservative and round. They are surfaced to the visitor on the calculator
 * page ("How this estimate works"), so nothing in the result is a black box.
 * A real deployment would source them from survey data and live supplier
 * pricing, and they would live in the database rather than in code.
 */

export const SEGMENTS = [
  "office",
  "hotel",
  "restaurant",
  "school",
  "clinic",
  "retail",
  "industrial",
  "household",
] as const;

export type Segment = (typeof SEGMENTS)[number];

export const SEGMENT_LABEL: Record<Segment, string> = {
  office: "Office",
  hotel: "Hotel or guesthouse",
  restaurant: "Restaurant or café",
  school: "School",
  clinic: "Clinic or pharmacy",
  retail: "Shop or supermarket",
  industrial: "Workshop or factory",
  household: "Home",
};

export const LOCATIONS = [
  "abidjan",
  "yamoussoukro",
  "bouake",
  "san-pedro",
  "korhogo",
  "daloa",
  "other",
] as const;

export type Location = (typeof LOCATIONS)[number];

/**
 * Specific yield in kWh produced per kWp installed per year, AFTER typical
 * system losses (heat, soiling, wiring, inverter). Irradiance rises from the
 * humid coast towards the drier north, which is why Korhogo sits well above
 * Abidjan. "other" is a cautious regional figure for elsewhere in West Africa.
 */
export const LOCATION: Record<Location, { label: string; yieldKwhPerKwp: number }> = {
  abidjan: { label: "Abidjan", yieldKwhPerKwp: 1300 },
  "san-pedro": { label: "San-Pédro", yieldKwhPerKwp: 1280 },
  daloa: { label: "Daloa", yieldKwhPerKwp: 1380 },
  yamoussoukro: { label: "Yamoussoukro", yieldKwhPerKwp: 1400 },
  bouake: { label: "Bouaké", yieldKwhPerKwp: 1450 },
  korhogo: { label: "Korhogo", yieldKwhPerKwp: 1550 },
  other: { label: "Elsewhere in West Africa", yieldKwhPerKwp: 1350 },
};

export const INDEPENDENCE = ["savings", "balanced", "maximum"] as const;
export type Independence = (typeof INDEPENDENCE)[number];

/**
 * The three ambitions a customer can pick, expressed as engineering rules:
 *
 *  - batteryShare: usable storage as a share of the average DAILY load.
 *  - minSelfUse:   the system is sized as large as possible while at least this
 *                  share of what the panels produce is actually used on site.
 *                  Côte d'Ivoire has no general net-metering scheme, so energy
 *                  that is not used (or stored) is wasted money.
 *  - outageCover:  the share of generator hours that solar + storage replaces.
 */
export const INDEPENDENCE_RULES: Record<
  Independence,
  { label: string; summary: string; batteryShare: number; minSelfUse: number; outageCover: number }
> = {
  savings: {
    label: "Lower my bill",
    summary: "Panels only. Sized to the daytime load, the fastest payback.",
    batteryShare: 0,
    minSelfUse: 0.9,
    outageCover: 0.15,
  },
  balanced: {
    label: "Savings and backup",
    summary: "Panels plus a battery that carries the evening and short outages.",
    batteryShare: 0.3,
    minSelfUse: 0.85,
    outageCover: 0.6,
  },
  maximum: {
    label: "Maximum independence",
    summary: "A larger battery that keeps the site running through most cuts.",
    batteryShare: 0.65,
    minSelfUse: 0.78,
    outageCover: 0.9,
  },
};

/**
 * A year is not one average day. Sizing against the average alone is
 * optimistic twice over: clear days overflow a small battery (energy wasted)
 * and grey rainy-season days leave it empty. The estimator simulates each day
 * type and weights the results. Factors are relative to the annual mean and
 * are renormalised in code, so the yield figures above stay authoritative.
 */
export const WEATHER_DAYS = [
  { label: "clear", factor: 1.2, weight: 0.5 },
  { label: "hazy", factor: 0.9, weight: 0.3 },
  { label: "overcast", factor: 0.45, weight: 0.2 },
] as const;

/** Grid tariffs (FCFA per kWh, taxes included) used when only one of bill/consumption is known. */
export const DEFAULT_TARIFF_XOF: Record<"household" | "business" | "industrial", number> = {
  household: 85,
  business: 110,
  industrial: 85,
};

/** Bounds applied to a tariff derived from bill ÷ consumption, to absorb typos. */
export const TARIFF_BOUNDS_XOF = { min: 50, max: 250 };

/** Installed price of the PV part (panels, inverters, mounting, labour), FCFA per kWp. */
export const PV_PRICE_XOF_PER_KWP = [
  { upToKwp: 20, price: 560_000 },
  { upToKwp: 100, price: 500_000 },
  { upToKwp: Infinity, price: 440_000 },
] as const;

/** Installed price of lithium iron phosphate storage, FCFA per usable kWh. */
export const BATTERY_PRICE_XOF_PER_KWH = 260_000;
export const BATTERY_ROUND_TRIP = 0.9;

/** Generator energy cost: diesel at ~0.3 L/kWh plus servicing. */
export const GENERATOR_COST_XOF_PER_KWH = 300;

export const PANEL_WATTS = 550;
/** Roof area per kWp including maintenance walkways and edge setbacks. */
export const ROOF_M2_PER_KWP = 6.5;
export const MIN_SYSTEM_KWP = 3;
export const KWP_STEP = 0.5;

/** Grid emission factor for Côte d'Ivoire (gas-dominated mix), kg CO₂ per kWh. */
export const GRID_KG_CO2_PER_KWH = 0.45;

/** Spread applied to price and savings, because a desk estimate is not a survey. */
export const UNCERTAINTY = 0.15;

/**
 * The sun's shape over a day, hour by hour (00:00–23:00). Near the equator
 * day length barely changes through the year: sunrise ≈ 06:10, sunset ≈ 18:20.
 */
export const SOLAR_SHAPE: readonly number[] = Array.from({ length: 24 }, (_, hour) => {
  const t = (hour + 0.5 - 6.2) / 12.2;
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) ** 1.3;
});

/** Builds a 24-value profile from a base level plus [from, to, level] blocks. */
function profile(base: number, blocks: Array<[number, number, number]>): number[] {
  const values = Array.from({ length: 24 }, () => base);
  for (const [from, to, level] of blocks) {
    for (let h = from; h < to; h++) values[h] = level;
  }
  return values;
}

/**
 * Typical hourly load shapes. Only the SHAPE matters (they are normalised);
 * the visitor's own consumption sets the scale. The shape is what decides how
 * much solar a site can use directly: a school is almost all daytime, a hotel
 * peaks after dark.
 */
export const LOAD_SHAPE: Record<Segment, number[]> = {
  office: profile(0.22, [
    [7, 8, 0.6],
    [8, 18, 1],
    [18, 20, 0.45],
  ]),
  hotel: profile(0.62, [
    [6, 10, 0.9],
    [10, 17, 0.72],
    [17, 18, 0.85],
    [18, 23, 1],
  ]),
  restaurant: profile(0.28, [
    [9, 11, 0.6],
    [11, 15, 0.95],
    [15, 18, 0.6],
    [18, 23, 1],
  ]),
  school: profile(0.1, [
    [7, 16, 1],
    [16, 18, 0.35],
  ]),
  clinic: profile(0.6, [
    [7, 19, 1],
    [19, 22, 0.75],
  ]),
  retail: profile(0.32, [
    [8, 20, 1],
    [20, 21, 0.55],
  ]),
  industrial: profile(0.35, [[6, 22, 1]]),
  household: profile(0.45, [
    [6, 8, 0.65],
    [8, 17, 0.4],
    [17, 18, 0.7],
    [18, 23, 1],
  ]),
};

export function tariffClass(segment: Segment): keyof typeof DEFAULT_TARIFF_XOF {
  if (segment === "household") return "household";
  if (segment === "industrial") return "industrial";
  return "business";
}
