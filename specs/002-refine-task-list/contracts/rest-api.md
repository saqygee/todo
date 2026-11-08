# REST Contract Delta: Refine Task List and Due-Date Selection

Inherit routes, strict fields, envelopes and statuses from the
[existing contract](../../001-todo-crud/contracts/rest-api.md), except for the changes below.

## Listing

GET /api/todos and GET /api/todos?includeCompleted=true return matching non-deleted records in
**descending ordinal** order. Default continues to exclude completed. true includes both states.
No sort parameter, new endpoint or reordering operation is added.

## DueAt Writes

POST /api/todos and PATCH /api/todos/:id retain a single optional/nullable dueAt field. A provided
value is valid timezone-qualified ISO 8601, normalised to UTC. No date/hour/minute/timezone fields
are added to the request. Date/time response strings remain UTC with Z; null still means absent.

- POST accepts null/omission or an instant strictly later than the application clock immediately
  before persistence. An expired value is 400.
- PATCH omission preserves the stored value; null clears it. A supplied instant equal to the
  current stored due instant is accepted, including when overdue. A different supplied instant
  must be strictly future at the write-boundary check.
- The current stored context is read atomically with validation/update, including on retries.
  No exception is based solely on an original timestamp supplied by the browser.
- Existing overdue values remain valid for GET/list/detail responses. Completion and deletion
  do not assign dates and continue to work on overdue tasks.

Invalid temporal values return the existing 400 error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fields": {"dueAt": ["Choose a future date and time, or clear the due date."]}
  }
}
```

The form preserves its values and associates this error with the date/time group. Missing or
deleted records remain 404. Known contention uses the existing bounded retry and 503 policy.
There are no version tokens or new conflict warnings; the latest valid content save still wins.

## Interface Contract

- Both actions precede the list in DOM and visual order, aligned top right: create first, display
  second. They remain visible for empty/error/loading states, and hide with the list during forms.
- Display completed keeps its label and aria-pressed. Active state has distinct colour and a
  non-colour indicator/border, including forced-colours rendering.
- Calendar date, Hour and Minute have separate labels, disabled unavailable choices and errors
  under the responsible controls. A grouped dueAt error is announced and associated accessibly.
- Existing read, create, edit, completion, deletion and optional-value behaviours otherwise remain.
