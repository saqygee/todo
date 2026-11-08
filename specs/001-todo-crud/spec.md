# Feature Specification: Single-User ToDo CRUD

**Feature Branch**: `main` (existing branch; no branch hook configured)

**Created**: 2026-11-08

**Status**: Draft

**Input**: Single-user ToDo application with create, read, update, soft-delete, completion
and reopening; one list with a completed-items visibility button; automatic ordinal ordering starting at
0 without renumbering; UTC timestamps displayed in the user's local timezone. Authentication,
multiple users and reordering are out of scope. The supplied directory layout is preserved in
[planning-constraints.md](planning-constraints.md).

## Clarifications

### Session 2026-11-08

- Q: If the same ToDo is edited in two browser tabs, how should conflicting saves be handled? → A: Last successful save wins; no conflict warning.

- Q: Does deletion change ordinal allocation? → A: Keep the lifetime sequence, including soft-deleted records when finding the maximum.

### Planning Requirements Update 2026-11-08

The latest plan revision replaces completion tabs with one list and two right-side buttons:
"create new task" followed by "Display completed". Creation hides the list until save succeeds
or the user cancels. Description and dueAt are optional; title is limited to 120 characters and
description to 500. Soft deletion remains Boolean; the lifetime ordinal sequence is unchanged.
Validation errors appear below their corresponding controls.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Create ToDos (Priority: P1)

As the user, I can see unfinished work and add a ToDo so that I can track everyday tasks.

**Why this priority**: Viewing and capturing work provides the application's core value.

**Independent Test**: Start with an empty list, create two ToDos, reload, and verify both remain
visible in their original order. A seeded list can independently verify list filtering.

**Acceptance Scenarios**:

1. **Given** a list containing incomplete, completed and deleted items, **When** the application
   opens, **Then** the single list shows only non-deleted incomplete items,
   ordered by ascending ordinal.
2. **Given** no items match the current completion filter, **When** it loads, **Then** an explicit empty state
   appears and the create action remains available.
3. **Given** no records have ever existed, **When** a valid ToDo is created, **Then** it is
   incomplete, receives ordinal 0, and appears in the list.
4. **Given** existing records, **When** a ToDo is created, **Then** it receives the highest
   previously assigned ordinal plus one, including ordinals belonging to deleted records.
5. **Given** a blank, whitespace-only or over-limit title, **When** the user submits it,
   **Then** a clear validation message appears and no record is created.
6. **Given** saved ToDos, **When** the user reloads or the application restarts, **Then** their
   content, status and ordering are preserved.
7. **Given** a valid title with no description or due date, **When** the user submits,
   **Then** creation succeeds with those optional fields absent.
8. **Given** an over-limit description or an invalid nonblank due date, **When** the user submits,
   **Then** an error appears below each invalid control and the form remains visible.
9. **Given** the list, **When** "create new task" is clicked, **Then** the list is hidden and the
   creation form appears; successful creation or Cancel returns to the list. Cancel saves nothing.
10. **Given** a create or edit request is pending, **When** the form is inspected, **Then** Save
    and Cancel are disabled. Failure retains input and re-enables both; success returns to the list.

---

### User Story 2 - Complete and Reopen ToDos (Priority: P1)

As the user, I can move tasks between unfinished and completed work without losing their order.

**Why this priority**: Completion and separation of finished work are central target behaviours.

**Independent Test**: Seed both statuses, use "Display completed", and set completion explicitly.

**Acceptance Scenarios**:

1. **Given** incomplete-only visibility, **When** an item is marked completed successfully,
   **Then** it disappears without changing its ordinal.
2. **Given** completed items are hidden, **When** "Display completed" is clicked, **Then** both
   completed and incomplete non-deleted items appear together in ascending ordinal order.
3. **Given** inclusive visibility, **When** a completed item is marked incomplete, **Then** it
   remains in the same list at its original ordinal position.
4. **Given** inclusive visibility, **When** "Display completed" is clicked again, **Then** only
   incomplete items remain. Reload also defaults to incomplete-only.

---

### User Story 3 - Edit ToDo Content (Priority: P2)

As the user, I can correct or update the content of an incomplete or completed ToDo.

**Why this priority**: Editing keeps captured tasks useful as their details change.

**Independent Test**: Seed one item of each completion status, edit each, and verify saved content after reload.

**Acceptance Scenarios**:

1. **Given** a non-deleted ToDo in the list, **When** valid title, description or due date/time changes are
   saved, **Then** the saved content appears and the ordinal and completion status are unchanged.
2. **Given** an edit in progress, **When** the user cancels, **Then** saved content is unchanged.
3. **Given** invalid content, **When** the user saves, **Then** validation feedback appears,
   entered content remains available for correction, and saved data is unchanged.
4. **Given** the same non-deleted ToDo is open for editing in two browser tabs, **When** both
   submit valid content edits successfully, **Then** the last successful save determines the
   saved title, description and due date/time, without an outdated-edit rejection or conflict warning.

---

### User Story 4 - Remove ToDos (Priority: P2)

As the user, I can remove unwanted tasks from the list without changing other tasks' order.

**Why this priority**: Deletion completes CRUD and keeps lists relevant.

**Independent Test**: Seed ordinals 0, 1 and 2, delete 1, and verify 0 and 2 remain; create a new
item and verify its ordinal is 3. Repeat after deleting the highest ordinal and all visible items.

**Acceptance Scenarios**:

1. **Given** a non-deleted ToDo in the list, **When** deletion succeeds, **Then** it disappears
   from the list and remains retained as a soft-deleted record with its deleted flag set to true.
2. **Given** a deleted item, **When** the list reloads or an attempt is made to retrieve, edit or
   change its completion status, **Then** it remains unavailable and unchanged.
3. **Given** any deletion, **When** remaining items are listed, **Then** their ordinals are
   unchanged and gaps remain; later creation does not reuse deleted ordinals.

---

### Edge Cases

- Deleting the highest ordinal or every visible item MUST NOT reset ordinal assignment.
- Overlapping creation requests MUST receive distinct ordinals without losing either item.
- Conflicting content edits to a non-deleted ToDo MUST use the last successful save without a
  conflict warning. A stale edit MUST NOT restore a deleted item or overwrite completion status.
- Invalid or nonexistent identifiers and already-deleted items MUST produce a clear unavailable
  result without creating, restoring or changing records. Repeated deletion leaves the record deleted.
- Cancelling a pending HTTP request MUST NOT be interpreted as undoing a committed write.
- Failed reads MUST show an error distinct from an empty list, with a retry action.
- Failed writes MUST preserve saved data, report failure without false success, and allow retry;
  failed create/edit actions MUST preserve entered content.
- Long titles/descriptions and whitespace-only titles MUST follow the declared validation limits.
- Switching status MUST preserve list order even when neighbouring items have a different completion status.
- Local dates that differ from the UTC date and daylight-saving transitions MUST represent the
  same stored instant correctly in the user's timezone.
- Keyboard and screen-reader users MUST be able to change completion visibility, operate forms and completion
  controls, delete items, and understand validation and operation results.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide one persistent ToDo list for a single user without login,
  registration, accounts, ownership assignment or multiple-user functionality.
- **FR-002**: The user MUST be able to create a ToDo with a required title and optional description
  and due date/time. New items MUST be incomplete. The "create new task" button MUST hide the
  list and display the form. Successful creation or Cancel MUST return to the list; failure MUST
  retain the form and entered values. Cancel before submission MUST NOT save a record. Save
  and Cancel MUST be disabled while creating or editing is pending; failure MUST re-enable both
  with input retained and success MUST restore the list.
- **FR-003**: Titles MUST be trimmed and contain 1–120 characters. Optional descriptions MUST be
  trimmed and contain at most 500 characters; blank descriptions normalise to absent. Provided
  due dates MUST be valid timezone-qualified ISO 8601 values normalised to UTC. Absent optional
  fields MUST NOT cause validation errors. Optional fields MUST be clearable during editing.
- **FR-004**: The interface MUST show a single list with two right-side buttons, in order:
  "create new task" and "Display completed". The second button MUST toggle completion visibility
  and expose its pressed state accessibly; FR-018 defines which items are visible.
- **FR-005**: The single list MUST display matching items in ascending ordinal order.
- **FR-006**: The system MUST assign ordinals automatically, starting at 0 and using the maximum
  assigned ordinal across all retained records plus one. Deleted records MUST participate in this
  calculation; clients MUST NOT assign or change ordinals. Overlapping creates MUST not produce
  duplicate ordinals.
- **FR-007**: The user MUST be able to edit a non-deleted item's title, description and due
  date/time in the list without changing its ordinal, identity, creation timestamp or completion
  status.
- **FR-008**: The user MUST be able to set an explicit completion state while preserving ordinal
  and content. Completed items MUST disappear only when incomplete-only visibility is active.
- **FR-009**: Every deletion MUST be a soft deletion that sets deleted to true, retains the
  record, excludes it from the list and normal retrieval, and prevents subsequent editing or
  completion changes. Other ordinals MUST remain unchanged. Restoration is out of scope.
- **FR-010**: Creation, edits, completion changes and deletion MUST persist across reloads and
  application restarts. Invalid or failed operations MUST NOT partially change saved records.
- **FR-011**: Creation, last-update and any provided due date/time MUST be stored in UTC and exchanged using
  consistent ISO 8601 UTC representation. New items MUST initialise creation and last-update
  times; successful content, status and deletion changes MUST update the last-update time while
  preserving creation time.
- **FR-012**: The UI MUST display creation and last-update times, and due date/time when present,
  in the browser timezone. Missing optional fields MUST display "No description" or "No due date"
  without inventing a timestamp.
- **FR-013**: The interface MUST explicitly communicate loading, empty, success and error states,
  retain unsaved form input after validation/write failures, and provide retries for failed reads.
  Errors MUST NOT disclose sensitive information or internal implementation details.
- **FR-014**: User flows MUST target WCAG 2.2 Level AA, including semantic controls, complete
  keyboard operation, visible and predictable focus, accessible list controls, form labels, error feedback,
  screen-reader status announcements and sufficient contrast.
- **FR-015**: Missing, invalid or deleted item references MUST return a clear unavailable or
  invalid-input outcome without modifying data or exposing retained deleted content.
- **FR-016**: Reordering controls and reordering operations MUST remain outside this feature.
- **FR-017**: When multiple browser tabs save conflicting content edits to a non-deleted ToDo, the
  last successful save MUST determine its title, description and due date/time. The system MUST
  NOT reject a content edit solely because it was based on older content or display a conflict
  warning. Content edits MUST preserve current completion status and MUST NOT restore deleted
  records.
- **FR-018**: The default list MUST exclude completed records. includeCompleted=true MUST return
  both statuses and the frontend MUST display both together. Toggling back MUST restore
  incomplete-only visibility. The selected visibility filter MUST
  survive create/edit save or cancel; a full reload MUST start incomplete-only.
- **FR-019**: Completion changes MUST accept an explicit Boolean state. Client requests MUST NOT
  set ID, ordinal, timestamps or deleted status. Each validation error MUST appear immediately
  below its corresponding input.

### Key Entities *(include if feature involves data)*

- **ToDo**: An everyday task with a stable unique identifier, title, optional description,
  optional due date/time, completion status, automatically assigned non-negative integer ordinal,
  creation time, last-update time and deleted flag. A false deleted flag denotes a non-deleted
  item. There is no user/owner entity or task-to-user relationship.
- **List view**: The single list visibility filter: incomplete-only or including completed. Both
  modes use the same ordinal sequence. The creation form temporarily replaces the list.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All acceptance scenarios for creation, viewing, editing, deletion, completion and
  reopening pass, including persistence after reload and restart.
- **SC-002**: With a mixed set of 100 tasks, each visibility mode shows 100% of its matching non-deleted tasks,
  zero nonmatching or deleted tasks, and every adjacent pair is in ascending ordinal order.
- **SC-003**: Across sequences that delete middle, highest and all visible items, 100% of surviving
  ordinals remain unchanged and every later creation receives a distinct greater ordinal.
- **SC-004**: Displayed timestamps match the same underlying instant in UTC, a timezone ahead of
  UTC and a timezone behind UTC, including a date boundary and daylight-saving transition.
- **SC-005**: A reviewer can complete every primary flow using only the keyboard, with visible
  focus and understandable screen-reader labels and feedback; affected flows have no identified
  WCAG 2.2 Level AA violations at acceptance review.
- **SC-006**: In an acceptance session using the agreed assessment environment and 100 tasks,
  list loading, completion visibility changes and successful changes become visible within 2 seconds in at least
  95% of 20 repetitions per action.

## Assumptions

- Task content consists of a required title, optional description and optional due date/time.
  Title and description limits are 120 and 500 characters. Priorities, tags, search, pagination,
  bulk actions, restoration and offline operation are outside this feature.
- Ordinals are a single lifetime sequence across both completion categories and soft-deleted
  records; they are ordering data rather than editable user content.
- The browser timezone defines the user's local timezone; a timezone preference control is not
  required. Due, creation and last-update times are user-visible.
- Deletion takes effect when selected and successfully saved; a confirmation dialog is not
  required. There is no permanent deletion or deleted-items view in this feature.
- The agreed assessment environment is a current desktop browser and a locally running
  application with persistent storage; performance measurements exclude deliberate fault tests.
- The project constitution supplies architecture, technology, security and testing constraints.
  The user's exact directory layout is retained in planning-constraints.md for the next phase.
  This specification does not authorise dependency installation or application implementation.

The visibility button is treated as a toggle with a stable label; its pressed state communicates
whether completed items are included. Description and dueAt use null for absence in stored and
returned records. POST omission defaults to null; PATCH omission preserves existing values and
explicit null clears them.
