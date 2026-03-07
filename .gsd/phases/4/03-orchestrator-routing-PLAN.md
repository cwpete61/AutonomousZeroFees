---
phase: 4
plan: 3
wave: 3
---

# Plan 4.3: Orchestrator & BullMQ Routing

## Goal
Integrate the orchestrator with BullMQ to route jobs to specialized agents based on lead state transitions.

## Tasks
1. [ ] Create `OrchestratorService` to handle complex routing logic
2. [ ] Map `LeadStatus` to specific BullMQ queues (e.g., `RESEARCHED` -> `auditor-queue`)
3. [ ] Implement `EventSubscriber` in Workers to listen for `LEAD_STATUS_CHANGED`
4. [ ] Add jobs to BullMQ based on orchestrator rules

## Verification
- [ ] Change lead stage to `RESEARCHED`
- [ ] Verify a job is added to the `auditor` queue in BullMQ
- [ ] Check logs for "Orchestrator routing job to..."
