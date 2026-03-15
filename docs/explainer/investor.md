# Autonomous Web Sales (Orbis Outreach) — Investor Explainer

## What It Is

An autonomous, multi-agent platform that finds businesses with weak web presence, runs personalized outreach, closes deals, and delivers sites—end-to-end with minimal human lift.

## Problem

Manual prospecting, outreach, and fulfillment are slow, inconsistent, and expensive. Most tools cover a slice (email, CRM) but not the full pipeline, leaving revenue on the table for agencies and SMBs.

## Solution

Coordinated agents that:

- **Scout**: detect poor websites and prioritize targets.
- **Enrich**: pull firmographics/contacts.
- **Outreach**: generate personalized multi-channel campaigns.
- **Sell**: qualify, schedule, and advance deals.
- **Deliver**: build and ship sites, then nurture post-sale.
  Orchestrated by a central workflow engine with queues, events, and observability.

## Product Surface

- **Dashboard (port 30000)**: pipeline, campaigns, leads, settings.
- **Marketing site (port 20000)**: acquisition funnel.
- **API (port 40000)**: campaigns, leads, email sequences, diagnostics, backups.
- **Workers (port 44444)**: queue processors for scout, outreach, demo, build, content, sales-close, client-success, nurture, audit.

## Architecture (High Level)

- **Frontends**: Next.js apps (dashboard, marketing).
- **Backend**: NestJS API with JWT auth + role guard, Prisma/Postgres, Bull queues, Redis for events/queues.
- **Workers**: NestJS service running specialized processors and bull-board.
- **Infra**: Docker Compose (nginx, postgres, redis, api, workers, dashboard, marketing, backup-runner).
- **Shared libs**: config, db, events, orchestrator, agents, services.

## How It Works (Pipeline)

1. Lead discovery (scout) → bad-site detection → target list.
2. Enrichment → contact data.
3. Sequencing → personalized email/social sequences.
4. Outreach + qualification → meetings booked.
5. Demo/close → proposals/invoices hooks present.
6. Fulfillment → web-build agent + content/design assistance.
7. Nurture/CS → follow-ups and upsell paths.

## Why It Wins

- Full-funnel automation (prospect → fulfill) vs point tools.
- Queue-backed reliability and deterministic workflows.
- Extensible agent library (code, content, outreach, nurture, audit).
- Runs locally/on-prem via Docker; minimal cloud dependence.

## Current State

- Services up in Docker: api, workers, dashboard, marketing, redis, postgres, nginx (backup-runner kept alive until backup logic is implemented).
- JWT auth with seeded superadmin (`owner@agency.com` / `Orbis@8214@@!!`); dashboard auto-login fallback included for dev.
- Lint: marketing/dashboard pass; api/workers need ESLint flat config (pending).
- Dev mode via `pnpm dev` conflicts with running Docker on ports 40000/44444; stop Docker or run targeted dev on alternate ports.

## Near-Term Roadmap

- Implement backup-service logic and remove keep-alive stub.
- Add ESLint flat configs for api/workers; re-enable lint.
- Implement the search_quality_rater skill (spec ready).
- Harden auth flows (refresh tokens, RBAC UX) and secrets management.

## KPIs

- Cost/lead, reply rate, meeting rate, close rate.
- Fulfillment cycle time; agent success/failure counts.
- Queue latency; health/crash alerts.
