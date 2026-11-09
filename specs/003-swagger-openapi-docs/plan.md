# Implementation Plan: Swagger/OpenAPI Documentation

**Branch**: Existing branch unchanged; feature tracked by `.specify/feature.json`.
**Date**: 2026-11-09
**Spec**: [spec.md](spec.md)
**Status**: Design recorded from the preceding planning conversation; dependency/technology approval pending. This is not implementation approval.

## Summary

Publish OpenAPI 3.0.3 at GET `/api/openapi.json` and locally served, browse-only Swagger UI at `/api/docs/`, with `/api/docs` redirecting to the trailing-slash address. Preserve all six existing task operations and architecture. User-selected preferences are local assets and disabled request execution. These specialize the specification's optional interactive behavior; they do not authorize packages.

## Technical Context

- Runtime: Node.js 24, strict TypeScript 5.9, Express 5.3, ESM/NodeNext.
- Schema source: installed Zod 4.6.7 and shared request/response schemas and inferred types.
- Persistence: existing Prisma 7 / SQLite, unchanged; soft deletion remains unchanged. No migration or domain entity is introduced.
- Verification: Vitest, Supertest, existing browser/accessibility tooling.
- Scale: local single-user application, six task operations; no public hosting, authentication, pagination, observability platform or performance infrastructure expansion.
- Availability: backend development and built application modes, direct backend port and existing Vite `/api` proxy; UI remains usable without internet after installation.

## Constitution Check

- I/II/V: Keep HTTP delivery in a documentation router, document construction separate, strongly typed; do not alter controllers, services, repositories or application validation.
- III/X: BLOCKED FOR DEPENDENCY INTRODUCTION until explicit approval. Record review and any technology-boundary amendment before installing packages or importing them into application code. Writing planning/task artifacts is permitted.
- IV/IX: No database changes, task-data seeding, authentication or multi-user changes; errors remain safe and generic.
- VII: Documentation interface must meet WCAG 2.2 AA for affected browsing flows; vendor UI does not waive this gate.
- VIII/XI: Tests must fail before implementation; run relevant tests, typecheck, lint and build; record evidence.
- XII: Minimal documentation integration, no architecture refactor. Post-design assessment: architecture/scope gates satisfied by design; dependency gate still pending, accessibility and quality gates require implementation evidence.

## Design and Research Decisions

### Schema construction

Use `z.toJSONSchema(schema, { io: 'input', target: 'openapi-3.0' })`. Read-only experiments during planning confirmed UUID/datetime formats and patterns, nullable fields, strict unknown-property rejection and literal false conversion. Output-mode conversion throws for existing transforms; do not use `unrepresentable: 'any'` or change runtime schemas merely for documentation.

Reuse create/update/completion/query/ID/Todo/response schemas and existing inferred types for examples. Add documentation-only overlays for update `minProperties: 1`, omitted create defaults, response read-only annotations and UTC output descriptions. Describe trimming, blank-to-null conversion and dynamic write-time date rules explicitly. Limits apply after trimming; do not claim a generated pre-transform schema completely models normalization. Record this representation limit and exercise whitespace examples against runtime schemas. Responses allow historical dates. Keep every response Todo field required.

Document all six task operations, input restrictions, status codes, envelopes, headers, absence of authentication, descending order and soft deletion. Include shared errors and precise applicability: 409 create-only, retry-related 503 for create/content update, Retry-After 1. Unmatched paths/methods retain existing behavior. Document root-level validation with empty fields and parser errors without fields.

### Delivery

Create `src/server/docs/openapi.ts` for the typed description and schema conversion, `src/server/docs/docs.routes.ts` for HTTP delivery and `src/server/docs/swagger-ui.ts` for interface HTML/configuration. Construct the document once. Mount the documentation router in `src/server/app.ts` after existing JSON boundary middleware and before API not-found handling. Preserve existing task router and frontend behavior. Documentation is available without a TodoService and adds no database calls.

Serve only required local UI bundle/CSS plus locally generated initialization from stable documentation asset addresses. Resolve package assets with Node module resolution, avoiding a dependency on a working-directory-specific path or an extra Express adapter. Do not expose the package's default initializer/Petstore page. Use `/api/openapi.json` as the fixed document URL; `supportedSubmitMethods: []`, `validatorUrl: null`, `queryConfigEnabled: false`; no remote assets, external validator or remote configuration. Add accessible failure feedback for an unavailable document, respecting existing error conventions for HTTP failures. Scope unknown asset handling to documentation addresses and keep unrelated API errors JSON.

### Dependency review (proposed, not approved)

| Package | Classification | Purpose and alternatives |
|---|---|---|
| swagger-ui-dist@5.34.1 | Runtime | Required vendor UI assets; Express alone has no Swagger UI. CDN delivery rejected by user preference; custom UI does not meet the Swagger UI request. |
| openapi-types@12.1.3 | Development | Typed OpenAPI construction; existing domain types do not describe OpenAPI. Local duplicate types add maintenance burden. |
| @apidevtools/swagger-parser@11.0.0 | Development | Full OpenAPI 3.0 document/reference validation; Vitest assertions alone do not validate the specification. Manual-only validation is less repeatable. |

No schema-conversion library or Express Swagger adapter. Pin approved versions and lock transitive dependencies; verify availability and compatibility before installation, and re-review any replacement rather than silently substituting. Review transitive dependencies and installation scripts as part of approval. A version discrepancy is a gate, not permission to pick another package.

Research references from the preceding planning turn: [Zod conversion](https://zod.dev/json-schema), [Swagger UI installation](https://swagger.io/docs/open-source-tools/swagger-ui/usage/installation/), [Swagger UI configuration](https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/), [OpenAPI validator options](https://apidevtools.com/swagger-parser/options.html).

## Project Structure

- Feature artifacts: `specs/003-swagger-openapi-docs/`; existing specification and quality checklists, this plan and generated tasks. Separate research/data-model/contracts/quickstart files have not been generated; this plan records the design needed for task generation.
- New implementation: `src/server/docs/`; only existing production integration point is `src/server/app.ts`.
- Tests: `tests/unit/server/openapi.test.ts`, `tests/integration/api/docs.test.ts`, `tests/integration/api/openapi-contract.test.ts`, and documentation-specific browser/accessibility evidence under `tests/e2e/`.
- Usage and evidence: `README.md`, feature `quickstart.md` and `validation-results.md` during implementation.

## Verification and Delivery

Write failing tests for document/reference validity, six-operation coverage, schema constraints, manual overlays, error applicability, authentication absence and transport delivery before implementation. Disable external reference resolution in validator tests. Use deterministic clocks and isolated temporary data for runtime comparisons; do not seed user databases. Keep failures separate from environment/setup failures.

Test JSON/UI/assets/redirects with and without frontend assets and without a service; preserve unrelated unknown path/method errors. Browser review covers direct and proxied development addresses, built mode, offline browsing, unavailable-description feedback, no task requests and keyboard/contrast/Chrome-Orca flows using existing tools. Fix vendor accessibility issues within documentation integration before acceptance; do not relax the constitution silently.

Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and existing browser/accessibility acceptance checks as applicable. Record exact commands/outcomes and any unresolved blockers, not assumed passes. A reviewer must construct a create request and identify validation/missing-task outcomes using documentation alone. Deliver machine-readable contract first as MVP, then UI, then contract fidelity/compatibility sign-off. Entire feature requires all three stories.
