import { describe, expect, it } from "vitest";
import { amountToInput, parseAmount } from "./parse";

describe("parseAmount", () => {
  it.each([
    ["2200000", 2_200_000],
    ["2 200 000", 2_200_000],
    ["2 200 000 FCFA", 2_200_000],
    ["1.250.000", 1_250_000],
    ["1,250,000", 1_250_000],
    ["1,5", 1.5],
    ["12.5", 12.5],
  ])("reads %j as %d", (raw, expected) => {
    expect(parseAmount(raw)).toBe(expected);
  });

  it.each(["", "   ", "abc", null, undefined])("returns undefined for %j", (raw) => {
    expect(parseAmount(raw)).toBeUndefined();
  });

  it("round-trips through amountToInput", () => {
    expect(parseAmount(amountToInput(1_250_000))).toBe(1_250_000);
  });
});
