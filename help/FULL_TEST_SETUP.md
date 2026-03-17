# 🧪 Full E2E Test Setup Guide

This guide outlines the critical path for running a **Full End-to-End (E2E) Test** including Email, LinkedIn, and full marketing intelligence signals.

---

## 1. Environment Finalization
To move from "Diagnostic" to "Full Production Test," ensure your [**.env**](file:///c:/Antigravity/AutonomousZeroFees/.env) matches the following:

### 🧠 Core Intelligence
- `ANTHROPIC_API_KEY`: Required for High-Quality email copywriting.
- `OPENAI_API_KEY`: Required for PageSpeed/SEO technical auditing.

### 📧 Email Delivery (Instantly)
- `INSTANTLY_API_KEY`: Must be a valid key from your Instantly.ai dashboard.
- **Verification**: Go to Instantly -> Settings -> Accounts and ensure at least one email account is connected and "Warmup" is active.

### 🔗 Social & SMS (LinkedIn/Twilio)
- `LINKEDIN_ACCESS_TOKEN`: Required for automated LinkedIn connection requests.
- `TWILIO_SID` & `TWILIO_TOKEN`: Required if you intend to test SMS follow-ups for home-service niches.
- `AGENCY_PHYSICAL_ADDRESS`: **CRITICAL**. Must be a real address for CAN-SPAM compliance in email footers.

---

## 2. Launching the "Live Test" Campaign

### Step A: The Sequence Template
1.  Navigate to **EMAIL CAMPAIGNS**.
2.  Create a sequence named `E2E_PROD_TEST`.
3.  Add **Marketing Links**: 
    - When writing your body, use clear CTAs like "Check out your custom audit here: {{audit_link}}".
    - *Note: Instantly will automatically wrap these in tracking pixels if "Open/Click Tracking" is enabled in the Instantly campaign settings.*

### Step B: The Scout Trigger
1.  Click **🚀 Launch Campaign**.
2.  Set **Niche**: `HVAC` or `Real Estate` (High response niches).
3.  Set **Geography**: Choose a specific city (e.g., `Miami, FL`).
4.  Set **Lead Limit**: Set to `5` for your first live test to avoid overwhelming your domain.
5.  **Enable Auto-Outreach**: Toggle this **ON** so the system pushes candidates directly to the `OUTREACH_PENDING` state.

---

## 3. The Validation Pipeline
Once the campaign starts, monitor these exact transitions:

1.  **Job Queue**: Verify `research-queue` results are coming back with `Propensity Scores` > 70.
2.  **Audit Data**: Click into a lead to verify you see real **PageSpeed** scores and **Review Counts**.
3.  **Outreach Review**:
    - Navigate to **Pipeline** -> **Outreach Pending**.
    - Review the AI-generated email. It should reference the specific Lead's Google reviews and website speed.
4.  **The "Send"**: Click **Approve**. 
    - Check your Instantly dashboard. You should see a new campaign created (or lead added to existing) with the personalized variables.

---

## 4. Measuring Success (Marketing ROI)
- **Open Rates**: Monitor in the **Conversations** tab.
- **Reply Classification**: When a lead replies, the **Outreach Agent** will classify it as `Interested` or `Meeting Booked`.
- **Conversion**: If interested, move the lead to `DEMO_PENDING` to trigger the **Design Preview Agent**.

---

> [!TIP]
> **Domain Safety**: Always use a "Throwaway" or "Burner" domain for your first 3 production tests (e.g., `yourbrand-outreach.com`) rather than your primary agency domain.
