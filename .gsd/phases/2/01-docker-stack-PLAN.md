---
phase: 2
plan: 1
wave: 1
title: Docker Stack Boot
---

# Plan: Docker Stack Boot

## Goal
Get PostgreSQL and Redis containers running with health checks passing.

## Tasks

<task name="Start Docker Containers">
Run `docker compose up postgres redis -d` and verify both containers are healthy.

### Steps
1. Run `docker compose up postgres redis -d`
2. Wait for containers to reach healthy state
3. Verify PostgreSQL accepts connections on port 5432
4. Verify Redis accepts connections on port 6379

### Verify
```bash
docker compose ps
docker compose exec postgres pg_isready
docker compose exec redis redis-cli ping
```
</task>

<task name="Verify PostgreSQL Init Script">
Confirm the init script created pgvector extension and all 5 schemas.

### Steps
1. Connect to PostgreSQL container
2. Check pgvector extension exists
3. Check all 5 schemas exist (core, auth, ops, backup, vector)

### Verify
```bash
docker compose exec postgres psql -U postgres -d agency_db -c "SELECT extname FROM pg_extension WHERE extname = 'vector';"
docker compose exec postgres psql -U postgres -d agency_db -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('core','auth','ops','backup','vector');"
```
</task>
