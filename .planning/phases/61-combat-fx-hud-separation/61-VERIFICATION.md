# Phase 61: Combat FX vs HUD Separation — Verification

**Status:** passed  
**Phase:** 61 — Combat FX vs HUD Separation  
**Requirement:** HUD-07  
**Date:** 2026-10-22

## Results

Combat FX never obscure HUD — HUD renders last in `gLoopFrame`, on top of all FX, Fade, Notify, and Feedback toasts.

| Task | Description | Status |
|------|-------------|--------|
| T1 | Verify HUD.render() called after all FX render calls in game.js | Passed |
| T2 | Source-order test verifying HUD after R.renderEffects/R.renderClickFx | Passed |
| T3 | Verify HUD positions unchanged when combat FX active | Passed |
| T4 | Full test suite + check_ui_invariants.sh | Passed |
| T5 | Verify HUD-07 at all 5 viewport sizes | Passed |

## Draw Order Verification

**gLoopFrame draw order (src/engine/game.js:462-480):**
1. `G.ctx.restore()` — shake transform popped
2. `R.renderProjectiles(G.ctx)` — projectiles
3. `R.renderEffects(G.ctx)` — element bursts (combat FX)
4. `R.renderClickFx(G.ctx)` — click FX
5. `R.renderLevelUp(G.ctx)` — level up FX
6. `R.renderEnlightenmentAura(G.ctx, G.dt)` — enlightenment aura
7. `Fade.render(G.ctx)` — fade overlay
8. `Notify.render(G.ctx)` — notifications
9. `UI.Feedback.renderToasts(G.ctx)` — feedback toasts
10. **`UI.HUD().render(G.ctx)` — HUD (LAST, topmost)** ✓

HUD is the final draw call — all combat FX render underneath it, never obscuring HUD information.

## Test Results

- `tests/hud_alignment.test.js`: 17/17 pass (includes 2 new HUD-07 tests)
- `tests/layout_harness.test.js`: 15/15 pass
- Full suite: 647/648 pass (1 pre-existing skip), 0 fail
- `check_ui_invariants.sh`: All checks passed

## Coverage

HUD-07 fully verified: combat FX never obscure critical HUD info at any viewport size. HUD renders last at all 5 viewport sizes (400×720, 540×900, 720×400, 1024×768, 1440×900).
