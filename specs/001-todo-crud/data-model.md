# Data Model: ToDo

## Entity and Validation

There is one Todo entity and no owner/user relationship. The latest revision makes description and dueAt
optional and retains Boolean soft deletion.

| Field | Prisma type / default | Rules |
|---|---|---|
| id | String, UUID primary key, Prisma-generated | Immutable; UUID params validated |
| title | String, required | Trimmed; 1–120 characters |
| description | String?, nullable | Optional; trimmed maximum 500; blank becomes null |
| dueAt | DateTime?, nullable | Optional; timezone-qualified when provided; UTC persistence |
| ordinal | Int, unique | Backend assigned; non-negative; immutable |
| completed | Boolean, false | Dedicated explicit Boolean update |
| deleted | Boolean, false | Only delete operation can set true |
| createdAt | DateTime, now | Server-managed; immutable |
| updatedAt | DateTime, automatically updated | Server-managed on content/status/delete writes |

SQLite cannot enforce String limits through Prisma schema declarations; shared Zod schemas
apply limits server-side and in forms. Only title is required on create. Omitted or null optional
fields default to null; blank description normalises to null. PATCH omission leaves a field
unchanged; explicit null clears it. A blank frontend date control sends null. Reject invalid
nonblank dates, wrong types and unsupported keys. Past due dates are allowed. No completedAt,
deletedAt, ownerId or recurrence fields are added. Migration history must use nullable columns.

## Constraints and Indexes

- Primary key on id; unique index on ordinal prevents duplicate allocation.
- Composite index (deleted, completed, ordinal) serves default incomplete and completed queries.
- Composite index (deleted, ordinal) serves includeCompleted=true ordering.
- Use Prisma Migrate for initial schema and every later change. Test migrations against empty
  SQLite files. No schema push as a substitute for migration history.
- Prisma 7 SQLite adapter uses ISO 8601 DateTime storage. Normalise input and verify raw persisted
  values and serialised UTC responses in integration tests; API timestamps always end in Z.

## State Transitions

Create → incomplete, non-deleted. Completion writes set true/false explicitly; setting the
current value is allowed. Content edits change title, description and dueAt only. Deletion
changes deleted to true and retains all data and ordinal. A deleted record has no outgoing
transition in this feature. No-op requests may retain updatedAt; acceptance does not require
updatedAt to change when no data changes.

Content updates use last-successful-save wins, preserving current status even from stale tabs.
Deleted=false is part of every mutable-record predicate. Concurrent delete/edit operations must
never restore a record; a post-deletion edit fails as unavailable.

## Ordinal Allocation and Atomicity

User confirmed the lifetime sequence: calculate max across all retained records, including
completed and deleted. Allocate 0 for an empty database, otherwise max+1. Delete never frees
an ordinal; deleting every visible record does not reset the sequence. No client-managed order.

Read maximum and insert within one short repository transaction, protected by unique ordinal.
Bounded whole-transaction retries handle confirmed rollback/conflict outcomes. Validate actual
SQLite adapter error codes with contention tests. Exhaustion is a retryable 503; integer overflow
is a domain 409. No counter table, renumbering job or process-local allocation cache is needed.
