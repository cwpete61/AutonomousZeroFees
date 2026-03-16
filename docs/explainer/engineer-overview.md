# Autonomous Web Sales (Orbis Outreach - BPS) — Engineer Overview

## Purpose

Fully automated pipeline to find businesses with weak web presence, enrich contacts, run personalized outreach, manage leads/campaigns, close deals, and deliver sites via coordinated agents.

## Architecture

- **Frontends:** Next.js apps — `apps/dashboard` (ops UI, port 30000) and `apps/marketing` (marketing site, port 20000).
- **Backend API:** NestJS (`apps/api`, port 40000) with JWT auth/role guard, Prisma + Postgres for data, Bull queues for async work, Redis for queues/events.
- **Workers:** NestJS service (`apps/workers`, port 44444) running Bull processors for scout, outreach, demo, content, web-build, sales-close, client-success, nurture, audit; Bull board exposed.
- **Shared packages:** config, db (Prisma client), events, orchestrator, logger, utils, agents, multiple services (email, backup, maintenance, website-audit, etc.).
- **Infra:** Docker Compose (nginx, postgres, redis, api, workers, dashboard, marketing, backup-runner). Nginx fronts 80/443.
- **Tooling:** pnpm workspace, Turborepo; Prisma for ORM; Bull for queues; Redis/Postgres; Next.js/NestJS.

## Workflow (Happy Path)

1. Scout agent finds bad websites → target list.
2. Enrichment service pulls firmographics/contacts.
3. Campaign/email-sequence creation with templated/personalized content.
4. Outreach + lead qualification; leads progress through pipeline.
5. Demo/close hooks (billing/proposals endpoints present).
6. Fulfillment via web-build/content/design agents.
7. Post-sale nurture/client-success flows.

## Runtime Services (Compose Defaults)

- Dashboard: 30000 → Next.js app UI.
- Marketing: 20000 → marketing site.
- API: 40000 → NestJS REST (Swagger at `/docs`).
- Workers: 44444 → NestJS processors + Bull board.
- Redis: 6379; Postgres: 54321 mapped; nginx: 80/443.
- Backup-runner: keep-alive stub; backup-service not yet implemented.

## Auth

JWT strategy with seeded superadmin (`owner@agency.com` / `Orbis@8214@@!!`). Dashboard includes an auto-login fallback in dev (defaults via env or built-in constants).

## Data Layer

Prisma schema in `packages/db`; `DATABASE_URL` targets Postgres; generated client in `packages/db/generated/client`.

## Queues/Events

Bull (Redis) for queues; workers subscribe to event bus for lead status changes, etc.

## Key Code Locations

- `apps/api/src`: modules for auth, leads, campaigns, email-sequences, webhooks, billing, settings, diagnostics, backups, maintenance, agents, incidents.
- `apps/workers/src`: job processors (scout, outreach, demo, content, sales-close, client-success, nurture, audit, web-build), workflow listener, schedulers.
- `apps/dashboard/src`: UI, API client (`src/lib/api.ts`), pages.
- `packages/*`: shared agents, services, config, utils.

## Dev vs Docker

- Docker: `docker compose up -d` brings full stack with fixed ports.
- Local dev: `pnpm dev` runs all watch tasks; conflicts with running Docker on 40000/44444. Either stop Docker or run targeted dev: `pnpm --filter @agency/api dev`, `pnpm --filter @agency/dashboard dev`, etc., and adjust ports if needed.

## Current Gaps / Notes

- Backup service is a stub; backup-runner is kept alive with a tail.
- ESLint v9 flat configs missing for api/workers (lint fails there); marketing/dashboard lint pass.
- search_quality_rater skill spec is written, not yet implemented.
- Hardcoded default creds for dev auto-login; swap to env secrets for production.
