# Validation Results: Swagger/OpenAPI Documentation

**Date**: 2026-11-09
**Scope**: Documentation implementation plus unchanged application regressions. User explicitly excluded Swagger-specific unit, integration, component and E2E tests and Swagger WCAG/Orca checks. No such tests remain in the repository.

## Completed Work

- OpenAPI 3.0.3 construction in src/server/docs/openapi.ts reuses shared Zod schemas, constants and inferred types. Covers the six current operations and documented errors/access rules.
- Local browse-only UI and fixed initializer in src/server/docs/swagger-ui.ts; allowlisted vendor assets, redirect, JSON route and API-specific missing-asset handling in src/server/docs/docs.routes.ts.
- Existing application production integration consists of importing the router and mounting it before API not-found handling. Task controllers, routes, services, repositories, shared validators and database model/migration files are unchanged.
- README and quickstart.md document direct and proxied addresses, offline/local behavior and limitations.
- Constitution v1.3.0 adopted the explicitly approved dependency scope; v1.4.0 records the subsequent user-requested Swagger testing exception. The Swagger-only WCAG/Orca exception is retained.

## Commands and Observed Outcomes

| Check | Outcome |
|---|---|
| Baseline npm test in sandbox | 52 pass, 10 fail from loopback/subprocess restrictions; not counted as product regressions. |
| Baseline npm test with required access | 62/62 tests pass across 34 files, before documentation implementation. |
| Baseline npm run typecheck / npm run lint | Both pass. |
| Final npm test with required access | 62/62 existing tests pass across 34 files. No Swagger cases added. |
| npm run typecheck | Pass with documentation code included. |
| npm run lint | Pass with documentation code included. |
| npm run build | Pass; Prisma generation, server compilation and Vite production build complete. Existing Zod/Rollup annotation warnings are non-fatal. |
| node tests/e2e/browser-check.mjs with required access | Pass using temporary data and existing headless Chrome/CDP harness, unmodified. CRUD, completion, edit/delete, ordering, date/time behavior and responsive checks pass. |
| git diff --check | Pass. |
| Swagger-specific automated/E2E/WCAG/Orca checks | Excluded by explicit user instruction; not reported as passing. |

The existing browser harness refreshed tests/e2e/browser-results.json with its actual recorded timings: 20/20 list/filter/write trials below 2 seconds; maximum 88/95/168 ms respectively. The harness and all other existing test source files are unchanged.

## Static Contract Review

Reviewed against existing todo.routes.ts, todo.controller.ts, todo.service.ts, todo.repository.ts, todo.schema.ts, due-date.schema.ts and error-handler.ts:

- Exact methods/paths: GET/POST collection, GET/PATCH/DELETE detail, PATCH completion. UUID path parameters and true/false query strings remain correct; no authentication/security scheme introduced.
- Request allowlists/defaults/nullability and content versus completion separation are preserved. Documentation-only post-trim limit descriptions avoid incorrect raw-input length assertions; normalized response limits remain. Nonempty updates use minProperties 1.
- Examples use existing domain/input types. Component references identify defined schemas/responses. No unsafe assertions, explicit any or new conversion dependency.
- Success envelopes/statuses, create Location and bodyless 204 match controllers. Descending order, soft deletion and no pagination match repository behavior.
- Future dates and exact unchanged-overdue exceptions are described, not enforced by new middleware. Historical response instants remain permitted.
- Safe messages and error fields match centralized handling. Create-only ordinal exhaustion, bounded retries only for create/content update, Retry-After 1 and unknown API path/method behavior remain accurately scoped. Global parser/media/size guidance covers shared boundaries.
- UI source fixes the local document URL, disables submission/external validation/query overrides and only references local bundle/CSS/initializer assets. Visible initial/failure status and refresh recovery add no task request.
- Static inspection confirms no new task-data access, user-data seed, database migration, auth implementation, frontend proxy change or architecture refactor.

These are source-review findings, not a claim that Swagger UI was exercised in a browser or the document validated by a dedicated validator. The generated document is constructed when existing app tests import the app; those existing tests are not repurposed into Swagger coverage.

## Test Removal and Dependency Review

The initially authored tests/unit/server/openapi.test.ts and tests/integration/api/docs.test.ts were removed following the user instruction. Earlier red results (missing documentation module and 404 JSON endpoint) are historical only. No replacement Swagger test or E2E harness was created. @apidevtools/swagger-parser and its test-only transitive dependencies were uninstalled with lifecycle scripts disabled.

Final direct additions: swagger-ui-dist@5.34.1 (runtime), openapi-types@12.1.3 (development/type imports). Lockfile adds only these and @scarf/scarf@1.4.0; existing locked versions are unchanged. Install lifecycle scripts were disabled, including Scarf reporting. Existing Prisma generation was invoked explicitly by the normal build command. Metadata and lockfile inspection is not a vulnerability-free guarantee.

## Final Requirement Coverage

| Requirements | Evidence |
|---|---|
| FR-001–FR-004, FR-007–FR-008; SC-001 | Typed document construction, request/response components and local delivery source review. |
| FR-005–FR-006, FR-009–FR-012; SC-002 | Shared schema reuse, explicit semantic descriptions and source comparison above. |
| FR-013–FR-015; SC-003/SC-005 | Local fixed UI configuration and routing source review; testing/accessibility exclusions explicitly recorded. Functional runtime promises remain unverified by Swagger-specific tests, by direction. |
| FR-016–FR-017; SC-004 | Static architecture/diff review, existing 62 tests, existing Todo browser regressions and type/lint/build checks. |
| FR-018 | Explicit package approval, dependency-review.md, scoped constitutional amendment and final lockfile. |
| FR-019; SC-006 | Revised no-Swagger-tests validation scope; typed examples and failure guidance reviewed from source; no independent user/browser study claimed. |

All revised implementation tasks are complete or explicitly retired by user instruction. Requirements checklists remain requirements-quality reviews only. No outstanding implementation blocker is recorded; lack of dedicated Swagger runtime/browser verification is an intentional scope limitation.
