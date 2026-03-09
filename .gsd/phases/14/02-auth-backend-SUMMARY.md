---
phase: 14
plan: 2
status: complete
---

# SUMMARY: Auth Backend Expansion

Implemented multi-identifier login and credential recovery logic.

- [x] Update `UsersService.findOne` for email/username lookup
- [x] Update `AuthService.validateUser`
- [x] Add `/auth/forgot-credentials` to `AuthController`
- [x] Implement mock recovery in `AuthService`
