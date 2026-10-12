---
created: 2026-10-12T00:00:00Z
title: Implement adaptive fill viewport
area: ui
priority: high
resolves_phase: 42
files:
  - src/engine/game.js
  - index.html
  - src/engine/scene-helpers.js
---

## Problem

Fixed 400x720 viewport scaled with CSS transform clips on some mobile sizes
(see `.planning/notes/mobile-viewport-fitting.md`). Whole game cuts rather
than individual panels overflowing.

## Solution

Implement adaptive fill:

1. Compute available size minus safe-area insets in one place (JS), using
   `visualViewport` height when available, `min(dvh, visualViewport.height)`.
2. Size canvas backing per refit (`G.W * dpr`, dynamic `G.H * dpr`), capped
   `min(devicePixelRatio, 3)`; re-init `ctx.setTransform(dpr, ...)` on
   resize/zoom/orientation, not boot-only.
3. Extend scene backgrounds to fill the real height; anchor HUD top/bottom;
   keep scroll/cull logic (`Scene.responsive`, `Scene.cullButtons`) correct
   for taller/shorter viewports.
4. Refit on `visualViewport.resize`, `resize`, and delayed
   `orientationchange`; fix `box-sizing: border-box` on the game container.
5. Verify no-cut + edge-to-edge at 390x844 and 844x390, plus the AGENTS.md
   responsive set (400x720, 540x900, 720x400, 1024x768, 1440x900).
