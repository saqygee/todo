# Feature Specification: Swagger/OpenAPI Documentation

**Feature Branch**: No branch created; feature directory tracking is used.

**Created**: 2026-11-09

**Status**: Draft

**Input**: User description: "Add Swagger/OpenAPI documentation to the existing backend. Document all existing endpoints, request parameters, bodies, response schemas, validation, errors and authentication requirements. Provide Swagger UI, reuse existing TypeScript types and Zod schemas wherever practical, follow the constitution and architecture, and avoid unnecessary application changes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand the existing API contract (Priority: P1)

As an API consumer, I can inspect a complete published contract so that I can construct requests and interpret responses without reading source code.

**Why this priority**: An accurate contract is the foundation of useful documentation.

**Independent Test**: Retrieve the description and compare all six operations, inputs and outputs against existing behavior.

**Acceptance Scenarios**:

1. **Given** the running backend, **When** a consumer retrieves its OpenAPI description, **Then** all six task operations have correct methods, paths and summaries.
2. **Given** any operation, **When** its contract is inspected, **Then** parameters, requiredness, request fields, success status, response schema and applicable headers are explicit.
3. **Given** create, update and completion operations, **When** their inputs are compared, **Then** each exposes only permitted properties and distinguishes omission, null and defaults.
4. **Given** a consumer checking access requirements, **When** they read the documentation, **Then** it clearly states that authentication, roles and user ownership are absent.

---

### User Story 2 - Browse documentation in Swagger UI (Priority: P1)

As a developer or reviewer, I can browse the published contract in Swagger UI to discover operations and understand their inputs and responses.

**Why this priority**: A browser interface is an explicit deliverable and supports API discovery.

**Independent Test**: Open the documented UI address in development and built application modes and inspect each operation.

**Acceptance Scenarios**:

1. **Given** either supported application mode, **When** a user opens the documented UI address, **Then** all six operations appear without document-loading errors.
2. **Given** keyboard or screen-reader navigation, **When** a user browses operations and schemas, **Then** controls have accessible names, keyboard access, visible focus and readable content consistent with WCAG 2.2 AA.
3. **Given** existing tasks, **When** a user opens or browses documentation without submitting a request, **Then** no task data changes.

---

### User Story 3 - Understand failures and trust compatibility (Priority: P2)

As a consumer or maintainer, I can understand validation failures and trust that documentation describes current behavior without changing it.

**Why this priority**: Accurate failure guidance prevents incorrect clients and protects existing workflows.

**Independent Test**: Compare representative valid and invalid requests against documented outcomes and run existing regression checks.

**Acceptance Scenarios**:

1. **Given** invalid input, **When** a consumer consults documentation, **Then** the relevant constraint and actual error envelope are explained, including optional or empty field-error maps.
2. **Given** a missing/deleted task, unsupported content type or oversized request, **When** the relevant operation is inspected, **Then** its applicable status and error code are documented.
3. **Given** an existing workflow, **When** documentation is added, **Then** request acceptance, responses, headers, ordering and persistence behavior remain unchanged.
4. **Given** shared validation definitions, **When** a maintainer reviews documentation, **Then** reusable definitions are used wherever practical and any manually represented rule has a documented reason and consistency check.

### Edge Cases

- Unknown body properties, system-managed properties, empty updates, invalid UUIDs, unknown query parameters, repeated query values and nonliteral boolean query values retain current rejection behavior.
- Blank descriptions become null; omitted create optional values default to null; omitted update values are preserved; explicit null clears nullable content fields.
- New or changed due dates must be strictly future at the write boundary. Updates may retain the exact stored overdue instant. Responses permit historical dates.
- Malformed JSON, bodies over 32 KB and POST/PATCH requests without accepted JSON content have distinct documented outcomes.
- Root-level validation failures may produce an empty field-error map; malformed JSON may omit that map.
- Missing and soft-deleted records share the task-not-found response, including repeated deletion.
- Only create and content update use bounded storage retries; documentation must not promise 503 for every storage failure.
- Unmatched API methods and paths retain route-not-found behavior rather than introducing 405 responses.
- Documentation remains reachable alongside frontend assets and fallback routing; unrelated unknown API paths retain JSON errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The backend MUST publish a valid OpenAPI description retrievable without credentials at a stable, documented address.
- **FR-002**: The description MUST cover GET and POST `/api/todos`, GET/PATCH/DELETE `/api/todos/{id}`, and PATCH `/api/todos/{id}/completion`, with a distinct summary for each operation.
- **FR-003**: Each operation MUST document applicable path and query parameters, types, requiredness, allowed values and defaults. `includeCompleted` accepts literal query values `true` and `false`, defaulting to exclusion of completed tasks.
- **FR-004**: Create, content update and completion MUST have separate JSON request descriptions specifying permitted fields, requiredness, nullability, defaults, unknown-property rejection and the nonempty content-update constraint.
- **FR-005**: Documentation MUST describe trimming, title length 1–120, description length at most 500, blank-description conversion to null, UUID identifiers, timezone-qualified due dates and UTC response serialization.
- **FR-006**: Documentation MUST explain future-date write validation, retention of the exact stored overdue instant on update, clearing with null and preservation on omission. Response descriptions MUST permit historical dates.
- **FR-007**: The complete Todo representation MUST include `id`, `title`, `description`, `dueAt`, `ordinal`, `completed`, `deleted`, `createdAt` and `updatedAt`, with types, nullability and system-managed fields. Returned `deleted` is always false; completion uses its separate operation.
- **FR-008**: Every operation MUST describe actual success responses: list and single-item `data` envelopes, create's 201 status and `Location` header, and deletion's bodyless 204 response.
- **FR-009**: Documentation MUST describe descending ordinal list order, exclusion of deleted tasks, default exclusion of completed tasks, inclusion of both completion states when requested, absence of pagination, soft deletion and missing/deleted-record behavior.
- **FR-010**: A shared error description MUST represent `error.code`, `error.message` and optional `error.fields`, mapping field names to arrays of messages and permitting an empty map. Examples MUST match current messages and exclude internal errors, paths and stack traces.
- **FR-011**: Applicable operations and shared boundary guidance MUST document 400 `VALIDATION_ERROR`, 404 `TODO_NOT_FOUND` and `ROUTE_NOT_FOUND`, create-only 409 `ORDINAL_EXHAUSTED`, 413 `PAYLOAD_TOO_LARGE`, 415 `UNSUPPORTED_MEDIA_TYPE`, 503 `STORAGE_BUSY` and 500 `INTERNAL_ERROR`. The 503 response MUST describe `Retry-After: 1` and the create/content-update retry scope.
- **FR-012**: Documentation MUST explicitly state that authentication, authorisation roles and per-user isolation are absent. It MUST NOT introduce credentials or describe hypothetical 401/403 responses as existing behavior.
- **FR-013**: Swagger UI MUST render the published description at a stable browser address in development and built application modes. Usage instructions MUST identify both documentation addresses and how to access them.
- **FR-014**: Documentation browsing MUST be read-only unless a user explicitly submits an API request. Examples MUST NOT automatically seed or modify persistent task data.
- **FR-015**: Documentation UI work MUST target WCAG 2.2 AA, including semantic structure, accessible labels, keyboard navigation, visible and predictable focus, contrast, screen-reader compatibility and accessible feedback for affected interactions.
- **FR-016**: Existing TypeScript types and Zod validation schemas MUST be reused wherever practical to avoid competing definitions. Any unavoidable documentation-specific representation or manually described business rule MUST have a documented reason and consistency check against existing behavior.
- **FR-017**: Implementation MUST preserve the constitution's modular monolith and controller/service/repository responsibilities. Existing application code changes MUST be limited to exposing documentation; existing API contracts, validation, error handling, business rules, persistence and frontend workflows MUST remain unchanged.
- **FR-018**: Dependency and technology choices MUST follow constitutional review and approval requirements. Planning MUST explain each proposed external dependency's purpose, existing-capability limitations and alternatives before introduction or installation. This specification selects no package and does not amend the constitution.
- **FR-019**: Verification MUST cover description validity, complete operation coverage, UI availability in both application modes, representative contract consistency, accessibility and regression behavior, following the constitution's test-first workflow and applicable quality gates.

### Key Entities

- **API description**: The published operations, inputs, outputs, access requirements and failure guidance; no new persistent domain data.
- **Todo representation**: The existing public task record shared by single-item and list responses.
- **Error representation**: The existing failure envelope with operation-specific statuses, codes and optional field details.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Consumers can find all six existing task operations in both published and browser documentation: 100% coverage and no invented task operations.
- **SC-002**: Every operation has complete inputs, success responses, applicable errors and access requirements; representative valid and invalid requests have zero documented-versus-observed discrepancies.
- **SC-003**: In development and built application modes, users can inspect all six operations without document-loading errors or unintended task changes.
- **SC-004**: All existing regression checks relevant to task behavior continue to pass, with zero intentional changes to task contracts or stored-data behavior.
- **SC-005**: Documentation browsing review finds zero unresolved WCAG 2.2 AA failures in affected keyboard, focus, naming, contrast and screen-reader flows.
- **SC-006**: Using documentation alone, a reviewer can construct a valid create request and identify expected validation and missing-task responses without consulting source code.

## Assumptions

- The baseline is the current six-operation, local, single-user backend reviewed on 2026-11-09. Actual behavior takes precedence over stale prose, including the original contract's ascending-order statement.
- Exact documentation version, addresses, package choices and generation approach are planning decisions subject to compatibility and constitutional requirements.
- Documentation is available with the existing application; a separate hosted service is unnecessary.
- Static frontend routes and implicit framework method handling are not additional task operations. Existing fallback and unmatched-method behavior remain unchanged outside new documentation addresses.
- Authentication implementation, multi-user support, database changes, new task operations, client generation, public hosting and business-rule changes are outside scope.
- Interactive request execution is not an additional acceptance requirement; if exposed by Swagger UI, it uses existing operations and requires explicit user action.
- Existing schemas, types, tests and contract artifacts provide documentation inputs. Dynamic rules and transformations require descriptions even when not expressible as schema constraints.
- Constitution version 1.1.0 governs this work. Any required technology-boundary amendment must be resolved explicitly during planning before conflicting implementation proceeds.
