# 📊 Real-Time Data Tracking (Datapoints)

Profit Shield AI is designed to move from "Sample Mode" to "Production Mode" by tracking live metrics across the merchant recovery lifecycle.

## 1. Technical Datapoints
Every lead discovered by the **Scout Agent** is audited for:
- **Payment Friction**: Detecting manual invoicing, lack of pay-links, and legacy terminals.
- **Transaction Volume Signals**: AI-estimated processing volume based on industry, review frequency, and location.
- **Legacy Stack**: Identification of older POS hardware or gateway integrations.
- **Industry Margin Sensitivity**: Calculating the impact of a 3% fee reduction on the business's net profit.

## 2. Lead Qualification Datapoints
We use a weighted **Profit Gap Score (0-100)**:
- **LOWER SCORE = BETTER LEAD**: This represents a high "Profit Leak" where the business is overpaying legacy banks.
- **Signals**: High daily transaction count, no automated recurring billing, and lack of integrated online payments.

## 3. Communication Datapoints
The **Outreach Agent** tracks:
- **Email Open Rates**: (Tracked via Instantly/Resend webhooks).
- **Reply Sentiment**: AI-classified sentiment (Interested, Objection, Question).
- **Reply Velocity**: Days from outreach to first response.
- **Audit Views**: Tracking when a prospect views their custom "Profit Recovery Report."

## 4. Financial Datapoints
- **Annual Waste Estimate**: The projected amount of capital being lost to unnecessary fees.
- **Recovery Potential**: The net profit jump for the client after "Zero-Fee" activation.
- **Reinvestment Budget**: The capital reclaimed that can be used to fund digital growth.

---

### 🚀 Transitioning to Real Data
To begin tracking these datapoints for real leads:
1.  **Fill API Keys**: Update your [**.env**](file:///c:/Antigravity/AutonomousZeroFees/.env) with real Google, Hunter, and Instantly keys.
2.  **Launch Campaign**: Use the **Campaign Wizard** in the dashboard to start a search in a specific city/industry.
3.  **Approve Recovery Audits**: Review the generated audits in the **Approvals** tab.

> [!NOTE]
> The app is now in a fresh state, ready for your first "Profit Shield" production campaign. All legacy website-design samples have been removed.
