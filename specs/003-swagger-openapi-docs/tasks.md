# Tasks: Swagger/OpenAPI Documentation

**Input**: [plan.md](plan.md), [spec.md](spec.md), constitution v1.4.0 and existing requirements checklists.
**Created**: 2026-11-09
**Tests**: User-directed exception: no Swagger-specific unit, integration, component or E2E tests. Existing application regression tests remain unchanged. Retired testing tasks below record scope removal, not successful test execution.
**Organization**: Setup → foundation → US1 (P1) → US2 (P1) → US3 (P2) → acceptance.
**Paths**: Repository-relative. `[P]` indicates a parallel opportunity only after its stated prerequisites; it does not authorize automatic delegation.

## Phase 1: Setup and Governance

**Purpose**: Resolve requirements and approval gates without changing application behavior.

- [x] T001 Review and record dispositions for the 35 requirements questions in specs/003-swagger-openapi-docs/checklists/api-docs.md; preserve existing entries, distinguish passes from unresolved gaps, and record material scope questions for user resolution rather than inventing requirements. Completed 2026-11-09: all 35 requirements-quality items pass; recovery and acceptance boundaries clarified in spec.md and plan.md; dependency approval remains pending.
- [x] T002 Record the user's local-assets and browse-only selections and the structural-schema/semantic-rule acceptance policy in specs/003-swagger-openapi-docs/spec.md and specs/003-swagger-openapi-docs/plan.md; clarify post-trim length limits without adding scope. Completed 2026-11-09 for analysis findings I1/I2.
- [x] T003 Prepare specs/003-swagger-openapi-docs/dependency-review.md with purpose, limitations, alternatives, proposed exact versions, compatibility and transitive/script review for swagger-ui-dist, openapi-types and @apidevtools/swagger-parser; obtain explicit approval and record its scope before introduction/installation, and propose any required amendment to .specify/memory/constitution.md without adopting it until approved.

**Gate**: No package introduction, imports or installation until T003 approval and any required constitutional amendment are complete. User preference for local assets is not approval of a named package. Do not mark approval complete merely because review text exists.

## Phase 2: Foundational Prerequisites

**Purpose**: Establish the approved documentation toolchain and baseline.

- [x] T004 Adopt the approved scoped constitutional changes in .specify/memory/constitution.md and install only remaining approved swagger-ui-dist@5.34.1 and development openapi-types@12.1.3 in package.json/package-lock.json with lifecycle scripts disabled; remove the test-only parser after the user scope reduction.
- [x] T005 Record baseline npm test, npm run typecheck and npm run lint results and relevant existing CRUD/error contract behavior in specs/003-swagger-openapi-docs/validation-results.md; distinguish pre-existing failures and environment restrictions from documentation regressions.

**Checkpoint**: Approved toolchain and baseline available. No database migration, new authentication or architecture refactor is needed.

## Phase 3: US1 — Understand the Existing API Contract (P1, MVP)

**Goal**: Publish a complete typed description of all six task operations without UI dependency.
**Independent review**: GET /api/openapi.json is valid OpenAPI 3.0.3 and describes the complete existing contract without credentials or a service instance.

### Scope exclusions

- [x] T006 [US1] RETIRED by user instruction: remove the previously authored Swagger unit tests in tests/unit/server/openapi.test.ts; do not replace them.
- [x] T007 [US1] RETIRED by user instruction: remove previously authored Swagger HTTP tests in tests/integration/api/docs.test.ts; do not replace them.

### Implementation

- [x] T008 [US1] Implement typed shared schema conversion in src/server/docs/openapi.ts using existing Zod schemas with io input and target openapi-3.0; add documented overlays for create defaults, nonempty update, required response properties, read-only annotations and UTC dates, remove minLength/maxLength only from create/update title/description string schemas (including nullable branches), describe shared post-trim limits explicitly, retain response limits and all other structural constraints, and keep separate immutable request/response components without changing application schemas or using unrepresentable-any fallbacks.
- [x] T009 [US1] Complete src/server/docs/openapi.ts with all six operations, shared request/response/error components, parameter descriptions, strict input allowlists, examples typed with existing inferred types, success envelopes, Location and bodyless 204; include authentication absence, descending order, soft deletion, normalization and dynamic due-date rules.
- [x] T010 [US1] Complete operation-specific errors and boundary guidance in src/server/docs/openapi.ts: exact safe messages/envelopes, optional or empty fields, malformed JSON, 32 KB limit, content-type errors, create-only ordinal exhaustion, retry scope, Retry-After and unmatched-method behavior; do not promise 503 for non-retried storage failures.
- [x] T011 [US1] Add fixed GET /api/openapi.json delivery in src/server/docs/docs.routes.ts using a once-constructed document and register it in src/server/app.ts after existing API JSON middleware and before API not-found handling; preserve task routing, frontend fallback and final error handling.
- [x] T012 [US1] Statically review all six documented operations against src/server/routes/todo.routes.ts, controllers, shared schemas and errors; record schema overlays and evidence limits in specs/003-swagger-openapi-docs/validation-results.md without Swagger tests.

**Checkpoint**: Machine-readable documentation is the first demonstrable increment; the full requested feature still requires US2 and US3.

## Phase 4: US2 — Browse Swagger UI (P1)

**Goal**: Local, browse-only documentation in development and built modes.
**Independent review**: /api/docs redirects to /api/docs/; all six operations are available using local assets without internet, request execution or task changes.

### Scope exclusions

- [x] T013 [US2] RETIRED by user instruction: do not extend or recreate tests/integration/api/docs.test.ts for Swagger UI.
- [x] T014 [US2] RETIRED by user instruction: do not add Swagger E2E acceptance steps or a harness at tests/e2e/docs-acceptance.md; use only existing application browser regressions.

### Implementation

- [x] T015 [US2] Implement locally served Swagger UI HTML and initialization in src/server/docs/swagger-ui.ts with fixed /api/openapi.json, supportedSubmitMethods empty, validatorUrl null and queryConfigEnabled false; provide page structure and visible document-failure feedback with no remote assets or configuration.
- [x] T016 [US2] Extend src/server/docs/docs.routes.ts to serve /api/docs/, canonical redirect and only required local vendor CSS/bundle and initialization assets using Node module resolution; avoid the package's Petstore/default initializer and preserve unrelated API routing.
- [x] T017 [US2] Statically review local assets, fixed URLs, browse-only configuration and visible failure feedback in src/server/docs/swagger-ui.ts and src/server/docs/docs.routes.ts; record review rather than claiming Swagger browser tests in specs/003-swagger-openapi-docs/validation-results.md.
- [x] T018 [US2] Add the direct backend and Vite-proxied development addresses, built-mode addresses, local/offline prerequisites and browse-only limitation to README.md; do not change existing runtime commands or Vite routing unnecessarily.

**Checkpoint**: Published document and browse-only local UI are available; functional browser failures remain acceptance blockers; WCAG and Orca checks are excluded for Swagger.

## Phase 5: US3 — Failure Guidance and Compatibility (P2)

**Goal**: Demonstrate documentation fidelity and protect existing behavior.
**Independent review**: Representative real API requests and deterministic service failures match the documented contracts while existing task tests remain unchanged and pass.

### Scope exclusions

- [x] T019 [US3] RETIRED by user instruction: do not create Swagger schema regression tests in tests/unit/server/openapi.test.ts; static schema review replaces this task.
- [x] T020 [US3] RETIRED by user instruction: do not create Swagger contract tests in tests/integration/api/openapi-contract.test.ts.
- [x] T021 [US3] RETIRED by user instruction: do not create Swagger failure/clock fixtures in tests/integration/api/openapi-contract.test.ts.

### Reconciliation

- [x] T022 [US3] Resolve static contract review discrepancies only in src/server/docs/openapi.ts; preserve shared schema/controller/service/repository runtime behavior and document normalization/date limitations in specs/003-swagger-openapi-docs/validation-results.md.
- [x] T023 [US3] Review published examples, validation/missing-task guidance and compatibility diff from source and record findings in specs/003-swagger-openapi-docs/validation-results.md; do not claim an independent browser/user test occurred.

**Checkpoint**: Contract fidelity is demonstrated; no domain behavior changes are permitted as a way to make documentation tests pass.

## Phase 6: Polish and Cross-Cutting Acceptance

- [x] T024 Write specs/003-swagger-openapi-docs/quickstart.md with existing setup commands, addresses, browse-only behavior and troubleshooting; explicitly exclude Swagger automated/E2E/WCAG/Orca checks.
- [x] T025 Run existing npm test, npm run typecheck, npm run lint, npm run build and existing application tests/e2e/browser-check.mjs; add no Swagger cases and record exact outcomes and skipped Swagger checks in specs/003-swagger-openapi-docs/validation-results.md.
- [x] T026 Re-evaluate specs/003-swagger-openapi-docs/checklists/requirements.md and specs/003-swagger-openapi-docs/checklists/api-docs.md against final requirements/design, reconcile resolved gap notes without erasing history, and record FR-001–FR-019 / SC-001–SC-006 coverage and outstanding blockers in specs/003-swagger-openapi-docs/validation-results.md.

## Dependencies and Execution Order

Setup/approval → shared-schema document (US1) → local UI (US2) → static fidelity review (US3) → usage/evidence and existing regression gates. T006/T007/T013/T014/T019/T020/T021 are retired, not test passes. No test-first requirement applies to Swagger under the explicit exception.

## Parallel Opportunities

README/quickstart guidance and static source review can proceed independently once addresses and behavior are fixed. Keep edits to the same source/evidence files sequential. Do not create Swagger test work as a parallel subtask.

## Implementation Strategy and Traceability

US1 covers FR-001–FR-012 and FR-016 via T008–T012. US2 covers FR-013–FR-015 via T015–T018. US3 covers FR-017 and contract fidelity via T022–T023. Setup covers FR-018. T024–T026 cover revised FR-019 and SC-001–SC-006 through static review, type/lint/build and existing application regressions only. The full feature includes contract, UI and guidance; retired test tasks do not establish runtime verification.
