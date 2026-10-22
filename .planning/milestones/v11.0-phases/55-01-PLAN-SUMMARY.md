---
phase: 055-element-burst-particles
plan: 01
status: completed
date: 2026-10-16
tasks_completed: 6/6
files_changed:
  - src/engine/renderer.js
  - src/systems/combatFx.js
  - src/systems/combat.js
  - src/scenes/combatScene.js
  - tests/damage_burst.test.js
test_results:
  - tests/damage_burst.test.js: 15/15 pass
  - full suite: 594/595 pass (1 skipped)
notes:
  - combatFx.js rewritten to delegate to R.elementBurst — no internal particle arrays
  - combat.js now passes isCrit as 4th arg to CombatFX.spawn
  - test uses vm.createContext with __result trick to leak const R from module scope
---

# Phase 55 Plan 01 — Element Burst Particles: Summary

## What was delivered

1. **`R.colors.elements`** token map (fire/ice/lightning/dark/holy/default) added to `renderer.js` — additive, Phase 52 pattern
2. **`R.elementBurst(x, y, element, crit)`** — pre-allocated 60-slot circular buffer; normal=6 particles, crit=10; slot reuse in place, zero per-frame allocation
3. **`R.updateElementBursts(dt)`** — in-place mutation, object identity preserved
4. **`R.renderElementBursts(ctx)`** — renders active particles with fade-out alpha
5. **`combatFx.js`** rewritten — delegates all three methods to `R.*` equivalents; public API unchanged (`spawn`, `update`, `render`)
6. **`combat.js:557`** — passes `isCrit` to `CombatFX.spawn` so crit bursts are larger
7. **`combatScene.js`** — `R.updateElementBursts(dt)` in update loop; `R.renderElementBursts(ctx)` after `CombatFX.render`
8. **`tests/damage_burst.test.js`** — 15 tests: spawn counts, all element colors, default fallback, reduced-motion suppression, in-place identity, empty-buffer render, wraparound, expiry, crit vs normal size

## Test results

- `tests/damage_burst.test.js`: **15/15 pass**
- Full suite (`node --test tests/*.test.js`): **594/595 pass** (1 skipped, 0 fail)
- `node --check` on all 5 modified files: **all clean**
- `git diff --check`: **clean**

## Deviations from plan

- `R.elementBurst` signature changed from `(ctx, x, y, element, crit)` in plan to `(x, y, element, crit)` — `ctx` not needed since particles render via `R.renderElementBursts(ctx)` separately. This matches how `R.screenShake` and other effect APIs work (no ctx param).
- `combat.js` `isCrit` is passed directly from the damage calc scope rather than re-derived from `result` — cleaner, avoids the double-read.
