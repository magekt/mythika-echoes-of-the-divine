---
phase: 11-dynamic-world-events
plan: 01
subsystem: systems
tags: [world-events, time-bound-events, zone-events, event-generation, offline-tick]

# Dependency graph
requires:
  - phase: 06-world-state-continuity
    provides: "WorldState.setEventActive, resolveEvent, getWorld API"
  - phase: 09-regional-influence-control
    provides: "ZoneAccess.status for eligible zone checks"
provides:
  - "WORLD_EVENTS static registry of 8 event templates across 4 zones"
  - "WorldEvents API: generate, tick, resolve, getForZone, getActive, pruneHistory"
  - "Offline event expiry via SaveSystem.load tick integration"
affects:
  - "11-dynamic-world-events"
  - "map-rendering (plan 02 will consume WorldEvents.getActive)"

# Tech tracking
tech-stack:
  added: []
  patterns: [vm-sandbox-tdd, typeof-guard-loading, iife-namespace, cooldown-tracker]

key-files:
  created:
    - src/data/world_events.js
    - src/systems/world_events.js
    - tests/world_events.test.js
  modified:
    - index.html
    - sw.js
    - src/systems/save.js

key-decisions:
  - "Event ids are unique per occurrence (templateId + timestamp) to support cooldown tracking across resolutions"
  - "Cooldown eligibility checks resolved events by templateId match with resolvedAt/expiredAt timestamp comparison"
  - "Double-resolve guard checks both active map and resolved map before applying rewards, preventing double-reward on concurrent calls"
  - "WorldEvents.tick(elapsed) uses wall-clock remaining (startedAt + duration - Date.now()) combined with elapsed for offline expiry"
  - "No cache-version bump — sw.js tolerant precache and runtime caching ensure new scripts load without worker restart"

patterns-established:
  - "World event lifecycle: generate → active → tick/resolve → resolved with pruning"
  - "Template cooldown tracking via resolved event metadata rather than separate cooldown state"
  - "typeof-guard cross-system calls for safe module loading during stale-cache scenarios"

requirements-completed: [REQ-018]

# Metrics
duration: 17min
completed: 2026-09-18
---

# Phase 11 Plan 01: Dynamic World Events Summary

**8 mythological event templates with generate/tick/resolve lifecycle, cooldown tracking, and offline expiry wired into save load**

## Performance

- **Duration:** 17 min
- **Started:** 2026-09-18T14:38:01Z
- **Completed:** 2026-09-18T14:55:06Z
- **Tasks:** 2
- **Files created/modified:** 6

## Accomplishments
- Created 8 lore-consistent world event templates across 4 zones (aryavarta, dandaka, meru, patala) with distinct durations, cooldowns, and rewards
- Implemented full WorldEvents lifecycle API with generation bounds (max 3 active), wall-clock-based expiry, idempotent resolution with double-reward guard, and bounded history (20 entries)
- Wired offline tick into SaveSystem.load following the established FarmSystem.tick pattern with typeof guard

## Commits

Each task was committed atomically:

1. **task 1 (RED): add failing test for world event system** - `85b59fb` (test)
2. **task 1 (GREEN): world event data and system API** - `5887119` (feat)
3. **task 2: register world event scripts and wire tick into save load** - `876f5d5` (feat)

**Final metadata:** (pending)

## Files Created/Modified
- `src/data/world_events.js` - 8 event templates with zone, duration, cooldown, rewards, labels, icons, marker colors
- `src/systems/world_events.js` - IIFE namespace: generate, tick, resolve, getForZone, getActive, pruneHistory
- `tests/world_events.test.js` - 10 test cases using vm sandbox harness matching world_state.test.js pattern
- `index.html` - Script tags in correct load order (data line 84, system line 95)
- `sw.js` - Precache entries for both world event files
- `src/systems/save.js` - WorldEvents.tick(elapsed) call after FarmSystem.tick in SaveSystem.load

## Decisions Made
- Event ids use `templateId + '_' + Date.now()` for unique-per-occurrence identification, enabling cooldown tracking across resolution history
- Cooldown check scans all resolved events for matching templateId and compares resolvedAt/expiredAt against current time; no separate cooldown state needed
- Double-resolve guard checks `world.events.resolved` directly before applying rewards (belt-and-suspenders with WorldState.resolveEvent's own idempotency check)
- generate(elapsed) accepts but ignores elapsed parameter (forward-compat reserved); generation always uses real Date.now() for startedAt
- No sw cache version bump — existing tolerant precache + runtime caching handles new assets gracefully

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pruneHistory test assertion**
- **Found during:** task 1 (GREEN)
- **Issue:** Test used incorrect `minKept` calculation (compared resolvedAt against wrong threshold), causing false assertion failure
- **Fix:** Changed assertion from time-based comparison to direct key-existence checks (hist_0/hist_1 removed, hist_2/hist_21 kept)
- **Files modified:** tests/world_events.test.js
- **Verification:** All 10 tests pass after fix
- **Committed in:** 5887119 (part of GREEN commit)

### TDD Gate Adjustment

**2. [Plan deviation] Split RED-GREEN into separate commits**
- **Found during:** task 1
- **Issue:** Plan specified single combined commit; system-level TDD gate requires separate test(...) and feat(...) commits
- **Fix:** Committed test file first (85b59fb), then data+system files (5887119) to satisfy RED→GREEN gate sequence
- **Files affected:** Commit structure only
- **Verification:** git log shows test(Phase-11) before feat(Phase-11)

**Total deviations:** 2 (1 bug fix, 1 structural)
**Impact on plan:** All deviations necessary for test correctness and TDD compliance. No scope creep.

## Issues Encountered

**Pre-existing test failure:** `travel_map_landmarks.test.js` ("region rendering distinguishes discovered and undiscovered landmark indicators") fails — this is a Phase 8 artifact unrelated to world events work. Verified by checking git history: the test was committed at ef64cc5 and has not been updated since.

## Known Stubs

None — all WORLD_EVENTS templates have concrete zone assignments, durations, cooldowns, and reward values. WorldEvents API fully implemented.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| T-11-01 (mitigated) | src/systems/world_events.js | WorldState.setEventActive already validates via _safeKey; WorldEvents.generate uses templateId + timestamp keys |
| T-11-02 (mitigated) | src/systems/world_events.js | MAX_HISTORY=20 and MAX_ACTIVE=3 bounds prevent DoS via state growth |
| T-11-03 (mitigated) | src/systems/world_events.js | Double-resolve guard: resolved map check before rewards + WorldState.resolveEvent idempotency |

## Self-Check: PASSED

All 6 created/modified files verified on disk. All 3 commits (85b59fb, 5887119, 876f5d5) confirmed in git log. 10/10 world_events tests passing.
