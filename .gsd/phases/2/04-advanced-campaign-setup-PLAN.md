---
phase: 2
plan: 4
wave: 2
---

# 04 — Advanced Campaign Setup

Refactor the campaign creation flow to support professional-grade targeting and budget forecasting.

## Context
The current "Create Campaign" modal is a simple 3-field form. We need a 4-step wizard to support:
- Google Category / Service selection
- Hierarchical Geography (State > County > City)
- Scheduling & Volume Targeting
- API Budget Forecasting

## Tasks

### 1. Define Constant Data
Add comprehensive industry and geographic data for the demo.
- [ ] Add `CAMPAIGN_DATA` constants (Industries, Services, Geo-hierarchy).
- [ ] Add `API_COST_MODELS` for forecasting.

<verify>
Check variables are exported and accurately contain defined data.
</verify>

### 2. Refactor CampaignModal UI
Implement the 4-step wizard architecture.
- [ ] Step 1: Basics (Name, Target Count, Dates).
- [ ] Step 2: Niche (Google Categories -> Service Checkboxes).
- [ ] Step 3: Geography (State -> County -> City Selectors).
- [ ] Step 4: Review & Forecast (API consumption analysis).

<verify>
Verify navigation between steps in the dashboard dev server.
</verify>

### 3. Implement Forecasting Logic
Simulate API health checks and credit requirements.
- [ ] Calculate `Scout`, `Audit`, and `OutreachAgent` credits based on target count.
- [ ] Create UI alerts for "Top-up Required" scenarios.

<verify>
Verify calculation matching `targetCount * multiplier` logic.
</verify>

### 4. Persistence & Launch
Ensure new fields are saved to `localStorage` and `campaigns` state.
- [ ] Update `addCampaign` to handle the extended schema.
- [ ] Update `CampaignDetails` to show new targeting data.

<verify>
Reload page and verify campaign data remains consistent.
</verify>
