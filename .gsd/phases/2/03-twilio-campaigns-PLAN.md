---
phase: 2
plan: 3
wave: 1
---

# 03-Twilio-Campaigns-PLAN

Implement Twilio SMS/Voice integration and a new 'Campaigns' management tab in the dashboard.

## Tasks

### 1. Dashboard: Add Campaigns Tab & View
- **Add** 'campaigns' to the `labels` and button list in `web-agency-dashboard.jsx`.
- **Implement** a basic `activeView === 'campaigns'` section showing mock campaigns.
- <verify>
  `grep "campaigns" web-agency-dashboard.jsx`
  Visual verification of tab.
  </verify>

### 2. Dashboard: Twilio API Configuration
- **Add** Twilio section to the `INTEGRATIONS` array in the `api` view.
- **Include** fields for `SID`, `Auth Token`, and `Phone Number`.
- **Add** a "Compliance Verified" badge to simulate A2P 10DLC verification.
- <verify>
  `grep "Twilio" web-agency-dashboard.jsx`
  Verify Twilio cards appear in API settings.
  </verify>

### 3. Outreach Agent: Add SMS Channel
- **Add** `sms` to `SOCIAL_CHANNELS` or a new `COMMUNICATION_CHANNELS` constant.
- **Implement** `sendSMS` and `makeCall` stubs in `OutreachAgent`.
- **Update** `selectChannels(lead)` to include SMS if phone is present.
- <verify>
  `grep "sendSMS" packages/agents/outreach-agent/outreach-agent.js`
  Check logic for SMS channel selection.
  </verify>

### 4. Lead Modal: Timeline Integration
- **Add** SMS/Call icons and mock activity to the `typeIcons` and sample lead timelines.
- <verify>
  Visual check in CRM lead modal for SMS/Call events.
  </verify>
