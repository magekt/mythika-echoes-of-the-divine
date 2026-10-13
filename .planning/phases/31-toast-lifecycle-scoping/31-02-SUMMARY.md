---
phase: 31-toast-lifecycle-scoping
plan: "02"
subsystem: engine-ui
tags: [toast-lifecycle, scene-tag, LAY-05, cap-docs]

# Dependency graph
requires:
  - phase: 31-toast-lifecycle-scoping plan 01
    provides: [Ashram boot fix, harden branch record, binding regression pattern]
provides:
  - [scene-tagged toast queues, transition clearing on both paths, lifecycle regression test, documented cap]
affects: [phase-32 shared-Notify toast lane (LAY-02), scene-helpers toast-lane constant]

# Tech tracking
tech-stack:
  added: []
  patterns: [scene-tagged ephemeral UI, idempotent transition clearing at both swap sites, real-source VM regression test]

key-files:
  created: [tests/toast_lifecycle.test.js, tools/shots/layout-31-toast.json]
  modified: [src/engine/game.js, src/ui/feedback.js]

key-decisions:
  - "Clear at BOTH swap sites (gScene pre-branch + Fade.update swap): navigation.js calls Fade.toScene directly, bypassing gScene — gScene-only clearing would miss it. Double-clear is idempotent so observable behavior is exactly-once per transition"
  - "gScene clears BEFORE the unknown-destination fallback show, so the redirect notice survives as the single transition-describing toast"
  - "No toast visuals, durations, caps, wrap logic, or y=470 lane touched — LAY-02 owns the lane in Phase 32"
  - "Test loads the REAL game.js + feedback.js in production order; cap tests pass pre-fix (pre-existing behavior), all clearing tests fail pre-fix"

patterns-established:
  - "Ephemeral per-scene UI carries a scene tag stamped at creation and dies in the transition choke point"
  - "Achievement/banner concepts live outside the clearable queue so survival is structural, not conditional"

requirements-completed: [LAY-05]

# Metrics
duration: 45min
completed: 2026-10-09
---

# Phase 31 Plan 02 Summary

**Toast lifetime scoped to the creating scene in both toast systems: scene tags stamped at creation, stale toasts dropped on every transition path, achievement banners structurally exempt, cap documented in the regression test.**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-10-09
- **Completed:** 2026-10-09
- **Tasks:** 3/3
- **Files modified:** 2 modified, 1 test created, 1 run artifact recorded

## Accomplishments

- `src/engine/game.js`: `Notify.show` stamps `scene` from `G.state.scene`; new `Notify.clearScene` drops the whole regular queue (never touches `achievements` — verified: achievement diff lines are additions/context only); new `clearSceneToasts()` choke helper clears Notify + Feedback (defensively guarded for harness contexts); called pre-branch in `gScene` and at the `Fade.update` deferred swap site (covers direct `Fade.toScene` callers such as navigation.js).
- `src/ui/feedback.js`: `Toast()` stamps `sceneTag`; new `Toast.clearScene` (drops all — Feedback has no achievement concept); exposed as `clearSceneToasts` in the public API block.
- `tests/toast_lifecycle.test.js`: 12 tests green against the real sources — existence guards, scene/sceneTag stamping, clear empties, achievements survive, 3/system cap with oldest-evicted in both systems, queue-level repro-path replay (travelMap toast dies across Back/Ashram/Party legs), achievement-survives-transition, dual-queue choke integration. 10/12 fail pre-fix (2 cap tests pass pre-fix as pre-existing behavior documentation).
- `tools/shots/layout-31-toast.json`: suite/invariants/layout evidence recorded.

## Verification

- `node --test tests/toast_lifecycle.test.js`: 12/12 pass (10 fail pre-fix)
- `node --test tests/*.test.js`: 421 pass, 0 fail
- `tools/check_ui_invariants.sh`: all checks passed
- `python3 tools/verify_matrix.py --budget 6000`: all 3 profiles booted clean
- `python3 tools/verify_matrix.py --layout --budget 30000`: 26 scenes x 2 viewports; 0 toast-related violations either viewport; 730 violations with fix vs 774 baseline without (44 fewer, zero new); 4/4 frozen expected pairs still HIT
- `node --check` + `git diff --check` clean; `grep` acceptance thresholds met (sceneTag present; 7+5 clearScene lines; no achievement removals)

## Surfaced-not-fixed (owning phases noted)

- Remaining 730 layout violations are pre-existing Phase 32/33 defects, untouched per plan: top counts in punarjanma (66), achievements (66), combatScene-5v3 (66), combatScene (56), party (18), modal-open (18), forge (13) per viewport. Fail-first oracle pairs (combat intersect x2, bazaar `Recipe: `/`Teaches `, zoneExploration encounter) still HIT as before.
