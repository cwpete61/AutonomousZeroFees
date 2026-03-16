"use client";

import Link from "next/link";
import { useSearchParams, notFound } from "next/navigation";
import { Suspense } from "react";

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const apptId = searchParams.get("appt");

  return (
    <section className="hero">
      <div className="hero-content">
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
        <h1>Request <span className="gradient-text">Confirmed</span></h1>
        <p className="hero-sub">
          Your savings review (ID: {apptId?.slice(-6).toUpperCase() || '...'}) has been received. 
          A specialist will reach out within 24 hours to finalize your new rates.
        </p>
        <div className="hero-ctas">
          <Link href="/" className="btn-primary">Return Home</Link>
          <Link href="/mlm" className="btn-secondary">Learn More</Link>
        </div>
      </div>
    </section>
  );
}

export default function ConfirmedPage() {

  return (
    <div className="mlm-container" style={{ minHeight: '100vh', background: '#020817', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">◉</div>
            Autonomous Zero Fees
          </Link>
        </div>
      </nav>
      <Suspense fallback={<div className="hero">Loading...</div>}>
        <ConfirmedContent />
      </Suspense>
    </div>
  );
}
