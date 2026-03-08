# ROADMAP — Autonomous Web Agency System

## Milestone 1: Production-Ready Agency Platform (v1.0)

### Phase 1: Foundation Validation
**Status**: ✅ Complete
**Goal**: Monorepo scaffolded, all configs created, agents implemented, frameworks initialized, dependencies installed, Prisma client generated.
**Must-haves**:
- [x] Directory structure (80+ files)
- [x] Root configs (package.json, turbo.json, pnpm-workspace.yaml, .env.example, .gitignore)
- [x] Docker setup (docker-compose.yml, 5 Dockerfiles, nginx.conf)
- [x] Prisma schema v1.1 (24 models, 30 enums)
- [x] All 9 agent implementations
- [x] Framework initialization (Next.js, NestJS x2)
- [x] pnpm install + prisma generate

---

### Phase 2: Docker & Database Validation
**Status**: ✅ Complete
**Goal**: Docker stack boots cleanly, PostgreSQL initialized with pgvector + schemas, Prisma schema synced, health endpoints responding, advanced campaign setup integrated.
**Must-haves**:
- [x] `docker compose up postgres redis` succeeds (Port 54321)
- [x] PostgreSQL init script creates pgvector extension and 5 schemas
- [x] Prisma schema synced all 29 tables
- [x] API health endpoint returns 200 (Port 40000)
- [x] Workers health endpoint returns 200 (Port 44444)
- [x] Dashboard dev server loads (Port 30000)
- [x] Twilio & Campaigns features integrated
- [x] Advanced Campaign Setup (Google Categories, Geo-hierarchy, API Forecast)

---

### Phase 3: API Layer — Core Endpoints
**Status**: ✅ Complete
**Goal**: REST API with auth, CRUD for all core entities, webhook ingestion, Swagger docs complete.
**Must-haves**:
- [x] Auth module (JWT, session management)
- [x] Leads CRUD endpoints
- [x] Businesses CRUD endpoints
- [x] Proposals & Invoices endpoints
- [x] Approval queue endpoints
- [x] Webhook handlers (Stripe, email replies)
- [x] Swagger docs for all endpoints
- [x] Rate limiting active on all routes

---

### Phase 4: Event Bus & Orchestrator Integration
**Status**: ✅ Complete
**Goal**: Redis event bus wired, orchestrator state machine enforced via API, domain events flowing.
**Must-haves**:
- [x] Redis Pub/Sub event bus implementation
- [x] State machine validation on all lead transitions
- [x] Domain events emitting on state changes
- [x] Audit log entries on all mutations
- [x] Orchestrator routing integrated with BullMQ queues

---

### Phase 5: Worker Queues & Agent Wiring
**Status**: ✅ Complete
**Goal**: BullMQ queues processing agent jobs, all 9 agents connected to real queue processors.
**Must-haves**:
- [x] BullMQ queue setup (one queue per agent class)
- [x] Scout Agent queue processor
- [x] Outreach Agent queue processor
- [x] Design Preview Agent queue processor
- [x] Sales Close Agent queue processor
- [x] Web Build Agent queue processor
- [x] Client Success Agent queue processor
- [x] Content Agent queue processor
- [x] Error Agent integrated as cross-cutting handler
- [x] Worker health checks monitoring queue depth

---

### Phase 6: Dashboard — Full Feature Build
**Status**: ✅ Complete
**Goal**: Dashboard with all control plane views — pipeline, agents, approvals, clients, admin, ops.
**Must-haves**:
- [ ] Pipeline board with drag-and-drop lead management
- [ ] Agent status cards with real-time updates
- [ ] Approval queue with approve/reject actions
- [ ] Client/project management views
- [ ] Admin user management
- [ ] Notification center
- [ ] Analytics and audit trail views
- [ ] Real-time WebSocket updates

---

### Phase 7: External Integrations
**Status**: ✅ Complete
**Goal**: All external services connected — email, payments, storage, APIs.
**Must-haves**:
- [ ] Resend/SendGrid email sending
- [ ] Stripe payment processing + webhook handling
- [ ] S3-compatible storage for assets
- [ ] Google Places API integration (Scout)
- [ ] PageSpeed Insights API integration (Scout)
- [ ] Hunter.io email finding integration (Scout)
- [ ] ScreenshotOne or Playwright screenshots (Design Preview)

---

### Phase 8: Operational Subsystems
**Status**: ✅ Complete
**Goal**: Backup, maintenance, incident management, and admin systems operational.
**Must-haves**:
- [x] Automated daily PostgreSQL backups
- [x] Backup restore verification
- [x] Maintenance window scheduling
- [x] Incident detection and classification
- [x] Admin/client portal access separation
- [x] CAN-SPAM compliance enforcement

---

### Phase 9: Testing & Quality
**Status**: ✅ Complete
**Goal**: Comprehensive test coverage — unit, integration, E2E.
**Must-haves**:
- [x] Unit tests for all agents (mock Claude responses)
- [x] Unit tests for state machine transitions
- [x] Integration tests for API endpoints
- [x] E2E tests for critical user flows
- [x] CI pipeline configuration

---

### Phase 10: Production Deployment
**Status**: 🔄 In Progress
**Goal**: Production-ready deployment with monitoring, secrets management, and operational runbooks.
**Must-haves**:
- [ ] Docker Secrets for production credentials
- [ ] Production docker-compose with resource limits
- [ ] Monitoring and alerting setup
- [ ] Deployment runbook documentation
- [ ] Rollback procedures documented

---

### Phase 11: Locations Management
**Status**: ✅ Complete
**Objective**: Implement custom geographic data management (Imports/Sync) for the Campaign Wizard.
**Depends on**: Phase 6

**Tasks**:
- [ ] Add "Locations" section to System page
- [ ] Implement manual and file-based JSON import logic
- [ ] Synchronize custom locations with Campaign Wizard dropdowns
- [ ] Implement local storage persistence for locations

**Verification**:
- Verify successful import of New York municipality data
- Confirm Location dropdowns in Campaign Wizard reflect imported data

---

### Phase 12: Campaign Control Enhancements
**Status**: ✅ Complete
**Objective**: Implement advanced campaign controls (Scheduling/Delete) and Job Queue UI.
**Depends on**: Phase 11

**Tasks**:
- [x] Add `isScheduled` and `scheduledDate` to campaign state
- [x] Implement `handleDeleteCampaign` logic
- [x] Update Campaign Wizard to include Step 4 (Scheduling) and Step 5 (Summary)
- [x] Refactor Job Queue into a dedicated "Job Queue" tab/page
- [x] Add "Delete" button to campaign cards


---

### Phase 13: Scout Agent Enhancements
**Status**: 🔄 In Progress
**Objective**: Integrate GTMetrix and Pingdom to improve website quality heuristics for the Scout Agent.
**Depends on**: Phase 12

**Tasks**:
- [ ] Add GTMetrix & Pingdom API input cards to Dashboard UI settings.
- [ ] Update `scout-agent.js` to run `checkGTMetrix(url)` and `checkPingdom(url)`.
- [ ] Incorporate GTMetrix and Pingdom stats into the lead's `qualityScore` algorithm.
- [ ] Pass the new metrics to Claude to generate more specific outreach copy.

**Verification**:
- [ ] API keys map successfully in dashboard UI and save to database.
- [ ] Scout Agent diagnostic successfully pulls performance/uptime metrics and populates the `issues` list payload.
