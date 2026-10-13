# Phase 37 Verification

**Phase:** 37-onboarding-polish
**Requirements:** ONB-01, ONB-02, ONB-03
**Date:** 2026-10-10
**Status:** All automated contracts green; live UAT (visual tour inspection) deferred

## Automated
- `node --check src/systems/tour.js` — clean
- `node --check src/systems/gloss.js` — clean
- `node --check src/scenes/zoneExploration.js` — clean
- `node --check src/scenes/characterCreate.js` — clean
- `node --check src/scenes/ashram.js` — clean
- `node --test tests/*.test.js` — 449/449 passed
- `tools/check_ui_invariants.sh` — all passed

## ONB-01 — Guided First-Battle Tour ✓
- `src/systems/tour.js`: 5-callout state machine; `start()` gated by `combatCount === 0` + `tourSeen.firstBattle` unset; `advance()` persists `tourSeen.firstBattle=true` on completion
- `src/scenes/zoneExploration.js`: `TourSystem.start('firstBattle')` in `enter()`; tap-intercept in `update()`; `TourSystem.render(ctx)` at end of `render()`

## ONB-02 — Stat Gloss Annotations ✓
- `src/systems/gloss.js`: 7-stat gloss map (STR/AGI/MAG/DEF/HP/MP/CRT)
- `src/scenes/characterCreate.js`: HP/STR/MAG/MP glosses drawn in `R.fonts.xs` below bonus line on first step-0 render; `__step0GlossesShown` flag suppresses repeats

## ONB-03 — Journey HUD Badge ✓
- `src/scenes/ashram.js`: gold chip at y=248 with journey icon + name; drawn only when `G.state.journeys.active` set and journey not completed

## Deferred
- Visual UAT: first-battle tour on real browser (tap-through) — consistent with v3.0–v5.0 accepted residual
- Ashram journey badge visual check at 390x844 / 844x390 — layout sweep not yet run for Phase 37 specifically

## Production defects fixed by this phase
1. `tools/layout_harness/expected_pairs.json` count drift after new script tags — refreshed to localScripts=96, fillText=41
