# Phase 59 Summary: Desktop Viewports

**Phase:** 59 — Desktop Viewports  
**Milestone:** v12.0 — Visual Polish & Combat FX  
**Status:** Complete ✅  
**Date:** 2026-10-22

## Goal

Verify HUD elements (health, mana, status, currency) maintain correct position and visibility at 1024×768 desktop card and 1440×900 desktop viewports.

## What Was Done

1. Confirmed both desktop viewports use logical 400×720 canvas (desktop card mode per viewport.js — not phone since uw>=600 AND uh>=500).
2. HUD anchors (x=92, 192, 292, 392; y=28) from Phase 57 fit within logical 400×720 canvas at both desktop viewports — zero code change needed.
3. Extended `tests/hud_alignment.test.js` with 4 new tests (HUD-04 × 2, HUD-05 × 2) covering anchor fit and horizontal ordering at both desktop viewports.
4. Ran layout harness: 15/15 pass at all 5 viewport sizes.
5. Ran `check_ui_invariants.sh`: all checks passed.
6. Full test suite: 643/644 pass (1 pre-existing skip), 0 fail.

## Decisions

- HUD x anchors unchanged from Phase 57 (x=92, 192, 292, 392) — consistency, zero code change.
- HUD y position unchanged (y=28, top margin) — consistent across all viewports.
- Desktop card mode uses CSS scale transform; logical G.W/G.H remain 400/720, so HUD coordinates are unchanged.

## Files Created/Modified

| File | Action |
|------|--------|
| `tests/hud_alignment.test.js` | Extended — +4 tests for desktop viewports |
| `.planning/phases/59-desktop-viewports/59-01-PLAN.md` | Created — plan with 6 tasks, all complete |
| `.planning/phases/59-desktop-viewports/59-CONTEXT.md` | Created — smart discuss context |
| `.planning/phases/59-desktop-viewports/59-VERIFICATION.md` | Created — verification results |
| `.planning/phases/59-desktop-viewports/59-SUMMARY.md` | Created — this file |

## Next Phase

Phase 60: Shake Scoping & HUD Isolation — verify screen shake never displaces HUD/UI layers. Key finding from Phase 57: HUD is drawn within scene render (game.js:461), which is inside the `ctx.translate(R.shakeX, R.shakeY)` block (game.js:458-462) — HUD WILL be displaced by shake. This phase addresses that concern.
