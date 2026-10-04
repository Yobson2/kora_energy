import {
  BATTERY_PRICE_XOF_PER_KWH,
  BATTERY_ROUND_TRIP,
  DEFAULT_TARIFF_XOF,
  GENERATOR_COST_XOF_PER_KWH,
  GRID_KG_CO2_PER_KWH,
  INDEPENDENCE_RULES,
  KWP_STEP,
  LOAD_SHAPE,
  LOCATION,
  MIN_SYSTEM_KWP,
  PANEL_WATTS,
  PV_PRICE_XOF_PER_KWP,
  ROOF_M2_PER_KWP,
  SOLAR_SHAPE,
  TARIFF_BOUNDS_XOF,
  UNCERTAINTY,
  WEATHER_DAYS,
  tariffClass,
  type Independence,
  type Location,
  type Segment,
} from "./assumptions";

/**
 * The solar estimator.
 *
 * Pure and synchronous: it runs identically in the browser (instant feedback
 * as the visitor types) and on the server (the API recomputes from the raw
 * inputs, so a lead's stored estimate can never be a value the client made
 * up). It has no knowledge of React, HTTP or storage.
 *
 * Method, in one paragraph: scale the site's typical daily load shape to the
 * visitor's consumption; simulate an average day hour by hour with a given
 * array and battery; and choose the LARGEST array whose output is still mostly
 * used on site. Bigger than that and the extra panels mostly produce energy
 * nobody uses, because there is no general export tariff to sell it back.
 */

export type EstimateInput = {
  segment: Segment;
  location: Location;
  independence: Independence;
  /** Monthly electricity bill in FCFA. At least one of bill/consumption is required. */
  monthlyBillXof?: number;
  /** Monthly consumption in kWh. */
  monthlyKwh?: number;
  /** Usable roof or ground area in m². Omitted means "not a constraint". */
  roofAreaM2?: number;
  /** Hours per week the site currently runs a generator. */
  generatorHoursPerWeek?: number;
};

export type HourPoint = {
  hour: number;
  load: number;
  solar: number;
  /** Solar used as it is produced. */
  direct: number;
  /** Delivered from the battery. */
  battery: number;
  /** Still bought from the grid (or generator). */
  grid: number;
};

export type Estimate = {
  /** Inputs after defaults were applied  what the numbers actually rest on. */
  basis: {
    monthlyKwh: number;
    tariffXof: number;
    tariffSource: "derived" | "default";
    yieldKwhPerKwp: number;
  };
  systemKwp: number;
  panelCount: number;
  batteryKwh: number;
  roofAreaM2: number;
  limitedByRoof: boolean;
  annualProductionKwh: number;
  /** Share of the site's annual consumption met by solar (direct + via battery). */
  solarShare: number;
  /** Share of produced solar that is used on site. */
  selfUse: number;
  monthlySavingsXof: number;
  annualSavingsXof: number;
  investmentXof: { low: number; mid: number; high: number };
  paybackYears: { low: number; high: number };
  co2TonnesPerYear: number;
  day: HourPoint[];
};

/**
 * Inputs the estimator cannot size a system from. `code` is stable, so the
 * interface can say it in the visitor's language; `message` is English, for
 * the API and logs.
 */
export class EstimateInputError extends Error {
  constructor(
    readonly code: "no-consumption" | "area-too-small",
    message: string
  ) {
    super(message);
  }
}

const sum = (values: readonly number[]) => values.reduce((total, v) => total + v, 0);

const normalise = (values: readonly number[]) => {
  const total = sum(values);
  return values.map((v) => v / total);
};

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

/** Rounds money to a precision a person would quote, not to the franc. */
export function roundMoney(xof: number): number {
  if (xof >= 10_000_000) return roundTo(xof, 100_000);
  if (xof >= 1_000_000) return roundTo(xof, 10_000);
  return roundTo(xof, 1_000);
}

export function resolveConsumption(input: EstimateInput): Estimate["basis"] {
  const defaultTariff = DEFAULT_TARIFF_XOF[tariffClass(input.segment)];
  const { monthlyBillXof: bill, monthlyKwh: kwh } = input;

  if (kwh && bill) {
    const derived = bill / kwh;
    const tariff = Math.min(TARIFF_BOUNDS_XOF.max, Math.max(TARIFF_BOUNDS_XOF.min, derived));
    return {
      monthlyKwh: kwh,
      tariffXof: Math.round(tariff),
      tariffSource: "derived",
      yieldKwhPerKwp: LOCATION[input.location].yieldKwhPerKwp,
    };
  }
  if (kwh) {
    return {
      monthlyKwh: kwh,
      tariffXof: defaultTariff,
      tariffSource: "default",
      yieldKwhPerKwp: LOCATION[input.location].yieldKwhPerKwp,
    };
  }
  if (bill) {
    return {
      monthlyKwh: Math.round(bill / defaultTariff),
      tariffXof: defaultTariff,
      tariffSource: "default",
      yieldKwhPerKwp: LOCATION[input.location].yieldKwhPerKwp,
    };
  }
  throw new EstimateInputError("no-consumption", "Enter a monthly bill or a monthly consumption.");
}

/**
 * Simulates one average day. The battery's state of charge carries across a
 * warm-up day so the evening it enters with is realistic, not "full by magic".
 */
export function simulateDay(
  dailyLoadKwh: number,
  loadShape: readonly number[],
  dailySolarKwh: number,
  batteryKwh: number
): HourPoint[] {
  const load = normalise(loadShape).map((v) => v * dailyLoadKwh);
  const solar = normalise(SOLAR_SHAPE).map((v) => v * dailySolarKwh);
  const chargeEff = Math.sqrt(BATTERY_ROUND_TRIP);

  let soc = 0;
  let points: HourPoint[] = [];

  for (let pass = 0; pass < 2; pass++) {
    points = [];
    for (let hour = 0; hour < 24; hour++) {
      const l = load[hour]!;
      const s = solar[hour]!;
      const direct = Math.min(l, s);
      const surplus = s - direct;
      const deficit = l - direct;

      soc = Math.min(batteryKwh, soc + surplus * chargeEff);
      const fromBattery = Math.min(deficit, soc * chargeEff);
      soc -= fromBattery / chargeEff;

      points.push({
        hour,
        load: l,
        solar: s,
        direct,
        battery: fromBattery,
        grid: deficit - fromBattery,
      });
    }
  }
  return points;
}

function pvPricePerKwp(kwp: number): number {
  return (PV_PRICE_XOF_PER_KWP.find((tier) => kwp <= tier.upToKwp) ?? PV_PRICE_XOF_PER_KWP[2])
    .price;
}

export function estimate(input: EstimateInput): Estimate {
  const basis = resolveConsumption(input);
  const rules = INDEPENDENCE_RULES[input.independence];
  const shape = LOAD_SHAPE[input.segment];

  const dailyLoad = (basis.monthlyKwh * 12) / 365;
  const dailyYieldPerKwp = basis.yieldKwhPerKwp / 365;
  const batteryKwh = roundTo(dailyLoad * rules.batteryShare, 1);

  const roofCapKwp =
    input.roofAreaM2 !== undefined
      ? Math.floor(input.roofAreaM2 / ROOF_M2_PER_KWP / KWP_STEP) * KWP_STEP
      : Infinity;

  const used = (day: HourPoint[]) => sum(day.map((p) => p.direct + p.battery));

  // Solar energy actually used on an average day, weighted across day types.
  const meanFactor = sum(WEATHER_DAYS.map((d) => d.factor * d.weight));
  const usedAcrossWeather = (kwp: number) =>
    sum(
      WEATHER_DAYS.map((d) => {
        const solar = (kwp * dailyYieldPerKwp * d.factor) / meanFactor;
        return d.weight * used(simulateDay(dailyLoad, shape, solar, batteryKwh));
      })
    );

  // Grow the array in half-kWp steps while it still pays its way. The search
  // is bounded by the point where the array alone would produce three times
  // the site's need  far beyond anything the self-use rule would accept.
  const ceiling = Math.max(MIN_SYSTEM_KWP, (3 * dailyLoad) / dailyYieldPerKwp);
  let economicKwp = MIN_SYSTEM_KWP;
  for (let kwp = MIN_SYSTEM_KWP; kwp <= ceiling; kwp += KWP_STEP) {
    const selfUse = usedAcrossWeather(kwp) / (kwp * dailyYieldPerKwp);
    if (selfUse < rules.minSelfUse) break;
    economicKwp = kwp;
  }

  const limitedByRoof = roofCapKwp < economicKwp;
  const systemKwp = Math.max(Math.min(economicKwp, roofCapKwp), 0);

  if (systemKwp < MIN_SYSTEM_KWP) {
    throw new EstimateInputError(
      "area-too-small",
      `The available area fits less than ${MIN_SYSTEM_KWP} kWp of panels. Enter a larger area, or leave it blank if you are not sure.`
    );
  }

  // `day` is the illustrative average day drawn in charts. Money and coverage
  // come from the weather-weighted figure, which is the honest one.
  const day = simulateDay(dailyLoad, shape, systemKwp * dailyYieldPerKwp, batteryKwh);
  const dailySolarUsed = usedAcrossWeather(systemKwp);
  const annualProductionKwh = systemKwp * basis.yieldKwhPerKwp;

  const gridSavingsYear = dailySolarUsed * 365 * basis.tariffXof;
  const generatorKwhYear = ((input.generatorHoursPerWeek ?? 0) * 52 * dailyLoad) / 24;
  const generatorSavingsYear =
    generatorKwhYear * rules.outageCover * (GENERATOR_COST_XOF_PER_KWH - basis.tariffXof);
  const annualSavings = gridSavingsYear + Math.max(0, generatorSavingsYear);

  const investment = systemKwp * pvPricePerKwp(systemKwp) + batteryKwh * BATTERY_PRICE_XOF_PER_KWH;

  const round1 = (v: number) => Math.round(v * 10) / 10;

  return {
    basis,
    systemKwp,
    panelCount: Math.ceil((systemKwp * 1000) / PANEL_WATTS),
    batteryKwh,
    roofAreaM2: Math.ceil(systemKwp * ROOF_M2_PER_KWP),
    limitedByRoof,
    annualProductionKwh: Math.round(annualProductionKwh),
    solarShare: dailySolarUsed / dailyLoad,
    selfUse: dailySolarUsed / (systemKwp * dailyYieldPerKwp),
    monthlySavingsXof: roundMoney(annualSavings / 12),
    annualSavingsXof: roundMoney(annualSavings),
    investmentXof: {
      low: roundMoney(investment * (1 - UNCERTAINTY)),
      mid: roundMoney(investment),
      high: roundMoney(investment * (1 + UNCERTAINTY)),
    },
    paybackYears: {
      // Best case: cheap install, savings at the top of the range.
      low: round1((investment * (1 - UNCERTAINTY)) / (annualSavings * (1 + UNCERTAINTY))),
      high: round1((investment * (1 + UNCERTAINTY)) / (annualSavings * (1 - UNCERTAINTY))),
    },
    co2TonnesPerYear: round1((dailySolarUsed * 365 * GRID_KG_CO2_PER_KWH) / 1000),
    day,
  };
}
