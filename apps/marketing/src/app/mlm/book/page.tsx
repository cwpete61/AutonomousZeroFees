"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, notFound } from "next/navigation";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    preferredTime: "",
    notes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("No session found. Please start from the calculator.");
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:40001';
        const resp = await fetch(`${apiUrl}/mlm/calculator/sessions/${sessionId}`);
        if (!resp.ok) throw new Error("Session expired or not found.");
        const data = await resp.json();
        setSessionData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:40001';
      const resp = await fetch(`${apiUrl}/mlm/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculatorSessionId: sessionId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          businessName: formData.businessName,
          preferredTimeWindow: formData.preferredTime,
          notes: formData.notes,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.message || "Failed to book. Please check your information.");
      }

      const data = await resp.json();
      router.push(`/mlm/confirmed?appt=${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="hero"><h1>Loading...</h1></div>;

  if (error && !sessionData) {
    return (
      <section className="hero">
        <div className="hero-content">
          <h1>Session Error</h1>
          <p className="hero-sub">{error}</p>
          <Link href="/mlm/calculator" className="btn-primary">Back to Calculator</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="hero" style={{ padding: '120px 24px', textAlign: 'left', minHeight: 'auto' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem', maxWidth: '1100px' }}>
        
        <div className="session-summary">
          <div className="hero-badge">Savings Summary</div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Your <span className="gradient-text">Wholesale</span> Advantage</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>We&apos;ve locked in a target rate of {sessionData.targetRatePct}% for your business based on your volume.</p>
          
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '2rem', borderRadius: '20px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Annual Savings</span>
              <span style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--orbis-primary-light)', display: 'block', lineHeight: '1' }}>${sessionData.annualSavingsUsd}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Monthly Savings</span>
              <span style={{ fontSize: '2rem', fontWeight: '700', color: '#fff' }}>${sessionData.monthlySavingsUsd}</span>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>✓ Institutional Wholesale Rates</div>
            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>✓ Zero Hidden Fees Guaranteed</div>
            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>✓ 24-Hour Implementation</div>
          </div>
        </div>

        <div className="booking-form-container">
          <form onSubmit={handleSubmit} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Secure Your Consultation</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Complete the form below to have a specialist review your breakdown and apply these rates.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
                <input style={{ width: '100%', padding: '12px', background: 'rgba(2, 8, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white' }} type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} suppressHydrationWarning={true} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Business Name</label>
                <input style={{ width: '100%', padding: '12px', background: 'rgba(2, 8, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white' }} type="text" required value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} suppressHydrationWarning={true} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
                <input style={{ width: '100%', padding: '12px', background: 'rgba(2, 8, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white' }} type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} suppressHydrationWarning={true} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Phone Number</label>
                <input style={{ width: '100%', padding: '12px', background: 'rgba(2, 8, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white' }} type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} suppressHydrationWarning={true} />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Preferred Time to Reach You</label>
              <input style={{ width: '100%', padding: '12px', background: 'rgba(2, 8, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white' }} type="text" placeholder="e.g. Weekdays after 2pm ET" value={formData.preferredTime} onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })} suppressHydrationWarning={true} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Additional Notes (Optional)</label>
              <textarea style={{ width: '100%', padding: '12px', background: 'rgba(2, 8, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white' }} rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} suppressHydrationWarning={true} />
            </div>

            {error && <p style={{ color: '#f43f5e', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
            
            <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '1rem' }} suppressHydrationWarning={true}>
              {submitting ? "Submitting..." : "Schedule My Savings Review"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function BookingPage() {
  return (
    <div className="mlm-container" style={{ minHeight: '100vh', background: '#020817', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/mlm" className="nav-logo">
            <div className="nav-logo-icon">◉</div>
            Claim Your Savings
          </Link>
        </div>
      </nav>
      <Suspense fallback={<div className="hero">Loading...</div>}>
        <BookingContent />
      </Suspense>
    </div>
  );
}
