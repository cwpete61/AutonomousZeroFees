# 📊 Real-Time Data Tracking (Datapoints)

Orbis Outreach is designed to move from "Sample Mode" to "Production Mode" by tracking live metrics across the lead lifecycle.

## 1. Technical Datapoints
Every lead discovered by the **Scout Agent** is audited for:
- **PageSpeed Score**: Core Web Vitals (FCP, LCP, CLS) from Google PageSpeed Insights.
- **GTMetrix Grade**: Performance and Structure scores for deep technical auditing.
- **Pingdom Response**: Global latency and uptime checks.
- **SSL Status**: Binary check for secure connections.

## 2. Lead Qualification Datapoints
We use a weighted **Qualification Score (0-100)**:
- **LOWER SCORE = BETTER LEAD**: This represents "Bad Website Quality" which makes the business a prime candidate for a redesign.
- **Signals**: Outdated copyright dates, non-responsive layouts, slow mobile speed, and poor CTA visibility.

## 3. Communication Datapoints
The **Outreach Agent** tracks:
- **Email Open Rates**: (Tracked via Instantly/Resend webhooks).
- **Reply Sentiment**: AI-classified sentiment (Positive, Negative, Unsubscribe).
- **Reply Velocity**: Days from outreach to first response.
- **Engagement Time**: Seconds spent viewing the "Blurred Redesign Preview."

## 4. Financial Datapoints
- **Budget Tiers**: AI-estimated budget based on business size and location.
- **Conversion Velocity**: Days from Discovery to Payment.
- **ROI Factor**: Projected lead jump for the client post-redesign.

---

### 🚀 Transitioning to Real Data
To begin tracking these datapoints for real leads:
1.  **Fill API Keys**: Update your [**.env**](file:///c:/Antigravity/AutonomousZeroFees/.env) with real Google, Hunter, and Instantly keys.
2.  **Launch Campaign**: Use the **Campaign Wizard** in the dashboard to start a search in a specific city/industry.
3.  **Approve Sequences**: Review the generated sequences in the **Approvals** tab.

> [!NOTE]
> The "Sample Data" that was previously in the dashboard has been completely removed. The app is now in a fresh state, ready for your first production campaign.
