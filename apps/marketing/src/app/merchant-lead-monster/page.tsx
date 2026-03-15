import Link from "next/link";
import { notFound } from "next/navigation";
import { merchantLeadMonsterEnabled } from "../../lib/merchant-lead-monster-api";
import { ReferrerCapture } from "./ReferrerCapture";

export default function MerchantLeadMonsterLanding(props: any) {
  if (!merchantLeadMonsterEnabled()) return notFound();

  const searchParams = (props?.searchParams || undefined) as
    | Record<string, string | string[] | undefined>
    | undefined;

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams || {})) {
    if (typeof v === "string") qs.set(k, v);
    else if (Array.isArray(v) && v[0]) qs.set(k, v[0]);
  }
  const calculatorHref = qs.toString()
    ? `/merchant-lead-monster/calculator?${qs.toString()}`
    : "/merchant-lead-monster/calculator";

  return (
    <main className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <ReferrerCapture />
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          lineHeight: 1.1,
        }}
      >
        Merchant Savings Calculator
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          marginTop: 16,
          maxWidth: 720,
        }}
      >
        Estimate what you could save on credit card processing fees and request
        a quick savings review.
      </p>
      <div style={{ marginTop: 28 }}>
        <Link className="nav-cta" href={calculatorHref}>
          Check Savings
        </Link>
      </div>
    </main>
  );
}
