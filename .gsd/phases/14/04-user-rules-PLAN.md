---
phase: 14
plan: 4
wave: 4
---

# PLAN: User Rule Refinement & Super Admin Setup

Enforce strict user data requirements and initialize the Super Admin account.

<task>
Update schema.prisma to make username and fullName required.
<verify>
Run `npx prisma validate` to check schema correctness.
</verify>
</task>

<task>
Apply database migration.
<verify>
Verify User table structure in database.
</verify>
</task>

<task>
Update UsersService to enforce immutable usernames and password changes.
<verify>
Check UsersService for update and changePassword methods.
</verify>
</task>

<task>
Set Super Admin credentials (superadmin / Orbis@8214@@!!).
<verify>
Login to the dashboard with the new credentials.
</verify>
</task>
