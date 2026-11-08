# Performance and Timezone Evidence

Date: 2026-11-08. Local production build in Google Chrome headless.
Dataset: 100 mixed incomplete/completed tasks initially; timed writes add tasks.
Every trial measures visible UI results, including navigation/request/render round trips.

| Action | Trials under 2 seconds | Maximum | Median |
|---|---|---|---|
| list | 20/20 | 116 ms | 92 ms |
| filter | 20/20 | 157 ms | 100 ms |
| write | 20/20 | 222 ms | 174 ms |

The 19/20 acceptance threshold passes for every action. Results are local observations,
not a guarantee for public hosting or other hardware. The reusable native-CDP script is
tests/e2e/browser-check.mjs; raw measurements summary is browser-results.json.

Timezone tests cover UTC, Asia/Tokyo, America/New_York and Europe/London, unchanged instant
round trips, UTC date boundaries, spring-forward gaps and autumn repeated-hour selection.
Required timezone qualification, invalid calendar dates and offset normalisation are tested
in shared validation; SQLite integration tests inspect actual ISO timestamp persistence.

Default 100-task visibility contains 66 incomplete records; the inclusive API contains all
100 non-deleted records in strictly increasing ordinal order. Browser checks verify the
matching list, inclusive display and mobile document overflow.
