---
phase: 30-layout-harness-extension
plan: "01"
subsystem: testing
tags: [canvas, fillText, layout-harness, fail-first, LAY-00]

# Dependency graph
requires:
  - phase: 30-layout-harness-extension context
    provides: [hook-point decision, settled-frame rule, z-flag protocol, fail-first fixture shape]
provides:
  - [fillText recording injector, findViolations assert module, seeded save, frozen expected-pairs oracle, contract tests]
affects: [30-03 sweep wiring, phase-32-34 layout fixes]

# Tech tracking
tech-stack:
  added: []
  patterns: [prototype-wrap observation harness, per-frame box recording with overlay tagging, self-checking fixture counts]

key-files:
  created: [tools/layout_harness/inject.js, tools/layout_harness/assert.js, tools/layout_harness/seeded_save.json, tools/layout_harness/expected_pairs.json, tests/layout_harness.test.js]
  modified: []

key-decisions:
  - "Fixture records FRESH grep counts (fillText 34 / translate 21 / clip 6 / localScripts 94); plan estimates (36/23) were stale — test locks counts to source"
  - "Box y is the alphabetic baseline extending upward 1.2x px; per-box clip snapshot with opts.clip fallback"
  - "Zone pair marked TENTATIVE pending 30-03 live sweep; combat + bazaar pairs grounded in render code"

patterns-established:
  - "Harness observes via prototype wrap + call-through; never alters rendering or state"
  - "Self-checking fixture: contract test recounts hook points from src/ so drift fails loudly"

requirements-completed: [LAY-00]

# Metrics
duration: 45min
completed: 2026-10-09
---

# Phase 30 Plan 01 Summary

**Text-bounds proof-harness core built: every fillText call recorded as a game-coordinate box with overlay tagging, intersection/canvas/clip asserts in one pure-Node module, and a frozen fail-first oracle.**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-10-09
- **Completed:** 2026-10-09
- **Tasks:** 3/3
- **Files modified:** 5 created, 0 game-code touched

## Accomplishments

- `tools/layout_harness/inject.js`: classic pre-game script wrapping `CanvasRenderingContext2D.prototype.fillText` (measureText width, 1.2x px height, textAlign adjust, getTransform to game coords, call-through identical args) + save/restore/rect/clip tracking (rect-then-clip is the game's only clip pattern, all 6 sites) + `window.__layoutHarness` protocol (overlay flag, endFrame snapshot+reset, selfCheck leakage guard). No-op unless `?layout=1`; pure math exported for Node tests.
- `tools/layout_harness/assert.js`: `findViolations(boxes, {W,H,clip,allowlist})` — overlay skip, pairwise intersect area > 1px², canvas/clip outset > 2px, allowlist split into `waived` (never dropped). Stable `{kind,a,b,boxes}` finding shape consumed by 30-03.
- `tools/layout_harness/seeded_save.json`: loadable `mythika_save` envelope (version 1): reduceMotion true, 5-hero Lv3 party, aryavarta 45%, gold 5000, 10-item inventory (8+ sell rows), empty alchemyRecipes (recipe scrolls always offered on Buy).
- `tools/layout_harness/expected_pairs.json`: frozen oracle — 4 pairs (2 solid combat: HP-over-MP text, title-over-story log; 1 solid bazaar `Recipe: `/`Teaches ` name-over-desc; 1 tentative zone `Next encounter`/`Exploring `), full 25-scene registry with 20-scene checked subset + sweep variants.
- `tests/layout_harness.test.js`: 15 tests green (box math via stub ctx, transform/DPR, overlay/leakage/clip protocol, all assert rules, fixture shape, live source-recount).

## Verification

- `node --test tests/layout_harness.test.js`: 15/15 pass
- `node --check` on inject.js + assert.js: clean
- `tools/check_ui_invariants.sh`: green; `git diff --check`: clean
- Full suite `node --test tests/*.test.js`: 402/402 pass

## Fail-first status

Oracle frozen, not yet proven live — Plan 30-03 runs the sweep against the unpatched build and must exit nonzero reproducing all pairs (tentative zone pair confirmed or corrected to true renders there).

## Files changed

- created tools/layout_harness/inject.js, assert.js, seeded_save.json, expected_pairs.json, tests/layout_harness.test.js
