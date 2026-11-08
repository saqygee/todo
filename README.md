# Everyday — single-user ToDo application

A small React + Express application for creating, editing, completing and soft-deleting tasks.
The list hides completed tasks by default. **Display completed** includes them alongside unfinished
work; **create new task** replaces the list with a form until Save or Cancel returns you to it.
Only the title is required. Description and due date are optional, with inline validation errors.

## Run locally

Requires Node.js 24 and npm. Dependency installation was approved for this project; the reviewed
exact versions are in [dependency-review.md](specs/001-todo-crud/dependency-review.md).

```bash
npm ci
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev:server
```

In a second terminal:

```bash
npm run dev:client
```

Open **http://127.0.0.1:5173**. Vite proxies `/api` to the server at `127.0.0.1:3000`.
The server development command watches and recompiles TypeScript and restarts the server.
The ignored `.env` defaults to `DATABASE_URL=file:./prisma/dev.db` and `PORT=3000`.
SQLite paths resolve from the repository root for both the application and migration commands.

To run the production build locally:

```bash
npm run build
npm run db:deploy
npm start
```

Open **http://127.0.0.1:3000**. Express serves the built UI and API from the same origin.
`db:deploy` applies committed migrations; `db:migrate` is for local schema development.
No database files, secrets or generated Prisma client code belong in Git.

## Verification

```bash
npm run test:unit
npm run test:integration
npm run test:components
npm run typecheck
npm run lint
npm run build
```

Integration tests apply migrations to isolated temporary SQLite files, refuse developer database
paths and clean up only their own files. Supertest needs local loopback access. The migration
reproducibility test runs Prisma Migrate in a fresh temporary directory and reconnects afterward.

An optional real-browser acceptance script uses an existing `/usr/bin/google-chrome` installation
and Node's native Chrome DevTools Protocol support, with no additional testing dependency:

```bash
npm run build
node tests/e2e/browser-check.mjs
```

It uses a disposable database and local server, verifies CRUD, validation, focus, keyboard button
activation, accessible names and responsive layout, and times 20 trials per action with 100 tasks.
Evidence and remaining manual accessibility work are in
[validation-results.md](specs/001-todo-crud/validation-results.md).

## Design choices

- Modular monolith with route/controller/service/repository separation and shared Zod schemas.
- Prisma + SQLite with version-controlled migrations, UUID identifiers and nullable optional fields.
- Immutable lifetime ordinals start at 0, include deleted records when finding the maximum, and
  never renumber or reuse deleted positions. Concurrent allocation uses a transaction, unique
  constraint, WAL mode and bounded asynchronous retries.
- Explicit Boolean completion updates; Boolean soft deletion excludes records from normal access.
- ISO 8601 timezone-qualified date input, UTC storage/responses and browser-local presentation.
- React Hook Form + Zod and Axios; no global state framework or dependency injection container.
- No authentication, multiple users, reordering, restoration or public deployment configuration.
  This application is intended for the local single-user assessment.

See the [API contract](specs/001-todo-crud/contracts/rest-api.md),
[implementation plan](specs/001-todo-crud/plan.md),
[task progress](specs/001-todo-crud/tasks.md), and
[acceptance guide](specs/001-todo-crud/quickstart.md).
