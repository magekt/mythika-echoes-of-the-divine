---
phase: 42-adaptive-fill-viewport
plan: "01"
subsystem: ui
tags: [viewport, canvas, dpr, visualViewport, safe-area, responsive]

# Dependency graph
requires:
  - phase: 42-adaptive-fill-viewport
    provides: 42-RESEARCH.md fitting-core analysis, 42-UI-SPEC.md design contract, 42-VALIDATION.md
provides:
  - Pure computeViewportDims + initDprBacking module (src/engine/viewport.js)
  - Safe-area-aware adaptive fitGame with per-refit DPR backing (src/engine/game.js)
  - Fill-mode container CSS + precache/fixture updates for the new engine script
affects: [42-02 scene responsive geometry, 42-03 verification contract]

# Tech tracking
tech-stack:
  added: []
  patterns: [pure-logic engine module require()-able in Node via globalThis attach, trailing-edge debounced refit with change-guard realloc skip]

key-files:
  created: [src/engine/viewport.js, tests/viewport_dims.test.js]
  modified: [src/engine/game.js, styles/game.css, index.html, sw.js, tools/layout_harness/expected_pairs.json]

key-decisions:
  - "Followed the LOCKED round() branch rule literally; corrected three plan-arithmetic expectations (865→866, 865→866, 782→783) instead of shipping an overfit formula"
  - "Stored the debounced scheduleRefit consistently in G._resizeHandler/G._orientationHandler so by-reference cleanup removes exactly what was added"
  - "Desktop scale string built via String(scale) so the legacy unconditional-scale line is truly gone"

patterns-established:
  - "Viewport math lives in a DOM-free pure module; game.js only reads visualViewport/safe-area probe and applies results"
  - "Canvas realloc is guarded by G._lastFit (W/H/dpr) so event bursts can never realloc per-event"

requirements-completed: [LAY-08]

# Metrics
duration: 4min
completed: 2026-10-13
---

# Phase 42 Plan 01: Fitting Core Summary

**Adaptive logical viewport (400×866 portrait / 866×400 landscape fill, 400×720 desktop card) with safe-area-aware fitGame, visualViewport refit triggers, and per-refit DPR backing**

## Performance

- **Duration:** 4 min
- **Started:** 2026-10-13T05:08:53Z
- **Completed:** 2026-10-13T05:13:23Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- New `src/engine/viewport.js`: pure `computeViewportDims(vw, vh, dpr, safe)` implementing the LOCKED branch rule (desktop iff NOT (vw<600||vh<500); portrait H=clamp(round(400·vh/vw),400,1000); landscape W=clamp(round(400·vw/vh),400,1000), H=400; dpr capped at 3; insets subtracted before math) plus `initDprBacking` helper; wired into index.html immediately before game.js
- Rewrote `fitGame`: visualViewport sizing with innerWidth/innerHeight fallback, cached safe-area env() probe, phone modes size the container in CSS px + `fill` class + `transform:none`, desktop keeps the byte-equivalent 400×720 card with `scale(min(vw/404,vh/724,1))`; per-refit DPR backing guarded by `G._lastFit`; rotate nudge and viewportProfile tiers unchanged
- Refit triggers: resize + orientationchange + visualViewport resize/scroll all route through trailing-edge 100ms debounce (`G._refitT`); cleanup removes every listener by stored reference and clears pending timers
- CSS: container `box-sizing:border-box`, canvas `width/height:100%`, new `#game-container.fill` borderless/square/shadowless chrome; body centering, safe-area padding, splash and overlay rules untouched
- `tests/viewport_dims.test.js`: 10 passing tests covering all 7 responsive sizes, dpr cap/fallback, safe-area shrink, and the getBoundingClientRect input-mapping pin (input.js untouched)

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing viewport-dims tests (RED)** - `d546c22` (test)
2. **Task 2: Implement viewport.js pure module + wire script tag** - `2568fa2` (feat)
3. **Task 3: Rewrite fitGame + container CSS + refit triggers** - `efb1a4f` (feat)

**Plan metadata:** `(this SUMMARY commit)` (docs: complete plan)

## Files Created/Modified

- `src/engine/viewport.js` - Pure computeViewportDims + initDprBacking, globalThis-attached classic script
- `tests/viewport_dims.test.js` - Dims contract (7 sizes + dpr + safe-area) + input-mapping pin
- `src/engine/game.js` - Adaptive fitGame, readSafeInsets probe, gInit via refit path, debounced listeners + full cleanup
- `styles/game.css` - border-box container, 100% canvas, `.fill` chrome rule
- `index.html` - viewport.js script tag immediately before game.js (no other reorder)
- `sw.js` - viewport.js added to precache ASSETS in load order
- `tools/layout_harness/expected_pairs.json` - localScripts count 99→100 for the new engine script

## Decisions Made

- LOCKED-rule-literal over plan parentheticals (see deviation 1): the formula is normative, the worked numbers were miscomputed; downstream 42-02/42-03 must use the 42-01 values below
- Debounced-fn stored consistently in `G._resizeHandler`/`G._orientationHandler` (plan's conditional branch): game.js's own cleanup removes listeners by reference, so identical refs are required — verified lifecycle.js never touches these refs
- `String(scale)` in the desktop transform (not string-identical legacy line) so the "no unconditional scale" acceptance holds under any grep

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected three viewport test expectations to true round() outputs**
- **Found during:** task 2 (GREEN step — implementation per LOCKED rule produced 866/866/783)
- **Issue:** Plan parentheticals claim `round(865.64)=865` and `round(782.56)=782`, which is arithmetically false; `Math.round` per the LOCKED rule yields H=866 (390×844), W=866 (844×390), H=783 (safe-area case). No standard rounding reproduces all three plan values simultaneously (865.64→down vs 666.67→up vs 782.56→down), so the numbers — not the formula — are the error. 42-01 locked values: portrait 400×866, landscape 866×400, safe-area H=783
- **Fix:** Updated the three assertions in tests/viewport_dims.test.js (866/866/783); implementation follows the LOCKED branch rule verbatim
- **Files modified:** tests/viewport_dims.test.js
- **Verification:** `node --test tests/viewport_dims.test.js` 10/10 green
- **Committed in:** 2568fa2 (task 2 commit)

**2. [Rule 1 - Bug] Bumped layout-harness localScripts fixture 99→100**
- **Found during:** task 3 (full-suite regression)
- **Issue:** `expected_pairs.json: counts match fresh source greps` failed — the new viewport.js `<script>` tag raised the fresh grep to 100 while the fixture still pinned 99
- **Fix:** Updated `counts.localScripts` to 100 (plan verification anticipated: "index.html edit adds engine script")
- **Files modified:** tools/layout_harness/expected_pairs.json
- **Verification:** `node --test tests/layout_harness.test.js` green
- **Committed in:** efb1a4f (task 3 commit)

**3. [Rule 2 - Missing Critical] Added viewport.js to sw.js precache ASSETS**
- **Found during:** task 3 (full-suite regression — `sw.js ASSETS includes every local script from index.html` failed)
- **Issue:** New engine script loaded by index.html was missing from the service-worker precache list, so offline/cached boots would fetch-or-miss a boot-critical file
- **Fix:** Added `'src/engine/viewport.js'` to ASSETS in index.html load order (before game.js)
- **Files modified:** sw.js
- **Verification:** `node --test tests/save_coherence.test.js` green; `node --check sw.js` clean
- **Committed in:** efb1a4f (task 3 commit)

---

**Total deviations:** 3 auto-fixed (2 correctness bugs, 1 missing critical)
**Impact on plan:** All three required for correctness/offline-boot integrity. No scope creep. Deviation 1 changes phase-wide geometry constants: use H/W=866 (not 865) and safe-area H=783 downstream.

## Issues Encountered

- Plan's worked arithmetic (865.6→"round 865", 782.56→"782") contradicts its own LOCKED `round()` rule; resolved per deviation 1. No blockers, no auth gates.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for 42-02 (scene responsive geometry): stub logical sizes against the 42-01 locked values — portrait `{W:400,H:866}`, landscape `{W:866,H:400}`, desktop `{W:400,H:720}`. 42-02-PLAN.md currently stubs 865; its assertions are relative to G (G.H-80 etc.) so only the stub constants need updating, not the geometry logic
- Ready for 42-03 (verification contract): its dims-contract block duplicates viewport expectations and already instructs "if plan 42-01 changed a number, update BOTH files to the 42-01 value" — apply 866/866/783 there, plus the `<what-built>` H=865/W=865 mentions
- Full Node suite: 459 pass / 0 fail / 1 skipped (460 total); `tools/check_ui_invariants.sh` green
- UI-SPEC "≈865" language remains accurate for 866; no spec change needed

## Self-Check: PASSED

- `[ -f src/engine/viewport.js ]` FOUND; `[ -f tests/viewport_dims.test.js ]` FOUND; SUMMARY file itself FOUND
- `git log --oneline --all --grep="42-01"` returns d546c22, 2568fa2, efb1a4f (all three task commits present)
- All task `<acceptance_criteria>` re-verified green post-commit; plan `<verification>` (dims tests green, full suite no-regressions, invariants green) re-run and logged above

---
*Phase: 42-adaptive-fill-viewport*
*Completed: 2026-10-13*
