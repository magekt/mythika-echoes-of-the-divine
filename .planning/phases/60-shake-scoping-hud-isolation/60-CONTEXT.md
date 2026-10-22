# Phase 60: Shake Scoping & HUD Isolation - Context

**Gathered:** 2026-10-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify screen shake never displaces HUD/UI layers — shake `ctx.translate` scoped to game loop render region only; HUD/Notify/Fade/toast render after `ctx.restore()`. Key finding from Phase 57: `UI.HUD()` is called from within scene render methods at `game.js:461`, which is INSIDE the `ctx.translate(R.shakeX, R.shakeY)` block (game.js:458-462). HUD is drawn BEFORE `ctx.restore()` at line 462, so HUD IS displaced by screen shake — violating HUD-06.

</domain>

<decisions>
## Implementation Decisions

### HUD render location fix
- Move `UI.HUD().render(G.ctx)` from individual scene render methods into `gLoopFrame` in `src/engine/game.js`, AFTER `G.ctx.restore()` at line 462. Single centralized change: HUD rendered once per frame after shake transform is restored, so HUD is never displaced by shake.
- Remove `UI.HUD().render(ctx)` calls from all scenes that call it (debug.js, bazaar.js, alchemyScene.js, forge.js, party.js, trials.js, combatScene.js, farm.js, questLog.js, achievementsScene.js).

### Notify/Fade/toast shake verification
- `Notify.render(G.ctx)` at game.js:476 — renders after `ctx.restore()`, shake-free ✓
- `Fade.render(G.ctx)` at game.js:475 — renders after `ctx.restore()`, shake-free ✓
- `UI.Feedback.renderToasts(G.ctx)` at game.js:477 — renders after `ctx.restore()`, shake-free ✓
- All three already correctly isolated; no changes needed.

### HUD shake regression test
- Add test verifying HUD positions are identical with shake active vs inactive (mock `R.shakeX`/`R.shakeY` non-zero, assert HUD anchor positions unchanged).

</decisions>

<specifics>
## Specific Ideas

None — no specific product references. Fix is driven by Phase 57 finding that HUD is inside shake transform.

</specifics>

<canonical_refs>
## Canonical References

### Requirements
- `.planning/REQUIREMENTS.md` — HUD-06 (screen shake never displaces HUD/UI layers) requirement for v12.0
- `.planning/ROADMAP.md` — Phase 60 goal and success criteria (phases 57–64)
- `.planning/PROJECT.md` — v12.0 constraints: R.reducedMotion() gating, zero per-frame allocation, vanilla JS immediate-mode Canvas

### Code
- `src/engine/game.js:458-462` — shake `ctx.translate` + `ctx.restore()` scoping; HUD drawn inside shake block — BUG to fix
- `src/engine/game.js:475-477` — Fade, Notify, Feedback render after `ctx.restore()` — already correct
- `src/ui/button.js:367-388` — `UI.HUD()` definition
- Scene files calling `UI.HUD().render(ctx)`: debug.js:154, bazaar.js:228, alchemyScene.js:177, forge.js:295, party.js:845/878, trials.js:314, combatScene.js:1067, farm.js:192, questLog.js:392, achievementsScene.js:147

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UI.HUD()` (`src/ui/button.js:367-388`) — HUD render, draws gold/prana/level/cultivation at fixed anchors
- `UI.Component` factory — immediate-mode component base
- `R.reducedMotion()` — null-safe motion gate
- Layout harness tests — viewport matrix at 5 sizes

### Established Patterns
- Game loop: `G.ctx.save()` → `G.ctx.translate(shakeX, shakeY)` → draw background + scene → `G.ctx.restore()` → draw FX/Fade/Notify/Feedback
- HUD should be drawn in the post-restore section (like Fade/Notify/Feedback) but currently isn't
- Zero per-frame allocation — no `push()` in render hot paths

### Integration Points
- `src/engine/game.js:gLoopFrame()` — single place to add HUD render after `ctx.restore()`
- Multiple scene files — each calls `UI.HUD().render(ctx)` inside scene render (inside shake transform)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 60-shake-scoping-hud-isolation*
*Context gathered: 2026-10-22*
