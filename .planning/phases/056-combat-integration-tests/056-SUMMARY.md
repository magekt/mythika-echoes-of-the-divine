# Phase 56 — Combat Integration + Tests

**Commit:** `cad464d`
**Date:** 2026-10-16
**Status:** Complete — verified via `056-VERIFICATION.md`

## What shipped

### combatScene.js
- **Player attack site** (`doPlayerAttack`): added `R.elementBurst(enemyX, enemyY - 20, playerElement, result.isCrit)` inside the existing 200ms delay block, alongside `R.damageNumber`. Element derived from `hero.ailment` (agni→fire, shila→ice, vayu/vajra→lightning, else→dark).
- **Reaction/enemy hit site** (`resolveReactionAction`): added `R.elementBurst(targetIdx*70+30, 30, reactionElement, result.isCrit||false)` alongside the existing `R.damageNumber` call. Element derived from `enemy.ailment` using the same mapping.

### tests/damage_fx.test.js (new)
11 tests across 3 suites:
- `R.elementBurst` — spawn counts (6 normal / 10 crit), reduced-motion suppression, element color correctness, unknown-element default fallback, `updateElementBursts` life decay, `renderElementBursts` no-throw
- `R.damageNumber` — floater entry shape, null-color default
- Element mapping — ailment→element key mapping matches combatScene.js logic; `R.colors.elements` covers all keys

## Verification
- `node --test tests/damage_fx.test.js` — 11/11 pass
- `node --test tests/*.test.js` — 628/629 pass (1 pre-existing skip)
- `bash tools/check_ui_invariants.sh` — all checks passed

## Cross-Phase Integration

- Depends on Phase 54 (`054-damage-floater-foundation`): `R.damageNumber` called at both hit sites with `{element, crit}` opts
- Depends on Phase 55 (`055-element-burst-particles`): `R.elementBurst` called at both hit sites with ailment-derived element keys
- `damageFlash` screen shake preserved and gated behind reduced-motion; `UI.Feedback.Toast` flow unchanged
