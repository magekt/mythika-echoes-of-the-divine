# Phase 56 — Combat Integration + Tests

**Commit:** `cad464d`
**Date:** 2026-10-16

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
- `node --test tests/*.test.js` — 605/606 pass (1 pre-existing skip)
- `bash tools/check_ui_invariants.sh` — all checks passed
