# Implementation Plan: Refine Task List and Due-Date Selection

**Branch**: `main` (actual Git branch; feature identifier `002-refine-task-list`)
**Date**: 2026-11-08 | **Spec**: [spec.md](spec.md)

**Input**: Existing CRUD implementation plus the three follow-up user stories.

## Summary

Return task lists in descending ordinal order, put both actions above the list at its top right,
and make the active completed filter visibly distinct. Replace the existing datetime-local
field with a native date calendar and native hour/minute selects that disable elapsed choices.
Add temporal validation at the write boundary, preserving unchanged overdue due values and
optional-field clearing. Reuse the installed stack; no external calendar package is needed.

## Technical Context

**Language/Version**: Node 24, strict TypeScript, ESM; existing lockfile versions retained.
**Primary Dependencies**: Existing Express 5, React 19, Vite 7, Prisma 7, Zod 4, RHF/resolver and
Axios. Native HTML date/select controls; no dependency additions or upgrades.
**Storage**: Existing SQLite/Prisma model and migrations, nullable dueAt, UTC DateTime format.
No schema changes or new migrations are required for this feature.
**Testing**: Existing Vitest, Supertest, RTL, isolated SQLite harness, native-CDP Chrome and
isolated Orca/D-Bus review scripts. Add no test framework.
**Target Platform**: Existing local desktop browser assessment, responsive to 320 CSS pixels.
**Project Type**: Incremental change to the existing modular monolith.
**Performance Goals**: Retain the baseline 100-task, 19/20 trials within 2 seconds per list,
filter and write action; date/time eligibility is bounded by 24 hours × 60 minutes per day.
**Constraints**: No duration/time-tracking field, new endpoint, clock-sync service, authentication,
reordering, state framework, custom calendar grid or change to immutable ordinal allocation.
**Scale/Scope**: Three stories affecting list presentation, due selection and write validation.

## Constitution Check

*Pre-research and post-design gates evaluated against constitution v1.1.0.*

| Principles | Evidence | Gate |
|---|---|---|
| I–II Architecture and quality | Existing layers; typed pure date helpers; focused DueDateFields component | Pass |
| III, X Technology/dependencies | Installed approved stack; native controls; no installations proposed | Pass |
| IV Database | UUID/schema/UTC/migrations unchanged; atomic due comparison and write through repositories | Pass |
| V API | Existing REST routes, strict Zod shapes, field errors and central error handler | Pass |
| VI Frontend | RHF/Zod, local form/filter state, current failure/empty/loading handling retained | Pass |
| VII Accessibility | Native controls, disabled options, labels/error relations, visible state beyond colour, Orca review | Pass |
| VIII TDD | Red baselines for sort, temporal policy, UI layout/controls and accessibility regressions | Pass |
| IX Security | Invalid direct writes rejected; no client authority over managed fields | Pass |
| XI Workflow | Spec explicitly supersedes earlier order/layout/past-due selection; design only in this phase | Pass |
| XII Scope | Small changes to existing paths; no infrastructure or calendar framework | Pass |

Post-design recheck: no exceptions or unresolved functional clarifications. UTC conversion and
past-selection validation remain separate from response parsing so overdue records stay readable.
Actual native-picker behaviour and keyboard/Orca interaction are acceptance checks during
implementation, not assertions that this design has already been implemented or validated.

## Project Structure

### Documentation (this feature)

```text
specs/002-refine-task-list/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/rest-api.md
├── quickstart.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
src/
├── shared/
│   ├── schemas/todo.schema.ts
│   ├── schemas/due-date.schema.ts          # New context-dependent write validation
│   └── types/todo.ts
├── server/
│   ├── services/todo.service.ts
│   └── repositories/todo.repository.ts
└── client/
    ├── components/todo/TodoForm.tsx
    ├── components/todo/DueDateFields.tsx   # New native calendar/hour/minute group
    ├── components/todo/TodoListActions.tsx
    ├── pages/TodosPage.tsx
    ├── utils/datetime.ts
    └── styles/app.css
tests/
├── unit/shared/due-date.test.ts
├── unit/server/todo-due-date.service.test.ts
├── unit/client/datetime.test.ts
├── unit/client/timezone.test.ts
├── unit/client/due-date-fields.test.tsx
├── unit/client/todo-create-list.test.tsx
├── unit/client/todo-edit.test.tsx
├── unit/client/todo-completion.test.tsx
├── integration/api/todo-create-list.test.ts
├── integration/api/todo-edit.test.ts
├── integration/repositories/todo-create-list.test.ts
└── e2e/
    ├── browser-check.mjs
    ├── accessibility-check.mjs
    └── manual-acceptance.md
```

**Structure Decision**: Preserve [the original layout](../001-todo-crud/planning-constraints.md)
and change existing feature modules in their layers. New validation lives with shared schemas;
calendar UI is one small component, not a custom calendar subsystem. Existing infrastructure,
request DTO names, nullable model and migration history remain in place. tasks.md is generated
by the next command, not this one.

## Phase 0: Research Decisions

See [research.md](research.md) for platform sources and alternatives. Native date min constrains
the calendar, while disabled select options provide explicit unavailable-time choices that a
native time input cannot guarantee. Manual entry still requires validation. Native control
presentation varies across browsers and must be tested in the agreed assessment browser.

## Phase 1: Design

### US1 — Descending Lists

Change the repository list orderBy from ordinal asc to desc. Use this order for default and
includeCompleted=true results; do not reverse only the frontend or sort by updatedAt/dueAt.
Existing list and refresh hooks preserve response order. Creation continues to allocate max+1
across all retained rows in the existing transaction, so the newest item naturally appears first.
No migration, counter reset, ordinal rewriting or reorder endpoint is required.

Update baseline assertions and browser membership/order checks to descending order. Review
fixtures that accidentally relied on the first rendered item being the oldest. Seed completed
and deleted rows to prove both filters remain correct; check edits do not redefine recency.

### US2 — Calendar and Time Selection

DueDateFields uses a fieldset/legend describing optional due date/time, a labelled input type=date
with min set to browser-local today, and labelled native Hour/Minute selects. Hour choices are
00–23; minute choices 00–59. An hour is disabled when it has no eligible minute. Minutes are
disabled when their local date/hour/minute is nonexistent or resolves to an instant at or before
now. This avoids a large 1,440-entry menu while allowing every future minute. Both selectors
have empty placeholders; do not silently choose midnight or the next available slot.

Build local components rather than deriving today from a UTC ISO date substring. Reuse the
existing component round-trip check for nonexistent DST times and the earlier-occurrence policy
for repeated hours. The current partly elapsed minute is disabled; the next future minute is
the earliest choice. At the end of the day, show that no times remain today and invite a future
date; do not fabricate a due time. Date is optional but a partial date/hour/minute entry is invalid.
Clearing the whole group produces null. No task-duration concept is introduced.

Use a clock parameter in pure eligibility/conversion helpers for deterministic tests. While the
form is open, refresh the clock at minute boundaries and on window focus/pageshow and relevant
field focus/change. Clean up timers/listeners. Recompute again during save. If a selected value
expires, retain it visibly with an associated error until corrected or cleared; do not silently
advance it. Browser timezone changes are handled by recomputing local components on focus.

For editing, retain the full original UTC instant separately from minute-level control text.
An existing due value is initially shown as a retained current value, with Change and Clear
controls. This avoids injecting a past value into restricted native selection. An overdue
current value can remain while content is edited. Change opens replacement controls; Clear
selects null; a Keep existing action can discard replacement input without discarding other
form fields. An untouched retained instant is submitted exactly, preserving seconds and offset
normalisation. Newly selected replacements always follow future-only checks.

RHF owns the form state and Zod validates complete local selections and existing content fields.
Map local date/hour/minute errors beneath their respective controls. Keep the server's dueAt
field error associated with the group and announce it; focus the first relevant control. Preserve
aria-invalid, aria-errormessage, aria-describedby, pending Save/Cancel disabling and input retention.
The request payload remains a single timezone-qualified UTC dueAt or null, not separate wire fields.

### Temporal Policy and Atomic Writes

Do not attach a future-only refinement to the shared response instant schema: historical overdue
records must remain parseable. Add an explicit context-dependent write schema/policy accepting
proposed dueAt, current stored dueAt (when editing) and nowMs. Creation accepts null or strictly
future. Editing accepts omission, null, the exact current stored instant, or a strictly future
replacement. A past different instant is rejected with VALIDATION_ERROR and fields.dueAt.

The service owns this rule and accepts a narrow optional now() function defaulting to Date.now.
Keep HTTP request/response translation in controllers and all data access in repositories.
Pass a synchronous domain-validation callback into the existing create/update repository method,
invoked immediately before the write inside its transaction. For create, run it on each retry
following ordinal lookup. For update, read the current non-deleted row in the same transaction,
invoke the service-owned callback with that row, then perform the allowlisted conditional update.
A local bounded transaction-retry helper can reuse existing retry behaviour for these writes;
no general transaction manager or DI framework is needed. Re-evaluate time and stored context
on every attempt, never reuse a pre-transaction exemption read.

This prevents a stale saved original from being treated as unchanged after another edit changes
the stored due instant. It also catches a future selection that expires during contention.
Missing/deleted records stay 404; invalid due choices use 400 with no data changes. A concurrent
write conflict may use the existing bounded retry/503 outcome; no version token or conflict UI
is added. Valid content writes keep last-successful-save behaviour. Completion and deletion do
not assign due values and do not revalidate an existing overdue dueAt.

The application clock is authoritative for the boundary check, immediately before persistence;
browser clock validation is early feedback. No clock-sync endpoint is introduced. A server-side
rejection caused by delay or clock difference preserves the form for correction. Input may use
any explicit offset, but is normalised to UTC before comparison and persistence.

### US3 — Actions Above the List and Filter Styling

Move TodoListActions before the list panel in DOM order inside the existing list view. Use a
full-width flex action row, justify-content:flex-end, gap and wrapping; keep both buttons above
the panel at all supported widths. Remove the side-column grid and side-note layout that would
keep actions beside the panel. Keep create first and display second, with unchanged handlers,
labels and pressed-state behaviour. Empty/error/loading views must not hide the actions.

Use a dark green background and light text for the active Display completed button; inactive
remains the existing light/outlined appearance. Add a persistent-size non-colour state indicator
(e.g. a check mark in a reserved slot) and a distinct border treatment. Keep aria-pressed and
forced-colors styling using system colours/border/indicator rather than forced-colour overrides.
Do not change the label to Hide completed. Verify 4.5:1 normal text and 3:1 applicable non-text
contrast, and retain unobscured focus outlines. No new icon dependency is needed.

The change in DOM order alters keyboard traversal. Review focus after disappearing items: the
list heading is programmatically focused, then traversal reaches remaining task controls; the
user can Shift+Tab to the preceding action row. Save/Cancel still restores create-button focus.
Update the CDP/Orca script to assert the intended sequence rather than its old sidebar order.

## Validation and Delivery Sequence

1. US1 red tests for descending order in default/inclusive results; implement repository sort,
   verify new-task-first and stable position after editing and soft deletion.
2. US2 red pure-policy, service and API tests with controlled clocks, including direct bypass,
   unchanged overdue, stale stored context and elapsed-before-write/retry cases. Implement the
   shared rule and transactional callback integration without schema changes.
3. US2 red component/timezone tests; implement native calendar/hour/minute UI, dynamic disabled
   options, optional/partial/clear/retained modes and inline error mapping. Verify no response
   schema starts rejecting existing overdue data.
4. US3 red layout/filter-state assertions; move actions and style both states and forced-colors.
5. Run existing test projects, strict type checks, lint and build. Extend native-CDP scenarios
   for native controls, top-right geometry, 100-task descending order and timing. Re-run the
   isolated Orca keyboard/speech review with new calendar controls and updated focus order.

Clock-based tests freeze time in helpers/services and advance it explicitly. Do not make old
API tests expire with wall-clock time: use relative future fixtures or inject a fixed clock.
Verify timezone boundaries, invalid calendar values, DST gaps/overlaps, last-minute-of-day and
local-midnight rollover. Migrate existing test fixtures that intentionally create past dues by
seeding legacy rows directly in the isolated repository/database harness; new writes must reject.

## Complexity Tracking

No constitutional violations or architecture exceptions. No new dependency, storage migration,
application implementation or tasks.md generation is included in this planning command.
