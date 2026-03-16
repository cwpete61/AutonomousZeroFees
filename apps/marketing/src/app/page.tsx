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
            Orbis Outreach - BPS
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
                Book a Call
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
            Powered by AI Agents
          </div>
          <h1>
            <span style={{ whiteSpace: "nowrap" }}>Autonomous Lead Gen.</span>
            <br />
            <span className="gradient-text" style={{ whiteSpace: "nowrap" }}>
              Zero Manual Work.
            </span>
          </h1>
          <p className="hero-sub">
            Orbis Outreach - BPS finds businesses with bad websites, sends
            personalized outreach, closes deals, and builds sites — all while
            you sleep.
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
              <h3>24/7</h3>
              <p>Autonomous Ops</p>
            </div>
            <div className="hero-stat">
              <h3>10x</h3>
              <p>Pipeline Velocity</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Social Proof ═══ */}
      <section className="social-proof">
        <div className="container">
          <p className="social-proof-text">
            Trusted by agencies scaling their outreach
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
            <h2 className="section-title">Nine Agents. One Mission.</h2>
            <p className="section-sub">
              Each agent handles a different stage of the sales pipeline — from
              discovery to delivery.
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
            <h2 className="section-title">From Zero to Revenue in 4 Steps</h2>
            <p className="section-sub">
              Set your targets, let the agents handle the rest.
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
            <div className="section-label">◉ Apex Pipeline</div>
            <h2 className="section-title">The Apex Pipeline Experience</h2>
            <p className="section-sub">
              Manage your entire sales cycle with a premium, high-density CRM
              board designed for speed and clarity.
            </p>
          </div>
          <div className="preview-mockup-app">
            <aside className="preview-sidebar">
              <div className="sidebar-logo">A</div>
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
                  <span className="nav-tab">Leads</span>
                  <span className="nav-tab">Contacts</span>
                  <span className="nav-tab">Analytics</span>
                </div>
                <div className="nav-actions">
                  <span className="nav-search">🔍 Search...</span>
                  <span className="nav-notif">🔔</span>
                  <div className="nav-user" />
                </div>
              </header>
              <div className="preview-app-header">
                <h3>SALES PIPELINE</h3>
                <div className="app-header-right">
                  <button className="btn-app-action">🔍 Search</button>
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
                              <span className="data-label">Company</span>
                              <span className="data-value">{card.name}</span>
                            </div>
                            <div className="card-data">
                              <span className="data-label">Value</span>
                              <span className="data-value">{card.value}</span>
                            </div>
                            <div className="card-data">
                              <span className="data-label">Follow-up Date</span>
                              <span className="data-value">{card.date}</span>
                            </div>
                          </div>
                          <div className="card-footer">
                            <div
                              className="card-avatar"
                              style={{ background: card.avatar }}
                            />
                            {card.hasProposal && (
                              <span className="badge-proposal">Proposal</span>
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

      {/* ═══ Pricing ═══ */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="pricing-header">
            <div className="section-label">◉ Pricing</div>
            <h2 className="section-title">
              Custom Builds. By Appointment Only.
            </h2>
            <p className="section-sub">
              Every deployment is tailored to your agency. Schedule a
              consultation to discuss your needs.
            </p>
          </div>
          <div className="pricing-grid">
            {PRICING.map((plan, i) => (
              <div
                key={i}
                className={`pricing-card${plan.featured ? " featured" : ""}`}
              >
                <h3>{plan.name}</h3>
                <div className="price">
                  {plan.price}
                  <span>/mo</span>
                </div>
                <p className="price-desc">{plan.desc}</p>
                <ul className="pricing-features">
                  {plan.features.map((f, fi) => (
                    <li key={fi}>{f}</li>
                  ))}
                </ul>
                <a
                  href="#cta"
                  className={plan.featured ? "btn-primary" : "btn-secondary"}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="faq" id="faq">
        <div className="container">
          <div className="faq-header">
            <div className="section-label">◉ FAQ</div>
            <h2 className="section-title">Questions & Answers</h2>
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
            <h2>Ready to Put Your Outreach on Autopilot?</h2>
            <p>
              We build and deploy custom Orbis Outreach - BPS systems for agencies. By
              appointment only.
            </p>
            <a href="mailto:hello@orbisoutreach.com" className="btn-primary">
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
              © 2026 Orbis Outreach - BPS. All rights reserved.
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
      "Finds U.S. service businesses with outdated websites using Google Places, PageSpeed, and AI scoring.",
  },
  {
    icon: "✉️",
    title: "Outreach Agent",
    description:
      "Multi-channel outreach via email, LinkedIn, Facebook, and Instagram — AI-personalized messages that comply with each platform's policies.",
  },
  {
    icon: "🎨",
    title: "Design Preview Agent",
    description:
      "Creates blurred redesign mockups to tease prospects — full previews unlock after engagement.",
  },
  {
    icon: "🤝",
    title: "Sales Close Agent",
    description:
      "Handles objections, sends proposals, and creates Stripe invoices to close deals autonomously.",
  },
  {
    icon: "🏗️",
    title: "Web Build Agent",
    description:
      "Generates full HTML/CSS production websites tailored to each client's industry and brand.",
  },
  {
    icon: "📱",
    title: "Multi-Channel Reach",
    description:
      "LinkedIn InMails, Facebook Page DMs, Instagram Business messages — the right channel for each industry, automatically selected.",
  },
];

const STEPS = [
  {
    title: "Set Your Targets",
    description:
      "Choose industries and locations. Scout Agent finds businesses with bad websites.",
  },
  {
    title: "Multi-Channel Outreach",
    description:
      "AI writes personalized emails, LinkedIn messages, Facebook DMs, and Instagram messages — each tailored to the platform.",
  },
  {
    title: "Close & Collect",
    description:
      "Demos release on interest. Proposals are generated. Stripe invoices go out automatically.",
  },
  {
    title: "Build & Deliver",
    description:
      "Websites are generated, client comms handled, and sites delivered — all autonomously.",
  },
];

const PIPELINE_COLS = [
  {
    title: "DISCOVERED",
    glow: "blue",
    cards: [
      {
        name: "Omni Solutions",
        value: "$12k",
        date: "1/17/2026",
        avatar: "#6366f1",
        hasProposal: false,
      },
      {
        name: "Sarah Chen",
        value: "$12k",
        date: "10/10/2025",
        avatar: "#f59e0b",
        hasProposal: false,
      },
      {
        name: "Omni Solutions",
        value: "$12k",
        date: "12/10/2025",
        avatar: "#6366f1",
        hasProposal: false,
      },
      {
        name: "Omni Solutions",
        value: "$12k",
        date: "10/10/2025",
        avatar: "#6366f1",
        hasProposal: false,
      },
    ],
  },
  {
    title: "OUTREACH SENT",
    glow: "purple",
    cards: [
      {
        name: "TechCorp",
        value: "$25k",
        date: "12/10/2025",
        avatar: "#a855f7",
        hasProposal: false,
      },
      {
        name: "Mark Evans",
        value: "$25k",
        date: "7/10/2025",
        avatar: "#3b82f6",
        hasProposal: false,
      },
      {
        name: "Mark Evans",
        value: "$25k",
        date: "12/10/2025",
        avatar: "#3b82f6",
        hasProposal: false,
      },
      {
        name: "Jensen Evans",
        value: "$20k",
        date: "7/10/2025",
        avatar: "#f43f5e",
        hasProposal: false,
      },
    ],
  },
  {
    title: "QUALIFIED",
    glow: "teal",
    cards: [
      {
        name: "Mark Evans",
        value: "$25k",
        date: "1/17/2026",
        avatar: "#3b82f6",
        hasProposal: false,
      },
      {
        name: "Jansen Evans",
        value: "$20k",
        date: "13/11/2025",
        avatar: "#f43f5e",
        hasProposal: false,
      },
    ],
  },
  {
    title: "NEGOTIATION",
    glow: "gold",
    cards: [
      {
        name: "Quantum Inc.",
        value: "$68k",
        date: "7/17/2025",
        avatar: "#fbbf24",
        hasProposal: true,
      },
      {
        name: "Quantum Inc.",
        value: "$68k",
        date: "10/12/2025",
        avatar: "#fbbf24",
        hasProposal: true,
      },
      {
        name: "Quantum Inc.",
        value: "$68k",
        date: "11/17/2025",
        avatar: "#fbbf24",
        hasProposal: true,
      },
    ],
  },
  {
    title: "CLOSED WON",
    glow: "green",
    cards: [
      {
        name: "Nexus Dynamics",
        value: "$150k",
        date: "10/12/2025",
        avatar: "#10b981",
        hasProposal: false,
      },
      {
        name: "Nexus Dynamics",
        value: "$150k",
        date: "12/12/2025",
        avatar: "#10b981",
        hasProposal: false,
      },
      {
        name: "Nexus Dynamics",
        value: "$150k",
        date: "11/15/2025",
        avatar: "#10b981",
        hasProposal: false,
      },
      {
        name: "Nexus Dynamics",
        value: "$150k",
        date: "10/13/2025",
        avatar: "#10b981",
        hasProposal: false,
      },
    ],
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "Custom",
    desc: "For solo operators getting started",
    featured: false,
    cta: "Book a Consultation",
    features: [
      "1 active campaign",
      "Up to 100 leads / month",
      "3 email sequences",
      "Basic dashboard",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "Custom",
    desc: "For growing agencies",
    featured: true,
    cta: "Book a Consultation",
    features: [
      "5 active campaigns",
      "Up to 500 leads / month",
      "Unlimited sequences",
      "Full agent suite",
      "Design preview agent",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For agencies at scale",
    featured: false,
    cta: "Contact Us",
    features: [
      "Unlimited campaigns",
      "Unlimited leads",
      "Custom agent configs",
      "White-label dashboard",
      "Dedicated account manager",
      "API access",
    ],
  },
];

const FAQS = [
  {
    q: "How does Orbis Outreach - BPS find leads?",
    a: "Our Scout Agent searches Google Places for service businesses in your target industries and locations, then scores their websites using PageSpeed Insights and AI analysis. Only businesses with genuinely poor websites are flagged as qualified leads.",
  },
  {
    q: "Is the email outreach CAN-SPAM compliant?",
    a: "Yes. Every email includes an unsubscribe mechanism, physical address, and clear sender identification. Our Outreach Agent enforces CAN-SPAM rules at the template level — non-compliant emails cannot be sent.",
  },
  {
    q: "What happens when a prospect replies?",
    a: "The Outreach Agent classifies the reply (interested, objection, question, etc.) and routes it to the Sales Close Agent, which handles the response, sends the demo, or escalates to you for human review.",
  },
  {
    q: "Do I need to approve every outreach?",
    a: "You set approval gates. By default, initial outreach, demos, and invoices require human approval. You can adjust the automation level as you build confidence in the system.",
  },
  {
    q: "Can I use my own domain for sending emails?",
    a: "Yes. Orbis Outreach - BPS integrates with Resend or SendGrid using your own verified domain. We recommend warming up new domains before scaling.",
  },
  {
    q: "What kind of websites does the Build Agent create?",
    a: "Production-ready, mobile-responsive HTML/CSS sites with semantic markup, structured data, SEO meta tags, and industry-specific content. Sites are tailored to each client's business and location.",
  },
];
