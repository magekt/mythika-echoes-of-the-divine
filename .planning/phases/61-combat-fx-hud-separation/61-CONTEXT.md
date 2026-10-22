# Phase 61: Combat FX vs HUD Separation - Context

**Gathered:** 2026-10-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify Combat FX (damage numbers, element bursts, shake) never obscure or overlap critical HUD information at any viewport size. With HUD now rendering last in `game.js:gLoopFrame` (after all FX, Fade, Notify, Feedback), HUD is always on top — FX never visually obscure HUD information.

</domain>

<decisions>
## Implementation Decisions

### Combat FX draw order vs HUD
- HUD renders LAST in `gLoopFrame` (after `R.renderEffects`, `R.renderClickFx`, `Fade.render`, `Notify.render`, `UI.Feedback.renderToasts`) — HUD is always on top, FX never obscure HUD ✓
- No code change needed — already handled by Phase 60 game.js modification

### Damage floater vs HUD visual overlap
- Damage floaters render at impact points (combat hit sites), HUD at top-right (x=392 anchor)
- HUD on top means floaters are visually behind HUD — acceptable, HUD remains readable
- No Z-ordering changes needed

### Element burst vs HUD at different viewports
- Element bursts at impact points, HUD anchors at fixed positions (92, 192, 292, 392; y=28)
- HUD on top at all viewport sizes — burst visuals behind HUD, HUD readable
- No viewport-specific adjustment needed

### FX draw-order test
- Add test verifying `UI.HUD().render` is called after all FX render calls in `gLoopFrame`
- Verify by checking game.js source ordering

</decisions>

<specifics>
## Specific Ideas

None — fix driven by Phase 60 game.js change (HUD moved to render last).

</specifics>

<canonical_refs>
## Canonical References

### Requirements
- `.planning/REQUIREMENTS.md` — HUD-07 (combat FX never obscure critical HUD info) requirement for v12.0
- `.planning/ROADMAP.md` — Phase 61 goal and success criteria (phases 57–64)
- `.planning/PROJECT.md` — v12.0 constraints

### Code
- `src/engine/game.js:gLoopFrame` — HUD.render(G.ctx) called last after all FX/Fade/Notify/Feedback
- `src/engine/renderer.js` — `R.renderEffects`, `R.renderClickFx`, `R.renderProjectiles` — combat FX rendering

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UI.HUD()` (`src/ui/button.js:367-388`) — HUD render, renders last in game loop
- `R.renderEffects(G.ctx)` — element burst rendering (combat FX)
- `R.renderClickFx(G.ctx)` — click FX rendering
- `R.renderProjectiles(G.ctx)` — projectile rendering

### Established Patterns
- Draw order in gLoopFrame: background → scene (inside shake) → restore → FX → Fade → Notify → Feedback toasts → HUD (last)
- HUD as topmost layer — consistent with standard game UI layering

### Integration Points
- `src/engine/game.js:462-477` — post-restore draw order: projectiles → effects → click FX → level up → enlightenment → Fade → Notify → Feedback → HUD

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 61-combat-fx-hud-separation*
*Context gathered: 2026-10-22*
