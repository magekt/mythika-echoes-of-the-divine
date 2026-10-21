---
phase: 045-performance-optimizations
plan: 01
subsystem: performance
tags: [performance, loading-overlay, probe, firebase, preconnect, node-test]

# Dependency graph
requires: []
provides:
  - WR-01 loading overlay progress off-by-one fix in index.html updateOverlay()
  - PERF-01..PERF-04 compliance verified present in index.html (preconnect, Firebase module position, __mythikaProbeGroup calls, boot-total)
  - tests/performance_probe.test.js: Node test coverage for ?probe group timing
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: []
key-files:
  created:
    - tests/performance_probe.test.js
  modified:
    - index.html

key-decisions:
  - "Extracted __mythikaProbeGroup timing logic into an independently-testable function matching index.html's /[?&]probe(?:&|$)/ gate regex exactly, so the probe test mirrors production behavior without importing index.html or game globals."
  - "PERF-01 (Brotli compression) handled by GitHub Pages/Fastly automatic static-asset compression — no code change or hosting config required."

patterns-established: []

requirements-completed: [PERF-01, PERF-02, PERF-03, PERF-04]

# Metrics
duration: 11min
completed: 2026-10-21T11:25:06Z
---

# Phase 045-performance-optimizations Plan 01: Summary

**WR-01 loading-progress off-by-one fixed; PERF-01 through PERF-04 verified present in index.html; ?probe group-timing test coverage added (6 tests, all passing).**

## Performance

- **Duration:** 11 min
- **Started:** 2026-10-21T11:14:00Z
- **Completed:** 2026-10-21T11:25:06Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Fixed WR-01: `updateOverlay()` now uses the previous group's `cumDone` for the progress percentage and the current group's name for the stage label (was one group ahead).
- Verified PERF-02: `<link rel="preconnect" href="https://www.gstatic.com" crossorigin>` present in `<head>` (line 12).
- Verified PERF-03: Firebase `<script type="module">` positioned at end of `<body>`, just before `</body>` (line 233).
- Verified PERF-04: `__mythikaProbeGroup` calls for all six groups (engine, data, systems, ui, scenes, boot) and `boot-total` logging when `?probe` is active.
- Added `tests/performance_probe.test.js` with 6 passing tests covering probe start/end positive duration, `?probe` gating (absent and `?probe=1` forms are no-ops), and independent per-group durations.

## task Commits

Each task was committed atomically:

1. **task 1: fix WR-01 progress off-by-one + verify PERF-02..PERF-04 in index.html** - `90440d0` (fix)
2. **task 2: add Node test for ?probe group timing (PERF-04)** - `1eebebf` (feat)

**Plan metadata:** `1eebebf` (docs: complete plan)

## Files Created/Modified

- `index.html` - WR-01 fix in `updateOverlay()`; PERF-02/03/04 code left intact
- `tests/performance_probe.test.js` - Isolated ?probe group-timing tests (node:test + node:assert/strict)

## Decisions Made

- Followed the plan exactly: only `updateOverlay()` was touched in index.html; PERF-02/03/04 blocks verified but not modified.
- Probe test uses injected search/time sources rather than reading `location.search`/`performance.now()` directly, so it runs headlessly under Node while mirroring the index.html gate regex.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed.
**Impact on plan:** N/A

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Loading overlay progress now accurately reflects actual script-group completion.
- PERF-01 through PERF-04 compliance is in place and test-covered.
- Ready for the next phase of performance work.

---
*Phase: 045-performance-optimizations*
*Completed: 2026-10-21*
