# Phase 48 — Panels & Modals: Nested Shells Plan 01

## Objective
Migrate `src/ui/panel.js` and `src/ui/modal.js` to the Phase 46/47 renderer
primitives (`R.doubleBezel`, `R.easePremium`, `R.reducedMotion`) so panels and
modal shells render as nested "Doppelrand" enclosures, with interpolated
overlay backdrops, a 40ms button-cascade enter, and media-aware reduced motion.

## Requirements coverage
- **PAN-01** `UI.Panel` renders through `R.doubleBezel` — DONE (panel.js:34-66)
- **PAN-02** `UI.Modal` panel uses the double-bezel shell; overlay backdrop alpha
  interpolates (not instant) — DONE (modal.js `_paint`, overlay via
  `R.colors.overlay` × `R.easePremium(m._overlayProgress)`)
- **PAN-03** Modal buttons enter with a 40ms stagger cascade during the modal
  enter animation — DONE (modal.js `render` + `_paint`; `m._btnProgress[i]`)
- **PAN-04** Modal/panel reduced-motion is media-aware via `R.reducedMotion()`
  instead of the manual `G && G.state && G.state.reduceMotion` check — DONE
  (modal.js `render` + panel.js `update` both call `R.reducedMotion()`)

## Files modified
- `src/ui/panel.js`
  - Added `enterProgress: 0` field.
  - Added `update(dt)`: reduced-motion → `enterProgress = 1`; otherwise
    `enterProgress = Math.min(1, enterProgress + dt / 0.25)`.
  - Rewrote `render`: flat `R.roundRect` + manual `strokeRect` path replaced
    with `R.doubleBezel(ctx, x, y, w, h, { shellFill, shellStroke, radius: R.radius.m })`.
    Alpha (`R.easePremium(enterProgress)`) wraps the bezel + title render only;
    children render at full opacity (buttons own their alpha).
- `src/ui/modal.js`
  - Added state fields: `_created: 0`, `_overlayProgress: 0`, `_btnProgress: []`.
  - `_paint`: overlay fill now `R.colors.overlay` at
    `ctx.globalAlpha = m._alpha * R.easePremium(m._overlayProgress)`; panel shell
    `R.roundRect`+manual stroke → `R.doubleBezel(ctx, m.x, m.y, m.w, m.h,
    { shellFill: m.color || R.colors.panel, shellStroke: m.borderColor || R.colors.hairline,
    radius: R.radius.l })`; button loop now applies `ctx.globalAlpha = R.easePremium(m._btnProgress[i])`
    per button (40ms stagger), restoring `globalAlpha = 1` after each.
  - `render`: drives enter progress on first render (`m._created = performance.now()`);
    computes `m._overlayProgress` (250ms ramp) and `m._btnProgress[i]`
    (250ms + 40ms×i start, 400ms window). Ghost dissolve now uses
    `R.easePremium(1 - t)`. All `G.state.reduceMotion` refs replaced with
    `const reduceMotion = R.reducedMotion()`. `handleInput` / `dismiss` logic
    untouched.
- `tests/panels.test.js` (new)
  - Node `node:test` + `node:assert/strict`. MockCtx + stubbed `R` primitives.
  - Covers: Panel.render routes through `R.doubleBezel`; Panel.update instant
    under reduced motion; Modal `_overlayProgress` ramps 0→mid→1 over time;
    `_overlayProgress` instantly 1 under reduced motion; button cascade ordering
    (button[0] fully in before button[1]).

## Test results
- `node --check src/ui/panel.js && node --check src/ui/modal.js && node --check tests/panels.test.js`
  → SYNTAX_OK
- `node --test tests/panels.test.js` → 5/5 pass
- `node --test tests/*.test.js` (full suite) → 501 pass, 0 fail, 1 skipped
- `tools/check_ui_invariants.sh` → "All checks passed." (104 files syntax,
  26 system scripts, no raw centered-scale patterns)
- `python3 tools/verify_matrix.py --budget 6000` → "RESULT: all 3 profiles
  booted clean" (desktop, phone, phone-land)

## Caveats
- `UI.Panel.update(dt)` has no global rAF hook yet. Phase 48 added the method
  and field; scenes that create `UI.Panel` instances must call `panel.update(G.dt)`
  in their update cycle to drive the enter ramp. Panels used in diagnostics are
  the only current factory consumer. No consumer wiring was added (out of
  scope, per "only edit panel.js").
- The prompt's line-number references in modal.js were approximate; the actual
  file structure (shared `_paint` painter, 120ms enter easeOutCubic + 100ms
  ghost dissolve) was preserved and extended rather than rewritten per literal
  line numbers.
- No commit made (per "Do NOT commit").
