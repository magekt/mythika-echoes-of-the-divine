# Phase 60 Summary: Shake Scoping & HUD Isolation

**Phase:** 60 — Shake Scoping & HUD Isolation  
**Milestone:** v12.0 — Visual Polish & Combat FX  
**Status:** Complete ✅  
**Date:** 2026-10-22

## Goal

Verify screen shake never displaces HUD/UI layers — shake `ctx.translate` scoped to game loop render region only; HUD/Notify/Fade/toast render after `ctx.restore()`.

## What Was Done

1. **Root cause found:** `UI.HUD().render(ctx)` was called from within each scene's `render()` method, executing at `game.js:461` — inside the `ctx.translate(R.shakeX, R.shakeY)` block (game.js:458-462). HUD was drawn before `ctx.restore()` at line 462, so HUD WAS displaced by screen shake (violating HUD-06).

2. **Fix:** Moved `UI.HUD().render(G.ctx)` into `gLoopFrame` in `src/engine/game.js`, AFTER `G.ctx.restore()` at line 462. HUD now renders once per frame after the shake transform is popped, locked to screen position.

3. **Removed** `UI.HUD().render(ctx)` calls from 10 scene files (12 occurrences total): debug.js, bazaar.js, alchemyScene.js, forge.js, party.js (2), trials.js, combatScene.js, farm.js, questLog.js, achievementsScene.js.

4. **Verified** Notify/Fade/toast already render after `ctx.restore()` (game.js:475-477) — no changes needed.

5. **Added** 2 HUD shake regression tests in `tests/hud_alignment.test.js` verifying HUD positions are identical with shake active vs inactive, and at all shake intensities.

## Decisions

- Centralize HUD rendering in game loop (one call after `ctx.restore()`) rather than per-scene with transform reset — cleaner architecture, single point of control.
- Notify/Fade/toast already correctly isolated — no changes needed.

## Files Created/Modified

| File | Action |
|------|--------|
| `src/engine/game.js` | Modified — added `UI.HUD().render(G.ctx)` after `ctx.restore()` |
| `src/scenes/debug.js` | Modified — removed `UI.HUD().render(ctx)` |
| `src/scenes/bazaar.js` | Modified — removed `UI.HUD().render(ctx)` |
| `src/scenes/alchemyScene.js` | Modified — removed `UI.HUD().render(ctx)` |
| `src/scenes/forge.js` | Modified — removed `UI.HUD().render(ctx)` |
| `src/scenes/party.js` | Modified — removed 2x `UI.HUD().render(ctx)` |
| `src/scenes/trials.js` | Modified — removed `UI.HUD().render(ctx)` |
| `src/scenes/combatScene.js` | Modified — removed `UI.HUD().render(ctx)` |
| `src/scenes/farm.js` | Modified — removed `UI.HUD().render(ctx)` |
| `src/scenes/questLog.js` | Modified — removed `UI.HUD().render(ctx)` |
| `src/scenes/achievementsScene.js` | Modified — removed `UI.HUD().render(ctx)` |
| `tests/hud_alignment.test.js` | Extended — +2 HUD shake regression tests |
| `.planning/phases/60-shake-scoping-hud-isolation/60-01-PLAN.md` | Created |
| `.planning/phases/60-shake-scoping-hud-isolation/60-CONTEXT.md` | Created |
| `.planning/phases/60-shake-scoping-hud-isolation/60-VERIFICATION.md` | Created |
| `.planning/phases/60-shake-scoping-hud-isolation/60-SUMMARY.md` | Created |

## Next Phase

Phase 61: Combat FX vs HUD Separation — verify combat FX (damage numbers, element bursts, shake) never obscure critical HUD information at any viewport size.
