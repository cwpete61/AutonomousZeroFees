"use client";

import Link from "next/link";
import { notFound } from "next/navigation";

export default function MlmHome() {

  return (
    <div className="mlm-container">
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">◉</div>
            Autonomous Zero Fees
          </Link>
          <div className="nav-links">
            <Link href="/mlm/calculator" className="nav-cta">
              Savings Calculator
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Merchant Lead Monster
          </div>
          <h1>
            Stop Overpaying for <br />
            <span className="gradient-text">Credit Card Processing</span>
          </h1>
          <p className="hero-sub">
            Most merchants are overpaying by 15-30%. Our AI analyzes your volume and finds the absolute lowest rates guaranteed.
          </p>
          <div className="hero-ctas">
            <Link href="/mlm/calculator" className="btn-primary">
              Calculate Your Savings
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid" style={{ marginTop: '3rem' }}>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Enter Volume</h3>
              <p>Tell us your monthly card volume and current effective rate.</p>
            </div>
            <div className="feature-icon-arrow">→</div>
            <div className="feature-card">
              <div className="feature-icon">⚖️</div>
              <h3>AI Analysis</h3>
              <p>Our engine compares your data against institutional wholesale rates.</p>
            </div>
            <div className="feature-icon-arrow">→</div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>See Savings</h3>
              <p>Get a precise breakdown of your monthly and annual savings.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer" style={{ marginTop: 'auto' }}>
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              © 2026 Autonomous Zero Fees. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        .mlm-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0a0a0a;
          color: white;
        }
        .feature-icon-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: rgba(255,255,255,0.2);
        }
        @media (max-width: 768px) {
          .feature-icon-arrow { display: none; }
          .features-grid { display: block; }
          .feature-card { margin-bottom: 2rem; }
        }
      `}</style>
    </div>
  );
}
