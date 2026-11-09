# Swagger/OpenAPI Documentation Usage

## Prerequisites and startup

Use the existing Node.js 24 application setup described in README.md. The approved UI package
and type definitions are pinned in package.json/package-lock.json. No new database migration,
configuration variable, authentication setup or external documentation service is needed.

For the built application, run `npm run build` then `npm start` using the existing database setup.
For development, run `npm run dev:server` and `npm run dev:client` in separate terminals.

## Addresses

| Mode | Swagger UI | OpenAPI JSON |
|---|---|---|
| Backend development or built app, default port | http://127.0.0.1:3000/api/docs/ | http://127.0.0.1:3000/api/openapi.json |
| Vite development proxy, both servers running | http://127.0.0.1:5173/api/docs/ | http://127.0.0.1:5173/api/openapi.json |

Use the configured backend port instead of 3000 when applicable. `/api/docs` redirects to
`/api/docs/`. Local assets allow browsing without internet after dependencies are installed.
No credentials are required; the API is the existing local, single-user application.

## Reading the contract

The reference describes list, detail, create, content update, completion and soft deletion.
Examples are illustrative; Swagger UI cannot submit them. For create, title is required;
description and dueAt default to null. Updates are nonempty partial content bodies; omission
preserves values, null clears nullable fields. Completion uses its separate boolean body.
A create returns 201 and Location; validation returns 400 VALIDATION_ERROR; missing/deleted
tasks return 404 TODO_NOT_FOUND. See the published reference for all fields, errors and headers.

Post-trim title/description limits and dynamic date checks are described in prose. Structural
request schemas alone do not replace server validation. Responses retain normalized limits
and permit historical dates. No endpoint, business rule, persistence policy or security
requirement has been changed by documentation.

## Troubleshooting

If the description or bundle is unavailable/invalid, the page retains a visible status message.
Restore backend/assets availability and refresh; this does not retry task mutations. The Vite
address also requires the backend at the existing proxy target. Missing documentation assets
return API errors rather than falling through to the Todo HTML page.

## Verification boundary

Per explicit user direction, no Swagger unit, integration, component or E2E test files are
included. Do not add Swagger cases to the existing application E2E harness. Swagger WCAG and
Orca checks are excluded. Static source review, `npm run typecheck`, `npm run lint`, and
`npm run build` are used for documentation verification. Existing `npm test` and
`node tests/e2e/browser-check.mjs` cover prior Todo behavior only. These checks do not establish
that every Swagger runtime/browser interaction was tested. Recorded evidence is in
[validation-results.md](validation-results.md).
