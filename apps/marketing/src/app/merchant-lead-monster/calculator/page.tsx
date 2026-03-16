import { notFound } from "next/navigation";
import { merchantLeadMonsterEnabled } from "../../../lib/merchant-lead-monster-api";
import { CalculatorForm } from "./CalculatorForm";

export default function CalculatorPage() {
  if (!merchantLeadMonsterEnabled()) return notFound();

  return (
    <main className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
        }}
      >
        Processing Fee Savings
      </h1>
      <p
        style={{ color: "var(--text-secondary)", marginTop: 12, maxWidth: 720 }}
      >
        Enter your estimated monthly card volume and current rate.
      </p>
      <div style={{ marginTop: 24, maxWidth: 720 }}>
        <CalculatorForm />
      </div>
    </main>
  );
}
