# Research: Adaptive Fill Viewport (v7.0, inline — subagents not installed)

**Date:** 2026-10-12
**Scope:** Single-requirement milestone (LAY-08). No parallel researcher agents
available (`agents_installed: false`); this file stands in for
STACK/FEATURES/ARCHITECTURE/PITFALLS + SUMMARY for v7.0 only.

## Current fitting stack (verified in code)

- `src/engine/game.js:fitGame` — `scale = min(vw/404, vh/724, 1)` from
  `window.innerWidth/innerHeight`; applies CSS `transform: scale()` with
  `transform-origin: center center`. Canvas backing `G.W*dpr × G.H*dpr`
  (dpr capped at 3) set once at boot (`gInit`).
- `styles/game.css` — body `100dvh` + `env(safe-area-*)` padding + flex
  centering; `#game-container` fixed `400×720`, `box-sizing: content-box`
  (3px border adds ~6px to layout box), `max-width/max-height` calc minus
  safe-area insets, `overflow: hidden`. Short-landscape media query flips
  origin to `center top` (fights the JS `center center`).
- `src/engine/input.js` — all pointer mapping via `getBoundingClientRect()`
  scaled by `G.W/r.width`: resolution-independent, safe under any
  scale/resize/origin. No input changes needed.
- `src/engine/scene-helpers.js:Scene.responsive` — returns fixed safe/header/
  primary/back rects derived from `G.W/G.H`; anchors assume 720 height.
  Adaptive fill must re-anchor `primary`/`back` to real height.
- `index.html` — `viewport-fit=cover` already set (good).

## What adaptive fill entails (table stakes)

1. One place computes available CSS px: `visualViewport` size when present
   else `innerWidth/Height`, minus `env()` safe-area insets once (CSS and JS
   currently both subtract → double-count).
2. Refit triggers: `visualViewport.resize` + `resize` + delayed
   `orientationchange` (mobile chrome makes `innerHeight` jump mid-gesture).
3. Size canvas backing per refit and re-`setTransform(dpr,…)` (currently
   boot-only); keep dpr cap 3.
4. Extend scene backgrounds into the extra height (ties to LAY-07 background
  slot contract); anchor HUD chrome top/bottom; keep scroll/cull math
  (`clipContent`, `cullButtons`) consistent with real content height.
5. Fix `box-sizing` on the container and unify `transform-origin` (JS vs CSS
   media query disagree).

## Watch out for

- Double-counted safe-area (body padding + container max-* + JS full vw/vh).
- `transform: scale()` never reflows: any `center center` + `overflow:hidden`
  combo crops; verify with real-device chrome (URL bar show/hide).
- Auth input overlays are absolutely positioned in container space — recheck
  alignment after container sizing changes.
- Landscape squeeze: current code just shows a "rotate" hint; LAY-08 demands
  real landscape fill (844x390), so `Scene.responsive` landscape branch needs
  real anchor values, not fixed 720-based rects.
- No new dependencies: everything needed (`visualViewport`, `dvh`, `env()`)
  is already in the existing stack. No research beyond this file required.
