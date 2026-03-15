import {
  centsToUsdString,
  computeFees,
  parsePercentToBps,
  parseUsdToCents,
  roundHalfUpDiv,
} from "./merchant-lead-monster-calculator.math";

describe("merchant-lead-monster-calculator.math", () => {
  test("parseUsdToCents parses 2dp USD strings", () => {
    expect(parseUsdToCents("0.01")).toBe(1n);
    expect(parseUsdToCents("50000.00")).toBe(5_000_000n);
    expect(parseUsdToCents("12")).toBe(1200n);
  });

  test("parseUsdToCents rejects >2 decimals and non-numeric", () => {
    expect(() => parseUsdToCents("1.001")).toThrow();
    expect(() => parseUsdToCents("abc")).toThrow();
    expect(() => parseUsdToCents("-1.00")).toThrow();
  });

  test("parsePercentToBps parses up to 4 decimals", () => {
    expect(parsePercentToBps("2.9")).toBe(290);
    expect(parsePercentToBps("2.3456")).toBe(235);
    expect(parsePercentToBps("0.0100")).toBe(1);
  });

  test("roundHalfUpDiv rounds half-up for positive integers", () => {
    expect(roundHalfUpDiv(1n, 2n)).toBe(1n);
    expect(roundHalfUpDiv(3n, 2n)).toBe(2n);
    expect(roundHalfUpDiv(4n, 2n)).toBe(2n);
  });

  test("centsToUsdString formats cents deterministically", () => {
    expect(centsToUsdString(0n)).toBe("0.00");
    expect(centsToUsdString(1n)).toBe("0.01");
    expect(centsToUsdString(1200n)).toBe("12.00");
    expect(centsToUsdString(1234n)).toBe("12.34");
  });

  test("computeFees computes savings from cents + bps", () => {
    const result = computeFees({
      monthlyVolumeCents: 5_000_000n, // $50,000
      currentRateBps: 290,
      targetRateBps: 220,
    });

    expect(result.monthlyFeesCurrentCents).toBe(145_000n);
    expect(result.monthlyFeesTargetCents).toBe(110_000n);
    expect(result.monthlySavingsCents).toBe(35_000n);
    expect(result.annualSavingsCents).toBe(420_000n);
  });
});
