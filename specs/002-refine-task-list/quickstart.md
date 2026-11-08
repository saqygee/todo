# Quickstart Validation: Refine Task List and Due-Date Selection

The follow-up feature is implemented. Use the existing approved dependencies and migrated SQLite
setup. No new package or schema migration was introduced. Run commands from repository root.

## Build and Run

```bash
npm run build
npm run db:deploy
npm start
```

If port 3000 is occupied, use an available port without stopping the other application:

```bash
PORT=3001 npm start
```

Open the matching local URL. Start or restart your chosen local process to serve the new backend build.

## Automated Gates

```bash
npm run test:unit
npm run test:integration
npm run test:components
npm run typecheck
npm run lint
npm run build
```

Use controlled clocks for temporal assertions and isolated migrated SQLite files. Historical
fixtures that intentionally contain overdue tasks must be seeded directly in the test harness;
new create requests cannot introduce past due values. Test direct HTTP bypass, not only forms.

## Acceptance Scenarios

1. Seed 100 mixed tasks, including ordinal gaps and deleted rows. Check default/inclusive lists
   contain exactly the matching records, with every adjacent ordinal strictly decreasing.
   Create another task and verify it appears first. Edit older content and verify no reorder.
2. Inspect create/edit forms: native date calendar plus labelled Hour/Minute selects, no new
   calendar dependency. Calendar cannot choose yesterday; today/future are available. Today
   disables elapsed minutes and hours without any future minutes. Future days permit valid times.
3. Freeze the clock at 10:15:30 local: 10:15 is unavailable, 10:16 is available. Select 10:16,
   advance past 10:16 before Save and verify an inline rejection with input retained. Repeat at
   23:59 and across local midnight; choose a future day when no minute remains today.
4. Confirm absent optional date succeeds; date-only/hour-only/partial selections fail beneath
   their controls; Clear sets null. Typed invalid/past values and direct HTTP past writes fail.
5. Seed an overdue task. Edit title without changing its due instant: success with original
   milliseconds preserved. Clear it: success. Replace it with another past instant: rejection.
   Race a stored due change against a stale supplied past value; it must not get an unchanged
   exemption against obsolete data. Advance the service clock during transaction retry.
6. Verify UTC/offset normalisation and local display in UTC, Asia/Tokyo, America/New_York and
   Europe/London, including DST gap/repeated-hour cases. Select a complete future due time,
   change the browser timezone while the form is open, refocus and verify displayed components
   change while submitted UTC milliseconds remain identical. Repeat with a partial draft: entered
   components remain with review guidance, and no instant is invented. Read schemas still accept
   overdue data.
7. On empty, populated, loading and error lists, verify both buttons are above/top-right, create
   first. At 320 CSS pixels and 200% zoom, check wrapping/order, no horizontal scrolling and
   unclipped focus. Create/edit Save/Cancel still restores list/filter state as before.
8. Toggle Display completed: visibly distinct active colour, stable label, non-colour cue and
   accessible pressed state. Verify both states in forced-colors mode and measure applicable
   text/control contrast. Repeat keyboard and screen-reader flows with native calendar controls.

## Browser and Screen-Reader Review

The native-CDP scripts check descending order, top action geometry, native calendar choices,
timezone changes and the updated keyboard traversal. Each uses its own temporary database.

```bash
node tests/e2e/browser-check.mjs
dbus-run-session -- node tests/e2e/accessibility-check.mjs
```

The latter requires the installed graphical Chrome, Orca, AT-SPI, D-Bus, xdotool and DISPLAY. Verify
calendar navigation/dismissal (Space to open in the reviewed Chrome), disabled time options, partial-entry errors, retained overdue
values and active filter indication through actual keyboard and Orca-generated speech output.
Document exactly which browser/assistive-technology combination was reviewed; do not claim a
cross-platform certification from an accessibility tree alone.

## Evidence

Record new feature results in specs/002-refine-task-list/validation-results.md during
implementation, including the baseline 19/20 under 2 seconds threshold for list/filter/write,
all 12 requirements and five success criteria. Keep actual outcomes separate from this plan.
