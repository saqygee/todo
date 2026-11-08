# Accessibility Acceptance Evidence — T051 Complete

Date: 2026-11-08. Reviewed built UI, keyboard-only interaction results, Chrome accessibility
output and the generated speech transcript from the installed Orca screen reader.
The Orca/Chrome session used isolated D-Bus and temporary profiles/database, excluding other apps.

## Checks and Results

| Area | Evidence | Result |
|---|---|---|
| Keyboard-only primary flows | Enter, Space, Tab and Shift+Tab for create, cancel, completion, inclusive display, reopening, edit and delete | Pass |
| Form entry and return | Title receives focus; Cancel/save restores create-button focus | Pass |
| Item disappearance | Completion/deletion focuses the list heading; navigation continues predictably | Pass |
| Validation | Title invalid state and error relation exposed; Orca generates “invalid entry: Enter a title.” | Pass |
| Form labels | Orca reads title, optional description and native segmented due-date controls | Pass |
| Status announcements | Orca generates “Task created.”, “Task completed.”, “Task reopened.”, “Task updated.” and “Task deleted.” | Pass |
| Completion control | Orca exposes checkbox labels and ticked/not-ticked state | Pass |
| Visibility control | Named toggle button with pressed state | Pass |
| Text contrast | Computed contrast reviewed in error/form and populated-list states; zero remaining findings | Pass |
| Zoom and reflow | No horizontal overflow at 200% zoom or 320 CSS pixel viewport | Pass |
| Responsive layout | Prior 390 × 844 browser check and inspected desktop screenshots | Pass |
| Error recovery | Component tests preserve values and re-enable Save/Cancel after failed submission | Pass |

## Findings Corrected

- Section marker and footer small text measured 4.33–4.37:1; side note measured 4.44:1.
  Darkened these text colours to satisfy the 4.5:1 normal-text threshold. Rerun found zero
  failing text nodes in the reviewed form/error and populated-list states.
- Added aria-errormessage associations for all field errors alongside aria-describedby and
  aria-invalid. Orca's transcript confirms the specific title error is announced.
- Replaced generic completion/deletion feedback with specific completed/reopened/deleted
  messages. The screen-reader transcript confirms the resulting live announcements.
- Regression assertions for error-message association and deletion feedback failed before the
  fixes and passed afterward.

## Reproducible Evidence

Run after npm run build, with installed Chrome, Orca, AT-SPI, a graphical DISPLAY and D-Bus:

```bash
dbus-run-session -- node tests/e2e/accessibility-check.mjs
```

The script fails on keyboard-flow errors, contrast findings, missing validation utterance or
missing deletion utterance. It writes tests/e2e/accessibility-results.json and a temporary
speech-only log at /tmp/todo-orca-speech.txt. The latest run produced 75 Orca utterances.

The reviewer inspected generated Orca utterances; this report does not claim to have listened
to audio or tested NVDA/VoiceOver. This is scoped acceptance evidence for the implemented
assessment flows, not an independent certification of every browser/assistive-technology pair.
No outstanding accessibility defects were identified in the reviewed scope.

## Feature 002 — Refined List and Native Due-Date Selection

Latest review: 2026-11-08. This section supersedes the original segmented datetime-local control
and sidebar traversal observations above. Final graphical Chrome/Orca run passed **13 steps**,
produced **108 utterances**, and found **zero text contrast issues**. The transcript was inspected;
this is generated-speech review, not an assertion of listening to audio.

- Actions precede the list, create before Display completed. Keyboard CRUD, form return and
  heading focus after completion/deletion pass with the new DOM order.
- Space opens Chrome's native calendar. Its grid and previous/next month controls are exposed.
  ArrowDown/Enter select a future date; Escape dismisses; Tab and arrows select hour/minute;
  keyboard save returns to the list. No third-party calendar is used.
- Orca announces native day/month/year segments, calendar date, Hour (24-hour), Minute,
  “Choose an hour.”, “Choose a minute.” and “Choose a future due date and time.”
- Current-minute options are disabled; partial and expired values retain accessible errors.
  Change, Keep existing and Clear controls support overdue edits. Some validation/legacy fixtures
  are entered programmatically to establish the scenario; the complete calendar/time save and
  primary CRUD flows are exercised through keyboard input.
- Active filtering has a checkmark plus aria-pressed, a different colour, and a distinct border
  under forced-colors. Contrast checks wait for palette transitions to finish.
- At 320 CSS pixels and 200% zoom, actions remain above the list with no horizontal overflow.
  Inspected desktop screenshots also show the native date/hour/minute form and top-right actions.

The harness requires xdotool to activate only its own test Chrome window and waits for Orca
startup before keyboard input. Initial runs revealed harness timing, desktop pixel rounding and
an incorrect Alt+Down assumption; those were corrected before the passing acceptance run.
The form error-focus regression was fixed by deferring focus until the pending fieldset is enabled.
The reviewed scope has no outstanding finding. NVDA, VoiceOver and other browser combinations
were not tested. Full feature results: [validation-results.md](../../specs/002-refine-task-list/validation-results.md).
