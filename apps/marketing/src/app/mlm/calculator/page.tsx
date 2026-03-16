"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, notFound } from "next/navigation";

function CalculatorContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ volume: "", rate: "" });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const utm = {
        source: searchParams.get("utm_source"),
        medium: searchParams.get("utm_medium"),
        campaign: searchParams.get("utm_campaign"),
        term: searchParams.get("utm_term"),
        content: searchParams.get("utm_content"),
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:40001';
      const resp = await fetch(`${apiUrl}/mlm/calculator/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyVolumeUsd: formData.volume,
          currentRatePct: formData.rate,
          utm,
          referrer: typeof document !== 'undefined' ? document.referrer : "",
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.message || "Failed to calculate. Check your inputs.");
      }
      
      const data = await resp.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="hero" style={{ minHeight: '80vh', paddingBottom: '40px' }}>
      <div className="hero-content" style={{ maxWidth: '600px', width: '100%' }}>
        {!results ? (
          <div className="calc-card-animation">
            <h1>Calculate Your <span className="gradient-text">Savings</span></h1>
            <p className="hero-sub">Enter your processing details to see how much you could save with our institutional rates.</p>

            <form onSubmit={handleSubmit} className="calc-form">
              <div className="form-group">
                <label>Monthly Card Volume (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 50000.00"
                  required
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  suppressHydrationWarning={true}
                />
              </div>
              <div className="form-group">
                <label>Current Effective Rate (%)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="e.g. 2.9"
                  required
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  suppressHydrationWarning={true}
                />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }} suppressHydrationWarning={true}>
                {loading ? "Analyzing..." : "Calculate Savings"}
              </button>
            </form>
          </div>
        ) : (
          <div className="results-card glass-effect">
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Analysis Result</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>We&apos;ve analyzed your volume against our wholesale merchant rates.</p>
            
            <div className="results-grid">
              <div className="result-item">
                <label>Monthly Savings</label>
                <div className="value">${results.monthlySavingsUsd}</div>
              </div>
              <div className="result-item highlight">
                <label>Annual Savings</label>
                <div className="value">${results.annualSavingsUsd}</div>
              </div>
            </div>

            <div className="results-breakdown">
              <div className="breakdown-row">
                <span>Current Monthly Fees</span>
                <span>${results.monthlyFeesCurrentUsd}</span>
              </div>
              <div className="breakdown-row">
                <span>New Estimated Fees</span>
                <span>${results.monthlyFeesTargetUsd}</span>
              </div>
              <div className="breakdown-row highlight-txt">
                <span>Target Rate</span>
                <span>{results.targetRatePct}%</span>
              </div>
            </div>

            <div className="hero-ctas" style={{ marginTop: '2.5rem', flexDirection: 'column' }}>
              <Link href={`/mlm/book?session=${results.id}`} className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                Book Consultation to Claim
              </Link>
              <button onClick={() => setResults(null)} className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function CalculatorPage() {
  return (
    <div className="mlm-container">
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/mlm" className="nav-logo">
            <div className="nav-logo-icon">◉</div>
            Savings Calculator
          </Link>
        </div>
      </nav>
      <Suspense fallback={<div className="hero">Loading...</div>}>
        <CalculatorContent />
      </Suspense>

      <style jsx>{`
        .mlm-container { min-height: 100vh; background: #020817; color: white; }
        .calc-form, .results-card {
          background: rgba(15, 23, 42, 0.6);
          padding: 3rem;
          border-radius: 24px;
          border: 1px solid rgba(99, 102, 241, 0.2);
          backdrop-filter: blur(20px);
          text-align: left;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .form-group { margin-bottom: 2rem; }
        .form-group label { display: block; margin-bottom: 0.75rem; font-size: 0.9rem; color: #94a3b8; font-weight: 500; }
        .form-group input {
          width: 100%;
          padding: 16px;
          background: rgba(2, 8, 23, 0.6);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 1.2rem;
          transition: all 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
        }
        .error-msg { color: #f43f5e; margin-top: 1rem; font-size: 0.9rem; }
        .results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .result-item { padding: 1.5rem; background: rgba(30, 41, 59, 0.5); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
        .result-item.highlight { background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.3); }
        .result-item label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .result-item .value { font-size: 2rem; font-weight: 700; margin-top: 0.5rem; color: #fff; }
        .result-item.highlight .value { color: #818cf8; }
        
        .results-breakdown { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; }
        .breakdown-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem; color: #94a3b8; }
        .breakdown-row:last-child { margin-bottom: 0; }
        .highlight-txt { color: #fff; font-weight: 600; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem; margin-top: 0.75rem; }
      `}</style>
    </div>
  );
}
