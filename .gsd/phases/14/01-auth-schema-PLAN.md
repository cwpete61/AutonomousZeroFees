---
phase: 14
plan: 1
wave: 1
---

# PLAN: Auth Schema Update

Add 'username' field to the User model to support multi-identifier login.

<task>
Update schema.prisma with username field.
<verify>
Check packages/db/prisma/schema.prisma for the field.
</verify>
</task>

<task>
Run prisma generate and migration.
<verify>
pnpm -C packages/db exec prisma migrate dev --name add_username
</verify>
</task>
