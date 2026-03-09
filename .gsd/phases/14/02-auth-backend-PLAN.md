---
phase: 14
plan: 2
wave: 2
---

# PLAN: Auth Backend Expansion

Extend AuthService and AuthController to handle username/email login and forgot credentials.

<task>
Update UsersService.findOne to handle identifier (email or username).
<verify>
grep "where: { OR:" apps/api/src/modules/users/users.service.ts
</verify>
</task>

<task>
Add forgot-credentials endpoint to AuthController.
<verify>
grep "forgot-credentials" apps/api/src/modules/auth/auth.controller.ts
</verify>
</task>

<task>
Implement mock credential recovery in AuthService.
<verify>
Verify logic logs the "Email sent" mock message.
</verify>
</task>
