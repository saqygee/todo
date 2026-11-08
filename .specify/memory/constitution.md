<!--
Sync Impact Report
Version change: unversioned template → 1.0.0 (initial adoption)
Modified principles: five unnamed template slots replaced with twelve supplied principles:
I. Architecture and Design; II. Code Quality; III. Technology Constraints;
IV. Database Principles; V. API Design; VI. Frontend Engineering;
VII. Accessibility; VIII. Testing and TDD; IX. Security;
X. Dependency Management; XI. AI-Assisted Development and Workflow;
XII. Scope and Engineering Priorities.
Added sections: Technology and Scope Constraints; Development Workflow and Quality Gates;
concrete Governance rules.
Removed sections: unused placeholder text and illustrative template comments.
Dependent templates and commands: unchanged; read the constitution at runtime.
Deferred items / follow-up TODOs: none.
-->
# Todo Constitution

## Core Principles

### I. Architecture and Design

The application MUST use a modular monolith organised by feature, with layered architecture
and MVC-style controllers. Controllers MUST handle HTTP requests and responses; services MUST
own business rules and application logic; repositories MUST own database access. These
responsibilities MUST remain separate. SOLID principles MUST be applied pragmatically, with
composition and simple solutions preferred over unnecessary abstractions. Microservices,
premature optimisation and overengineering MUST be avoided to keep this assessment manageable.

### II. Code Quality

Code MUST use strict TypeScript, strong typing, consistent naming and focused responsibilities.
Code MUST avoid `any` and unsafe type assertions. Implementations MUST be readable, maintainable
and documented where intent is not evident from the code. Developers MUST apply Clean Code,
DRY, KISS and YAGNI pragmatically and keep dependencies loosely coupled.

### III. Technology Constraints

Implementations MUST use the approved stack in Technology and Scope Constraints. Additional
frameworks, libraries or technologies MUST NOT be introduced without explicit user approval.
Dependency installation MUST also satisfy Principle X, including dependencies in the approved
stack; stack approval alone does not authorise installation.

### IV. Database Principles

Database access MUST use Prisma ORM and safe Prisma query methods or parameterised queries.
Entities MUST use UUID identifiers and appropriate constraints and relationships. Schema
changes MUST include version-controlled Prisma migrations. Operations that must succeed or
fail together MUST use transactions. Timestamps MUST be stored and processed consistently in
UTC. Each feature involving deletion MUST assess whether record preservation or data integrity
requires soft deletion and document that decision in its plan.

### V. API Design

APIs MUST follow RESTful conventions, consistent resource naming, appropriate HTTP methods and
status codes, and consistent response and error structures. Incoming requests MUST be validated
using Zod schemas. Express middleware MUST centralise error handling. Business logic MUST remain
independent of HTTP concerns. Responses MUST NOT expose internal errors, stack traces or
implementation details.

### VI. Frontend Engineering

The frontend MUST use component-based React architecture with focused, reusable, maintainable
components. Forms MUST use React Hook Form for state and submission management and Zod for
validation. Implementations MUST avoid unnecessary global state and duplicated sources of truth,
separate presentation from application logic, and explicitly handle loading, empty, success and
error states wherever applicable.

### VII. Accessibility

All UI work MUST target WCAG 2.2 Level AA. Specifications, plans, implementations and tests MUST
address semantic HTML, accessible markup, complete keyboard navigation, visible and predictable
focus management, accessible labels and validation feedback, sufficient colour contrast,
screen-reader compatibility, and accessible interactive controls. Reviews MUST assess these
requirements for every affected user flow.

### VIII. Testing and TDD

Functionality MUST follow test-driven development: write and observe a failing test, implement
the minimum code needed to pass, then refactor while keeping tests passing. Business logic and
individual components MUST have unit tests; API endpoints and database interactions MUST have
integration tests. Tests MUST use Vitest, Supertest for HTTP integration, and React Testing
Library for component behaviour as applicable. Coverage MUST include normal operation,
validation failures, boundaries, edge cases and expected failures. Tests MUST remain
deterministic, isolated and maintainable.

### IX. Security

Code MUST follow OWASP secure coding guidelines, treat external input as untrusted, validate
input and sanitise it where required by its use. Database access MUST prevent SQL injection
through safe query methods. Implementations MUST use secure defaults and appropriate error
handling and MUST NOT expose sensitive information or internal implementation errors.
Authentication and multi-user functionality MUST remain out of scope.

### X. Dependency Management

Before introducing or installing any external dependency, the developer or agent MUST explain
its purpose, the problem it solves, why existing capabilities are insufficient, and reasonable
alternatives. Explicit user approval MUST be obtained before introduction or installation.
No additional technology or dependency MAY bypass this process.

### XI. AI-Assisted Development and Workflow

Development MUST follow specification-first development using Spec Kit. Requirements and
acceptance criteria MUST be specified before implementation. Plans MUST comply with this
constitution and the approved stack. AI-generated code MUST be reviewed for correctness,
security, maintainability and architectural compliance before acceptance. Work MUST preserve
meaningful Git history through focused, descriptive commits. Relevant automated tests, type
checks and linting MUST pass before work is considered complete. Approved requirements and
architectural decisions MUST NOT be silently changed.

### XII. Scope and Engineering Priorities

This application MUST remain a small technical assessment. Work MUST NOT introduce unrequested
features, technologies, unnecessary abstractions, infrastructure or architectural complexity.
Engineering decisions MUST prioritise simplicity, correctness, maintainability, accessibility
and future extensibility within the approved scope. Conflicts between requirements and these
principles MUST be identified and clarified with the user before architectural decisions are
made or conflicting work proceeds.

## Technology and Scope Constraints

- Backend: Node.js, Express 5, TypeScript, Prisma ORM, SQLite and Zod.
- Frontend: React, TypeScript, Vite, React Hook Form and Zod.
- Testing: Vitest, Supertest and React Testing Library.
- Product: a simple Todo application for creating, managing, organising and tracking everyday
  tasks. Authentication and multi-user functionality are excluded.

These choices define the approved technology boundary. Changes require explicit user approval
and, when they alter this boundary, a corresponding constitutional amendment.

## Development Workflow and Quality Gates

1. Specify requirements and testable acceptance criteria using Spec Kit before implementation.
2. Produce a plan that checks architecture, stack, scope, database integrity, security and
   accessibility against this constitution. Resolve conflicts before implementation.
3. Obtain approval for any dependency introduction or installation under Principle X.
4. Implement functionality using the failing-test, passing-implementation, refactoring cycle.
5. Review changes, including AI-generated code, against requirements and all applicable
   principles. Record relevant test, type-check and lint results before declaring completion.
6. Keep commits focused and descriptive; do not silently revise approved requirements or design.

## Governance

This constitution governs project specifications, plans, implementation and review. Every plan
and change review MUST check compliance with applicable principles. Conflicts MUST be raised
with the user; complexity MUST be justified against the assessment scope. A conflicting change
MUST NOT proceed until the user resolves the conflict and any required amendment is adopted.

Amendments MUST document the proposed rule changes, rationale, affected work and any migration
or follow-up actions. They require explicit user approval. Each adopted amendment MUST update
this document, its Sync Impact Report, version and last-amended date. The original ratification
date MUST remain unchanged.

Versions MUST follow semantic versioning: MAJOR for incompatible removals or redefinitions of
principles or governance; MINOR for new principles, sections or materially expanded guidance;
PATCH for clarifications and wording changes that do not alter obligations. Version 1.0.0 is the
initial adoption of the supplied principles.

**Version**: 1.0.0 | **Ratified**: 2026-11-08 | **Last Amended**: 2026-11-08
