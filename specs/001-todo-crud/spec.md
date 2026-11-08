# Feature Specification: Single-User ToDo CRUD

**Feature Branch**: `main` (existing branch; no branch hook configured)

**Created**: 2026-11-08

**Status**: Draft

**Input**: Single-user ToDo application with create, read, update, soft-delete, completion
and reopening; separate Incomplete and Completed tabs; automatic ordinal ordering starting at
0 without renumbering; UTC timestamps displayed in the user's local timezone. Authentication,
multiple users and reordering are out of scope. The supplied directory layout is preserved in
[planning-constraints.md](planning-constraints.md).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Create ToDos (Priority: P1)

As the user, I can see unfinished work and add a ToDo so that I can track everyday tasks.

**Why this priority**: Viewing and capturing work provides the application's core value.

**Independent Test**: Start with an empty list, create two ToDos, reload, and verify both remain
visible in their original order. A seeded list can independently verify list filtering.

**Acceptance Scenarios**:

1. **Given** a list containing incomplete, completed and deleted items, **When** the application
   opens, **Then** the Incomplete tab is selected and shows only non-deleted incomplete items,
   ordered by ascending ordinal.
2. **Given** no items in the selected tab, **When** it loads, **Then** an explicit empty state
   appears and the create action remains available.
3. **Given** no records have ever existed, **When** a valid ToDo is created, **Then** it is
   incomplete, receives ordinal 0, and appears in the Incomplete tab.
4. **Given** existing records, **When** a ToDo is created, **Then** it receives the highest
   previously assigned ordinal plus one, including ordinals belonging to deleted records.
5. **Given** a blank, whitespace-only or over-limit title, **When** the user submits it,
   **Then** a clear validation message appears and no record is created.
6. **Given** saved ToDos, **When** the user reloads or the application restarts, **Then** their
   content, status and ordering are preserved.

---

### User Story 2 - Complete and Reopen ToDos (Priority: P1)

As the user, I can move tasks between unfinished and completed work without losing their order.

**Why this priority**: Completion and separation of finished work are central target behaviours.

**Independent Test**: Seed incomplete and completed items, toggle their statuses and switch tabs.

**Acceptance Scenarios**:

1. **Given** an incomplete ToDo, **When** it is marked completed successfully, **Then** it leaves
   the Incomplete tab and appears in the Completed tab with its original ordinal.
2. **Given** completed ToDos, **When** the user selects the Completed tab, **Then** only
   non-deleted completed items appear in ascending ordinal order.
3. **Given** a completed ToDo, **When** it is marked incomplete successfully, **Then** it leaves
   the Completed tab and appears in the Incomplete tab at its original ordinal position.
4. **Given** either tab is selected, **When** the user reloads the application, **Then** the
   Incomplete tab is selected by default.

---

### User Story 3 - Edit ToDo Content (Priority: P2)

As the user, I can correct or update the content of an incomplete or completed ToDo.

**Why this priority**: Editing keeps captured tasks useful as their details change.

**Independent Test**: Seed one item per tab, edit each, and verify saved content after reload.

**Acceptance Scenarios**:

1. **Given** a non-deleted ToDo in either tab, **When** valid title or description changes are
   saved, **Then** the saved content appears and the ordinal and completion status are unchanged.
2. **Given** an edit in progress, **When** the user cancels, **Then** saved content is unchanged.
3. **Given** invalid content, **When** the user saves, **Then** validation feedback appears,
   entered content remains available for correction, and saved data is unchanged.

---

### User Story 4 - Remove ToDos (Priority: P2)

As the user, I can remove unwanted tasks from either tab without changing other tasks' order.

**Why this priority**: Deletion completes CRUD and keeps lists relevant.

**Independent Test**: Seed ordinals 0, 1 and 2, delete 1, and verify 0 and 2 remain; create a new
item and verify its ordinal is 3. Repeat after deleting the highest ordinal and all visible items.

**Acceptance Scenarios**:

1. **Given** a non-deleted ToDo in either tab, **When** deletion succeeds, **Then** it disappears
   from both tabs and remains retained as a soft-deleted record with a deletion timestamp.
2. **Given** a deleted item, **When** the list reloads or an attempt is made to retrieve, edit or
   change its completion status, **Then** it remains unavailable and unchanged.
3. **Given** any deletion, **When** remaining items are listed, **Then** their ordinals are
   unchanged and gaps remain; later creation does not reuse deleted ordinals.

---

### Edge Cases

- Deleting the highest ordinal or every visible item MUST NOT reset ordinal assignment.
- Overlapping creation requests MUST receive distinct ordinals without losing either item.
- Invalid or nonexistent identifiers and already-deleted items MUST produce a clear unavailable
  result without creating, restoring or changing records. Repeated deletion leaves the record deleted.
- Failed reads MUST show an error distinct from an empty list, with a retry action.
- Failed writes MUST preserve saved data, report failure without false success, and allow retry;
  failed create/edit actions MUST preserve entered content.
- Long titles/descriptions and whitespace-only titles MUST follow the declared validation limits.
- Switching status MUST preserve list order even when neighbouring items belong to the other tab.
- Local dates that differ from the UTC date and daylight-saving transitions MUST represent the
  same stored instant correctly in the user's timezone.
- Keyboard and screen-reader users MUST be able to switch tabs, operate forms and completion
  controls, delete items, and understand validation and operation results.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide one persistent ToDo list for a single user without login,
  registration, accounts, ownership assignment or multiple-user functionality.
- **FR-002**: The user MUST be able to create a ToDo with a required title and optional description.
  Newly created items MUST be incomplete.
- **FR-003**: Titles MUST be trimmed, contain 1–200 characters after trimming, and descriptions
  MUST contain at most 2,000 characters. Invalid input MUST be rejected with field-level feedback.
- **FR-004**: The user MUST be able to view non-deleted items in two tabs: Incomplete first and
  Completed second. The initial/default list MUST contain only incomplete items; completed items
  MUST be shown only when the user chooses the Completed tab.
- **FR-005**: Each tab MUST display its items in ascending ordinal order.
- **FR-006**: The system MUST assign ordinals automatically, starting at 0 and using the maximum
  assigned ordinal across all retained records plus one. Deleted records MUST participate in
  this calculation; clients MUST NOT assign or change ordinals. Overlapping creates MUST not
  produce duplicate ordinals.
- **FR-007**: The user MUST be able to edit a non-deleted item's title and description in either
  tab without changing its ordinal, identity, creation timestamp or completion status.
- **FR-008**: The user MUST be able to mark incomplete items completed and completed items
  incomplete. Each successful change MUST move the item to the appropriate tab while preserving
  its ordinal and content.
- **FR-009**: Every deletion MUST be a soft deletion that records the deletion time, retains the
  record, excludes it from both tabs and normal retrieval, and prevents subsequent editing or
  completion changes. Other ordinals MUST remain unchanged. Restoration is out of scope.
- **FR-010**: Creation, edits, completion changes and deletion MUST persist across reloads and
  application restarts. Invalid or failed operations MUST NOT partially change saved records.
- **FR-011**: Creation, last-update and deletion timestamps MUST be stored in UTC using ISO 8601
  representation. New items MUST initialise creation and last-update times; successful content,
  status and deletion changes MUST update the last-update time while preserving creation time.
- **FR-012**: Each visible ToDo MUST display its creation and last-update date/time in the user's
  current browser timezone, correctly handling date boundaries and daylight-saving rules.
- **FR-013**: The interface MUST explicitly communicate loading, empty, success and error states,
  retain unsaved form input after validation/write failures, and provide retries for failed reads.
  Errors MUST NOT disclose sensitive information or internal implementation details.
- **FR-014**: User flows MUST target WCAG 2.2 Level AA, including semantic controls, complete
  keyboard operation, visible and predictable focus, accessible tabs, form labels, error feedback,
  screen-reader status announcements and sufficient contrast.
- **FR-015**: Missing, invalid or deleted item references MUST return a clear unavailable or
  invalid-input outcome without modifying data or exposing retained deleted content.
- **FR-016**: Reordering controls and reordering operations MUST remain outside this feature.

### Key Entities *(include if feature involves data)*

- **ToDo**: An everyday task with a stable unique identifier, title, optional description,
  completion status, automatically assigned non-negative integer ordinal, creation time,
  last-update time and optional deletion time. An absent deletion time denotes a non-deleted
  item. There is no user/owner entity or task-to-user relationship.
- **List view**: The currently selected completion category. Both categories share the same
  underlying ordinal sequence; category changes do not create a new ordering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All acceptance scenarios for creation, viewing, editing, deletion, completion and
  reopening pass, including persistence after reload and restart.
- **SC-002**: With a mixed set of 100 tasks, each tab shows 100% of its matching non-deleted tasks,
  zero nonmatching or deleted tasks, and every adjacent pair is in ascending ordinal order.
- **SC-003**: Across sequences that delete middle, highest and all visible items, 100% of surviving
  ordinals remain unchanged and every later creation receives a distinct greater ordinal.
- **SC-004**: Displayed timestamps match the same underlying instant in UTC, a timezone ahead of
  UTC and a timezone behind UTC, including a date boundary and daylight-saving transition.
- **SC-005**: A reviewer can complete every primary flow using only the keyboard, with visible
  focus and understandable screen-reader labels and feedback; affected flows have no identified
  WCAG 2.2 Level AA violations at acceptance review.
- **SC-006**: In an acceptance session using the agreed assessment environment and 100 tasks,
  list loading, tab switching and successful changes become visible within 2 seconds in at least
  95% of 20 repetitions per action.

## Assumptions

- A required title and optional description are sufficient task content. Title and description
  limits are defaults of 200 and 2,000 characters; due dates, priorities, tags, search, pagination,
  bulk actions, restoration and offline operation are outside this feature.
- Ordinals are a single lifetime sequence across both completion categories and soft-deleted
  records; they are ordering data rather than editable user content.
- The browser timezone defines the user's local timezone; a timezone preference control is not
  required. Creation and last-update times are the user-visible timestamps.
- Deletion takes effect when selected and successfully saved; a confirmation dialog is not
  required. There is no permanent deletion or deleted-items view in this feature.
- The agreed assessment environment is a current desktop browser and a locally running
  application with persistent storage; performance measurements exclude deliberate fault tests.
- The project constitution supplies architecture, technology, security and testing constraints.
  The user's exact directory layout is retained in planning-constraints.md for the next phase.
  This specification does not authorise dependency installation or application implementation.
