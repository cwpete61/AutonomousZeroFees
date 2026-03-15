import { notFound } from "next/navigation";
import { merchantLeadMonsterEnabled } from "../../../lib/merchant-lead-monster-api";

export default function ConfirmedPage() {
  if (!merchantLeadMonsterEnabled()) return notFound();

  return (
    <main className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
        }}
      >
        Request Received
      </h1>
      <p
        style={{ color: "var(--text-secondary)", marginTop: 12, maxWidth: 720 }}
      >
        Thanks — we’ll reach out shortly to confirm a time.
      </p>
      <div style={{ marginTop: 24 }}>
        <a className="nav-cta" href="/merchant-lead-monster/calculator">
          Run Another Estimate
        </a>
      </div>
    </main>
  );
}
