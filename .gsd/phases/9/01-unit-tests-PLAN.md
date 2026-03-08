---
phase: 9
plan: 1
wave: 1
name: Unit Tests — Agents & State Machine
---

# PLAN: Unit Tests — Agents & State Machine

Write unit tests for core business logic: agent scoring, state machine transitions, and email prompt builders. All external dependencies (Claude, Prisma) should be mocked.

## Tasks

### 1. Setup Jest & Test Infrastructure
Configure Jest for the monorepo with proper tsconfig paths, module aliases, and shared mocks.

<task>
Create `apps/api/jest.config.js` with ts-jest preset.
Create `apps/workers/jest.config.js` with ts-jest preset.
Add `"test": "jest"` scripts to both package.json files.
Install `jest`, `ts-jest`, `@types/jest` in each app.
</task>

<verify>
cd apps/api && pnpm test -- --passWithNoTests
cd apps/workers && pnpm test -- --passWithNoTests
</verify>

### 2. State Machine Transition Tests
Test that leads can only move to valid next states and invalid transitions throw errors.

<task>
Create `apps/api/src/modules/leads/leads.state-machine.spec.ts`.
Test all valid transitions (e.g. lead_inbox → discovered → qualified).
Test that invalid transitions throw a `BadRequestException`.
Mock Prisma client using `jest.mock`.
</task>

<verify>
cd apps/api && pnpm test -- --testPathPattern=state-machine
</verify>

### 3. Scout Agent Scoring Logic Tests
Test that the scoring algorithm returns correct scores for given inputs.

<task>
Create `packages/agents/scout-agent/scout-agent.spec.ts`.
Test score calculation for businesses with/without websites, reviews, and GBP listings.
Assert score ranges (0-100) and correct weighting.
</task>

<verify>
pnpm test -- --testPathPattern=scout-agent
</verify>

### 4. Email Prompt Builder Tests
Test that AI prompt templates render correctly with different campaign/lead data.

<task>
Create `apps/workers/src/jobs/outreach.processor.spec.ts`.
Test that prompts include lead name, business type, and city.
Test that empty fields are handled gracefully without crashing.
</task>

<verify>
cd apps/workers && pnpm test -- --testPathPattern=outreach.processor
</verify>

## Verification
- [ ] All unit tests pass with `pnpm test`
- [ ] Coverage reports generated
- [ ] No tests rely on live DB or external APIs
