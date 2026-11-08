# Feature Specification: Refine Task List and Due-Date Selection

**Feature Branch**: `main` (existing branch; no branch hook configured)

**Created**: 2026-11-08

**Status**: Draft

**Input**: Display recent tasks first in descending order. Replace the Due Date field with a
calendar and time selection that permits today and future dates while preventing elapsed times.
Move "create new task" and "Display completed" above the list at its top right. Give the active
completed-items button a different colour.

This feature builds on [001-todo-crud](../001-todo-crud/spec.md). It supersedes that feature's
ascending display order, actions positioned beside the list and acceptance of newly selected
past due times. Its other requirements remain in force, including optional dueAt, a single list,
soft deletion, stable lifetime ordinals, local presentation, UTC timestamps and no authentication.

## Clarifications

### Session 2026-11-08

- Q: Should the calendar retain time selection or select only a date? → A: Calendar plus time; past times disabled.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See New Tasks First (Priority: P1)

As the user, I see my most recently created tasks at the top so I can find new work immediately.

**Why this priority**: Ordering affects every visit and every task creation.

**Independent Test**: Seed tasks with distinct ordinals, including completed and deleted records,
and verify visible items are ordered from highest to lowest ordinal in each visibility mode.

**Acceptance Scenarios**:

1. **Given** incomplete tasks at ordinals 0, 2 and 5, **When** the list opens, **Then** they appear
   in the order 5, 2, 0.
2. **Given** an existing list, **When** creation succeeds, **Then** the new task appears first.
3. **Given** tasks of both completion states, **When** "Display completed" is active, **Then**
   all non-deleted tasks appear together in descending ordinal order.
4. **Given** a content edit, completion change or deletion, **When** the visible list updates,
   **Then** surviving items retain descending ordinal order and their original ordinals.

---

### User Story 2 - Select a Future Due Date and Time (Priority: P1)

As the user, I choose an optional due date from a calendar and a time that has not passed,
so I can schedule work without accidentally selecting an elapsed period.

**Why this priority**: This changes date entry and validation for both creation and editing.

**Independent Test**: With the current time controlled, try yesterday, earlier today, later today,
a future day and an absent due date, then advance time before submission.

**Acceptance Scenarios**:

1. **Given** the create or edit form, **When** the due-date control is opened, **Then** a calendar
   permits today and future days and prevents selecting earlier days.
2. **Given** today is selected, **When** time choices are inspected, **Then** elapsed times are
   disabled or otherwise unavailable, and future times are selectable.
3. **Given** a future day, **When** a valid time on that day is selected, **Then** the selection
   is accepted and displayed in the user's local timezone.
4. **Given** no due date is provided, **When** an otherwise valid task is saved, **Then** it
   succeeds without requiring a date or time. Clearing an existing due value remains supported.
5. **Given** a selected due instant has passed while the form was open, **When** the user saves,
   **Then** the task is not saved with that new past selection; an actionable error appears
   below the date/time control and entered values remain available for correction.
6. **Given** an existing task is overdue, **When** its title or description is edited without
   changing the due value, **Then** saving preserves that existing due instant. Choosing a
   replacement due value must satisfy the new future-only rule.
7. **Given** a past value is typed, pasted or submitted without using the picker, **When** it is
   validated, **Then** it is rejected by the same rule as an invalid picker selection.
8. **Given** a complete unsaved due selection, **When** the browser timezone changes and the form
   regains focus, **Then** the same instant is displayed in the new local timezone and remains
   subject to future-only validation. A partial selection retains its entered components with
   review guidance and remains incomplete until the user finishes it.

---

### User Story 3 - Use Top-Right List Actions and Recognise the Active Filter (Priority: P2)

As the user, I find both list actions above the list and can immediately recognise whether
completed tasks are included.

**Why this priority**: Consistent placement and a clear active state make list controls easier to use.

**Independent Test**: Inspect empty and populated lists on desktop and narrow viewports, then
activate and deactivate completed-item visibility using pointer and keyboard.

**Acceptance Scenarios**:

1. **Given** the list view, **When** it renders, **Then** "create new task" and "Display completed"
   sit above the list, aligned to its top-right edge, with create first in visual and keyboard order.
2. **Given** completed items are hidden, **When** "Display completed" is activated, **Then** its
   colour visibly changes and its accessible pressed state becomes active while the list includes
   completed and incomplete tasks together.
3. **Given** the filter is active, **When** it is deactivated, **Then** its inactive colour returns,
   its pressed state becomes inactive, and only incomplete tasks remain visible.
4. **Given** an empty list or failed load, **When** the list view is shown, **Then** both actions
   remain available above it. Opening creation still replaces the list with the form.
5. **Given** a narrow viewport or increased zoom, **When** controls wrap, **Then** both remain above
   the list in the same order, without horizontal scrolling or clipped focus indicators.

### Edge Cases

- Ordinal gaps and deleted records must not affect descending display or lifetime allocation.
- Editing an older task must not move it above newly created tasks; recency means creation order.
- If the local date rolls over while a calendar is open, expired dates/times become unavailable
  on the next interaction and are rechecked on submission.
- A date without a time, or time without a date, is incomplete and must show an inline error;
  leaving both absent is valid.
- Local midnight, timezone changes and daylight-saving gaps/overlaps must preserve the intended
  instant. Nonexistent local times are unavailable; ambiguous times follow the existing policy.
- Selecting a new time and then waiting until it passes must not bypass the save-time check.
- Existing overdue tasks remain readable and retain their due values; they are not automatically
  rescheduled or removed. Clearing a due value is permitted.
- The active filter must remain distinguishable without relying solely on colour, including in
  forced-colour/high-contrast modes, and during loading or refresh.
- Calendar/time selection, navigation, dismissal and correction must work using only a keyboard.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every task-list visibility mode MUST order non-deleted records by descending ordinal,
  with the highest ordinal first. Editing and completion changes MUST NOT redefine task recency.
- **FR-002**: Newly created tasks MUST appear at the top of the visible list after successful
  creation. Allocation MUST retain the existing immutable lifetime ordinal sequence and gaps.
- **FR-003**: Create and edit forms MUST offer an optional calendar-based date selector and time
  selection. A provided due value MUST contain both a valid local date and a valid local time.
- **FR-004**: The calendar MUST prevent selecting dates before the user's current local day.
  Today and future dates MUST be available, subject to valid future time selection.
- **FR-005**: On today, times at or before the current instant MUST be unavailable for new
  selection. On future days, valid times MUST be available. The same restrictions MUST apply
  to pointer, keyboard and manually entered values.
- **FR-006**: Every new or changed nonempty due value MUST be later than the current instant when
  saved. The system MUST revalidate at submission rather than relying only on picker state.
  Rejection MUST preserve form values and show a useful error below the associated control.
- **FR-007**: An unchanged existing due value MUST remain valid for an unrelated content edit,
  including when already overdue. An omitted due value on creation or a cleared due value on
  editing MUST remain valid. Existing tasks MUST NOT be silently rescheduled.
- **FR-008**: Provided due instants MUST retain the established UTC storage/exchange and browser-
  local presentation rules, including timezone-qualified input and daylight-saving validity.
  If the browser timezone changes while a complete selection is unsaved, its underlying instant
  MUST remain unchanged and its displayed components MUST reflect the new timezone. Partial
  selections MUST retain entered components with guidance to review them, without inventing
  a due instant or silently filling missing values.
- **FR-009**: The list view MUST position "create new task" and "Display completed" above the
  list, aligned to its right edge, with create preceding display in visual and keyboard order.
  Both MUST remain available for empty or failed list states and wrap without horizontal overflow.
- **FR-010**: "Display completed" MUST use visibly different active and inactive colours while
  preserving its label. Active includes both completion states; inactive includes incomplete
  only. Reload MUST default to inactive, with existing form-return filter preservation intact.
- **FR-011**: Filter state MUST also be conveyed through an accessible pressed state and a visible
  non-colour cue, such as border or indicator treatment. Text and control contrast MUST meet
  applicable WCAG 2.2 AA thresholds in both states.
- **FR-012**: Calendar/time controls and list actions MUST support semantic labels, keyboard
  operation, visible unobscured focus, accessible unavailable states and associated inline
  validation messages, consistent with WCAG 2.2 AA.

### Key Entities *(include if feature involves data)*

- **Task**: Existing ToDo with stable identity, immutable ordinal, content, completion/deletion
  state and optional due instant. No additional duration field is introduced.
- **Due selection**: Optional local calendar date and time representing one future instant when
  newly assigned. Existing unchanged due instants remain retained even after they pass.
- **Completion visibility**: Existing inactive/active filter state, represented through colour,
  a non-colour visual cue and an accessible pressed state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a 100-task mixed dataset, 100% of visible adjacent task pairs have descending
  ordinals in both visibility modes, and a new task appears first after successful creation.
- **SC-002**: All past-date, earlier-today, elapsed-before-save, invalid-local-time and manual-
  entry bypass cases are rejected, while valid future selections and absent optional values pass.
- **SC-003**: All unchanged-overdue edit and clear-due-value scenarios preserve the user's intent
  without rescheduling, losing content or blocking unrelated edits.
- **SC-004**: At desktop width and 320 CSS pixels, and at 200% zoom, both actions remain above
  the list without horizontal overflow; their order is consistent in visual and keyboard traversal.
- **SC-005**: A reviewer can identify both active and inactive filter states with colour unavailable,
  complete calendar/time selection and all list-action flows using only the keyboard, and read
  state/validation feedback using a screen reader, with no identified AA violations in those flows.

## Assumptions

- "Recent" means most recently created, determined by ordinal, rather than last edited or due date.
- The user confirmed a calendar with time selection, rather than a date-only value. Mention of
  elapsed "duration" refers to past periods; task durations and time tracking are outside scope.
- The browser timezone defines local today and local time. The system's current instant is
  authoritative for save-time validation. A newly selected due instant must be strictly future.
- Existing minute-level input precision remains acceptable; the current partially elapsed minute
  cannot be newly selected. The next future minute is the earliest selectable minute today.
- An unchanged overdue value is identified by its underlying instant, not its displayed text.
  Changing a due value requires future validation; clearing it remains allowed.
- Original CRUD behaviour, dependency approval rules, constitution and project structure apply.
  Planning must explicitly update the earlier ascending-order and side-action design/tests.
  This command specifies the follow-up feature; it does not change the running application.
