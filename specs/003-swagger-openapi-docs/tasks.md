# Tasks: Swagger/OpenAPI Documentation

**Input**: [plan.md](plan.md), [spec.md](spec.md), constitution v1.1.0 and existing requirements checklists.
**Created**: 2026-11-09
**Tests**: Required by FR-019 and Constitution VIII. For every implementation increment, write and observe the corresponding failing test first; then implement and refactor. All tasks below are unexecuted.
**Organization**: Setup → foundation → US1 (P1) → US2 (P1) → US3 (P2) → acceptance.
**Paths**: Repository-relative. `[P]` indicates a parallel opportunity only after its stated prerequisites; it does not authorize automatic delegation.

## Phase 1: Setup and Governance

**Purpose**: Resolve requirements and approval gates without changing application behavior.

- [ ] T001 Review and record dispositions for the 35 requirements questions in specs/003-swagger-openapi-docs/checklists/api-docs.md; preserve existing entries, distinguish passes from unresolved gaps, and record material scope questions for user resolution rather than inventing requirements.
- [ ] T002 Record the user's local-assets and browse-only selections in specs/003-swagger-openapi-docs/spec.md, specializing FR-013/FR-014 and the optional-interactivity assumption; clarify post-trim length limits and reference the documentation delivery decisions in specs/003-swagger-openapi-docs/plan.md without adding new scope.
- [ ] T003 Prepare specs/003-swagger-openapi-docs/dependency-review.md with purpose, limitations, alternatives, proposed exact versions, compatibility and transitive/script review for swagger-ui-dist, openapi-types and @apidevtools/swagger-parser; obtain explicit approval and record its scope before introduction/installation, and propose any required amendment to .specify/memory/constitution.md without adopting it until approved.

**Gate**: No package introduction, imports or installation until T003 approval and any required constitutional amendment are complete. User preference for local assets is not approval of a named package. Do not mark approval complete merely because review text exists.

## Phase 2: Foundational Prerequisites

**Purpose**: Establish the approved documentation toolchain and baseline.

- [ ] T004 After T003 approval, apply only the approved constitutional amendment in .specify/memory/constitution.md, including sync report/version/date, and install/pin approved runtime swagger-ui-dist@5.34.1 and development openapi-types@12.1.3 and @apidevtools/swagger-parser@11.0.0 in package.json and package-lock.json; stop for re-review if versions or compatibility differ.
- [ ] T005 Record baseline npm test, npm run typecheck and npm run lint results and relevant existing CRUD/error contract behavior in specs/003-swagger-openapi-docs/validation-results.md; distinguish pre-existing failures and environment restrictions from documentation regressions.

**Checkpoint**: Approved toolchain and baseline available. No database migration, new authentication or architecture refactor is needed.

## Phase 3: US1 — Understand the Existing API Contract (P1, MVP)

**Goal**: Publish a complete typed description of all six task operations without UI dependency.
**Independent test**: GET /api/openapi.json is valid OpenAPI 3.0.3 and describes the complete existing contract without credentials or a service instance.

### Tests first

- [ ] T006 [P] [US1] Write and observe failing tests in tests/unit/server/openapi.test.ts for OpenAPI 3.0.3 validity with external references disabled, exactly six task operations, unique operation IDs, resolvable references, required inputs and response shapes, correct statuses/headers and no authentication scheme.
- [ ] T007 [P] [US1] Write and observe failing tests in tests/integration/api/docs.test.ts for GET /api/openapi.json JSON delivery without credentials or TodoService, with and without clientDir, and preservation of unrelated unknown API route/method JSON errors.

### Implementation

- [ ] T008 [US1] Implement typed shared schema conversion in src/server/docs/openapi.ts using existing Zod schemas with io input and target openapi-3.0; add documented overlays for create defaults, nonempty update, required response properties, read-only annotations and UTC dates, and explain trim/transformation representation limits without changing application schemas or using unrepresentable-any fallbacks.
- [ ] T009 [US1] Complete src/server/docs/openapi.ts with all six operations, shared request/response/error components, parameter descriptions, strict input allowlists, examples typed with existing inferred types, success envelopes, Location and bodyless 204; include authentication absence, descending order, soft deletion, normalization and dynamic due-date rules.
- [ ] T010 [US1] Complete operation-specific errors and boundary guidance in src/server/docs/openapi.ts: exact safe messages/envelopes, optional or empty fields, malformed JSON, 32 KB limit, content-type errors, create-only ordinal exhaustion, retry scope, Retry-After and unmatched-method behavior; do not promise 503 for non-retried storage failures.
- [ ] T011 [US1] Add fixed GET /api/openapi.json delivery in src/server/docs/docs.routes.ts using a once-constructed document and register it in src/server/app.ts after existing API JSON middleware and before API not-found handling; preserve task routing, frontend fallback and final error handling.
- [ ] T012 [US1] Run the T006/T007 tests to green and review the six-operation contract against src/server/routes/todo.routes.ts and src/server/controllers/todo.controller.ts; record results and justified overlays in specs/003-swagger-openapi-docs/validation-results.md.

**Checkpoint**: Machine-readable documentation is the first demonstrable increment; the full requested feature still requires US2 and US3.

## Phase 4: US2 — Browse Swagger UI (P1)

**Goal**: Local, accessible, browse-only documentation in development and built modes.
**Independent test**: /api/docs redirects to /api/docs/; all six operations are available using local assets without internet, request execution or task changes.

### Tests first

- [ ] T013 [US2] Extend tests/integration/api/docs.test.ts and observe failures for /api/docs redirect, UI HTML/local asset content types, fixed document URL, disabled submission/external validation/query overrides, coexistence with clientDir and documentation-specific missing assets without frontend HTML fallback.
- [ ] T014 [P] [US2] Define documentation browser/accessibility acceptance steps in tests/e2e/docs-acceptance.md covering direct/proxied development, built mode, offline assets, unavailable-description feedback, no task requests, semantic names, keyboard/focus, contrast and Chrome/Orca; state evidence requirements and do not claim conformance from vendor defaults.

### Implementation

- [ ] T015 [US2] Implement locally served Swagger UI HTML and initialization in src/server/docs/swagger-ui.ts with fixed /api/openapi.json, supportedSubmitMethods empty, validatorUrl null and queryConfigEnabled false; provide semantic page structure and accessible document-failure feedback with no remote assets or configuration.
- [ ] T016 [US2] Extend src/server/docs/docs.routes.ts to serve /api/docs/, canonical redirect and only required local vendor CSS/bundle and initialization assets using Node module resolution; avoid the package's Petstore/default initializer and preserve unrelated API routing.
- [ ] T017 [US2] Run T013 to green, perform tests/e2e/docs-acceptance.md browser/accessibility review and remediate affected documentation UI issues in src/server/docs/swagger-ui.ts and src/server/docs/docs.routes.ts; record actual evidence or unresolved blockers in specs/003-swagger-openapi-docs/validation-results.md.
- [ ] T018 [US2] Add the direct backend and Vite-proxied development addresses, built-mode addresses, local/offline prerequisites and browse-only limitation to README.md; do not change existing runtime commands or Vite routing unnecessarily.

**Checkpoint**: Published document and browse-only local UI are available; accessibility failures remain acceptance blockers.

## Phase 5: US3 — Failure Guidance and Compatibility (P2)

**Goal**: Demonstrate documentation fidelity and protect existing behavior.
**Independent test**: Representative real API requests and deterministic service failures match the documented contracts while existing task tests remain unchanged and pass.

### Tests first

- [ ] T019 [P] [US3] Add failing consistency cases to tests/unit/server/openapi.test.ts for every manual overlay and schema-reuse exception, post-trim boundaries, create omission/null defaults, partial update minProperties, completion strictness, query string enums, historical response dates and accurate UTC/normalization descriptions.
- [ ] T020 [P] [US3] Write failing real-API contract comparisons in tests/integration/api/openapi-contract.test.ts using isolated temporary storage for create/list/get/update/completion/delete, headers and no-body responses, descending order, completion filtering, missing/deleted records, unknown fields/query values, malformed JSON, oversized and non-JSON requests.
- [ ] T021 [US3] Extend tests/integration/api/openapi-contract.test.ts with injected deterministic services for AppError 409/503 and unexpected 500, verify documented envelope/header applicability without forcing unstable contention, and cover clock-controlled future/unchanged-overdue due-date behavior using existing repository/service fixtures.

### Reconciliation

- [ ] T022 [US3] Resolve T019–T021 discrepancies only in src/server/docs/openapi.ts or documentation tests where the test assumption is wrong; document non-representable transformation/temporal rules and preserve src/shared/schemas/todo.schema.ts and all existing controller/service/repository behavior.
- [ ] T023 [US3] Have a reviewer use only the published documentation to construct a valid create request and identify validation/missing-task responses, then record outcomes plus the T019–T022 results and a compatibility diff review in specs/003-swagger-openapi-docs/validation-results.md.

**Checkpoint**: Contract fidelity is demonstrated; no domain behavior changes are permitted as a way to make documentation tests pass.

## Phase 6: Polish and Cross-Cutting Acceptance

- [ ] T024 [P] Write specs/003-swagger-openapi-docs/quickstart.md with prerequisites, approved setup commands, documentation addresses, targeted test commands and expected outcomes, browser/accessibility evidence links and troubleshooting; keep implementation code out of this validation guide.
- [ ] T025 Run npm test, npm run typecheck, npm run lint and npm run build plus existing applicable browser/accessibility checks and tests/e2e/docs-acceptance.md against the built app; record exact outcomes in specs/003-swagger-openapi-docs/validation-results.md and fix only documentation-related regressions before acceptance.
- [ ] T026 Re-evaluate specs/003-swagger-openapi-docs/checklists/requirements.md and specs/003-swagger-openapi-docs/checklists/api-docs.md against final requirements/design, reconcile resolved gap notes without erasing history, and record FR-001–FR-019 / SC-001–SC-006 coverage and outstanding blockers in specs/003-swagger-openapi-docs/validation-results.md.

## Dependencies and Execution Order

```text
T001 → T002 → T003 (explicit approval gate) → T004 → T005
  → US1: (T006 || T007) → T008 → T009 → T010 → T011 → T012
  → US2: (T013 || T014) → T015 → T016 → T017 → T018
  → US3: (T019 || T020) → T021 → T022 → T023
  → (T024 || acceptance preparation) → T025 → T026
```

- US1 depends only on the foundation; US2 consumes US1's document; US3 validates US1 and the completed interface. Each has its own acceptance checkpoint; they are not falsely represented as dependency-free.
- Within each story tests must fail for the intended missing behavior before implementation. Missing approved packages/environment setup is not the required red test.
- T013 and T014 can proceed together after T012. T019 and T020 can proceed together after US2. T024 may proceed alongside US3 once interface addresses and commands are stable; T025 waits for all implementation and the quickstart.
- Shared-file edits are sequential: do not overlap tasks modifying openapi.ts, docs.routes.ts, docs.test.ts or validation-results.md. If a tested discrepancy appears, write a focused regression before its correction.

## Parallel Execution Examples

- **US1**: T006 authors document/schema tests while T007 authors HTTP delivery tests in a separate file; both finish before T008.
- **US2**: T013 authors HTTP UI requirements tests while T014 authors the browser/accessibility review guide; both precede UI acceptance.
- **US3**: T019 authors schema overlay tests while T020 authors real HTTP contract tests; T021 subsequently extends the integration file.

## Implementation Strategy

Deliver US1 as the smallest useful increment, then add US2, then complete US3 and cross-cutting acceptance. Do not treat the contract-only MVP as completion of the requested Swagger UI feature. Keep user data untouched during verification by using temporary databases and deterministic examples. Do not commit approval records, constitutional changes or passed checklist states without supporting evidence. No dependency is approved by task generation itself.

## Requirement Traceability

| Requirements / outcomes | Tasks |
|---|---|
| FR-001–FR-004, FR-007–FR-008, SC-001 | T006–T012 |
| FR-005–FR-006, FR-009–FR-012, SC-002 | T008–T010, T019–T023 |
| FR-013–FR-015, SC-003, SC-005 | T013–T018, T025 |
| FR-016–FR-017, SC-004 | T008, T019–T023, T025 |
| FR-018 | T003–T004 |
| FR-019, SC-006 | T005–T007, T013–T014, T019–T026 |
