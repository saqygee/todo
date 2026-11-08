# Dependency Review and Installation Proposal

Date: 2026-11-08. Status: **Approved by user on 2026-11-08**.

## Scope and Existing Approval

The user approved the product technology choices and constitution v1.1.0 includes Axios.
Constitution Principles III and X separately require installation approval after this review.
The user approved the installation scope below on 2026-11-08. Packages have now been
installed at the reviewed direct versions, with resolved transitive versions in package-lock.json.
The original review used npm view to read registry metadata before installation.

The repository has no existing application dependencies to reuse. Installed runtime is Node
24.4.1 and npm 11.4.2. The selected package engine ranges accept this Node version. Versions below
are deliberate compatible pins, not a request to install every newest major. Exact transitive
resolution will be captured by package-lock.json and checked during installation.

## Runtime Dependencies

| Package | Exact version | Purpose and gap | Alternative considered |
|---|---|---|---|
| express | 5.3.0 | Required HTTP routes/middleware; no backend exists | Node HTTP requires manual routing and departs from selected stack |
| react | 19.1.10 | Required component UI | Plain DOM code departs from selected stack |
| react-dom | 19.1.10 | Mount React in the browser | No existing renderer; required React companion |
| zod | 4.6.7 | Required shared runtime validation | Manual validation duplicates rules and departs from stack |
| react-hook-form | 7.91.0 | Required form state/submission handling | Manual React state departs from requested form approach |
| @hookform/resolvers | 5.9.2 | Connect Zod rules to RHF field errors | Custom resolver adds maintenance |
| axios | 1.21.0 | Explicitly requested API request client | Built-in fetch works but does not meet user request |
| @prisma/client | 7.10.1 | Required typed ORM data access | Direct SQL departs from required repository/Prisma approach |
| @prisma/adapter-better-sqlite3 | 7.10.1 | SQLite runtime adapter with ISO DateTime storage | Older native driver configuration changes the planned storage path |

The adapter declares better-sqlite3 ^12.6.0 and @prisma/driver-adapter-utils 7.10.1 as required
transitive dependencies. They are included in the proposed installation scope; lockfile pins
will record the actual driver version. The native driver may require a prebuilt binary download
or local compilation. Do not install optional unrelated peer integrations (canvas, Sass, etc.).

## Development Dependencies

| Package | Exact version | Purpose and gap | Alternative considered |
|---|---|---|---|
| prisma | 7.10.1 | Required client generation and migration CLI | Schema push loses required migration history |
| typescript | 5.9.3 | Required strict type checking and server compilation | JavaScript does not satisfy strict TS requirement |
| vite | 7.3.7 | Required browser build and development proxy | Custom bundling departs from selected stack |
| vitest | 3.2.7 | Required unit/integration/component test runner | Node runner does not meet chosen testing stack |
| supertest | 7.3.2 | Required in-process HTTP integration testing | Manual requests add server/process complexity |
| @testing-library/react | 16.3.3 | Required behaviour-oriented component tests | Low-level DOM tests offer less React lifecycle support |
| @testing-library/dom | 10.4.2 | RTL peer providing accessible DOM queries | Reimplementing queries is unnecessary |
| jsdom | 26.1.0 | Browser DOM environment for Vitest/RTL | happy-dom is viable; full browser runner adds scope |
| eslint | 9.39.5 | Constitutional lint gate | Type checking alone does not provide lint rules |
| @eslint/js | 9.39.5 | Standard JS lint rules for flat configuration | Handwritten rule list adds maintenance |
| typescript-eslint | 8.72.1 | TS-aware ESLint parser/rules | Plain ESLint cannot fully parse/check TS |
| @types/node | 24.19.2 | Node runtime types matching major 24 | Local declarations duplicate maintained typing |
| @types/express | 5.0.6 | Express request/response types | Unsafe casts/local declarations weaken strict typing |
| @types/react | 19.3.0 | React/JSX types | Handwritten declarations are unnecessary |
| @types/react-dom | 19.3.0 | Browser renderer types | Handwritten declarations are unnecessary |
| @types/supertest | 6.0.3 | Type-safe HTTP test assertions | Unsafe casts weaken tests |

## Compatibility Checks

- React DOM 19.1.10 requires React ^19.1.10; both runtime packages are pinned together.
- RTL 16 supports React/React DOM 19 and requires @testing-library/dom ^10.
- Resolvers 5 supports RHF ^7.55 and Zod ^4; the proposed versions satisfy those ranges.
- React DOM type definitions require React types ^19.3; both type packages are pinned together.
- Prisma CLI/client/adapter are aligned at 7.10.1; Prisma supports Node >=24 and TS >=5.4.
- Vite 7 and Vitest 3 support the installed Node 24 runtime.
- typescript-eslint 8.72.1 accepts ESLint 9 and TypeScript 5.9.
- Verify a clean npm dependency resolution and actual driver error mappings during implementation;
  these metadata checks do not claim tests, builds or installation have already succeeded.

## Installation Scope Requested

Approve installation of the exact direct dependencies above, their normal required transitive
dependencies, and necessary Prisma/native-driver package setup scripts and engine/binary downloads.
Use exact direct version pins and retain package-lock.json. No globally installed tools, unrelated
libraries, state frameworks, CSS frameworks, browser test runners, dotenv, tsx or concurrently
are proposed. Node's built-in env-file/watch support and TypeScript compilation cover dev scripts.
Any additional direct dependency or replacement requires another review of purpose and alternatives.

## Execution Status

- User approved the proposed installation scope on 2026-11-08 (T001 complete).
- Constitution v1.1.0 verified to include Axios and preserve installation approval rules (T002).
- Specification quality checklist: 16/16 complete.
- No extension hooks configured.
