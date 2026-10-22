# Phase 54 — Damage Floater Foundation

**Commit:** `c9a7f80`
**Date:** 2026-10-16

## What shipped

### src/engine/renderer.js
- **DMG-01:** `R.damageNumber(ctx, x, y, value, color, opts)` — `opts = {element, crit, heal}`. Backward compatible: old 5-arg call sites unaffected.
- **DMG-01/02:** Pre-allocated spring state (`_spring`) attached at spawn via a shared critically-damped spring factory (`FLOATER_SPRING`). Stepped in place by `R.updateEffects`; no per-frame object allocation.
- **DMG-03:** Element tint from `R.colors.elements` tokens (fire/ice/lightning/dark/holy/default). Icon chip (double-arc) rendered left of the number for non-default elements. Heal shows `+` prefix in green.
- **DMG-04:** Crit floaters: gold emphasis ring, larger 20px font, longer life (1.4s vs 1s).
- **DMG-05:** `G.state.reduceMotion` → `_reduced` flag captured at spawn; update path skips spring and sets `scale = 1` (instant appear + fade, no bounce).

### src/scenes/combatScene.js
- Player attack + reaction hit sites now pass `{element, crit}` to `R.damageNumber`, matching the `R.elementBurst` calls already wired in Phase 56.

### tests/damage_floater.test.js (new, 17 tests)
- DMG-01: opts signature, field storage, pre-allocated spring
- DMG-02: spring scale increases over time; no per-frame allocation (object identity preserved)
- DMG-03: element tint correctness (fire/ice/unknown/holy)
- DMG-04: crit life + flag
- DMG-05: reduced-motion instant scale, normal spring animation
- renderEffects integration: no-throw for element/crit/heal/reduced-motion

### tests/damage_fx.test.js (updated)
- Null-color default test updated: now defaults to element primary (not red) after Phase 54 change.

### tools/layout_harness/expected_pairs.json
- `fillText` count 36 → 37 (one new `ctx.fillText` in the floater render path).

## Verification
- `node --test tests/damage_floater.test.js` — 17/17 pass
- `node --test tests/*.test.js` — 622/623 pass (1 pre-existing skip)
- `bash tools/check_ui_invariants.sh` — all checks passed

## Note
Phase 54 was previously marked ✅ in ROADMAP.md but had never been implemented. This commit is the actual implementation. The `src/effects/` module files listed in the original 54-01-PLAN.md were a planning draft and were superseded by this renderer.js-centric approach (no separate effect modules needed — all floater state lives in the pre-allocated circular buffer).
