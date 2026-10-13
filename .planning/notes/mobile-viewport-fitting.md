---
title: Mobile viewport fitting decisions
date: 2026-10-12
context: explore — whole-game fixed viewport cuts on some mobile sizes
---

## Problem

Same UI ships for mobile and desktop. The game runs in a fixed 400x720
logical viewport (`src/engine/game.js:fitGame`, `G.W/G.H`) scaled with a CSS
`transform: scale(min(vw/404, vh/724, 1))`. On certain phone sizes part of
the game is cut off. Not a per-screen panel bug — the whole viewport clips.

## Cause (confirmed via code + research)

- `transform: scale()` does not reflow: the container keeps ~404x724 layout
  size, so `transform-origin: center center` + `overflow: hidden` crops edges.
- Scale math uses full `window.innerWidth/innerHeight`, ignoring safe-area
  insets (notch), dynamic browser chrome (URL bar show/hide), and the
  `content-box` border adding ~2px to the layout box.
- Canvas backing (`G.canvas.width = G.W * dpr`) is set once at boot, never
  re-initialized on resize/zoom/orientation change.
- Input mapping is safe: `src/engine/input.js` maps via
  `getBoundingClientRect()`, which reflects transforms.

## Options considered

- **A — Safe contain (minimal):** `box-sizing: border-box`, safe-area-aware
  scale, refit on `visualViewport.resize` + delayed `orientationchange`,
  DPR re-init on resize. Keeps all 400x720 scene code untouched. Never cuts;
  small themed bars on odd aspect ratios.
- **B — Adaptive fill (chosen):** dynamic canvas height to the real aspect,
  extend backgrounds to fill, anchor HUD top/bottom, let scroll content use
  extra vertical space. Fills every pixel edge-to-edge; touches scene layout.

## Decision

Adaptive fill (Option B). Rationale: user priority is a cleaner mobile feel
with no cut content and no dead side bars; letterboxing was acceptable as a
fallback but not the desired end state.

## Implications

- Scene backgrounds must paint the extended area (ties to LAY-07 backgrounds
  harness: sample corners + center, assert against clear color).
- HUD/chrome needs top/bottom anchors; scroll regions need content-height
  vs viewport-height logic (`Scene.responsive`, `Scene.cullButtons`).
- Refit triggers: `visualViewport.resize`, `resize`, delayed
  `orientationchange`; size against `min(dvh, visualViewport.height)`.
- Verify at 390x844 and 844x390 plus 400x720, 540x900, 720x400, 1024x768,
  1440x900 per AGENTS.md responsive checklist.
