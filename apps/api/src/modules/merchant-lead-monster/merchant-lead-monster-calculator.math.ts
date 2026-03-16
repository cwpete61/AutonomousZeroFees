export function roundHalfUpDiv(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new Error("Invalid denominator");
  if (numerator < 0n) throw new Error("Only positive supported");
  return (numerator + denominator / 2n) / denominator;
}

export function parseUsdToCents(input: string): bigint {
  const s = (input ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new Error("Invalid USD amount");
  const [whole, frac = ""] = s.split(".");
  const cents = BigInt(whole) * 100n + BigInt((frac + "00").slice(0, 2));
  if (cents <= 0n) throw new Error("USD amount must be > 0");
  return cents;
}

export function parsePercentToBps(input: string): number {
  const s = (input ?? "").trim();
  if (!/^\d+(\.\d{1,4})?$/.test(s)) throw new Error("Invalid percent");
  const [whole, frac = ""] = s.split(".");

  // scale to 4 decimals (percent * 10_000)
  const scale4 = BigInt(whole) * 10_000n + BigInt((frac + "0000").slice(0, 4));
  // bps = round_half_up(scale4 / 100) since 1 bp = 0.01%.
  const bpsBig = roundHalfUpDiv(scale4, 100n);
  if (bpsBig <= 0n || bpsBig > 10_000n)
    throw new Error("Percent out of bounds");
  return Number(bpsBig);
}

export function centsToUsdString(cents: bigint): string {
  if (cents < 0n) throw new Error("Only non-negative supported");
  const whole = cents / 100n;
  const frac = cents % 100n;
  return `${whole.toString()}.${frac.toString().padStart(2, "0")}`;
}

export function computeFees(params: {
  monthlyVolumeCents: bigint;
  currentRateBps: number;
  targetRateBps: number;
}) {
  const { monthlyVolumeCents, currentRateBps, targetRateBps } = params;
  const current = roundHalfUpDiv(
    monthlyVolumeCents * BigInt(currentRateBps),
    10_000n,
  );
  const target = roundHalfUpDiv(
    monthlyVolumeCents * BigInt(targetRateBps),
    10_000n,
  );
  const savings = current > target ? current - target : 0n;
  return {
    monthlyFeesCurrentCents: current,
    monthlyFeesTargetCents: target,
    monthlySavingsCents: savings,
    annualSavingsCents: savings * 12n,
  };
}
