# Implementation Plan: Single-User ToDo CRUD

**Branch**: `main` (actual Git branch; Spec Kit feature identifier: `001-todo-crud`)
**Date**: 2026-11-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification and explicit planning requirements, reconciled in spec.md.

## Summary

Build one small React interface and Express API backed by SQLite through Prisma. Use the
supplied layer directories with ToDo-specific modules inside them. Show a single task list with
completed items hidden initially. Place two buttons to the right of the list, in this order:
"create new task" and "Display completed". Creation replaces the list with a form; successful
creation or cancellation returns to the list. Title remains required (1–120 characters), while
description (maximum 500 characters) and dueAt are optional. All field errors appear under
the corresponding control.

This revision explicitly supersedes completion tabs and the required description/dueAt fields.
Soft deletion, UTC handling and the confirmed lifetime ordinal sequence remain in force.

## Technical Context

**Language/Version**: Node.js 24 LTS, strict TypeScript, ESM; select exact compatible patch versions
and commit the lockfile during implementation. Separate server and browser TypeScript configs.
**Primary Dependencies**: Express 5, React, Vite, Zod 4, React Hook Form with @hookform/resolvers,
Axios; Prisma 7 CLI/client and its SQLite driver adapter. Align Prisma package versions.
**Storage**: Local SQLite file, Prisma Migrate, Prisma 7 better-sqlite3 adapter with ISO 8601
DateTime storage. Never commit live databases, local environment files or test data files.
**Testing**: Vitest, Supertest, React Testing Library; isolated file-backed SQLite databases.
Component tests require an approved DOM environment; no browser automation framework assumed.
**Target Platform**: Local desktop assessment on a current browser; server bound to loopback.
**Project Type**: Single repository web application, one backend process, one database.
**Performance Goals**: With 100 tasks, at least 19/20 trials per list/filter/write action display
results within 2 seconds in the agreed local environment (SC-006).
**Constraints**: No authentication, multi-user support, reordering, restoration, pagination,
CQRS, event bus, DI framework, microservices or unrelated feature work.
**Scale/Scope**: One user's list; four user journeys, six REST operations, no external service.

## Constitution Check

*Pre-research gate evaluated against the latest explicit user requirements.*

| Principle | Design evidence | Gate |
|---|---|---|
| I. Architecture | One modular monolith; feature modules within required layers | Pass |
| II. Code quality | Strict types, Zod-inferred DTOs, explicit error narrowing, no any | Pass |
| III. Technology | Approved stack including Axios under constitution v1.1.0 | Pass |
| IV. Database | UUID, Migrate, safe queries, unique ordinal, atomic transactions, UTC | Pass |
| V. API | REST contract, validation, final error middleware, safe errors | Pass |
| VI. Frontend | Focused components/hooks, RHF + Zod, local state, explicit states | Pass |
| VII. Accessibility | Accessible list controls/forms, keyboard/focus, errors, manual AA review | Pass |
| VIII. TDD | Red-green-refactor for every behavioural slice; meaningful integration tests | Pass |
| IX. Security | Strict allowlists, no secrets/errors disclosed, loopback deployment | Pass |
| X. Dependencies | No installation now; dependency review and approval before installing | Pass |
| XI. Workflow | Spec reconciled explicitly; test/type/lint evidence before completion | Pass |
| XII. Scope | No enterprise infrastructure or unrequested product features | Pass |

**Post-design recheck**: Architecture and design gates pass against constitution v1.1.0,
which includes the explicitly approved Axios addition. Dependency review and installation
approval remain mandatory execution prerequisites under Principle X; stack approval alone
is not installation approval. No outstanding stack amendment or architecture exception remains.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-crud/
├── spec.md
├── planning-constraints.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/rest-api.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
package.json
package-lock.json
tsconfig.json
tsconfig.server.json
tsconfig.client.json
vite.config.ts
vitest.config.ts
prisma.config.ts
index.html
prisma/
├── schema.prisma
└── migrations/
src/
├── shared/
│   ├── schemas/todo.schema.ts
│   ├── types/todo.ts
│   └── constants/todo.ts
├── server/
│   ├── controllers/todo.controller.ts
│   ├── routes/todo.routes.ts
│   ├── services/todo.service.ts
│   ├── repositories/todo.repository.ts
│   ├── models/
│   ├── middleware/{validate,error-handler,not-found}.ts
│   ├── validators/todo.validator.ts
│   ├── utils/
│   ├── config/{env,prisma}.ts
│   ├── app.ts
│   └── index.ts
└── client/
    ├── components/todo/{TodoListActions,TodoList,TodoItem,TodoForm}.tsx
    ├── pages/TodosPage.tsx
    ├── hooks/useTodos.ts
    ├── services/{http,todo-api}.ts
    ├── context/
    ├── layouts/AppLayout.tsx
    ├── utils/datetime.ts
    ├── types/
    ├── styles/
    ├── App.tsx
    └── main.tsx
tests/
├── unit/{server,shared,client}/
├── integration/{api,repositories}/
└── e2e/
```

**Structure Decision**: planning-constraints.md is authoritative; the existing repository is the
application root, without a nested todo-app directory. Feature-specific naming within the
prescribed layers gives feature organisation without replacing the required layout. Reserved
folders need no placeholder abstractions. Root HTML and configuration files above are necessary
build/runtime support additions. Prisma-generated code is build output, not hand-maintained models.

## Phase 0: Research Decisions

See [research.md](research.md) for primary sources, alternatives and compatibility constraints.
Prefer a deliberately compatible Node 24 / Prisma 7 combination over upgrading to a new major
without evaluating its API. Verify exact package compatibility at dependency approval time.

## Phase 1: Design

### Backend and Persistence

Request flow: route → Zod middleware → controller → service → repository → Prisma. Shared
schemas validate field shapes; server validators handle route/query schemas and parsed DTOs.
Controllers only translate HTTP. Services enforce business rules and return domain results.
Repositories own all Prisma calls, including transactions; importing Prisma into controllers,
routes or services is prohibited. Use ordinary modules with explicit collaborators for service
unit testing, without a generic repository, container or DI framework.

List defaults to deleted=false and completed=false. includeCompleted=true removes only the
completion predicate. Every result is ordered by ordinal ascending. Detail reads, content
updates and explicit completion writes always include deleted=false. Use atomic conditional
updates inside a repository transaction, not a stale read followed by an unrestricted update.
A missing match maps to 404. Last successful content write wins for title/description/dueAt only.
Delete sets deleted=true; repeated deletion returns 404. No hard-delete or restore path exists.

The repository enables SQLite WAL mode using a fixed PRAGMA through Prisma before data access.
The driver uses a zero busy timeout so synchronous lock waits cannot block the Node event loop;
known conflicts use the bounded asynchronous retry below. This was verified with separate clients.

Create reads the maximum ordinal across all records and inserts max+1 (or 0) in one short
serializable transaction. Ordinal is unique. Retry the entire rolled-back transaction up to
three attempts for verified transient SQLite locking/write conflicts and ordinal collisions,
with bounded short backoff. Test the pinned adapter's actual error mapping; do not retry every
Prisma error. Exhaustion returns safe 503 with Retry-After: 1. Overflow returns a safe 409 domain
error. Never automatically repeat a possibly committed HTTP create after network failure.

Use strict allowlisted write DTOs. Set 32 KB JSON body limit. Reject unknown input properties;
validate UUID params and literal query Boolean values. Explicit completed=false must remain
false. Dates must be timezone-qualified ISO 8601, calendar-valid and normalised before writes.
Central error handling maps known errors and logs unexpected failures server-side without
bodies or sensitive field values. No async-handler dependency is required in Express 5.

### Frontend and Dates

Axios instance uses relative /api URLs, finite timeout and AbortController cancellation. API
service returns typed, schema-validated data; unknown errors are narrowed safely. useTodos owns
list/loading/error and refresh state. Cancel obsolete reads and use a request-generation guard
so late responses cannot replace the current completion filter. Do not introduce global state
or query caching. TodosPage holds local view state (list/create/edit) and includeCompleted=false.

In list view, TodoListActions sits to the right of the list with "create new task" first and
"Display completed" second. The first button hides the list and its action group and displays
TodoForm with Save and Cancel. Successful creation returns to the list, refreshes it and retains
the completion filter. Before submission, Cancel returns without saving and discards the draft. Save and Cancel are
disabled while a create or edit request is pending. On failure both re-enable with input retained;
on success return to the list. Cancelling an HTTP request is not treated as undoing a save. Validation or
request failure keeps the form visible and preserves entered values. Move focus to the title
on form entry and back to "create new task" on return. An empty list still shows both buttons.
Editing uses the same form view; save or cancel returns to the list.

"Display completed" enables includeCompleted=true and displays completed and incomplete tasks
together in ascending ordinal order, without a second list or completed-only filtering. Use a
pressed-state button (aria-pressed); a second click restores incomplete-only visibility while
retaining its label. A reload starts incomplete-only. Retain this filter through create/edit
save or cancel. Responsive styling may stack controls while preserving order and keyboard flow.

Re-fetch after successful writes. Completion controls send an explicit target Boolean and
disable duplicate submissions while pending. A newly completed item disappears only when the
filter excludes completed items. Failed writes preserve form values and saved UI state; network
uncertainty prompts refresh before a manual retry. No background polling or cross-tab real-time
synchronisation is required.

TodoForm uses RHF, shared Zod field rules and zodResolver. Title is required; description and dueAt
are labelled optional. Omitted, null or blank description normalises to null; omitted/null dueAt
means no due date. Blank date input sends null. On PATCH, omission preserves the existing value
and explicit null clears either optional field. Reject invalid nonblank values. The model uses
String? and DateTime? for these fields; render absent values as "No description" / "No due date".

Render every local or returned field validation error directly below its control, including
under title, description and due date inputs. Connect error IDs using aria-describedby and set
aria-invalid; focus the first error. Keep non-field failures in an accessible form summary.
Use semantic buttons and live feedback. After an item disappears, move focus to an adjacent item
or list heading. Keep load retry and empty states distinct; no tablist semantics are needed.

When dueAt is provided, a datetime-local control edits local wall time, then converts to a timezone-qualified UTC ISO
string before submission. Do not append Z to a local input value. Populate edits with local
components rather than slicing a UTC string. Preserve unchanged dueAt exactly; browser Date
resolution selects the earlier instant in an overlapping hour. Reject a nonexistent local time
by round-trip component comparison and show an error below the date control. No prohibition on
past due dates; display due/created/updated using Intl.DateTimeFormat in the browser timezone.

### Runtime and Configuration

app.ts builds the Express app without listening; index.ts handles listen and graceful close of
HTTP/database resources. Development uses Vite's /api proxy to loopback Express. Built assets
are served by Express with API routes resolved before SPA fallback. No permissive CORS middleware
or public hosting is required. Validate server environment at startup. Use separate dev/test
SQLite file URLs and refuse test startup against the development database. Add SQLite files,
sidecars, generated Prisma output and test artefacts to .gitignore during implementation.

## Validation and Implementation Sequence

1. Dependency review, approved installation, strict build and isolated test harness. Record the
   expected failing baseline before each behavioural slice.
2. Test shared validation and middleware in isolation. Configure Prisma, then write schema
   tests, create the shared schema/initial migration and generate the client before building the
   isolated migrated-database harness. Write HTTP boundary tests, compose Express and make those
   integration tests pass before the foundational checkpoint. Cover: required title, optional-field omission/null/
   clearing, lengths, provided due dates, flags, UUID, unique
   ordinal and rollback; apply committed migrations to each isolated test database.
3. P1 list/create service and API tests, including concurrent creation and persistence.
4. P1 explicit completion and visibility tests, followed by accessible list/filter/form interactions.
5. P2 edit and last-save-wins tests, then soft deletion and stale edit/delete race coverage.
6. Component tests for list → create → save/cancel → list, failure retention, inclusive completion
   filtering, optional field clearing and errors under each control; local-time conversion and daylight-saving edge tests.
7. Run all automated tests, strict type checking, lint and production build. Complete the
   keyboard/screen-reader/contrast review and timed 100-item scenarios in quickstart.md.

Unit tests use narrow service collaborators; repository/API tests use real isolated SQLite
files with migrations and no developer data. Isolate files per worker and close clients before
cleanup. Cover invalid JSON, unknown/system fields, missing/deleted IDs, completion false,
content/status races, missing timezone, invalid calendar dates and transactional rollback.
Use RTL for interactions and stub Axios at the service boundary; no network mocking framework
is necessary. tests/e2e remains available for documented manual browser validation; adding an
end-to-end runner requires separate approval. Component tests alone cannot establish WCAG AA.

## Complexity Tracking

No constitution or architecture exceptions remain. Axios is included in the approved stack in
constitution v1.1.0. Dependency installation still requires the Principle X review and approval.
This remediation changes documentation only; it does not implement the application or install
packages.
