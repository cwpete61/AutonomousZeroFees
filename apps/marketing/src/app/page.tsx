"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ═══ Navigation ═══ */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">◉</div>
            Profit Shield AI
          </Link>
          <ul className="nav-links">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#how-it-works">How It Works</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
            <li>
              <Link href="/admin/login" className="nav-admin">
                Admin
              </Link>
            </li>
            <li>
              <a href="#cta" className="nav-cta">
                Deploy Shield
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Autonomous Merchant Recovery
          </div>
          <h1>
            <span style={{ whiteSpace: "nowrap" }}>Zero Processing Fees.</span>
            <br />
            <span className="gradient-text" style={{ whiteSpace: "nowrap" }}>
              Keep Your Profit.
            </span>
          </h1>
          <p className="hero-sub">
            Profit Shield AI finds businesses overpaying for processing, sends
            personalized audits, and activates "Zero-Fee" recovery — all while
            you sleep. Reclaim thousands in lost revenue for your clients.
          </p>
          <div className="hero-ctas">
            <a href="#cta" className="btn-primary">
              Book a Consultation
            </a>
            <a href="#how-it-works" className="btn-secondary">
              See How It Works
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <h3>9</h3>
              <p>AI Agents</p>
            </div>
            <div className="hero-stat">
              <h3>$0</h3>
              <p>Processing Fees</p>
            </div>
            <div className="hero-stat">
              <h3>100%</h3>
              <p>Margin Retention</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Social Proof ═══ */}
      <section className="social-proof">
        <div className="container">
          <p className="social-proof-text">
            Powering agencies who scale financial recovery
          </p>
          <div className="social-proof-logos">
            <span>Antigravity</span>
            <span>Orbis Digital</span>
            <span>ScaleForce</span>
            <span>VelocityLabs</span>
            <span>NexusAgency</span>
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="features" id="features">
        <div className="container">
          <div className="features-header">
            <div className="section-label">◉ Platform Features</div>
            <h2 className="section-title">Nine Agents. One Financial Mission.</h2>
            <p className="section-sub">
              Each agent handles a different stage of the recovery pipeline — from
              statement discovery to "Zero-Fee" activation.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="how-header">
            <div className="section-label">◉ How It Works</div>
            <h2 className="section-title">From Waste to Recovery in 4 Steps</h2>
            <p className="section-sub">
              Set your targets, let the agents handle the financial recovery.
            </p>
          </div>
          <div className="how-steps">
            {STEPS.map((s, i) => (
              <div key={i} className="how-step">
                <div className="how-step-number">{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Dashboard Preview ═══ */}
      <section className="preview" id="preview">
        <div className="container">
          <div className="preview-header">
            <div className="section-label">◉ Recovery Pipeline</div>
            <h2 className="section-title">The Profit Shield Experience</h2>
            <p className="section-sub">
              Manage your entire recovery cycle with a premium CRM board designed
              for maximum margin retention.
            </p>
          </div>
          <div className="preview-mockup-app">
            <aside className="preview-sidebar">
              <div className="sidebar-logo">P</div>
              <div className="sidebar-icons">
                <div className="sidebar-icon active">⊞</div>
                <div className="sidebar-icon">⇄</div>
                <div className="sidebar-icon">👥</div>
                <div className="sidebar-icon">📄</div>
              </div>
              <div className="sidebar-bottom">⚙</div>
            </aside>
            <main className="preview-app-content">
              <header className="preview-app-nav">
                <div className="nav-tabs">
                  <span className="nav-tab active">Dashboard</span>
                  <span className="nav-tab">Merchant Leads</span>
                  <span className="nav-tab">Audits</span>
                  <span className="nav-tab">Analytics</span>
                </div>
                <div className="nav-actions">
                  <span className="nav-search">🔍 Search...</span>
                  <span className="nav-notif">🔔</span>
                  <div className="nav-user" />
                </div>
              </header>
              <div className="preview-app-header">
                <h3>PROFIT PIPELINE</h3>
                <div className="app-header-right">
                  <button className="btn-app-action">Generate Audit</button>
                </div>
              </div>
              <div className="preview-grid-v2">
                {PIPELINE_COLS.map((col, ci) => (
                  <div key={ci} className={`preview-col-v2 col-${col.glow}`}>
                    <div className="preview-col-header">
                      <div className="col-header-left">
                        <span className="col-title">{col.title}</span>
                        <span className="col-count">({col.cards.length})</span>
                      </div>
                      <div className="col-toggle">
                        <span className="toggle-label">ACTIVE</span>
                        <div className="toggle-switch active" />
                      </div>
                    </div>
                    <div className="preview-col-cards">
                      {col.cards.map((card, cdi) => (
                        <div key={cdi} className="preview-card-v2">
                          <div className="card-top">
                            <span className="card-name">{card.name}</span>
                          </div>
                          <div className="card-body">
                            <div className="card-data">
                              <span className="data-label">Merchant</span>
                              <span className="data-value">{card.name}</span>
                            </div>
                            <div className="card-data">
                              <span className="data-label">Annual Waste</span>
                              <span className="data-value">{card.value}</span>
                            </div>
                            <div className="card-data">
                              <span className="data-label">Audit Sent</span>
                              <span className="data-value">{card.date}</span>
                            </div>
                          </div>
                          <div className="card-footer">
                            <div
                              className="card-avatar"
                              style={{ background: card.avatar }}
                            />
                            {card.hasAgreement && (
                              <span className="badge-proposal">Agreement</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="faq" id="faq">
        <div className="container">
          <div className="faq-header">
            <div className="section-label">◉ FAQ</div>
            <h2 className="section-title">Common Questions</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`faq-item${openFaq === i ? " open" : ""}`}
              >
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cta-section" id="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Eliminate Processing Fees?</h2>
            <p>
              We deploy custom Profit Shield systems for agencies. Reclaim your
              clients' margins and build a high-retention service.
            </p>
            <a href="mailto:hello@profitshield.ai" className="btn-primary">
              Schedule Your Consultation
            </a>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              © 2026 Profit Shield AI. All rights reserved.
            </div>
            <ul className="footer-links">
              <li>
                <a href="#">Privacy</a>
              </li>
              <li>
                <a href="#">Terms</a>
              </li>
              <li>
                <a href="/admin/login">Admin Login</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ═══ Data ═══ */

const FEATURES = [
  {
    icon: "🔍",
    title: "Scout Agent",
    description:
      "Finds high-volume service businesses (HVAC, Legal, Medical) that are losing thousands to legacy processing fees.",
  },
  {
    icon: "✉️",
    title: "Outreach Agent",
    description:
      "AI-personalized outreach focusing on 'Margin Retention' and 'Fee Reclamation'. Compliant cross-channel messaging.",
  },
  {
    icon: "📈",
    title: "Profit Audit Agent",
    description:
      "Generates deep 'Profit Recovery Reports' that visualize exactly how much the merchant is losing to junk fees every month.",
  },
  {
    icon: "🤝",
    title: "Sales Close Agent",
    description:
      "Handles objections about switching, provides 'compliance guarantees', and automates activation invoices.",
  },
  {
    icon: "🏗️",
    title: "Growth Agent",
    description:
      "Uses reclaimed fees to fund automated lead-gen and digital infrastructure for the client, increasing LTV.",
  },
  {
    icon: "📱",
    title: "Multi-Channel Recovery",
    description:
      "Personalized follow-ups on LinkedIn, Email, and SMS to ensure the decision-maker sees the potential recovery.",
  },
];

const STEPS = [
  {
    title: "Identify Waste",
    description:
      "Select high-volume industries. Scout Agent identifies businesses with the largest processing leaks.",
  },
  {
    title: "Financial Audit",
    description:
      "Profit Audit Agent generates a custom Recovery Report showing exactly where their profit is leaking.",
  },
  {
    title: "Zero-Fee Activation",
    description:
      "Sales Agent handles the transition. Clients switch to a 'Zero-Fee' model and keep 100% of their sale.",
  },
  {
    title: "Scale Growth",
    description:
      "The reclaimed capital is reinvested into automated digital growth, making you an indispensable partner.",
  },
];

const PIPELINE_COLS = [
  {
    title: "DISCOVERED",
    glow: "blue",
    cards: [
      {
        name: "Omni Medical",
        value: "$14k/yr",
        date: "1/17/26",
        avatar: "#6366f1",
        hasAgreement: false,
      },
      {
        name: "Chen Law Firm",
        value: "$9k/yr",
        date: "10/10/25",
        avatar: "#f59e0b",
        hasAgreement: false,
      },
    ],
  },
  {
    title: "AUDIT SENT",
    glow: "purple",
    cards: [
      {
        name: "TechCorp Labs",
        value: "$32k/yr",
        date: "12/10/25",
        avatar: "#a855f7",
        hasAgreement: false,
      },
    ],
  },
  {
    title: "QUALIFIED",
    glow: "teal",
    cards: [
      {
        name: "Evans HVAC",
        value: "$18k/yr",
        date: "1/17/26",
        avatar: "#3b82f6",
        hasAgreement: false,
      },
    ],
  },
  {
    title: "NEGOTIATION",
    glow: "gold",
    cards: [
      {
        name: "Quantum Dental",
        value: "$45k/yr",
        date: "7/17/25",
        avatar: "#fbbf24",
        hasAgreement: true,
      },
    ],
  },
  {
    title: "CLOSED WON",
    glow: "green",
    cards: [
      {
        name: "Nexus Realty",
        value: "$28k/yr recovered",
        date: "10/12/25",
        avatar: "#10b981",
        hasAgreement: false,
      },
    ],
  },
];

const FAQS = [
  {
    q: "How does Profit Shield AI find leads?",
    a: "Our Scout Agent targets industries with high transaction volumes and low margins. It analyzes their current payment friction and identifies likely 'Legacy Processing' setups that are wasting capital.",
  },
  {
    q: "What is the 'Zero-Fee' model?",
    a: "It's a compliant processing structure (Dual Pricing or Surcharging) where the merchant keeps 100% of their sale, and the processing cost is bridged. This instantly increases their net profit by 3-4%.",
  },
  {
    q: "What happens when a merchant is interested?",
    a: "The Profit Audit Agent creates a side-by-side comparison of their current costs vs. the shielded model. The Sales Agent then handles the technical transition and activation agreement.",
  },
  {
    q: "Is this model compliant across all states?",
    a: "Yes. Our agents are programmed with current Durbin Amendment and state-level compliance rules to ensure every proposal meets legal requirements for merchant processing.",
  },
  {
    q: "Can I still offer web design services?",
    a: "Absolutely. We recommend using the 'Reclaimed Capital' as a way to fund digital growth. Instead of asking for a budget, you show them how they can pay for a new site using the money they just stopped losing to the bank.",
  },
];
