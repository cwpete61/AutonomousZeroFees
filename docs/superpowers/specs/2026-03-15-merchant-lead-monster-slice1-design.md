# Merchant Lead Monster (MLM) - Slice 1 Design

Date: 2026-03-15

## Goal

Ship the first Merchant Lead Monster user-facing flow: a savings calculator and appointment request funnel.

This slice is intentionally additive ("strangler" approach): it introduces a parallel MLM domain without modifying the existing lead/campaign pipeline, queues, or enums used by Orbis Outreach - BPS.

## Non-Goals (Slice 1)

- No merchant discovery.
- No signal extraction.
- No opportunity scoring.
- No outbound outreach sending.
- No dashboard changes required to ship.

## Success Criteria

- A user can visit marketing pages, calculate estimated processing savings, and request an appointment.
- Calculator sessions and appointment requests are persisted in Postgres.
- The legacy app behavior is unchanged (existing APIs, workers, and e2e smoke tests continue to pass).

## Feature Flag / Rollout

- `MLM_ENABLED=true` enables API module wiring.
- `NEXT_PUBLIC_MLM_ENABLED=true` enables marketing routes/UI.
- When disabled:
  - marketing routes return 404.
  - API routes return 404.

Implementation detail: use separate env flags for API vs marketing since `apps/marketing` has client-side code.

Rollout sequencing (to avoid a broken funnel):

- Enable API first (`MLM_ENABLED=true`), verify `/mlm/calculator/sessions/:id` works.
- Enable marketing second (`NEXT_PUBLIC_MLM_ENABLED=true`).

## User Experience (apps/marketing)

### Routes

- `GET /mlm`
  - A short value prop and CTA to calculator.
  - CTA -> `/mlm/calculator`.

- `GET /mlm/calculator`
  - Form inputs:
    - Monthly card volume (required)
    - Current processing rate % (required)
  - On submit:
    - call API to create a calculator session
    - display computed results
    - CTA -> `/mlm/book?session=<id>`

- `GET /mlm/book?session=<id>`
  - Appointment request form:
    - Name (required)
    - Email (required)
    - Phone (optional but recommended)
    - Business name (required)
    - Preferred time window (optional)
    - Notes (optional)
  - On submit:
    - call API to create appointment
    - navigate to confirmation page

The booking page SHOULD verify that `session` exists by calling a read endpoint before submitting the appointment.

If the session is not found (404), show a "Session expired" message and link back to `/mlm/calculator`.

- `GET /mlm/confirmed?appt=<id>`
  - Confirmation + next steps.

### Tracking

Capture and store attribution on calculator session creation:

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` (optional)
- `referrer` (optional)

Source:

- query params
- document referrer

## Pricing Math

### Inputs

UI collects dollar and percent values, but the system stores and computes using integer cents (USD) and basis points.

- `monthlyVolumeUsd` (required, > 0)
- `currentRatePct` (required, > 0)

Input precision:

- `monthlyVolumeUsd`: up to 2 decimal places
- `currentRatePct`: up to 4 decimal places

### Configuration

- `targetRatePct` default: 2.2
- configurable via env: `MLM_TARGET_RATE_PCT`
- the value used MUST be persisted into each `CalculatorSession` for auditability.

Config parsing:

- parse `MLM_TARGET_RATE_PCT` as a percent number (e.g. `"2.2"`)
- validate `0 < targetRatePct <= 100`
- convert to basis points using the same rule as request input (see conversion)

### Computation

Storage representation:

- `monthlyVolumeCents`: integer (bigint)
- `currentRateBps`: integer (basis points; 1 bp = 0.01%)
- `targetRateBps`: integer

Derived values are computed/stored in cents.

Conversion:

- `monthlyVolumeCents = round_half_up(monthlyVolumeUsd * 100)`
- `currentRateBps = round_half_up(currentRatePct * 100)`
- `targetRateBps = round_half_up(targetRatePct * 100)`

- `monthlyFeesCurrentCents = round_half_up(monthlyVolumeCents * currentRateBps / 10000)`
- `monthlyFeesTargetCents  = round_half_up(monthlyVolumeCents * targetRateBps  / 10000)`
- `monthlySavingsCents      = max(0, monthlyFeesCurrentCents - monthlyFeesTargetCents)`
- `annualSavingsCents       = monthlySavingsCents * 12`

Rounding:

- Use round-half-up for all rounding steps.
- API returns USD amounts as fixed 2-decimal strings derived from cents.

## API Design (apps/api)

Namespace all routes under `/mlm`.

### POST /mlm/calculator/sessions

Creates and persists a calculator session.

Request body:

```json
{
  "monthlyVolumeUsd": "50000.00",
  "currentRatePct": "2.9",
  "utm": {
    "source": "...",
    "medium": "...",
    "campaign": "...",
    "term": "...",
    "content": "..."
  },
  "referrer": "..."
}
```

Response:

```json
{
  "id": "<sessionId>",
  "targetRatePct": 2.2,
  "monthlyFeesCurrentUsd": "1450.00",
  "monthlyFeesTargetUsd": "1100.00",
  "monthlySavingsUsd": "350.00",
  "annualSavingsUsd": "4200.00"
}
```

Validation:

- reject missing required fields
- accept `monthlyVolumeUsd` and `currentRatePct` as decimal strings (to avoid float parsing issues)
- reject `monthlyVolumeUsd <= 0`
- reject `currentRatePct <= 0`
- bounds:
  - `currentRatePct <= 100`
  - `monthlyVolumeUsd <= 1_000_000_000`
  - derived: `0 < currentRateBps <= 10000`

Parsing:

- parse decimal strings using a deterministic decimal parser (not JS float math)
- enforce decimal place limits:
  - `monthlyVolumeUsd`: max 2 decimals
  - `currentRatePct`: max 4 decimals

Errors:

- `400` for validation errors
- `503` if database unavailable
- `429` if rate limited

Error response shape is the app-wide default produced by `apps/api/src/common/filters/http-exception.filter.ts`.

### GET /mlm/calculator/sessions/:id

Fetches a calculator session (for the booking page to confirm the session exists).

Response:

```json
{
  "id": "<sessionId>",
  "targetRatePct": 2.2,
  "monthlyFeesCurrentUsd": "1450.00",
  "monthlyFeesTargetUsd": "1100.00",
  "monthlySavingsUsd": "350.00",
  "annualSavingsUsd": "4200.00"
}
```

Errors:

- `404` if session not found

### POST /mlm/appointments

Creates an appointment request tied to an existing calculator session.

Request body:

```json
{
  "calculatorSessionId": "<sessionId>",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "businessName": "Acme Dental",
  "preferredTimeWindow": "Weekdays 1-4pm ET",
  "notes": "Currently with X provider"
}
```

Response:

```json
{
  "id": "<appointmentId>",
  "status": "REQUESTED"
}
```

Validation:

- `calculatorSessionId` must exist
- `name` required
- `businessName` required
- `email` required, basic format validation
- `phone` optional (basic format validation if present)

Normalize:

- trim all strings
- treat empty strings as missing

Max lengths (after trimming):

- `name` <= 120
- `businessName` <= 160
- `email` <= 254
- `phone` <= 32
- `preferredTimeWindow` <= 120
- `notes` <= 2000

Tracking field max lengths (after trimming):

- `referrer` <= 500
- each `utm.*` <= 200

Errors:

- `400` validation
- `404` calculator session not found
- `429` if rate limited

## Data Model (Prisma)

Additive models only. No changes to existing Lead/Campaign schema in this slice.

### CalculatorSession

Fields (suggested):

- `id` (cuid/uuid)
- `createdAt`
- `updatedAt`
- `monthlyVolumeCents` (BigInt)
- `currentRateBps` (Int)
- `targetRateBps` (Int)
- `monthlyFeesCurrentCents` (BigInt)
- `monthlyFeesTargetCents` (BigInt)
- `monthlySavingsCents` (BigInt)
- `annualSavingsCents` (BigInt)
- `utmSource`/`utmMedium`/`utmCampaign`/`utmTerm`/`utmContent` (nullable)
- `referrer` (nullable)
- `merchantId` (nullable; reserved for later slices)

Indexes:

- `createdAt`
- `utmCampaign` (optional)

### Appointment

Fields (suggested):

- `id` (cuid/uuid)
- `createdAt`
- `updatedAt`
- `calculatorSessionId` (FK -> CalculatorSession)
- `status` enum (start with `REQUESTED` only, but model as enum for forward compatibility)
- `name`
- `email`
- `phone` (nullable)
- `businessName`
- `preferredTimeWindow` (nullable)
- `notes` (nullable)

Indexes:

- `createdAt`
- `email`
- `calculatorSessionId`

## Security / Abuse Controls

- Rate limit the MLM endpoints (basic IP-based limiting is sufficient for Slice 1).
- Do not require auth for marketing flow.
- Ensure logs do not print full PII payloads.

Rate limiting should be proxy-aware (only trust `X-Forwarded-For` if the deployment is configured to do so).

## Testing

### Unit tests (apps/api)

- Calculator math: representative cases and boundary conditions.
- Conversion/rounding rules: cents and bps conversions + fee rounding.
- Validation errors: missing fields, invalid numbers.

### Integration tests (apps/api)

- Create calculator session -> persisted values match response.
- Create appointment with valid session -> persisted; rejects unknown session.

### E2E (apps/e2e)

- Add a new test for `/mlm/calculator` happy path:
  - load page
  - submit calculator
  - verify results show
  - proceed to booking
  - submit booking
  - verify confirmation

Important: keep existing smoke tests unchanged.

Test environment requirements:

- set `MLM_ENABLED=true` for API
- set `NEXT_PUBLIC_MLM_ENABLED=true` for marketing

## Operational Notes

- Slice 1 should not require new background workers or queues.
- All MLM functionality in this slice is request/response (marketing -> API -> DB).

## Future Slices (Context Only)

- Slice 2: dashboard views for sessions/appointments + merchant entity.
- Slice 3: signal extraction + scoring models + opportunity ranking.
- Slice 4: outreach sending + tracking to drive traffic to calculator.
- Slice 5: cutover and retire old thesis components.
