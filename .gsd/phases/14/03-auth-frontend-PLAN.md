---
phase: 14
plan: 3
wave: 3
---

# PLAN: Auth Frontend UI

Build the Login page and integrate session management into the Dashboard.

<task>
Add authApi to src/lib/api.ts.
<verify>
Check for login and forgotCredentials methods in api.ts.
</verify>
</task>

<task>
Create LoginView component in web-agency-dashboard.jsx.
<verify>
Ensure input for identifier and password exists.
</verify>
</task>

<task>
Implement Forgot Credentials flow in UI.
<verify>
Verify "Forgot Email or Username" link triggers the recovery view.
</verify>
</task>

<task>
Enforce session check on App mount.
<verify>
Dashboard should redirect to Login if token is missing.
</verify>
</task>
