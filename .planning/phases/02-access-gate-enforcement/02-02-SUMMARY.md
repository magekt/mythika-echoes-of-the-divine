---
phase: 02-access-gate-enforcement
plan: 02
subsystem: auth
tags: [access-gates, authority, recruit, tournament, trials, browser-uat, vanilla-js]

# Dependency graph
requires:
  - phase: 01-save-hydration-equipment-authority
    provides: ZoneAccess authority gate pattern (status()/enter())
provides:
  - RecruitAccess authority gate in party scene
  - TournamentAccess authority gate in tournament scene
  - TrialsAccess authority gate in trials scene
affects: [Phase 03 narrative encounters, Phase 04 combat UI]

# Tech tracking
tech-stack:
  added: []
  patterns: ["XxxAccess authority gate: status() pure read + enter() gates mutation"]

key-files:
  created: []
  modified:
    - src/scenes/party.js
    - src/scenes/tournament.js
    - src/scenes/trials.js

key-decisions:
  - "RecruitAccess.costs uses actual game values [800/2500/6000/14000], not plan's outdated [200/600/2000/14000] — preserving game economy balance (Rule 1 deviation)"
  - "TournamentAccess computes dynamic fee (50 + wins*25) in status() rather than plan's hardcoded 50, to correctly gate escalation (Rule 1 deviation)"
  - "partyScene.data.recruitCosts references RecruitAccess.costs as single source of truth (mirrors ForgeAccess.costs pattern)"

patterns-established:
  - "Gate at mutation point: enter() is called as first line in the scene's mutation method, protecting both UI and programmatic paths"
  - "Dynamic fee in gate: TournamentAccess computes fee using G.state.tournamentWins so the gate matches the actual cost, not a static default"

requirements-completed: [REQ-006, REQ-010]

# Metrics
duration: 4min
completed: 2026-09-14
---

# Phase 02 Plan 02: Recruit + Tournament + Trials Authority Gates Summary

**Three scene-level XxxAccess authority gates (RecruitAccess, TournamentAccess, TrialsAccess) plus automated browser UAT confirming all 6 Phase 02 gates work correctly with no state corruption on blocked attempts**

## Performance

- **Duration:** 4 min
- **Started:** 2026-09-14T15:10:08Z
- **Completed:** 2026-09-14T15:14:00Z
- **Tasks:** 3 (task 3 auto-approved per auto mode)
- **Files modified:** 3

## Accomplishments
- `RecruitAccess` gate in party.js — validates party capacity (<5), duplicate hero, and gold; gate powers both buildList (recruit button disabled/hidden when full) and buildRecruitList (per-hero button state); recruitHero gates via RecruitAccess.enter before any gold spend
- `TournamentAccess` gate in tournament.js — validates player exists and gold meets dynamic escalating fee (50 + wins×25); startMatch gates via TournamentAccess.enter as first line; buildMenu uses TournamentAccess.status for canEnter state
- `TrialsAccess` gate in trials.js — validates player exists and boss_svarga flag; startRun gates via TrialsAccess.enter as first line; buildMenu uses TrialsAccess.status for canStart state
- Automated browser UAT: all 6 gates (JourneyAccess, RebirthAccess, ForgeAccess, RecruitAccess, TournamentAccess, TrialsAccess) verified programmatically via browser-use CDP; scene navigation confirmed zero runtime errors across all modified files

## task Commits

Each task was committed atomically:

1. **task 1: Add RecruitAccess authority gate to party scene** - `8b6c182` (feat)
2. **task 2: Add TournamentAccess and TrialsAccess authority gates** - `20bad46` (feat)
3. **task 3: Browser UAT — all 6 Phase 02 authority gates** - auto-approved (no code changes; automated UAT passed)

**Plan metadata:** (committed with final phase commit)

## Files Created/Modified
- `src/scenes/party.js` - Added RecruitAccess status/enter; buildList and buildRecruitList use status(); recruitHero gates via enter; recruitCosts references RecruitAccess.costs as single source of truth
- `src/scenes/tournament.js` - Added TournamentAccess status/enter (dynamic fee); buildMenu uses status(); startMatch gates via enter
- `src/scenes/trials.js` - Added TrialsAccess status/enter; buildMenu uses status(); startRun gates via enter

## Decisions Made
- RecruitAccess.costs uses the real game values [800, 2500, 6000, 14000] — the plan's [200, 600, 2000, 14000] was an outdated assumption (could silently halve recruitment costs)
- TournamentAccess.status() computes the dynamic fee (50 + wins*25) rather than hardcoding 50, so the gate correctly blocks at all escalation stages — verified with wins=2 → cost=100 in UAT

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] RecruitAccess.costs corrected from [200,600,2000,14000] to [800,2500,6000,14000]**
- **Found during:** task 1 (Add RecruitAccess authority gate)
- **Issue:** Plan's sample cost values [200/600/2000/14000] do not match the real game economy (party.js line 12: [800/2500/6000/14000]). Using plan values would silently halve recruitment costs.
- **Fix:** Used actual game values in RecruitAccess.costs and routed data.recruitCosts to reference it as single source of truth
- **Files modified:** src/scenes/party.js
- **Verification:** Gate status returns cost=800 for 1-hero party, matching pre-gate behavior
- **Committed in:** 8b6c182 (task 1 commit)

**2. [Rule 1 - Bug] TournamentAccess fee made dynamic instead of hardcoded 50**
- **Found during:** task 2 (Add TournamentAccess and TrialsAccess authority gates)
- **Issue:** Plan hardcodes `cost = 50` in TournamentAccess, but the game escalates the fee (50 + wins*25). A hardcoded 50 would allow entry with insufficient gold once wins > 0.
- **Fix:** TournamentAccess.status() now computes `const cost = 50 + ((G.state.tournamentWins || 0) * 25)` to match the real fee
- **Files modified:** src/scenes/tournament.js
- **Verification:** UAT confirmed cost=50 at wins=0, cost=100 at wins=2
- **Committed in:** 20bad46 (task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — incorrect values that would break game economy if left uncorrected)
**Impact on plan:** Both fixes preserve correct game balance; no scope creep; all acceptance criteria still met.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Browser UAT Summary

Automated via `browser-use` CDP on local HTTP server (`localhost:8321`):

| Gate | status() Correct | enter() Blocks | No State Change | Scene Navigation |
|------|------------------|----------------|-----------------|------------------|
| JourneyAccess | ✓ blocked 'other-active' | ✓ JourneySystem.start returns false | ✓ | ✓ ashram/journey |
| RebirthAccess | ✓ blocked 'Requires Level 30+' | ✓ performRebirth no-ops | ✓ | ✓ punarjanma |
| ForgeAccess | ✓ blocked 'Need Xg (0g)' | ✓ upgradeSlot returns false, gold unchanged | ✓ | ✓ forge |
| RecruitAccess | ✓ blocked 'Need 800g', 'already in party', 'Party is full' | ✓ recruitHero returns false | ✓ | ✓ party |
| TournamentAccess | ✓ blocked 'Need 50g' (wins=0), 'Need 100g' (wins=2) | ✓ startMatch no-ops | ✓ | ✓ tournament |
| TrialsAccess | ✓ blocked 'Defeat the Svarga boss' | ✓ startRun no-ops, state stays menu | ✓ | ✓ trials |

## Next Phase Readiness
- All 6 Phase 02 authority gates complete and verified via browser UAT
- Phase 03 narrative encounters can reference JourneySystem with guaranteed gate validation
- Phase 04 combat UI can safely modify party views (RecruitAccess gate prevents stale-state recruitment)

---
*Phase: 02-access-gate-enforcement*
*Completed: 2026-09-14*
