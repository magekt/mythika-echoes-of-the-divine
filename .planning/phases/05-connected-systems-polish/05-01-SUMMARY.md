---
phase: 05-connected-systems-polish
plan: 01
subsystem: connected-systems
tags: [encounters, quests, achievements, cross-system-hooks]
# Dependency graph
requires: []
provides:
  - "QuestSystem.trackEncounter method for encounter quest tracking"
  - "EncounterSystem.choose() wires into QuestSystem and AchievementSystem"
  - "narrative_enthusiast achievement (complete 5 encounters)"
affects: [05-02, 05-03]
# Tech tracking
tech-stack:
  added: []
  patterns: ["cross-system guard pattern: typeof X !== 'undefined' && X.method"]
key-files:
  created: []
  modified:
    - src/systems/quest.js
    - src/systems/encounter.js
    - src/data/achievements.js
key-decisions:
  - "Placed QuestSystem.trackEncounter call after AchievementSystem.check in choose(), matching existing ordering pattern"
  - "_advanceChainForEncounter follows _advanceChainForFish pattern (global loop over all zones) since encounter IDs are global, not zone-scoped"
patterns-established:
  - "Cross-system hooks use typeof guard before calling sibling system methods"
requirements-completed: ["REQ-005"]
# Metrics
duration: 15min
completed: 2026-09-15
---

# Phase 05 Plan 01: Cross-system hooks — QuestSystem.trackEncounter + achievement
**Encounter choices now feed quest objectives and achievement checks, closing the connected player loop (REQ-005).**

## Performance
- **Duration:** 15min
- **Started:** 2026-09-15T10:31:22Z
- **Completed:** 2026-09-15T10:45:00Z
- **Tasks:** 3/3
- **Files modified:** 3

## Accomplishments
- `QuestSystem.trackEncounter(encounterId)` added to quest.js — iterates all quests with type='encounter', increments matching targets, notifies completion, and advances encounter-type chain steps
- `EncounterSystem.choose()` now calls `QuestSystem.trackEncounter(id)` after the existing `AchievementSystem.check()` call, wired with the same typeof guard pattern
- `narrative_enthusiast` achievement added to achievements.js — unlocks when player has completed 5 unique narrative encounters (checks `G.state.encounters.seen` key count)

## Task Commits
Each task was committed atomically:
1. **task 1: Add QuestSystem.trackEncounter to quest.js** - `8fc1d56` (feat)
2. **task 2: Wire encounter.js choose() to call QuestSystem.trackEncounter** - `74be246` (feat)
3. **task 3: Add narrative_enthusiast achievement to achievements.js** - `fc05ca0` (feat)

**Plan metadata:** `d722f6b` (docs)

## Files Created/Modified
- `src/systems/quest.js` — Added `trackEncounter(encounterId)` and `_advanceChainForEncounter(encounterId)` methods (50 lines added)
- `src/systems/encounter.js` — Added `QuestSystem.trackEncounter(id)` call in `choose()` after `AchievementSystem.check()` (5 lines added)
- `src/data/achievements.js` — Added `narrative_enthusiast` achievement entry (1 line added)

## Deviations from Plan
None - plan executed exactly as written.

## Known Stubs
None.

## Threat Flags
None - no new network endpoints, auth paths, file access patterns, or trust boundary changes introduced.

## Self-Check: PASSED
- `trackEncounter` present in quest.js: ✅ (line 225)
- `_advanceChainForEncounter` present in quest.js: ✅ (line 332)
- `QuestSystem.trackEncounter` called in encounter.js choose(): ✅ (lines 158-159)
- `narrative_enthusiast` present in achievements.js: ✅ (line 25)
- `AchievementSystem.check` still present in encounter.js choose(): ✅ (lines 153-155)
- All 3 tasks committed: ✅
- No file deletions: ✅
