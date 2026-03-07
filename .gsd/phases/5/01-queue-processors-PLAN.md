---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: BullMQ Processor Scaffold

## Goal
Implement the base BullMQ processor structure in the Workers app to handle agent jobs.

## Tasks
1. [ ] Create `BaseProcessor` class in `apps/workers/src/jobs/base.processor.ts`
2. [ ] Implement `ScoutProcessor` in `apps/workers/src/jobs/scout.processor.ts`
3. [ ] Register `ScoutProcessor` in `WorkersModule`
4. [ ] Wire `ScoutProcessor` to `ScoutAgent` from `@agency/agents`

## Verification
- [ ] Build Workers app: `pnpm --filter @agency/workers build`
- [ ] Verify logs: "ScoutProcessor registered and listening on research-queue"
