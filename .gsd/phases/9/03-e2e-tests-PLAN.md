---
phase: 9
plan: 3
wave: 2
name: End-to-End Tests — Critical User Flows
---

# PLAN: End-to-End Tests — Critical User Flows

Use Playwright to run E2E tests against the running dashboard and API. Tests should validate the critical user flows: campaign creation, lead pipeline movement, and email sequences.

## Tasks

### 1. Setup Playwright
Install and configure Playwright targeting the dashboard at `http://localhost:30000`.

<task>
Run `pnpm create playwright` in a new `apps/e2e` directory.
Configure `playwright.config.ts` baseURL to `http://localhost:30000`.
Add `"test:e2e": "playwright test"` script to the e2e package.json.
Add `@agency/e2e` to the pnpm workspace.
</task>

<verify>
cd apps/e2e && pnpm test:e2e -- --reporter=list --passWithNoTests
</verify>

### 2. Campaign Creation Flow
Test creating a campaign through the dashboard wizard UI.

<task>
Create `apps/e2e/tests/campaign-flow.spec.ts`.
Navigate to dashboard → click Campaigns → click Create Campaign.
Fill in campaign name, category, geo, and target count.
Submit and assert campaign appears in the list.
</task>

<verify>
cd apps/e2e && pnpm test:e2e -- --grep "campaign"
</verify>

### 3. Lead Pipeline Movement Flow
Test dragging a lead from one pipeline stage to another.

<task>
Create `apps/e2e/tests/pipeline-flow.spec.ts`.
Navigate to Pipeline view.
Locate a lead card and drag it to the next stage column.
Assert the lead appears in the new column.
</task>

<verify>
cd apps/e2e && pnpm test:e2e -- --grep "pipeline"
</verify>

### 4. Email Sequence Flow
Test creating an email sequence and assigning it to a campaign.

<task>
Create `apps/e2e/tests/email-sequence-flow.spec.ts`.
Navigate to EmailCampaigns.
Create a new sequence with 2 steps.
Assign it to an existing campaign.
Assert the assignment is persisted in the UI.
</task>

<verify>
cd apps/e2e && pnpm test:e2e -- --grep "email sequence"
</verify>

## Verification
- [ ] All Playwright tests pass against running stack
- [ ] Screenshots/videos captured on failure
- [ ] Tests run against `http://localhost:30000` (dashboard) and `http://localhost:40000` (API)
