# Implementation Plan: Swagger/OpenAPI Documentation

**Date**: 2026-11-09
**Spec**: [spec.md](spec.md)
**Constitution**: v1.4.0, including user-approved Swagger WCAG/Orca and automated-testing exceptions.

## Summary and Scope

Publish OpenAPI 3.0.3 at GET `/api/openapi.json` and locally served, browse-only Swagger UI at `/api/docs/`. Redirect `/api/docs` to the canonical trailing-slash URL. Document the existing six task operations without altering runtime task behavior, validation, error handling, persistence or frontend workflows.

## Technical Context and Decisions

Node 24, strict TypeScript, Express 5 ESM, existing Prisma/SQLite and Zod. Approved runtime package swagger-ui-dist@5.34.1 supplies local assets; openapi-types@12.1.3 is development-only for type imports. The previously approved test-only swagger-parser package was removed after the user excluded all Swagger tests. Lifecycle scripts were disabled during installation, including Scarf reporting. No schema-conversion package or Express adapter is needed.

Construct the typed document once in `src/server/docs/openapi.ts`, using existing Zod schemas with `z.toJSONSchema(..., { io: 'input', target: 'openapi-3.0' })`. Map the emitted vocabulary into typed OpenAPI schema objects without unsafe casts; reject unsupported keywords. Reuse shared constants and inferred types. Do not mutate application schemas.

Create/update title/description limits apply after trimming. Remove misleading raw-input minLength/maxLength from those documentation properties and state post-trim limits in descriptions. Preserve normalized response limits, types, nullability, strict property allowlists, create defaults and nonempty-update constraints. Keep response fields required. Describe UTC serialization, historical response dates, exact unchanged-overdue exceptions and dynamic future checks in prose. Structural schemas plus descriptions form the contract; they do not replace runtime semantic validation.

Include all methods/paths, IDs, query values, required bodies, examples, response envelopes/statuses/headers and shared errors. Describe authentication absence, descending order, soft deletion, completion restrictions and last-successful-save behavior. Preserve create-only 409, create/content-update retry-related 503, Retry-After 1, empty versus absent error maps and global JSON boundary failures. Current behavior takes precedence over historical contract prose; the refinement contract overrides original ascending order, and runtime messages take precedence over stale examples.

## Delivery and Architecture

`src/server/docs/docs.routes.ts` serves the document, HTML, initialization and only the required vendor bundle/CSS resolved using Node module resolution. `src/server/docs/swagger-ui.ts` owns the local page/configuration. Mount after existing API JSON middleware and before API not-found handling in `src/server/app.ts`. No controller/service/repository changes, migrations, task-data calls or frontend routing changes.

Use fixed /api/openapi.json, supportedSubmitMethods empty, validatorUrl null and queryConfigEnabled false. No remote assets/configuration/validator. Preserve a visible status for bundle failure and show unavailable/invalid-document feedback with refresh recovery. Scope missing-documentation asset handling without swallowing unrelated API errors. Existing Vite /api proxy and built backend both serve these addresses.

## Constitution Check

I/II/V: Existing layers, strict typing, shared validation and centralized task errors preserved. III/X: Exact remaining packages and scoped technology amendment approved explicitly; no additional dependencies introduced. IV/IX: No database, authentication or multi-user changes. VII/VIII: User explicitly excludes Swagger WCAG/Orca and all Swagger-specific automated/E2E tests. Existing Todo accessibility requirements and application tests remain unchanged. XI/XII: Review source diff, typecheck, lint, build and existing regressions; do not claim skipped Swagger checks passed.

## Validation and Delivery

Remove tests/unit/server/openapi.test.ts and tests/integration/api/docs.test.ts authored before the scope change. Do not create Swagger unit/integration/component/E2E tests or acceptance harnesses. Existing npm test and node tests/e2e/browser-check.mjs cover only prior application behavior. Run npm run typecheck, npm run lint and npm run build. No Orca run is required for this documentation-only feature.

Statically review routes against current controller/service/repository/schema/error source, references/examples against component definitions, UI asset delivery and configuration against local/offline/browse-only requirements. Review whitespace-only/padded/post-trim-over-limit and future/overdue cases from source without adding test fixtures. Record exact outcomes and limitations in validation-results.md; new Swagger runtime/browser behavior is not automatically verified.

Deliver contract and UI plus README and quickstart usage guidance. The existing feature checklists are requirements reviews, not evidence of Swagger tests. Tasks retired by the user instruction must be explicitly identified as excluded rather than falsely recorded as executed tests.
