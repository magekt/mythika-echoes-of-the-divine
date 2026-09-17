---
phase: 08-landmark-discovery
plan: 01
subsystem: world-map
tags: [landmarks, world-state, discovery, vanilla-js, node-test]

requires:
  - phase: 06-world-state-continuity
    provides: normalized persistent world state and one-time landmark records
  - phase: 07-visual-region-map
    provides: canonical six-zone map topology and travel surface
provides:
  - Twelve canonical landmark definitions spanning every existing zone
  - Progress-, completion-, and encounter-flag-based discovery evaluation
  - Idempotent persistent landmark discovery and zone query APIs
affects: [08-02-map-integration, travel-map, save-state]

tech-stack:
  added: []
  patterns: [global namespace system, data-driven discovery conditions, WorldState persistence delegation]

key-files:
  created: [src/data/landmarks.js, src/systems/landmarks.js, tests/landmarks.test.js]
  modified: [src/systems/world_state.js, index.html]

key-decisions:
  - "Keep landmark definitions declarative and index them once by zone for bounded runtime checks."
  - "Expose WorldState.getWorld as the normalized read contract required by landmark queries."
  - "Return enriched copies from Landmarks.getAll so callers cannot mutate canonical discovery definitions."

patterns-established:
  - "Discovery condition dispatch: landmark definitions select zonePercentage, zoneComplete, or flag evaluation."
  - "One-time discovery: Landmarks performs an early read check and WorldState remains the authoritative idempotency guard."

requirements-completed: [REQ-014]

duration: 13min
completed: 2026-09-17
---

# Phase 8 Plan 1: Landmark Data and Discovery Engine Summary

**Twelve lore-rich landmarks now unlock from live exploration or encounter state and persist exactly once through the normalized WorldState contract.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-09-17T06:31:51Z
- **Completed:** 2026-09-17T06:44:51Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Defined two inspectable landmarks for each of the six canonical travel zones.
- Implemented progress, zone-completion, and encounter-flag discovery conditions.
- Added idempotent persistence plus per-zone discovery and enriched definition queries.
- Added Node test coverage for definition integrity, discovery behavior, and browser script ordering.

## Task Commits

Each task was committed atomically with mandatory TDD gates:

1. **Task 1 RED: landmark data contracts** - `e87c061` (test)
2. **Task 1 GREEN: landmark definitions** - `80575d0` (feat)
3. **Task 2 RED: discovery engine contracts** - `0da6750` (test)
4. **Task 2 GREEN: landmark discovery engine** - `8fdc239` (feat)

## Files Created/Modified

- `src/data/landmarks.js` - Canonical landmark lore, conditions, zone index, and static lookup helper.
- `src/systems/landmarks.js` - Discovery condition evaluation, persistence delegation, and zone queries.
- `src/systems/world_state.js` - Normalized `getWorld()` read contract used by landmark queries.
- `index.html` - Landmark data and system registration in dependency order.
- `tests/landmarks.test.js` - Definition, behavior, idempotency, query, and load-order tests.

## Decisions Made

- Landmark content remains immutable static data; runtime discovery logic lives exclusively in the system layer.
- The data script loads with other zone data, while the discovery system loads immediately after WorldState.
- `Landmarks.getAll()` exposes only inspectable fields plus discovered status, excluding internal condition objects.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added the documented normalized WorldState read contract**
- **Found during:** Task 2 GREEN verification
- **Issue:** The plan and landmark API depend on `WorldState.getWorld()`, but the existing WorldState implementation did not expose it.
- **Fix:** Added `WorldState.getWorld()` as a thin normalized accessor over `_ensureWorld()`.
- **Files modified:** `src/systems/world_state.js`
- **Commit:** `8fdc239`

## Deferred Issues

- The pre-existing `tests/save_coherence.test.js` reports older service-worker precache omissions for `map_layout.js` and `map_helpers.js`; adding Phase 8 scripts to that cache would require editing `sw.js`, outside Plan 08-01's allowed files. Runtime caching remains available, and this was not caused solely by the current task.

## Known Stubs

None. Empty arrays and objects in the implementation are initialized working collections, not UI placeholders or mock data.

## Threat Review

- Landmark IDs continue through `WorldState.recordLandmarkDiscovery`, which rejects unsafe keys before persistence.
- No new network, authentication, file access, or external trust boundary was introduced.

## Verification

- `node --test tests/landmarks.test.js tests/world_state.test.js` — passed, 16/16 tests.
- `node --check src/data/landmarks.js && node --check src/systems/landmarks.js && node --check src/systems/world_state.js` — passed.
- Targeted CommonJS discovery-engine assertions — passed.
- Confirmed both implementation artifacts exceed the plan's minimum line counts (143 and 96 lines).

## Self-Check: PASSED

- Created files exist: `src/data/landmarks.js`, `src/systems/landmarks.js`, `tests/landmarks.test.js`.
- Task commits exist: `e87c061`, `80575d0`, `0da6750`, `8fdc239`.
- All required APIs, zone coverage, and script-order links are present and tested.
