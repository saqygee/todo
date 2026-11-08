# Research Decisions

Date: 2026-11-08. Research used primary documentation; no packages installed. Exact versions
must be checked and pinned together at implementation's dependency review.

## Runtime and Prisma Compatibility

**Decision**: Target Node 24 LTS with Prisma 7, strict TypeScript and ESM. Keep Prisma CLI,
client and adapter versions aligned. Add prisma.config.ts as required runtime configuration.
**Rationale**: Node 24 appears in Prisma 7's explicit compatibility matrix and remains an LTS
line. A deliberately selected major prevents mixing incompatible Prisma documentation/APIs.
**Alternatives considered**: Newest Node/Prisma majors introduce unnecessary compatibility work;
older native SQLite driver configuration does not give the chosen ISO timestamp storage path.
Sources: [Node release schedule](https://github.com/nodejs/Release),
[Prisma 7 requirements](https://www.prisma.io/docs/orm/v7/reference/system-requirements),
[Prisma 7 SQLite](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sqlite).

## SQLite and Ordinal Correctness

**Decision**: Use the Prisma 7 better-sqlite3 adapter with its ISO 8601 DateTime format. Read
max ordinal across all rows and create within one short serializable transaction, backed by a
unique ordinal constraint. Retry only known rolled-back contention/collision outcomes.
**Rationale**: User confirmed a lifetime sequence. SQLite serializes writes, but transactions
that start with reads may encounter upgrade conflicts; a transaction alone is insufficient
without uniqueness and tested retry handling. No application-wide mutex or counter is needed.
**Alternatives considered**: Max of active records would reuse ordinals and violates the answer;
nontransactional allocation races; a separate sequence table is unnecessary for this scale.
Sources: [SQLite isolation](https://www.sqlite.org/isolation.html),
[Prisma SQLite adapter and timestamp format](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sqlite),
[Prisma traditional transaction semantics](https://www.prisma.io/docs/orm/v6/prisma-client/queries/transactions).
The last reference explains the traditional transaction pattern; implementation must verify
Prisma 7 signatures and actual pinned adapter error codes before encoding error classification.

## Input and Error Boundaries

**Decision**: Zod strict content objects, timezone-qualified datetime validation, explicit
Boolean completion objects; Express 5 async controllers and a final error middleware.
**Rationale**: Allowlisting prevents system-field mutation; explicit false is safe to repeat.
Express 5 propagates returned/awaited promise failures without an async wrapper package.
Calendar validity and UTC normalisation are tested in addition to string-shape validation.
**Alternatives considered**: Boolean coercion risks interpreting the string false as true;
implicit local dates are ambiguous; blind toggles fail with retries and stale state.
Sources: [Zod API](https://zod.dev/api),
[Express error handling](https://expressjs.com/en/guide/error-handling/).

## Frontend Requests and Forms

**Decision**: Axios is the user-requested request library; use cancellation and stale-response
guards. RHF with zodResolver maps shared Zod validation into field errors. Use local React state.
**Rationale**: A small list needs no global store or query cache. Inline labelled errors and
focus to the first invalid input support correction and accessibility.
**Alternatives considered**: Native fetch avoids a dependency but contradicts the explicit Axios
request; a state framework or form abstraction adds unnecessary complexity.
Sources: [Axios error handling](https://github.com/axios/axios/blob/v1.x/docs/pages/advanced/error-handling.md),
[RHF Zod integration](https://react-hook-form.com/integrations/zod),
[RHF useForm](https://react-hook-form.com/docs/useform),
[Vite server proxy](https://vite.dev/config/server-options).

## Single-List Flow and Optional Fields

**Decision**: Use one list, right-side "create new task" and "Display completed" buttons, and
local list/create/edit view state. The create form replaces the list; successful save or Cancel
restores it. The visibility button toggles includeCompleted and displays both statuses together.
**Rationale**: This directly follows the latest user request and avoids multiple list panels.
**Alternatives considered**: Separate completion tabs were superseded; a completed-only filter
would fail the inclusive display requirement. No new dependencies or technology research needed.

**Decision**: description and dueAt are nullable optional fields; PATCH omission preserves and
null clears. Blank form values map to absence; invalid provided values show errors below controls.
**Rationale**: Users can create with title alone and remove previously entered optional values.
**Alternatives considered**: Requiring these fields contradicts the latest request; conflating
PATCH omission and clearing would unexpectedly erase existing data.

**Decision**: Persist provided dates in UTC and display them in browser-local time. Preserve
unchanged instants; reject nonexistent local wall times; retain the existing overlap policy.
**Rationale**: Optionality does not alter timezone correctness for dates that are provided.
**Alternatives considered**: A fabricated default due date misrepresents user input.

## Dependencies and Installation Gate

The requested stack is approved for planning; this command performs no installations. Before
installation, present exact versions, purpose, existing-capability gap and alternatives for:

| Dependency group | Purpose / existing gap | Alternative |
|---|---|---|
| Express, React, Vite, TypeScript | Required HTTP/UI/build/type stack; no existing app | Handwritten HTTP/build code is outside chosen stack |
| Prisma CLI/client/SQLite adapter and its driver requirements | Required ORM, migrations and local SQLite access | Older native driver; manual SQL conflicts with ORM requirement |
| Zod, RHF, @hookform/resolvers | Required shared validation and form integration | Manual validation/form state conflicts with request |
| Axios | Explicitly requested HTTP client | Built-in fetch |
| Vitest, Supertest, RTL and React DOM support | Required automated tests and UI rendering | Node built-in runner/manual tests do not meet selected tools |
| DOM test environment, such as jsdom | Browser-like environment for RTL in Vitest | happy-dom or a browser runner |
| Node/Express/React/Supertest type packages | Strict typing for untyped package surfaces | Local declarations add maintenance and correctness risks |
| ESLint and TypeScript/React lint configuration packages | Constitutional lint gate; no existing configuration | Compiler-only checks do not cover all lint rules |

Select only necessary support packages after review. Prefer Node's built-in env-file loading
and watch functionality over adding dotenv/concurrently/tsx where compiled/watch workflows suffice.
Axios is included in constitution v1.1.0 following the explicit user-approved amendment.
Dependency review and installation approval are still required. No permission is inferred for arbitrary packages.

## Research Completion

All functional questions are resolved, including lifetime ordinal allocation. Exact package patch
selection and adapter error-code verification are implementation compatibility checks, not open
product decisions. No external integrations, identity system or deployment platform are needed.

## Submission Cancellation Policy

**Decision**: Disable Save and Cancel while create/edit submission is pending. Re-enable both
after failure with input retained; return to the list after success.
**Rationale**: Request cancellation cannot guarantee the server did not commit a write.
**Alternatives considered**: Allowing Cancel during submission would promise an unreliable undo;
adding mutation rollback or idempotency infrastructure is unnecessary for this assessment.
