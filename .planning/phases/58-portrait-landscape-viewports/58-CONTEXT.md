# Phase 58: Portrait & Landscape Viewports - Context

**Gathered:** 2026-10-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify HUD elements (health, mana, status, currency) maintain correct position and visibility at 540×900 tall portrait and 720×400 landscape viewports. HUD anchoring decisions from Phase 57 carry forward — discussion clarifies how HUD positions map to non-base viewports, not what the HUD contains.

</domain>

<decisions>
## Implementation Decisions

### HUD x anchoring at 540×900 portrait
- Keep same absolute anchors (x=92, 192, 292, 392) from Phase 57 — consistency, zero code change. Logical canvas at portrait is 400×666 (viewport.js clamp), so all anchors fit within 400px width.

### HUD x anchoring at 720×400 landscape
- Keep same absolute anchors (x=92, 192, 292, 392) — consistency, zero code change. Logical canvas at landscape is 720×400, so anchors fit with extra right-side space.

### HUD y position at 720×400 landscape
- Keep y=28 (top margin) — HUD belongs at top of canvas, consistent across all viewport sizes. 400px height provides ample vertical room.

### Cultivation element at landscape width
- Keep x=392 anchor — consistency, zero code change. Wider 720px canvas means more empty right-side space, but anchor position unchanged for cross-viewport consistency.

</decisions>

<specifics>
## Specific Ideas

None — no specific product references or "I want it like X" moments were raised. Open to standard approaches consistent with Phase 57.

</specifics>

<canonical_refs>
## Canonical References

### Requirements
- `.planning/REQUIREMENTS.md` — HUD-02 (540×900 portrait) and HUD-03 (720×400 landscape) requirements for v12.0
- `.planning/ROADMAP.md` — Phase 58 goal and success criteria (phases 57–64)
- `.planning/PROJECT.md` — v12.0 constraints: no new element types, no WebGL, R.reducedMotion() gating, zero per-frame allocation, vanilla JS immediate-mode Canvas

### Code
- `src/engine/viewport.js` — `computeViewportDims()`: portrait W=400, H=clamp(400*uh/uw,400,1000); landscape H=400, W=clamp(400*uw/uh,400,1000). At 540×900 → 400×666; at 720×400 → 720×400.
- `src/engine/game.js` — `fitGame()` applies computed dims; `G.W`/`G.H` are logical coordinates all rendering uses.
- `src/ui/button.js:367` — `UI.HUD()` right-align anchors at x=92, 192, 292, 392; y=28 (margin=12, iconSize=24).
- `src/engine/game.js:458-462` — shake `ctx.translate` scoped to game loop; HUD drawn within scene render (inside shake transform — Phase 60 concern).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UI.HUD()` (`src/ui/button.js:367-388`) — HUD render function, already draws at fixed right-aligned anchors
- `UI.Component` factory (`src/ui/component.js`) — immediate-mode component base
- `R` design tokens (`src/engine/renderer.js`) — colors, fonts, radii
- Layout harness tests (`tests/layout_harness.test.js`) — viewport matrix tests at 5 sizes including 540×900 and 720×400

### Established Patterns
- HUD positions are static margin-based offsets — no viewport-dependent scaling
- Logical canvas coordinates (G.W, G.H) are used by all rendering; CSS handles physical scaling
- `R.reducedMotion()` gates all animation — null-safe
- Zero per-frame allocation — circular buffers only

### Integration Points
- `src/engine/viewport.js:30-43` — `computeViewportDims()` determines logical W/H per viewport
- `src/engine/game.js:271-313` — `fitGame()` applies dims to canvas and CSS
- `src/engine/game.js:457-462` — scene render (including HUD) inside shake transform, then restore

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 58-portrait-landscape-viewports*
*Context gathered: 2026-10-22*
