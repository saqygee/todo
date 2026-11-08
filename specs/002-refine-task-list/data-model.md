# Data Model: Task Ordering and Due-Date Changes

## Persistence

The existing Todo model is unchanged: UUID id, title, nullable description, nullable dueAt,
unique ordinal, completed/deleted flags and createdAt/updatedAt. No schema migration, duration
field, timezone column or ordinal renumbering is required. Existing indexes remain applicable.
List results traverse ordinal descending for both visibility modes; allocation still uses the
lifetime maximum including deleted records. Edit/completion times do not define recency.

## Due-Value Write Rules

| Operation / requested value | Result |
|---|---|
| Create omitted/null dueAt | Store null |
| Create instant strictly after write-time now | Store normalised UTC instant |
| Create instant at/before now | Field validation error; no write |
| Update omitted dueAt | Preserve current value |
| Update null dueAt | Clear current value |
| Update exact current due instant | Preserve it, including when overdue |
| Update different instant strictly after now | Replace current value |
| Update different instant at/before now | Field validation error; no write |
| Completion or deletion of overdue task | Existing rules; no due reassignment or future check |

Compare normalised instants with millisecond precision, not display strings. Repository reads
current non-deleted data and invokes the service's policy inside the write transaction. Every
retry re-reads current context and evaluates the clock again. Missing/deleted rows remain 404.
Legacy overdue records remain valid in read/response schemas.

## Transient Form State

- Unset: no due value; all selectors absent; submission maps to null.
- Retained: edit form displays the original instant separately, preserving full precision.
- Selecting replacement: date string YYYY-MM-DD, hour 00–23 and minute 00–59; all three required
  once any is chosen. Calendar min is local today. New choices map to one UTC instant.
- Cleared: user explicitly removes a due value; submission maps to null.

Retained → Change opens replacement selection; retained/replacement → Clear removes the whole
group. Keep existing can discard a replacement draft. None of these modes is stored as a new
entity. A complete valid replacement also carries a canonical UTC candidate in transient state.
On browser timezone change, derive its new display components from that candidate without
changing the instant or losing precision. Only a user field edit invalidates/recomputes the
candidate. Clock refresh still revalidates future eligibility.

Partial drafts carry no UTC candidate: retain entered components, refresh local availability and
ask the user to review/complete them. Do not autofill or fabricate an instant. Form Save/Cancel
and pending behaviour stay as defined in the original feature.

## Eligibility

Eligible minute = valid local component round-trip AND resolved instant > current clock.
An hour is available if any of its minutes is eligible. Today has only future choices; future
calendar dates have every valid minute, except DST gaps. Repeated hours use the existing earlier
occurrence policy. No eligible minute today requires a future date; it does not auto-reschedule.
Refresh eligibility at minute boundaries, focus/interaction and save. Partial selections and
expired selections remain visible with errors rather than silently advancing.
