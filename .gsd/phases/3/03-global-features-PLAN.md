---
phase: 3
plan: 3
wave: 2
---

# Plan 3.3: Global API Features

## Goal
Finalize the API layer with documentation, rate limiting, and webhook support.

## Tasks
1. [ ] Configure Swagger (OpenAPI) at `/docs`
2. [ ] Implement `ThrottlerModule` for rate limiting
3. [ ] Create Webhooks controller for Stripe and Email events
4. [ ] Implement global ExceptionFilters for consistent error responses

## Verification
- [ ] `/docs` loads Swagger UI correctly
- [ ] Excessive requests receive 429 Too Many Requests
- [ ] Test webhooks respond with 200 OK
