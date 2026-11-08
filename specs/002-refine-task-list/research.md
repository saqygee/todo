# Research: Native Calendar, Future Times and Incremental Design

Date: 2026-11-08. Existing code and lockfile inspected; research performed read-only.

## Native Calendar and Disabled Time Choices

**Decision**: Use native input type=date with local-today min, and native Hour/Minute selects
with disabled options computed from eligible local minutes. No calendar library.
**Rationale**: A native time input's range validity does not guarantee author-controlled individual
unavailable choices. Native selects provide explicit disabled options without building a custom
calendar grid or adding a dependency. A date min constrains supported calendar pickers; typed
values still need validation. Verify the actual target-browser calendar and keyboard interaction.
**Alternatives considered**: Keeping datetime-local provides insufficient control over picker
choices. Native time with min alone does not guarantee unavailable-option behaviour. A custom
calendar/library adds maintenance or approval work that this scope does not require. A single
1,440-option time menu is less manageable than 24 hours and 60 minutes.
Sources: [HTML date state](https://html.spec.whatwg.org/multipage/input.html#date-state-(type=date)),
[HTML time state](https://html.spec.whatwg.org/multipage/input.html#time-state-(type=time)),
[HTML option element](https://html.spec.whatwg.org/multipage/form-elements.html#the-option-element).

## Local Times and Historical Values

**Decision**: Construct calendar components in the browser timezone, round-trip to reject DST
gaps, use the existing earlier-overlap policy, and send UTC. Keep an existing instant as retained
state separate from newly restricted choices; preserve it exactly unless replaced or cleared.
**Rationale**: Native local fields carry no timezone. Reducing a stored instant to minute text
can lose precision and mistakenly classify an unchanged historical value as a new past value.
**Alternatives considered**: UTC date substrings can choose the wrong local day. Adding expired
options to the picker conflicts with the new selection restriction. Rejecting all old dues would
block unrelated edits. New duration or timezone preference fields are outside scope.
Source: [HTML local datetime state](https://html.spec.whatwg.org/multipage/input.html#local-date-and-time-state-(type=datetime-local)).

## Authoritative Write Validation

**Decision**: Keep shape/response schemas separate from time-dependent write policy. The service
supplies the rule and clock; repository transactions invoke it against current stored data just
before writes and again on retries. Reuse existing safe 400/404/503 formats.
**Rationale**: Client-only min/disabled rules can be bypassed or become stale. A pre-transaction
current-due read could incorrectly exempt a stale past replacement after a concurrent edit.
**Alternatives considered**: A global future-only instant schema would break overdue list reads.
A version token, distributed clock service or general transaction framework is unnecessary.
Evidence: existing service/repository code supports a small typed callback extension; SQLite
transaction/retry infrastructure already exists. No new external service or ORM API is required.

## Display Order and Button State

**Decision**: Sort by ordinal desc at the repository; place action DOM before the panel and use
flex wrapping/right alignment. Active styling includes colour, a non-colour indicator and the
existing accessible pressed state. Retain all current filter semantics.
**Rationale**: One server ordering serves both filters, and DOM order matches visual navigation.
**Alternatives considered**: Sorting by updatedAt moves old tasks after editing; frontend-only
reversal disagrees with direct list results; colour alone does not meet accessibility requirements.

## Completion

No unresolved product decisions, dependency requests or database migrations. Research findings
are design choices, not claims of implementation or new accessibility acceptance. The follow-up
validation must reuse the existing Chrome/Orca evidence process on the changed controls.
