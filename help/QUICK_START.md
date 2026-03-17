# 💰 Profit Shield Guide: Your First 10 Minutes

Welcome to the command center. This guide will take you from a fresh install to launching your first autonomous research batch.

---

## 🛠️ Step 1: Fuel the Engine (Configuration)
Before the system can think, it needs its AI brains and email credentials.

1.  Open your [**.env**](file:///c:/Antigravity/AutonomousZeroFees/.env) file.
2.  Add your API Keys:
    - `ANTHROPIC_API_KEY`: For the primary "Claude" intelligence.
    - `OPENAI_API_KEY`: Required for GPT-4o auditing and template generation.
    - `INSTANTLY_API_KEY`: For email sequence delivery.
3.  Save the file. The system will auto-detect changes if running.

## 🧪 Step 2: The "Smoke Test" (Diagnostics)
Don't launch a full campaign yet. Verify your setup first.

1.  Navigate to the **SYSTEM** tab in the Dashboard (`localhost:30001`).
2.  Find the **Workflow Test (Diagnostic)** card.
3.  Paste a target URL (e.g., `https://example-hvac.com`).
4.  Click **Run E2E Test**.
5.  **Watch the Logs**: Go to the **JOB QUEUE** tab. You should see the `research-queue` light up as the Scout Agent begins the audit.

## 🚀 Step 3: Launch Your First Campaign
Once diagnostics pass, it's time to scale.

1.  **Define the Sequence**: Go to **EMAIL CAMPAIGNS** -> `✉️ New Sequence`.
    - Toggle **AutoWriteEmail™**.
    - Enter your industry data and save.
2.  **Launch the Scraper**: Click `🚀 Launch Campaign` on the Dashboard home.
    - Give it a name (e.g., "Chicago Plumbers - Initial").
    - Select **Niche** and **Geography**.
    - Assign the sequence you just created.
3.  **Go Live**: Click **Start Discovery**.

## 🕵️ Step 4: Monitoring the Pipeline
The machine is now autonomous, but you are the supervisor.

1.  **Pipeline Tab**: Watch leads move from `DISCOVERED` to `QUALIFIED`.
2.  **Approvals**: Look for the `OUTREACH_PENDING` column. Click on a lead to review the personalized email showing them how much money they can keep for their business.
3.  **Approve**: If it looks good, hit **Approve**. The engine will handle the rest of the 10-day "Profit Shield" sequence.

---

### 🆘 Need Help?
- **Detailed Features**: Check [EXISTING_FEATURES.md](./EXISTING_FEATURES.md)
- **Problem Solving**: See the `incidents` section in the Dashboard.
- **Rules of Engagement**: Read the [Campaign SOP](../campaign_sop.md) in the root directory.
