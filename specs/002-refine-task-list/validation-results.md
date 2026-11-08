# Implementation Validation — Refine Task List

Date: 2026-11-08. Implementation complete; no new dependency or schema migration.

## Setup and Baseline

Working tree was clean at start. Existing approved lockfile and Prisma model retained.
Baseline: 37 tests passed; typecheck, lint and production build passed. Ignore rules cover
SQLite files/sidecars, generated Prisma code, dist, node_modules and local environment files.
The existing integration harness migrates owned temporary databases and refuses developer paths.
Chrome, Orca, D-Bus and DISPLAY are available; HTTP tests require loopback approval.

## Test Strategy

Use explicit service clocks and pure helper clocks. Legacy overdue rows are inserted directly
through the isolated database harness; write requests are tested against future-only rules.
Existing API fixtures using fixed future dates will be assigned fixed clocks. Browser sidebar
geometry/keyboard assumptions and ascending membership assertions will be updated for this feature.

## Red/Green Evidence

US1 repository and API assertions failed with [0,5] instead of [5,0] before repository sort was
changed. Render-order preservation is existing behaviour; its additional test is regression
coverage rather than an invented failing implementation requirement.


US2 shared/service tests failed on past-value acceptance and absent validation callbacks;
API tests observed 201/200 instead of 400. The repository stale-context test observed a
partial content/date update before the fix. Native-control/form tests failed against the
old datetime-local field and absent retained-date controls before replacement.
All now pass. Real SQLite retry tests throw a transient error from the first callback,
then reject the expired value on the second attempt with no content/date/create persisted.
Historical response schemas remain syntax-only; completion/deletion bypass date reassignment.
DST gap, earlier overlap, local midnight and timezone redisplay regressions pass. Additional
timezone-form and retry regressions were added during verification, after the initial red batch.
US3 action-order assertion failed before DOM movement and now passes with a persistent-size
checkmark and aria-pressed. No dependency, schema or migration files changed.

## Final Gates and Browser Acceptance

Final `npm test`: **57/57 tests, 34 files passed** (21 unit, 20 integration, 16 component).
`npm run typecheck`, `npm run lint`, `npm run build` and `git diff --check` passed.
The build emits the existing upstream Zod PURE-comment annotation warnings; output succeeds.
No package/lockfile, Prisma schema, migration, development database or environment file changed.

Chrome native-CDP acceptance passed against a disposable database/server. The 100-task dataset
was checked through both API membership/order and rendered title order in both filters; every
new timed task was checked as the first item. Desktop screenshots were inspected, including the
native calendar/hour/minute form. Browser timezone overrides verified exact UTC preservation
for complete selections and review guidance for partial drafts. Native date minimum, disabled
current minute, expired-input retention, active colour/cue, CRUD and mobile overflow checks passed.

| Timing (20 trials each) | Under 2 seconds | Median | Maximum |
|---|---|---|---|
| List | 20/20 | 64 ms | 84 ms |
| Inclusive filter | 20/20 | 66 ms | 93 ms |
| Create and list refresh | 20/20 | 129 ms | 149 ms |

See tests/e2e/browser-results.json. This exceeds the required 19/20 local threshold; it does not
predict remote deployment performance. Screenshots are temporary artifacts at /tmp/todo-empty.png,
/tmp/todo-list.png and /tmp/todo-calendar.png.

The isolated graphical Chrome/Orca run passed all 13 recorded steps, with **108 generated speech
utterances** and **zero text contrast findings**. Reviewed speech includes calendar day/month,
Hour (24-hour), Minute, Choose an hour/minute, expired-date feedback and CRUD status announcements.
Space opens the native calendar in this Chrome; arrows/Enter select a future date and hour/minute,
and keyboard save succeeds. Forced-colors preserves the checkmark and distinct border. Actions
remain above the list without overflow at 320 CSS pixels and 200% zoom. See
[accessibility review](../../tests/e2e/manual-acceptance.md) and tests/e2e/accessibility-results.json.
Only generated utterances were reviewed; no claim of listening to audio or testing other AT/browser pairs.

## Findings and Resolutions

- Form regression tests exposed attempted error focus while the due fieldset was disabled during
  submission. Focus is now applied after submission finishes; partial/server-error assertions pass.
- Browser checks initially sampled the active colour during its 150 ms transition and sampled
  normal contrast immediately after leaving forced-colors. Checks now wait for the final palette.
- Desktop scaling rounds the declared 3px forced-colors border to 2.4 CSS pixels. The visual test
  checks the distinct rendered border rather than an exact integer CSS value.
- This Chrome opens its native calendar with Space, rather than Alt+Down. The script verifies a
  real calendar grid before navigating, preventing a false keyboard-picker acceptance.
- Orca startup/window activation caused incomplete speech capture in intermediate runs. The
  harness now activates only its own Chrome window and waits for startup. The final run passes
  validation and deletion utterance assertions; the fuller date/time/error transcript was reviewed.
- All owned test servers, browser/Orca processes and temporary databases were cleaned up. The
  existing user app was not restarted. No outstanding defect was identified in the reviewed scope.

## Requirement Results

| ID | Result and evidence |
|---|---|
| FR-001 | Pass: repository/API gaps, both filters, stable edits; rendered 100-task descending order |
| FR-002 | Pass: lifetime allocation retained; creation/refresh puts new tasks first |
| FR-003 | Pass: blank native date/hour/minute controls; optional title-only and partial-entry tests |
| FR-004 | Pass: local-today min; midnight rollover helper/focus tests and Chrome calendar |
| FR-005 | Pass: disabled elapsed minutes/hours, exhausted day, DST gaps, typed/API bypass tests |
| FR-006 | Pass: client save and transactional service clock checks; retries reject expiry without partial writes |
| FR-007 | Pass: exact stored instant, omission, null clearing, stale-context rejection; overdue completion/deletion usable |
| FR-008 | Pass: offset/UTC schemas, DST earlier overlap, precision preservation, pure and real-browser timezone changes |
| FR-009 | Pass: action-first DOM, desktop right alignment, empty/loading/error availability and narrow/zoom geometry |
| FR-010 | Pass: distinct active/inactive palette, stable accessible label, inclusive membership and form-return state |
| FR-011 | Pass: checkmark/aria-pressed, forced-colors border, zero reviewed text contrast findings |
| FR-012 | Pass: labels/error associations, pending focus fix, timer/listener cleanup, native keyboard and Orca checks |
| SC-001 | Pass: API and rendered order for 100 mixed tasks, both filters, new task first |
| SC-002 | Pass: fixed-clock temporal matrix, HTTP bypass, partial/gap/expiry tests and native controls |
| SC-003 | Pass: unchanged-overdue precision, explicit replacement, clear and stale-current rollback |
| SC-004 | Pass: desktop, 320px and 200% zoom action placement/order and no horizontal overflow |
| SC-005 | Pass in reviewed Chrome/Orca scope: keyboard calendar/time and CRUD, filter cue without colour, speech/errors and contrast |

README and quickstart now describe implemented behaviour. Final diff reviewed for unintended
changes, database files, secrets and dependencies. No extension hooks are configured.
