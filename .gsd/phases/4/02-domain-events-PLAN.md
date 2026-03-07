---
phase: 4
plan: 2
wave: 2
---

# Plan 4.2: Domain Event Emission

## Goal
Wire the core services (Leads, Campaigns) to emit domain events on state changes and important mutations.

## Tasks
1. [ ] Inject `EventBus` into `LeadsService`
2. [ ] Emit `LEAD_STATUS_CHANGED` in `updateStage`
3. [ ] Emit `LEAD_CREATED` in `create`
4. [ ] Implement event decorators or interceptors for cleaner emission (optional)

## Verification
- [ ] Trigger lead stage change via API
- [ ] Verify event appearance in Redis (e.g., via `MONITOR` or a debug subscriber)
