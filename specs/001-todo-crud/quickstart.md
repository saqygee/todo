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

1. Open with an empty database: Incomplete is selected, empty message visible and create usable.
2. Create three items with title, description and due time. Check ascending ordinals and reload
   persistence; restart the server and confirm the same records remain.
3. Complete the middle item. It disappears from Incomplete and appears only in Completed.
   The inclusive request contains both statuses; the UI Completed panel contains completed only.
   Set completed=false explicitly and check original order returns.
4. Edit all content fields in both tabs. Cancel once; confirm no save. Save conflicting content
   from two browser tabs; the last successful save wins and completion status is preserved.
5. Delete middle, highest and all visible items in separate tests. Verify retained deleted flags
   through repository tests, disappearance and 404 on detail/edit/status; later ordinals exceed
   all previously allocated values. Never hard-delete to simulate this acceptance case.
6. Submit title lengths 0/120/121 and description lengths 0/500/501, including whitespace-only
   strings. Verify clear errors under each invalid input. Reject missing/invalid/no-timezone
   dueAt, unknown fields, system-managed fields and string Boolean completion values.
7. Test same-instant dates with Z and positive/negative offsets. Display in UTC, Europe/London
   and America/New_York, including date boundaries and DST gaps/overlaps. Reject nonexistent
   local wall times; preserve unchanged stored instants when editing other fields.
8. Simulate list/write failures. Check empty/error distinction, retry, retained form values,
   disabled duplicate submission, no raw stack traces and no automatic replay of uncertain creates.
9. With keyboard only, create/edit/complete/delete, switch tabs with arrows/Home/End and cancel.
   Check predictable focus after disappearing items. Review labels, inline errors, status live
   announcements and contrast with a screen reader and manual WCAG AA review.
10. Seed 100 mixed tasks in an isolated acceptance database. Time list, tab and successful write
    visibility for 20 repetitions each; at least 19 per action must complete within 2 seconds.

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
