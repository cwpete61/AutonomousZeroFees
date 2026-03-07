---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Redis Event Bus Implementation

## Goal
Implement a robust, Redis-backed domain event bus in `packages/events` to facilitate communication between API and Workers.

## Tasks
1. [ ] Create `RedisEventBus` service in `packages/events`
2. [ ] Implement `publish` and `subscribe` methods using `ioredis`
3. [ ] Define standard `DomainEvent` interface
4. [ ] Create NestJS-friendly `EventsModule` for easy injection

## Verification
- [ ] Unit test: Publish an event and verify it is received by a dummy subscriber
- [ ] Verify Redis connection using logs
