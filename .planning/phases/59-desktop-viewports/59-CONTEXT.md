# Phase 59: Desktop Viewports - Context

**Gathered:** 2026-10-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify HUD elements (health, mana, status, currency) maintain correct position and visibility at 1024×768 desktop card and 1440×900 desktop viewports. Both desktop viewports use logical 400×720 canvas (desktop card mode per viewport.js), so HUD anchors from Phase 57 carry forward unchanged.

</domain>

<decisions>
## Implementation Decisions

### HUD anchoring at 1024×768 desktop card
- Keep same absolute anchors (x=92, 192, 292, 392) from Phase 57 — logical canvas is 400×720 (desktop card mode), all anchors fit within 400px width. Zero code change.

### HUD anchoring at 1440×900 desktop
- Keep same absolute anchors (x=92, 192, 292, 392) — logical canvas is 400×720 (desktop card mode), all anchors fit. Zero code change.

### HUD y position at desktop viewports
- Keep y=28 (top margin) — consistent across all viewport sizes including desktop.

### Desktop viewports need no HUD adjustment
- Both desktop viewports resolve to logical 400×720 canvas (viewport.js: not phone → W=400, H=720). Only CSS scale factor changes; logical HUD coordinates are unchanged.

</decisions>

<specifics>
## Specific Ideas

None — no specific product references or "I want it like X" moments. Open to standard approaches consistent with Phase 57.

</specifics>

<canonical_refs>
## Canonical References

### Requirements
- `.planning/REQUIREMENTS.md` — HUD-04 (1024×768 desktop card) and HUD-05 (1440×900 desktop) requirements for v12.0
- `.planning/ROADMAP.md` — Phase 59 goal and success criteria (phases 57–64)
- `.planning/PROJECT.md` — v12.0 constraints: no new element types, no WebGL, R.reducedMotion() gating, zero per-frame allocation, vanilla JS immediate-mode Canvas

### Code
- `src/engine/viewport.js` — `computeViewportDims()`: desktop (not phone) → W=400, H=720. Both 1024×768 and 1440×900 are desktop.
- `src/engine/game.js` — `fitGame()`: desktop branch sets el.style.width='400px', el.style.height='720px', CSS scale transform. Logical G.W/G.H remain 400/720.
- `src/ui/button.js:367` — `UI.HUD()` right-align anchors at x=92, 192, 292, 392; y=28.
- `src/engine/game.js:458-462` — shake `ctx.translate` scoped to game loop; HUD drawn within scene render (inside shake transform — Phase 60 concern).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UI.HUD()` (`src/ui/button.js:367-388`) — HUD render, already draws at fixed right-aligned anchors
- `UI.Component` factory (`src/ui/component.js`) — immediate-mode component base
- `R` design tokens (`src/engine/renderer.js`) — colors, fonts, radii
- Layout harness tests (`tests/layout_harness.test.js`) — viewport matrix at 5 sizes including 1024×768 and 1440×900

### Established Patterns
- Desktop card mode: CSS scale transform handles physical size; logical G.W/G.H = 400×720
- HUD positions are static margin-based offsets — no viewport-dependent scaling
- Zero per-frame allocation — circular buffers only

### Integration Points
- `src/engine/viewport.js:30-43` — desktop branch returns W=400, H=720
- `src/engine/game.js:291-298` — desktop card CSS setup
- `src/engine/game.js:457-462` — scene render (including HUD) inside shake transform

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 59-desktop-viewports*
*Context gathered: 2026-10-22*
