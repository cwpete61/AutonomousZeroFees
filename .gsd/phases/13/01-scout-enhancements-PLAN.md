---
phase: 13
plan: 1
wave: 1
---

# 01-scout-enhancements-PLAN.md

## Goal
Integrate GTMetrix and Pingdom performance metrics into the Scout Agent and Dashboard, and consolidate the dashboard to port 30000.

## Tasks
### Wave 1: Core Logic & Scouting
- [x] Refine performance auditing logic in `packages/agents/scout-agent/scout-agent.js`.
- [x] Implement realistic GTMetrix and Pingdom data fetching (replacing mocks).
- [x] Update `computeQualityScore` to incorporate new performance metrics.
- [x] Verify unit tests for Scout Agent pass with new scoring logic.

### Wave 2: Dashboard UI & Integration
- [x] Add Performance Audit section to the Analytics tab in `apps/dashboard/web-agency-dashboard.jsx`.
- [x] Update CRM lead details to show PageSpeed, GTMetrix, and Pingdom scores.
- [x] Ensure API cards for GTMetrix and Pingdom are fully functional in the Integration Hub.
- [x] Final audit and removal of any port 30001 references in the codebase.

## Verification
- [x] Run `pnpm --filter scout-agent test`.
- [x] Verify port 30001 is unreachable and 30000 is active.
- [x] Perform a diagnostic run with the "Workflow Test" on the dashboard.
