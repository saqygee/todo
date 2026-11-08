# REST Contract: ToDos

Base: /api/todos. JSON requests/responses except bodyless 204. No authentication or user ID.
API names use Todo; interface copy uses ToDo. Dates are returned as UTC ISO 8601 strings ending Z.

## Operations

| Method and path | Input | Success |
|---|---|---|
| GET /api/todos | Optional includeCompleted=true or false | 200, data array |
| GET /api/todos/:id | UUID parameter | 200, data Todo |
| POST /api/todos | Full content body | 201, data Todo; Location header |
| PATCH /api/todos/:id | Nonempty partial content body | 200, data Todo |
| PATCH /api/todos/:id/completion | Exactly completed: Boolean | 200, data Todo |
| DELETE /api/todos/:id | UUID parameter, no body | 204, no body |

Default includeCompleted=false excludes completed. true includes both states, not completed
only. Every list excludes deleted and orders ordinal ascending. Unknown query parameters,
repeated includeCompleted values and values other than literal true/false are rejected as 400.
Detail reads and all updates exclude deleted. Repeated delete returns 404.

## Content Requests

POST requires only title (trimmed 1–120). description is optional/nullable, trimmed to at most
500 characters; blank becomes null. dueAt is optional/nullable; when provided it must be valid
ISO 8601 with Z or a numeric timezone offset. Omitted optional fields default to null.
PATCH accepts a nonempty subset of title, description and dueAt. Omission preserves the current
value; explicit null clears description or dueAt. Title cannot be null or blank. Wrong types,
invalid nonblank dates and unknown/system-managed properties return 400. Strict allowlists reject
id, ordinal, createdAt, updatedAt, deleted and completed in content requests. Completion requires
exactly completed: true or completed: false; strings and omitted values are invalid.

Example create body:

```json
{"title":"Prepare demo","description":"Check CRUD acceptance flows","dueAt":"2026-11-09T10:00:00+01:00"}
```

## Success Representation

Single-item responses use {"data": Todo}; lists use {"data": [Todo, ...]} without pagination.
Todo contains id, title, description, dueAt, ordinal, completed, deleted, createdAt and updatedAt.
description and dueAt are null when absent. Only deleted=false items are returned. System-managed fields are read-only.

```json
{
  "data": {
    "id": "f5f24d2f-7a55-4aeb-b101-5b28d2040b82",
    "title": "Prepare demo",
    "description": "Check CRUD acceptance flows",
    "dueAt": "2026-11-09T09:00:00.000Z",
    "ordinal": 0,
    "completed": false,
    "deleted": false,
    "createdAt": "2026-11-08T12:00:00.000Z",
    "updatedAt": "2026-11-08T12:00:00.000Z"
  }
}
```

## Error Representation

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fields": {"title": ["Title must contain at most 120 characters."]}
  }
}
```

fields is optional and only contains safe field-specific messages. The frontend places each
message below its matching control; non-field errors appear in an accessible form/page summary.

| Status | Code | Meaning |
|---|---|---|
| 400 | VALIDATION_ERROR | Invalid body, UUID, query, unknown property or malformed JSON |
| 404 | TODO_NOT_FOUND | Missing/deleted record; never reveal retained content |
| 404 | ROUTE_NOT_FOUND | Unknown API path |
| 409 | ORDINAL_EXHAUSTED | No representable next ordinal |
| 413 | PAYLOAD_TOO_LARGE | JSON body exceeds 32 KB |
| 415 | UNSUPPORTED_MEDIA_TYPE | Non-JSON content request |
| 503 | STORAGE_BUSY | Bounded known-conflict retries exhausted; Retry-After: 1 |
| 500 | INTERNAL_ERROR | Unexpected failure with generic client message |

Express final error middleware serialises these errors, including parser failures, without
stack traces, SQL, file paths or raw dependency error messages. Content saves are last-successful-
save wins without version tokens or conflict warnings. Content updates do not change completed,
ordinal or deleted. A stale edit of a deleted record is 404. No restoration/reordering endpoints.

Do not automatically retry mutation requests after ambiguous network failure: a create may
already have committed. Refresh and let the user decide whether another create is necessary.
