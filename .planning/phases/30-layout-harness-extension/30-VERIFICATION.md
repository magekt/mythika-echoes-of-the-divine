# Phase 30 Verification

**Phase:** 30-layout-harness-extension
**Requirement:** LAY-00
**Date:** 2026-10-09
**Status:** Automated contracts complete; sweep fail-first proven

## Automated
- `python3 tools/verify_matrix.py --layout --budget 30000` — exits nonzero on unpatched build with 4/4 frozen pairs matched (combat ×2, bazaar, zone); reports written to tools/shots/layout-*.json.
- `node tools/combat_sim.js --seed 1 --fights 200` — BAL JSON (meanHpLossFirstFive 0.3925, deathRate 0.07, fightsToClear 8, meanPctGain 13.69).
- `node tests/layout_harness.test.js` — 15/15 passed (clean-frame control included).
- `node tests/combat_sim.test.js` — 5/5 passed.
- `node --test tests/*.test.js` — 403/403 passed.
- `tools/check_ui_invariants.sh` — all passed (94 files syntax, 21 systems).
- Standard `verify_matrix.py --budget 6000` — all 3 profiles booted clean.
- `git diff --check` — clean.

## Production defects fixed by this phase
1. Combat/cultivation routes pointed at nonexistent scenes (Ashram fallback on every combat entry since Phase 18).
2. Navigation.go infinite recursion on remapped names (stack overflow on combat/cultivation entry).

## Surfaced, not fixed
- R.Backgrounds split: backgrounds never paint in production → pending todo (candidate Phase 32/33).

## Deferred
- None for this phase; journey-level browser evidence rides Phase 31+ per-plan checkpoints.
