---
phase: 2
plan: 2
wave: 2
title: Prisma Migration & App Boot
depends_on: [1]
---

# Plan: Prisma Migration & App Boot

## Goal
Apply the first Prisma migration against PostgreSQL and verify all 3 apps boot in dev mode.

## Tasks

<task name="Apply First Migration">
Run Prisma migrate to create all 24 tables in the database.

### Steps
1. Run `pnpm db:migrate` from project root
2. Name the migration "init"
3. Verify all tables created

### Verify
```bash
cd packages/db && npx prisma migrate status
docker compose exec postgres psql -U postgres -d agency_db -c "\dt"
```
</task>

<task name="Boot API Server">
Start the NestJS API and verify health endpoint responds.

### Steps
1. Run API in dev mode
2. Hit the health endpoint

### Verify
```bash
curl http://localhost:4000/health
```
Expected: `{"status":"ok","service":"agency-api",...}`
</task>

<task name="Boot Workers Server">
Start the NestJS Workers and verify health endpoint responds.

### Steps
1. Run Workers in dev mode
2. Hit the health endpoint

### Verify
```bash
curl http://localhost:4001/health
```
Expected: `{"status":"ok","service":"agency-workers",...}`
</task>

<task name="Boot Dashboard">
Start the Next.js dashboard and verify it loads.

### Steps
1. Run dashboard in dev mode
2. Open http://localhost:3000

### Verify
Navigate to http://localhost:3000 — should display the agency dashboard.
</task>
