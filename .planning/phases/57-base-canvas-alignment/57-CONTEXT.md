# Phase 57: Base Canvas Alignment - Context

**Gathered:** 2026-10-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify HUD elements (health, mana, status, currency) maintain correct position and visibility at the 400×720 base canvas size. Discussion clarifies implementation within this boundary — new capabilities belong in other phases.

</domain>

<decisions>
## Implementation Decisions

### Verification method
- **D-01:** Verify HUD alignment at 400×720 using both layout harness visual check AND automated coordinate assertions (not either/or).

</decisions>

<specifics>
## Specific Ideas

None — no specific product references or "I want it like X" moments were raised during discussion. Open to standard approaches.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — HUD-01 through HUD-10 requirements for v12.0 (HUD-01 is the base canvas requirement covered by this phase)
- `.planning/ROADMAP.md` — Phase 57 goal and success criteria (phases 57–64)
- `.planning/PROJECT.md` — v12.0 constraints: no new element types, no WebGL, R.reducedMotion() gating, zero per-frame allocation, vanilla JS immediate-mode Canvas

### Code
- `src/engine/game.js` — shake `ctx.translate` scoped to game loop at line 459; HUD/Notify/Fade/toast render after `ctx.restore()`
- `src/engine/viewport.js` — DPR/logical viewport math and canvas sizing helpers

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UI.Component` factory (`src/ui/component.js`) — immediate-mode component base with `render(ctx)`, `update(dt)`, `contains(px,py)`
- `R` design tokens (`src/engine/renderer.js`) — colors, fonts, radii, drawing helpers used by all UI rendering
- Layout harness tests (`tests/layout_harness.test.js`) — existing viewport matrix tests at 400×720, 540×900, 720×400, 1024×768, 1440×900

### Established Patterns
- HUD drawn last in screen coordinates — `ctx.save()` → `ctx.setTransform(1,0,0,1,0,0)` → draw HUD → `ctx.restore()` (shake `ctx.translate` at `game.js:459` applies before HUD, so HUD is never displaced)
- Screen shake scoped to world/game loop only — HUD/Notify/Fade/toast layers render after `ctx.restore()` and are shake-free
- Zero per-frame allocation — circular buffers for all FX (damage numbers, bursts, click FX); no `push()` in render/update hot paths
- `R.reducedMotion()` gates all animation — null-safe, works in Node tests and browsers

### Integration Points
- `src/engine/game.js:459` — `G.ctx.translate(R.shakeX, R.shakeY)` wraps background + scene content only; HUD renders after `ctx.restore()`
- `src/engine/viewport.js` — DPR/logical viewport math; canvas sizing and fit logic
- `src/engine/renderer.js` — `R.colors.elements` token map (6 elements), `R.reducedMotion()`, `R.springConfigs`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 57-base-canvas-alignment*
*Context gathered: 2026-10-22*
