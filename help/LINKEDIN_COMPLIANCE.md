# 🔗 LinkedIn Compliance & Strategy Guide

This guide details the technical and legal requirements for using the Orbis Outreach system with LinkedIn, specifically focusing on the [LinkedIn API Terms of Use](https://www.linkedin.com/legal/l/api-terms-of-use).

---

## ⚖️ Legal & ToS Assessment

The LinkedIn platform is highly protective of its data and user experience. Below is how our application maps to their specific terms:

| ToS Section | Restriction | Application Impact | Risk Level |
| :--- | :--- | :--- | :--- |
| **3.1.26** | **Automated Posting** | Using APIs to automate DMs or connection requests. | **HIGH** |
| **3.1.24** | **Scraped Content** | Processing LinkedIn data obtained outside official APIs. | **MEDIUM** |
| **3.1.10** | **Mass Messages** | Generating mass promotions or offers. | **LOW** (due to personalization) |

### 🚩 Critical Risks
1.  **Account Restriction**: LinkedIn uses sophisticated heuristics to detect non-human behavior. Automated API calls for high-volume messaging can lead to permanent account suspension.
2.  **API Revocation**: Using official API tokens for cold outreach outside of approved "Sales Navigator" Use Cases can result in your API key being revoked.

---

## ✅ Safe Operating Procedures (SOP)

To maintain account health while using the autonomous engine, you **MUST** follow these rules:

### 1. The "Human-in-the-Loop" Rule
Never set LinkedIn outreach to "Fully Autonomous" (Auto-Send). 
- **Method**: Use the Dashboard to review AI-generated LinkedIn messages.
- **Action**: Click the "Approve & Send" button manually. This keeps the interaction "human-triggered" in the eyes of most telemetry systems.

### 2. Strict Volume Limits
The system is hard-coded with specific safety limits in `outreach-agent.js`:
- **Daily Limit**: 25 Connection Requests / DMs.
- **Weekly Limit**: 100 interactions.
*Do not attempt to increase these via the database without consulting the technical team.*

### 3. Hyper-Personalization
LinkedIn flags identical messages sent to multiple people. 
- **The Solution**: Our system uses **Claude 3.5 Sonnet** to inject specific technical audit signals (e.g., website load speed, Google rating) into every single DM. This makes every message unique, significantly reducing the "Bot" signature.

---

## 🛠️ Technical Setup

1.  **Obtain Token**: Enter your `LINKEDIN_ACCESS_TOKEN` in the [**.env**](file:///c:/Antigravity/AutonomousZeroFees/.env) file.
2.  **Verify Channel**: Ensure the `linkedin` channel is active in `packages/agents/outreach-agent/outreach-agent.js`.
3.  **Physical Address**: Ensure `AGENCY_PHYSICAL_ADDRESS` is set in your environment—this is required for all business-to-consumer outreach.

---

> [!IMPORTANT]
> **Account Recommendation**: We strongly recommend using a dedicated **SDR (Sales Development Representative)** profile rather than the primary CEO or Agency Founder profile for automated "Discovery" outreach. This isolates your primary professional brand from any potential technical flags.

> [!TIP]
> **Soft CTAs**: The system is programmed to use "Low-Friction" asks in LinkedIn (e.g., *"Mind if I send over a quick mockup of a faster site?"*) rather than hard sales links. This improves response rates and compliance scores.
