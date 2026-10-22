# Phase 64: Full Scene Alignment Audit - Context

**Gathered:** 2026-10-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify all ~27 scenes maintain HUD alignment, with combatScene and travelMap verified as most likely regression points from FX changes. Since HUD now renders last in `gLoopFrame` (after all FX), HUD alignment is maintained across all scenes automatically — this phase is primarily verification.

</domain>

<decisions>
## Implementation Decisions

### All ~27 scenes maintain HUD alignment
- HUD renders last in `gLoopFrame` (after all FX, Fade, Notify, Feedback toasts) — HUD is always on top ✓
- All scenes automatically maintain HUD alignment since HUD is drawn after scene content
- No per-scene HUD alignment changes needed

### combatScene verified
- combatScene.js line 1067 previously called `UI.HUD().render(ctx)` — removed (HUD now renders in game loop)
- combatScene no longer renders HUD inside shake transform ✓
- HUD renders after combat FX (damage numbers, element bursts) — never obscured ✓

### travelMap verified
- travelMap.js doesn't call `UI.HUD().render(ctx)` directly — HUD now renders in game loop ✓
- Travel map content renders inside shake transform, HUD renders after — no overlap ✓

### Scene-toast lane alignment
- `Scene.toastLane()` returns toast lane position — HUD renders after toast lane ✓
- Toast lane alignment maintained across all scenes ✓

</decisions>

<specifics>
## Specific Ideas

None — verification only, driven by Phase 60 game.js change.

</specifics>

<canonical_refs>
## Canonical References

### Requirements
- `.planning/REQUIREMENTS.md` — HUD-10 (all ~27 scenes maintain HUD alignment) requirement for v12.0
- `.planning/ROADMAP.md` — Phase 64 goal and success criteria (phases 57–64)
- `.planning/PROJECT.md` — v12.0 constraints

### Code
- `src/engine/game.js:480` — `UI.HUD().render(G.ctx)` called last in gLoopFrame
- `src/scenes/combatScene.js` — previously called `UI.HUD().render(ctx)` at line 1067, now removed
- `src/scenes/travelMap.js` — travel map content, HUD renders in game loop

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UI.HUD()` (`src/ui/button.js:367-388`) — HUD render, renders last in game loop
- `Scene.toastLane()` — toast lane position function
- `UI.Feedback.renderToasts(G.ctx)` — feedback toasts, renders before HUD

### Established Patterns
- HUD as topmost layer — drawn after all scene content, FX, notifications
- All scenes benefit from HUD rendering last — no per-scene changes needed

### Integration Points
- `src/engine/game.js:462-480` — post-restore draw order: FX → Fade → Notify → Feedback → HUD (last)
- `src/scenes/combatScene.js` — no longer renders HUD inside scene (removed at Phase 60)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 64-full-scene-alignment-audit*
*Context gathered: 2026-10-22*
