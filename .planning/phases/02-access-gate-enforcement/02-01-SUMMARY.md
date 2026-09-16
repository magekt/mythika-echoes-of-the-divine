---
phase: 02-access-gate-enforcement
plan: 01
subsystem: auth
tags: [access-gates, authority, journey, rebirth, forge, vanilla-js]

# Dependency graph
requires:
  - phase: 01-save-hydration-equipment-authority
    provides: ZoneAccess authority gate pattern (status()/enter())
provides:
  - JourneyAccess authority gate in JourneySystem (status + enter)
  - RebirthAccess authority gate in punarjanma scene
  - ForgeAccess authority gate in forge scene
affects: [02-02 browser UAT, Phase 03 narrative encounters]

# Tech tracking
tech-stack:
  added: []
  patterns: ["XxxAccess authority gate: status() pure read + enter() gates mutation"]

key-files:
  created: []
  modified:
    - src/systems/journey.js
    - src/scenes/punarjanma.js
    - src/scenes/forge.js

key-decisions:
  - "ForgeAccess.costs is the single source of truth for upgrade costs; forgeScene.data.upgradeCosts references it so cost escalation persists across the shared object"
  - "forgeScene.upgradeSlot also gates at the mutation point (defense-in-depth) so programmatic calls cannot bypass the onClick guard"
  - "Journey gates live inside JourneySystem.start so programmatic callers (progression.js, cultivation_sys.js) are automatically gated without modification"

patterns-established:
  - "Authority gate pattern: const XxxAccess = { status(params) { pure read -> {allowed, reason, ...} }, enter(params) { status + gate mutation } }"
  - "Scene integration: buildButtons/buildX uses status() for UI state; mutation methods call enter() first and Notify.show(reason) on failure"

requirements-completed: [REQ-006]

# Metrics
duration: 7min
completed: 2026-09-14
---

# Phase 02 Plan 01: Journey + Rebirth + Forge Authority Gates Summary

**Three system-level XxxAccess authority gates (JourneyAccess, RebirthAccess, ForgeAccess) enforcing eligibility at the entry/mutation point, extending the Phase 01 ZoneAccess pattern to journey starts, rebirth commits, and forge upgrades**

## Performance

- **Duration:** 7 min
- **Started:** 2026-09-14T15:03:44Z
- **Completed:** 2026-09-14T15:08:41Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- `JourneyAccess` gate in journey.js — validates journey existence, not-completed, and single-active-journey rules; `JourneySystem.start` now gates via `JourneyAccess.enter` so programmatic callers (progression.js level-10 trigger, cultivation_sys.js breakthrough trigger) are automatically protected
- `RebirthAccess` gate in punarjanma.js — validates level >= 30 and karma >= 10 (with stale-state karma recheck at mutation time); `performRebirth` gates via `RebirthAccess.enter`; `buildButtons` uses `RebirthAccess.status()` with reason text for UI state
- `ForgeAccess` gate in forge.js — validates hero exists in party and gold >= cost; upgrade onClick handlers plus `upgradeSlot` mutation point gate; `upgradeCosts` references `ForgeAccess.costs` as single source of truth

## task Commits

Each task was committed atomically:

1. **task 1: Add JourneyAccess authority gate to JourneySystem** - `71757ef` (feat)
2. **task 2: Add RebirthAccess authority gate to punarjanma scene** - `352d1bd` (feat)
3. **task 3: Add ForgeAccess authority gate to forge scene** - `0feb2ea` (feat)

**Plan metadata:** (committed with final phase commit)

## Files Created/Modified
- `src/systems/journey.js` - Added JourneyAccess status/enter; JourneySystem.start gates via enter; getAvailable annotates with access status
- `src/scenes/punarjanma.js` - Added RebirthAccess status/enter; performRebirth gates via enter; buildButtons uses status() for canRebirth and reason text
- `src/scenes/forge.js` - Added ForgeAccess status/enter + costs; upgrade onClick and upgradeSlot gated; upgradeCosts references ForgeAccess.costs

## Decisions Made
- ForgeAccess.costs doubles as single source of truth for upgrade cost data — cost escalation after each upgrade now persists in the shared object by design
- upgradeSlot got its own mutation-point guard (in addition to the onClick guard) so a programmatic `forgeScene.upgradeSlot()` call cannot bypass the gate — matches the threat model disposition for T-02-03
- Journey gates placed inside JourneySystem.start rather than in scene UI so all callers are gated transitively

## Deviations from Plan

None - plan executed exactly as written. (The upgradeSlot mutation-point guard is part of the plan's threat-model intent: additional defense-in-depth beyond the onClick handler, same code file, no behavior change for valid operations.)

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 3 Plan 01 gates complete and committed; ready for browser UAT in Plan 02 (task 3 covers all 6 gates)
- Plan 02 adds RecruitAccess, TournamentAccess, TrialsAccess gates in parallel-safe files

---
*Phase: 02-access-gate-enforcement*
*Completed: 2026-09-14*
