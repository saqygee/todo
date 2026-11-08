# Quickstart and Validation Guide

This is the intended command contract for implementation. There is currently no package.json,
source code, migration or test harness; commands below become runnable after those are built.
Do not treat these commands as already executed or as permission to install packages.

## Prerequisites

- Node 24 LTS and npm; supported local desktop browser.
- Approved exact dependency set and constitution stack reconciliation for Axios.
- Development DATABASE_URL points to an ignored local SQLite file. Test database URLs MUST be
  distinct and isolated per worker. Use an .env.example with placeholders only.
- The implementation supplies the scripts below and committed Prisma migrations. npm ci requires
  a committed lockfile; the initial lockfile is created only after installation approval.

## Setup and Run

From repository root after implementation and dependency approval:

```bash
npm ci
npm run db:generate
npm run db:migrate
npm run dev:server
```

Run the client in another terminal:

```bash
npm run dev:client
```

Script contracts: db:generate runs Prisma generation; db:migrate runs Prisma Migrate dev for
local development only. dev:server compiles/watches the server and loads the local environment;
dev:client runs Vite with /api proxied to loopback port 3000. The UI is at localhost:5173.
Do not apply development migrations to the test database through a shared DATABASE_URL.

## Automated Checks

```bash
npm run test:unit
npm run test:integration
npm run test:components
npm run typecheck
npm run lint
npm run build
```

Test scripts must create isolated file-backed databases, apply committed migrations, close
clients and clean up only their own files. No tests touch the development database. Record a
failing test before implementing each behavioural slice, then passing evidence after the change.

Production-build smoke check after build:

```bash
npm run db:deploy
npm start
```

db:deploy applies committed migrations with Prisma Migrate deploy; start serves the compiled
Express API and built client on loopback port 3000. API 404s must remain JSON errors, not SPA HTML.

## API Smoke Test

See [contracts/rest-api.md](contracts/rest-api.md) for full shapes and errors.

```bash
curl -i http://localhost:3000/api/todos
curl -i -H 'Content-Type: application/json' -d '{"title":"Prepare demo","description":"Verify CRUD flows","dueAt":"2026-11-09T10:00:00+01:00"}' http://localhost:3000/api/todos
curl -i 'http://localhost:3000/api/todos?includeCompleted=true'
```

Expected: default list excludes completed/deleted; creation is 201 with Location, UUID and
ordinal 0 in a never-used database. dueAt is returned as 2026-11-09T09:00:00.000Z. Use the returned
ID for subsequent PATCH/detail/delete checks; do not reset an existing database to force 0.

## End-to-End Acceptance Scenarios

1. Open an empty list: both right-side buttons are visible in the requested order. Click
   "create new task": the list disappears and the form appears. Cancel restores the list without
   saving. Repeat and create with only title; description and dueAt are null. Success restores
   the list, showing the new item. Failed validation/submission retains the form and input.
2. Create three tasks, some with optional fields. Check ordinal order, reload/restart persistence,
   and "No description" / "No due date" when absent.
3. Complete one task: it disappears from the default list. Click "Display completed": completed
   and incomplete tasks appear together in ordinal order. Click again: completed tasks hide.
   Verify aria-pressed matches the state; reload returns to incomplete-only.
4. Save or cancel a form while inclusive visibility is enabled: the restored list retains that
   filter. Edit optional fields and clear them; confirm null persistence. Verify last successful
   content save wins across browser tabs without changing completion state.
5. Delete middle, highest and all visible items in separate tests. Check retained deleted flags,
   404 on detail/edit/status, unchanged surviving ordinals and lifetime ordinal allocation.
6. Validate title lengths 0/120/121 and description lengths 0/500/501. Blank/omitted optional
   values succeed; invalid provided dates fail. Each error appears below its matching control,
   with an accessible description and focus on the first invalid field. Reject system fields.
7. For provided due dates, check timezone-qualified input, UTC persistence, local display, date
   boundaries and DST. Missing dueAt must not be formatted as an invalid or epoch date.
8. Simulate read/write failures: distinct error/empty states, retry, preserved values and no
   raw errors or automatic replay of uncertain creates. Verify cancellation during loading cannot
   cause late responses to reopen the form or replace the active visibility filter.
9. With keyboard and screen reader, operate both buttons, forms and completion/delete controls.
   Check form-entry/return focus, labels, inline errors, live feedback and colour contrast.
10. With 100 mixed tasks, time list/filter/write visibility for 20 repetitions each; at least
    19 per action must complete within 2 seconds.

## Database and Race Verification

Repository tests must inspect raw SQLite timestamp format, unique ordinals, required fields,
transaction rollback and exclusion of deleted rows. Run overlapping creates with separate
connections and verify distinct ordinals. Force contention and check bounded retries/503.
Race content edits against completion and deletion; no update may reset status or restore a
record. Check repeat deletion returns 404 and explicit repeat completion remains the target state.

## Completion Evidence

Record test/type/lint/build results, manual accessibility findings and timed outcomes. Report
unexecuted checks honestly. A populated tests/e2e folder does not imply a browser runner exists;
no additional test framework is required by this plan.
