"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createAppointment,
  getCalculatorSession,
} from "../../../lib/merchant-lead-monster-api";

export function BookingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session") || "";

  const [sessionOk, setSessionOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [preferredTimeWindow, setPreferredTimeWindow] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!sessionId) throw new Error("missing");
        await getCalculatorSession(sessionId);
        if (alive) setSessionOk(true);
      } catch {
        if (alive) setError("Session expired. Please re-run the calculator.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const appt = await createAppointment({
        calculatorSessionId: sessionId,
        name,
        email,
        phone: phone || undefined,
        businessName,
        preferredTimeWindow: preferredTimeWindow || undefined,
        notes: notes || undefined,
      });
      router.push(
        `/merchant-lead-monster/confirmed?appt=${encodeURIComponent(appt.id)}`,
      );
    } catch {
      setError("Could not submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div style={{ color: "#fca5a5" }}>{error}</div>
        <a
          className="nav-cta"
          href="/merchant-lead-monster/calculator"
          style={{ display: "inline-block", marginTop: 14 }}
        >
          Back to Calculator
        </a>
      </div>
    );
  }

  if (!sessionOk)
    return <div style={{ color: "var(--text-secondary)" }}>Loading…</div>;

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
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
          }}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
          }}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
          }}
        />
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business name"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
          }}
        />
        <input
          value={preferredTimeWindow}
          onChange={(e) => setPreferredTimeWindow(e.target.value)}
          placeholder="Preferred time window (optional)"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
          }}
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={4}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-deep)",
            color: "var(--text-primary)",
            resize: "vertical",
          }}
        />

        <button
          className="nav-cta"
          disabled={loading}
          style={{
            justifySelf: "start",
            padding: "10px 18px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Submitting…" : "Request Appointment"}
        </button>
      </form>
    </div>
  );
}
