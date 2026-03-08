---
phase: 9
plan: 4
wave: 2
name: CI Pipeline Configuration
---

# PLAN: CI Pipeline Configuration

Configure GitHub Actions to automatically run linting, type-checking, unit tests, and integration tests on every push and pull request to `main`.

## Tasks

### 1. Create Main CI Workflow
Set up `.github/workflows/ci.yml` to run on push/PR to `main`.

<task>
Create `.github/workflows/ci.yml` with:
- Trigger: `push` and `pull_request` on `main`
- Jobs: lint, type-check, unit-test, integration-test
- Use `node:20` and `pnpm` setup
- Cache pnpm store for speed
</task>

<verify>
Check `.github/workflows/ci.yml` exists and is valid YAML (use `cat` to inspect).
</verify>

### 2. Lint & Type-Check Job
Add a job that runs ESLint and TypeScript type-checking across the monorepo.

<task>
In `ci.yml`, add lint job:
```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v3
      with: { version: 9 }
    - uses: actions/setup-node@v4
      with: { node-version: 20, cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
    - run: pnpm turbo run lint type-check
```
</task>

<verify>
Confirm the lint job section is present in `ci.yml`.
</verify>

### 3. Unit Test Job
Add a job that runs Jest unit tests across all apps.

<task>
Add `unit-test` job to `ci.yml`:
```yaml
unit-test:
  runs-on: ubuntu-latest
  needs: lint
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v3
      with: { version: 9 }
    - uses: actions/setup-node@v4
      with: { node-version: 20, cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
    - run: pnpm turbo run test
```
</task>

<verify>
Confirm the unit-test job section is present in `ci.yml`.
</verify>

### 4. Docker Build Validation
Add a job that verifies all Docker images build successfully.

<task>
Add `docker-build` job to `ci.yml`:
- Build `dashboard`, `api`, `workers`, and `marketing` images via `docker compose build`
- Do NOT start services, just validate the builds complete
</task>

<verify>
Confirm the docker-build job section is present in `ci.yml`.
</verify>

## Verification
- [ ] `.github/workflows/ci.yml` exists and is valid YAML
- [ ] All 4 jobs defined: lint, unit-test, integration-test, docker-build
- [ ] Workflow triggers on push and pull_request to `main`
