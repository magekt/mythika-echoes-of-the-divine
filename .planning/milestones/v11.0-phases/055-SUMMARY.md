# Phase 55 — Element Burst Particles

**Commit:** `cad464d`
**Date:** 2026-10-16
**Status:** Complete — verified via `055-VERIFICATION.md`

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
- Full suite (`node --test tests/*.test.js`): **628/629 pass** (1 skipped, 0 fail)
- `node --check` on all 5 modified files: **all clean**
- `git diff --check`: **clean**

## Deviations from plan

- `R.elementBurst` signature changed from `(ctx, x, y, element, crit)` in plan to `(x, y, element, crit)` — `ctx` not needed since particles render via `R.renderElementBursts(ctx)` separately. This matches how `R.screenShake` and other effect APIs work (no ctx param).
- `combat.js` `isCrit` is passed directly from the damage calc scope rather than re-derived from `result` — cleaner, avoids the double-read.

## Cross-Phase Integration

- Depends on Phase 54 (`054-damage-floater-foundation`): `R.colors.elements` token table consumed by burst particle colors; `R.springConfigs` (Phase 51) reused
- Feeds into Phase 56 (`056-combat-integration-tests`): `R.elementBurst` called at player→enemy and enemy→hero hit sites with ailment-derived element keys
