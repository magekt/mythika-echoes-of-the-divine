---
phase: 30-layout-harness-extension
plan: "03"
subsystem: testing
tags: [harness, fail-first, navigation-fix]
requires:
  - phase: 30-layout-harness-extension
    provides: text-bounds harness core + combat sim
provides:
  - Live fail-first proof (4/4 frozen pairs HIT on unpatched build)
  - Two production navigation defects found and fixed via the sweep
affects: [phase-31, phase-32]
tech-stack:
  added: []
  patterns: [sweep-page injection, fail-first oracle, fade forwarding]
key-files:
  modified: [src/engine/navigation.js, src/engine/navigation_routes.js, src/engine/game.js, src/ui/modal.js, tools/verify_matrix.py, tools/layout_harness/expected_pairs.json, tests/navigation_integration.test.js]
  created: [tools/layout_harness/allowlist.json]
key-decisions:
  - "Fixed combat/cultivation route scene names (combatScene/cultivationScene): every combat entry had fallen back to Ashram since Phase 18."
  - "Fixed Navigation.go infinite recursion: go() now calls pre-wrap _rawGScene and forwards the fade flag (synchronous entry preserved)."
  - "Corrected the zone frozen pair to the true overlap (zone name x subtitle); fixture anticipated this correction."
  - "Left R.Backgrounds split (backgrounds never paint) UNFIXED: out of harness scope, filed as pending todo."
requirements-completed: [LAY-00]
duration: 90min
completed: 2026-10-09
---

# Phase 30 Plan 03 Summary

**Sweep integration, fail-first proof, and two production navigation fixes.**

## Accomplishments
- `--layout` sweep runs 26 scenes × 2 profiles; 4/4 frozen pairs HIT on the unpatched build (fail-first PROVEN); sweep exits nonzero as designed.
- Fixed route scene names + go() recursion + fade forwarding; added route-vs-SCENE_TABLE regression test.
- modal-open expectation corrected (party + modal is correct entry).
- Combat sim emits BAL JSON (seed 1: meanHpLossFirstFive 0.3925, deathRate 0.07, fightsToClear 8, meanPctGain 13.69; bond systems absent — baseline only).
- Clean-frame control passes via layout_harness unit path (15/15 + 5/5).

## Task Commits
1. **task 1: engine overlay-flag wiring** — 2 guarded sites each in game.js Notify.render + modal.js Modal.render (try/finally).
2. **task 2: layout-sweep mode** — sweep page, driver, JSON beacons, allowlist (empty), 600s profile timeout.
3. **task 3: fail-first proof + gates** — 4/4 pairs, sim JSON, 403/403 suite, invariants, boot matrix green.

## Verification
- `python3 tools/verify_matrix.py --layout --budget 30000` — FAILS as designed with all frozen pairs matched.
- `node tools/combat_sim.js --seed 1 --fights 200` — BAL JSON emitted.
- `node --test tests/*.test.js` — 403/403 passed.
- `tools/check_ui_invariants.sh` — all passed; standard boot matrix clean.

## Deviations from Plan
- Fixture pair corrected per its own tentative-note rule (never emptied).
- Surfaced (not fixed): backgrounds-never-paint split-R bug → pending todo.

---
*Phase: 30-layout-harness-extension*
*Completed: 2026-10-09*
