# Phase 60: Shake Scoping & HUD Isolation — Verification

**Status:** passed  
**Phase:** 60 — Shake Scoping & HUD Isolation  
**Requirement:** HUD-06  
**Date:** 2026-10-22

## Results

HUD is now isolated from screen shake — `UI.HUD().render()` is called in `game.js:gLoopFrame` after `ctx.restore()`, so shake `ctx.translate` never displaces HUD/UI layers.

| Task | Description | Status |
|------|-------------|--------|
| T1 | Move UI.HUD() render to game.js after ctx.restore() | Passed |
| T2–T11 | Remove UI.HUD().render() from 10 scene files (12 occurrences) | Passed |
| T12 | HUD shake regression test | Passed (2 tests) |
| T13 | Full test suite + check_ui_invariants.sh | Passed |
| T14 | Verify HUD/Notify/Fade/toast render after ctx.restore() | Verified |

## Fix Summary

**Before (buggy):** `UI.HUD().render(ctx)` was called from within each scene's `render()` method, which executes at `game.js:461` — inside the `ctx.translate(R.shakeX, R.shakeY)` block (game.js:458-462). HUD was drawn BEFORE `ctx.restore()` at line 462, so HUD WAS displaced by screen shake.

**After (fixed):** `UI.HUD().render(G.ctx)` is called once in `gLoopFrame` after `G.ctx.restore()` at line 462. HUD renders in screen coordinates after the shake transform is popped, so it stays locked to screen position regardless of shake intensity.

**Scene files modified (UI.HUD().render(ctx) removed):**
- debug.js, bazaar.js, alchemyScene.js, forge.js, party.js (2 occurrences), trials.js, combatScene.js, farm.js, questLog.js, achievementsScene.js

**Notify/Fade/toast — already correct (no changes needed):**
- `Fade.render(G.ctx)` at game.js:475 — after `ctx.restore()`
- `Notify.render(G.ctx)` at game.js:476 — after `ctx.restore()`
- `UI.Feedback.renderToasts(G.ctx)` at game.js:477 — after `ctx.restore()`

## Test Results

- `tests/hud_alignment.test.js`: 15/15 pass (includes 2 new HUD-06 shake tests)
- `tests/layout_harness.test.js`: 15/15 pass
- Full suite: 645/646 pass (1 pre-existing skip), 0 fail
- `check_ui_invariants.sh`: All checks passed

## Coverage

HUD-06 fully verified: screen shake never displaces HUD/UI layers at any intensity.
