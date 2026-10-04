import { describe, expect, it } from "vitest";
import { estimate, EstimateInputError, resolveConsumption, simulateDay } from "./estimate";
import { LOAD_SHAPE, ROOF_M2_PER_KWP, type Segment } from "./assumptions";

const base = {
  segment: "office" as Segment,
  location: "abidjan" as const,
  independence: "savings" as const,
};

describe("resolveConsumption", () => {
  it("derives consumption from the bill with the segment's default tariff", () => {
    const basis = resolveConsumption({ ...base, monthlyBillXof: 1_100_000 });
    expect(basis.monthlyKwh).toBe(10_000);
    expect(basis.tariffSource).toBe("default");
  });

  it("derives the tariff when both bill and consumption are given", () => {
    const basis = resolveConsumption({ ...base, monthlyBillXof: 1_200_000, monthlyKwh: 10_000 });
    expect(basis.tariffXof).toBe(120);
    expect(basis.tariffSource).toBe("derived");
  });

  it("clamps an implausible derived tariff instead of trusting a typo", () => {
    const basis = resolveConsumption({ ...base, monthlyBillXof: 100_000_000, monthlyKwh: 1_000 });
    expect(basis.tariffXof).toBe(250);
  });

  it("rejects input with neither bill nor consumption", () => {
    expect(() => resolveConsumption(base)).toThrow(EstimateInputError);
  });
});

describe("simulateDay", () => {
  it("conserves energy: every kWh of load is met by solar, battery or grid", () => {
    const day = simulateDay(300, LOAD_SHAPE.hotel, 250, 90);
    for (const p of day) {
      expect(p.direct + p.battery + p.grid).toBeCloseTo(p.load, 9);
    }
  });

  it("never delivers more from the battery than solar charged into it", () => {
    const day = simulateDay(300, LOAD_SHAPE.hotel, 250, 90);
    const surplus = day.reduce((t, p) => t + (p.solar - p.direct), 0);
    const delivered = day.reduce((t, p) => t + p.battery, 0);
    expect(delivered).toBeLessThanOrEqual(surplus);
  });

  it("produces nothing at night", () => {
    const day = simulateDay(100, LOAD_SHAPE.office, 80, 0);
    expect(day[2]!.solar).toBe(0);
    expect(day[21]!.solar).toBe(0);
  });
});

describe("estimate", () => {
  const office = { ...base, monthlyBillXof: 2_200_000 };

  it("returns a system that respects the self-use rule", () => {
    const result = estimate(office);
    expect(result.systemKwp).toBeGreaterThan(0);
    expect(result.selfUse).toBeGreaterThanOrEqual(0.9);
    expect(result.batteryKwh).toBe(0);
  });

  it("covers a larger share of a daytime site than an evening one", () => {
    const school = estimate({ ...office, segment: "school" });
    const hotel = estimate({ ...office, segment: "hotel" });
    expect(school.solarShare).toBeGreaterThan(hotel.solarShare);
  });

  it("adds storage and coverage as independence rises", () => {
    const savings = estimate({ ...office, segment: "hotel" });
    const maximum = estimate({ ...office, segment: "hotel", independence: "maximum" });
    expect(maximum.batteryKwh).toBeGreaterThan(0);
    expect(maximum.solarShare).toBeGreaterThan(savings.solarShare);
    expect(maximum.investmentXof.mid).toBeGreaterThan(savings.investmentXof.mid);
  });

  it("yields more in the north than on the coast", () => {
    const abidjan = estimate(office);
    const korhogo = estimate({ ...office, location: "korhogo" });
    expect(korhogo.annualProductionKwh / korhogo.systemKwp).toBeGreaterThan(
      abidjan.annualProductionKwh / abidjan.systemKwp
    );
  });

  it("caps the array at the available roof and says so", () => {
    const unconstrained = estimate(office);
    const roof = Math.floor((unconstrained.systemKwp / 2) * ROOF_M2_PER_KWP);
    const capped = estimate({ ...office, roofAreaM2: roof });
    expect(capped.limitedByRoof).toBe(true);
    expect(capped.roofAreaM2).toBeLessThanOrEqual(roof + ROOF_M2_PER_KWP);
    expect(capped.systemKwp).toBeLessThan(unconstrained.systemKwp);
  });

  it("refuses a roof too small for a minimum system", () => {
    expect(() => estimate({ ...office, roofAreaM2: 5 })).toThrow(EstimateInputError);
  });

  it("values generator hours it replaces", () => {
    const without = estimate({ ...office, independence: "balanced" });
    const withGen = estimate({ ...office, independence: "balanced", generatorHoursPerWeek: 20 });
    expect(withGen.annualSavingsXof).toBeGreaterThan(without.annualSavingsXof);
  });

  it("orders the investment and payback ranges", () => {
    const r = estimate(office);
    expect(r.investmentXof.low).toBeLessThan(r.investmentXof.mid);
    expect(r.investmentXof.mid).toBeLessThan(r.investmentXof.high);
    expect(r.paybackYears.low).toBeLessThan(r.paybackYears.high);
  });

  it("lands in a plausible range for a mid-size Abidjan office", () => {
    // ~20,000 kWh/month office. Payback for commercial PV without storage in
    // the region is commonly quoted at 3–7 years; the estimator must agree.
    const r = estimate({ ...base, monthlyKwh: 20_000 });
    expect(r.paybackYears.low).toBeGreaterThan(2);
    expect(r.paybackYears.high).toBeLessThan(8);
  });
});
