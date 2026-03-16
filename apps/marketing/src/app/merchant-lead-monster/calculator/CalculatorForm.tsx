"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createCalculatorSession } from "../../../lib/merchant-lead-monster-api";

export function CalculatorForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [monthlyVolumeUsd, setMonthlyVolumeUsd] = useState("");
  const [currentRatePct, setCurrentRatePct] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const utm = useMemo(
    () => ({
      source: params.get("utm_source") || undefined,
      medium: params.get("utm_medium") || undefined,
      campaign: params.get("utm_campaign") || undefined,
      term: params.get("utm_term") || undefined,
      content: params.get("utm_content") || undefined,
    }),
    [params],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const referrer = (() => {
        try {
          return (
            sessionStorage.getItem("merchant_lead_monster_initial_referrer") ||
            document.referrer ||
            undefined
          );
        } catch {
          return document.referrer || undefined;
        }
      })();

      const payload = {
        monthlyVolumeUsd,
        currentRatePct,
        utm,
        referrer,
      };
      const r = await createCalculatorSession(payload);
      setResult(r);
    } catch {
      setError("Could not calculate savings. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Monthly card volume (USD)
          </span>
          <input
            value={monthlyVolumeUsd}
            onChange={(e) => setMonthlyVolumeUsd(e.target.value)}
            placeholder="50000.00"
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-deep)",
              color: "var(--text-primary)",
            }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Current rate (%)
          </span>
          <input
            value={currentRatePct}
            onChange={(e) => setCurrentRatePct(e.target.value)}
            placeholder="2.9"
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-deep)",
              color: "var(--text-primary)",
            }}
          />
        </label>
        <button
          className="nav-cta"
          disabled={loading}
          style={{
            justifySelf: "start",
            padding: "10px 18px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Calculating…" : "Calculate Savings"}
        </button>
        {error ? <div style={{ color: "#fca5a5" }}>{error}</div> : null}
      </form>

      {result ? (
        <div
          style={{
            marginTop: 18,
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: 16,
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-secondary)" }}>
              Monthly savings
            </span>
            <span style={{ fontFamily: "var(--font-heading)" }}>
              ${result.monthlySavingsUsd}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-secondary)" }}>
              Annual savings
            </span>
            <span style={{ fontFamily: "var(--font-heading)" }}>
              ${result.annualSavingsUsd}
            </span>
          </div>
          <button
            className="nav-cta"
            onClick={() =>
              router.push(
                `/merchant-lead-monster/book?session=${encodeURIComponent(
                  result.id,
                )}`,
              )
            }
            style={{ justifySelf: "start", marginTop: 6, padding: "10px 18px" }}
          >
            Book a Savings Review
          </button>
        </div>
      ) : null}
    </div>
  );
}
