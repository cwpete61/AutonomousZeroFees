---
phase: 12
plan: 1
wave: 1
---

# Plan 1: Campaign Control Enhancements

Implement scheduling and deletion for campaigns in the dashboard.

## Tasks

### 1. Update State Management
- [ ] Add `isScheduled` and `scheduledDate` to `newCampaign` initial state.
- [ ] Add `handleDeleteCampaign` function to `Dashboard`.
- [ ] Update `addCampaign` to handle scheduled status.

### 2. Update Campaign Wizard
- [ ] Increase step count to 5.
- [ ] Add Step 4: Scheduling (Toggle + DateTime picker).
- [ ] Add Step 5: Summary (Final verification).
- [ ] Update modal navigation buttons.

### 3. Update Campaign UI & Navigation
- [ ] Add "JOB QUEUE" to header navigation items.
- [ ] Create dedicated `activeView === 'jobqueue'` section.
- [ ] Move Job Queue grid into the new view.
- [ ] Remove Job Queue code from `campaigns` view.
- [ ] Ensure Delete functionality works in the new view.

## Verification
- [ ] Verify scheduled campaign appears in Job Queue.
- [ ] Verify deleted campaign is removed from localStorage.
