# Phase 61 Summary: Combat FX vs HUD Separation

**Phase:** 61 — Combat FX vs HUD Separation  
**Milestone:** v12.0 — Visual Polish & Combat FX  
**Status:** Complete ✅  
**Date:** 2026-10-22

## Goal

Verify Combat FX (damage numbers, element bursts, shake) never obscure or overlap critical HUD information at any viewport size.

## What Was Done

1. **Confirmed** HUD renders last in `gLoopFrame` (src/engine/game.js:480) — after all FX (projectiles, effects, click FX, level up, enlightenment aura), Fade, Notify, and Feedback toasts. HUD is always the topmost layer.
2. **Added** 2 HUD-07 tests in `tests/hud_alignment.test.js`:
   - Source-order test: verifies HUD.render() appears after R.renderEffects, R.renderClickFx, Notify.render, UI.Feedback.renderToasts in game.js
   - Viewport coverage test: verifies HUD anchors fit within the smallest logical canvas (400×666 portrait) at all viewport sizes
3. **Ran** full test suite: 647/648 pass (1 pre-existing skip), 0 fail
4. **Ran** check_ui_invariants.sh: all checks passed

## Decisions

- HUD renders last — zero additional code changes needed (Phase 60 game.js modification already established correct draw order)
- Combat FX render underneath HUD — HUD always readable during FX playback
- No viewport-specific HUD adjustments needed — anchors fit all logical canvas sizes

## Files Created/Modified

| File | Action |
|------|--------|
| `tests/hud_alignment.test.js` | Extended — +2 HUD-07 tests (source-order + viewport coverage) |
| `.planning/phases/61-combat-fx-hud-separation/61-01-PLAN.md` | Created |
| `.planning/phases/61-combat-fx-hud-separation/61-CONTEXT.md` | Created |
| `.planning/phases/61-combat-fx-hud-separation/61-VERIFICATION.md` | Created |
| `.planning/phases/61-combat-fx-hud-separation/61-SUMMARY.md` | Created |

## Next Phase

Phase 62: Layout Harness Regression — layout harness tests pass at all 5 viewport sizes after all HUD alignment changes.
