---
phase: 9
plan: 2
wave: 1
name: Integration Tests — API Endpoints
---

# PLAN: Integration Tests — API Endpoints

Test API endpoints end-to-end with a real NestJS application context but a mocked/test database. Covers campaigns, leads, and email sequence endpoints.

## Tasks

### 1. Setup Supertest & NestJS Testing Module
Configure integration test infrastructure using `@nestjs/testing` and `supertest`.

<task>
Install `supertest` and `@types/supertest` in `apps/api`.
Create `apps/api/test/setup.ts` that bootstraps a test NestJS app with an in-memory SQLite or the test Postgres schema.
Create `apps/api/test/jest-e2e.json` config.
Add `"test:e2e": "jest --config test/jest-e2e.json"` to package.json.
</task>

<verify>
cd apps/api && pnpm test:e2e -- --passWithNoTests
</verify>

### 2. Campaigns API Integration Tests
Test CRUD operations on the campaigns endpoint.

<task>
Create `apps/api/test/campaigns.e2e-spec.ts`.
Test POST /campaigns — creates campaign and returns 201.
Test GET /campaigns — returns array.
Test PATCH /campaigns/:id — updates fields.
Test DELETE /campaigns/:id — removes campaign.
</task>

<verify>
cd apps/api && pnpm test:e2e -- --testPathPattern=campaigns
</verify>

### 3. Lead Stage Transition API Tests
Test that the state machine is enforced via the API.

<task>
Create `apps/api/test/leads.e2e-spec.ts`.
Test PATCH /leads/:id/stage with valid next stage → 200.
Test PATCH /leads/:id/stage with invalid stage skip → 400.
Test audit log entry is created on each transition.
</task>

<verify>
cd apps/api && pnpm test:e2e -- --testPathPattern=leads
</verify>

### 4. AI Email Generation API Tests
Test the AI email generation endpoint with a mocked Anthropic client.

<task>
Create `apps/api/test/ai.e2e-spec.ts`.
Mock the Anthropic SDK to return fixture email content.
Test POST /ai/generate-emails returns expected subject and body structure.
Test that missing required fields return 400.
</task>

<verify>
cd apps/api && pnpm test:e2e -- --testPathPattern=ai
</verify>

## Verification
- [ ] All integration tests pass with `pnpm test:e2e`
- [ ] No live external API calls made during tests
- [ ] Database is cleaned between test runs
