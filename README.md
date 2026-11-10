# Everyday — ToDo application

A local, single-user React + Express application for creating, editing, completing and soft-deleting
tasks. Tasks appear newest first; **Display completed** includes completed tasks.

## Install and run

Requires **Node.js 24.x** (verified with 24.4.1), npm and Bash. From the repository root:

```bash
bash scripts/install.sh
npm start
```

Open **http://127.0.0.1:3000**. The installer installs locked dependencies, including Swagger UI
and OpenAPI types, creates missing `.env`, builds and applies migrations while preserving existing
configuration and data. SQLite needs no separate server.
Defaults: `DATABASE_URL=file:./prisma/dev.db`, `PORT=3000`.

For development:

```bash
npm ci
[ -e .env ] || cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev:server
# Second terminal:
npm run dev:client
```

Open **http://127.0.0.1:5173**. Use `db:deploy` to apply committed migrations.

## API documentation

After installation, start the backend with Swagger:

```bash
npm run swagger
```

- Swagger UI: **http://127.0.0.1:3000/api/docs/**
- OpenAPI JSON: **http://127.0.0.1:3000/api/openapi.json**

Swagger is local and browse-only; `npm start` also serves it.
Use `npm run swagger`, not `npm start swagger`.

## Tests

After setup:

```bash
npm test                 # Unit, integration/API endpoint and React component tests
npm run typecheck
npm run lint
npm run build
node tests/e2e/browser-check.mjs  # E2E; requires /usr/bin/google-chrome
```

Vitest, Supertest and React Testing Library cover validation, business rules, CRUD endpoints,
database transactions and UI recovery. Integration tests use temporary databases and require
loopback access. Suites can run individually with `test:unit`, `test:integration`, `test:components`.
Accessibility acceptance uses `dbus-run-session -- node tests/e2e/accessibility-check.mjs` after
building; it requires Chrome, Orca, AT-SPI, D-Bus, xdotool and a graphical DISPLAY.

## Design and behaviour

**Backend:** modular monolith with **N-tier layered architecture**:
routes → controllers → services → repositories → Prisma/SQLite. Separating HTTP, business rules
and persistence improves testing and keeps deployment simple. Tradeoffs: extra delegation and
one deployment/scaling unit. SQLite simplifies setup but limits concurrent writes; WAL and bounded
asynchronous retries handle contention.

**React frontend architecture:** component composition, hooks and unidirectional data flow.
`AppLayout` provides the shell; `TodosPage` coordinates views; list, item and form components
receive props and callbacks. `useTodos` loads data, API services handle HTTP, and utilities handle
dates. React Hook Form owns form state; Zod validates it. Local state avoids a global store,
with more callback wiring as interactions grow.

**SOLID, DRY, KISS and YAGNI** guide focused responsibilities, shared helpers and minimal abstractions.
**WCAG 2.2 AA** is a strict project requirement: semantic controls, labels, keyboard access,
visible/restored focus, associated errors, live announcements, contrast, non-colour cues and reflow.
Recorded accessibility checks cover Chrome/Orca; they do not certify complete conformance.

- Title is required (120 characters maximum); description is optional (500 maximum).
- Due dates are optional; partial selections are rejected. New/changed dates must be future
  instants; unchanged overdue dates may be retained or cleared. Server transactions revalidate writes.
- UTC storage and local display preserve instant precision. DST gaps are rejected; repeated
  local times use the earlier occurrence. Native controls disable elapsed options.
- UUIDs identify tasks; immutable, never-reused ordinals determine order. Deleted rows remain stored.

Details: [API contract](specs/002-refine-task-list/contracts/rest-api.md),
[plan](specs/002-refine-task-list/plan.md).

## AI workflow

**Please refer to /specs folder to check for feature specification, planning and implementation**

**Codex + Spec Kit** follow specification-first development (**Spec as Code**):
**Specification → Plan → Tasks → Implementation → Review**, including changes and bug fixes.
The user directed scope, architecture and dependencies through versioned artifacts and the
[constitution](.specify/memory/constitution.md). Tasks have defined outcomes and dependency order;
each is verified before completion.

**TDD** (failing test → implementation → refactor), diff review, specification checks and automated
gates constrain AI hallucinations; requirements and tests still need review. Corrections included
SQLite contention, fresh-database setup, form ownership, time refresh, focus and contrast.
Tradeoffs are high token usage, planning overhead and artifact maintenance.

## Verification and remaining work

| Snapshot/check | Recorded result |
|---|---|
| Initial implementation, 8 Nov 2026 | 37 tests; typecheck, lint, build and migration checks passed |
| Refinement, 8 Nov 2026 | 57 tests; typecheck, lint and build passed |
| Chrome E2E | CRUD, validation, timezone and responsive checks passed; 20/20 trials per action under 2 seconds with 100 tasks |
| Chrome/Orca | 13 steps passed; 108 generated utterances reviewed; zero text contrast findings |
| Review, 9 Nov 2026 | 21 component tests, typecheck and installer syntax/help passed; no review findings |

Earlier results apply to their recorded snapshots. **Pending for current uncommitted changes:**
rerun the full suite, lint, build, browser/accessibility checks and complete installer execution.
[T036](specs/002-refine-task-list/tasks.md) guidance/tests are present but final acceptance and
record reconciliation remain. Other browser/screen-reader combinations were not tested.
Evidence: [initial](specs/001-todo-crud/validation-results.md),
[refinement](specs/002-refine-task-list/validation-results.md),
[accessibility](tests/e2e/manual-acceptance.md).

**Estimated effort:** 1 hour planning, 2–3 hours implementation/TDD, 1–2 hours verification and
documentation: **4–6 hours total**, an estimate rather than a measured log.

**Limitations:** no authentication, multi-user isolation, public deployment setup, pagination,
reordering or deleted-task restoration. Production expansion needs a specification for identity,
hosting/TLS, backups, retention and concurrency, followed by implementation and broader testing.
