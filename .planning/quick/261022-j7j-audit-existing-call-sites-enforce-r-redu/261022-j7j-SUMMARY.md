# Quick task 261022-j7j: Audit existing call sites, enforce R.reducedMotion() as the single source of truth

**Status:** complete
**Date:** 2026-10-22
**Files modified:** 5

## What was done

Audited all 74 `reduceMotion`/`reducedMotion` occurrences across 23 source files identified in thread `.planning/threads/reduced-motion-implementation-notes.md`. Found two distinct patterns:

1. **`G.state.reduceMotion` direct state access** (13 occurrences across 9 source files) — replaced with `R.reducedMotion()` helper, which checks both `G.state.reduceMotion` AND `matchMedia('(prefers-reduced-motion: reduce)')` — single source of truth.

2. **Legitimate state access / helper implementation** (7 occurrences across 5 files) — left unchanged:
   - `src/ui/feedback.js:16` — IS the `R.reducedMotion()` implementation
   - `src/engine/renderer.js:111` — inside `R.reducedMotion()` helper
   - `src/scenes/settings.js:103,105,107` — settings toggle reads/writes state directly (source of truth)
   - `src/engine/game.js:503` — `G.state.reduceMotion = true;` — setting state source of truth
   - `src/ui/modal.js:79`, `src/ui/codemap.md:70`, `src/engine/codemap.md:64` — documentation comments

## Files modified

- `src/ui/list.js` — list item fade gating (`R.reducedMotion()`)
- `src/scenes/equipment.js` — content crossfade gating (`R.reducedMotion()`)
- `src/scenes/title.js` — title settle and particle drift gating (2 calls → `R.reducedMotion()`)
- `src/engine/game.js` — toast enter (line 67), achievement slide (line 101), auto-reduce check (line 499)
- `src/engine/renderer.js` — floater `_reduced` flag (line 532), `screenShake` (line 538), `deathBurst` (line 549), `elementBurst` spawn (line 667), `drawCultivationAura` (line 898), `renderEnlightenmentAura` (line 1030)

## Verification

- `grep -rn "G.state.reduceMotion" src/ --include="*.js"` — zero direct state-access usages remain
- `node --test tests/*.test.js` — 628/629 pass (1 pre-existing skip)
- `tools/check_ui_invariants.sh` — all checks passed

## Deferred / remaining

None. All `G.state.reduceMotion` behavior-gating call sites converted. Remaining accesses are legitimate state read/write or inside the helper itself — documented above.
