# Accessibility and Manual Acceptance Evidence

Date: 2026-11-08. Application tested in local Google Chrome headless using the built-in DevTools
Protocol (tests/e2e/browser-check.mjs), plus React Testing Library interaction tests.

## Completed Checks

- Desktop screenshot inspected at 1440 × 1000: single list and the two requested buttons on its
  right, in the requested order. Empty and populated screenshots saved under /tmp/todo-*.png.
- Responsive check at 390 × 844: no horizontal document overflow.
- Browser create, cancel, inline validation, complete, inclusive display, reopen, edit and
  soft-delete flows passed against a disposable migrated SQLite database.
- Form entry focuses title; Cancel restores focus to create. Component tests verify pending
  Save/Cancel disabling and failure re-enabling with entered content preserved.
- Browser Space-key activation toggles the semantic pressed-state button. Native buttons,
  checkbox and labelled inputs remain keyboard-focusable, with explicit focus-visible outlines.
- Chrome accessibility tree exposes both action names. Forms have labels, optional-field
  descriptions, aria-invalid/error associations; status and error feedback use live semantics.
- Primary button white text contrast was measured at 9.34:1. Input and secondary control borders
  were darkened to improve non-text contrast. Screenshot review confirms visible focus styling
  is defined; RTL assertions verify error association and field preservation.

## Pending Human Verification — T051 Remains Open

A full screen-reader session (for example NVDA or VoiceOver) and manual WCAG 2.2 AA review of
all flows have not been performed. Accessibility-tree inspection and automated interaction
checks do not establish full AA conformance. Verify spoken validation/status announcements,
focus order through every flow, and contrast for all rendered states before claiming SC-005.

The implementation is functional; this remaining validation must be recorded rather than
silently treated as a passing manual test.
