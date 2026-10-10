# Phase 18: Modular Navigation & Screen Seams — Context

**Gathered:** 2026-10-08  
**Status:** Ready for execution planning  
**Requirement:** REQ-030

<domain>
## Phase Boundary

Introduce explicit compatibility-preserving architecture boundaries for high-connectivity screen flows. Core navigation requests use canonical route IDs with transient parameters, predictable transitions, and failure recovery. The Ashram → Travel Map → Zone Exploration → Combat slice consumes explicit screen context, selectors/commands, and lifecycle seams while legacy callers still work. Screen rendering reads derived presentation data; gameplay actions remain owned by canonical systems.

The phase includes automated source/contract coverage. It does not include new screens, background/asset pipeline (Phase 17), diagnostics implementation (Phase 20), or broad lifecycle cleanup (Phase 19).
</domain>

<decisions>
## Locked Decisions

### D-01 — Canonical route IDs with transient params
- Define route IDs: `ashram`, `travelMap`, `zoneExploration:{zoneId}`, `combat:{encounterId}`, `party`, `equipment`, `cultivation`, `settings`.
- Transient params passed via `gScene(routeId, pushHistory, { param: value })` — not stored in G.state.
- Legacy direct scene calls (e.g., `gScene('combatScene', ...)`) continue to work via compatibility layer.

### D-02 — Explicit screen context, selectors, commands
- Each migrated screen declares `contextSchema` (what it reads from G.state) and `commandSchema` (what actions it can dispatch).
- Context: derived presentation data only (e.g., `partySummary`, `zoneStatus`, `heroSurfaceModel`).
- Commands: canonical system calls only (e.g., `EquipmentSystem.equip`, `Combat.start`, `CultivationSystem.addCultivationBase`).
- No screen-local mutations of gameplay state.

### D-03 — Predictable transition + failure recovery
- All route transitions go through `Scene.transition(from, to, params)` with: fade out → cleanup from → init to → fade in.
- Failure modes: invalid route → fallback to ashram + Notify; missing params → derive from G.state + Notify; system unavailable → disabled actions + blocker tooltip (Phase 16).
- Transition state tracked in `G.state.transition = { from, to, params, timestamp }` for debugging.

### D-04 — Legacy compatibility layer
- `gScene` retains current signature; new `Navigation.go(routeId, params)` is the canonical API.
- Compatibility wrapper maps legacy scene names to route IDs.
- No breaking changes to existing scene `enter/leave` signatures.

### D-05 — Phase 13/14/15/16/17 contracts preserved
- Responsive layout, labeled navigation, combat bands, hero surface, feedback components all unchanged.
- New architecture only affects navigation requests and screen initialization data flow.

## OpenCode's Discretion

- Choose exact `contextSchema`/`commandSchema` format (plain object with validators).
- Choose `Scene.transition` implementation (reuse Fade + new transition manager).
- Choose compatibility wrapper location (Scene or new Navigation module).
- Choose debug/probe integration for transition tracing.

</decisions>

<canonical_refs>
- `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`
- `.planning/research/ARCHITECTURE.md`, `.planning/research/FEATURES.md`, `.planning/research/PITFALLS.md`, `.planning/research/STACK.md`
- `codemap.md`, `STYLE_GUIDE.md`, `src/engine/codemap.md`, `src/scenes/codemap.md`, `src/ui/codemap.md`
- `src/engine/scene.js`, `src/engine/game.js`, `src/main.js`
- `src/scenes/ashram.js`, `src/scenes/travelMap.js`, `src/scenes/zoneExploration.js`, `src/scenes/combatScene.js`, `src/scenes/party.js`, `src/scenes/equipment.js`, `src/scenes/cultivationScene.js`
- `.planning/phases/13-responsive-screen-grammar-navigation/13-CONTEXT.md`, `13-03-SUMMARY.md`
- `.planning/phases/14-combat-gameplay-readability/14-CONTEXT.md`, `14-01-SUMMARY.md`
- `.planning/phases/15-character-party-surfaces/15-CONTEXT.md`, `15-02-SUMMARY.md`
- `.planning/phases/16-guidance-progression-feedback/16-CONTEXT.md`
- `.planning/phases/17-canvas-backgrounds-asset-ready/17-CONTEXT.md`
</canonical_refs>

<deferred>
- New screens, background/asset pipeline (Phase 17), diagnostics implementation (Phase 20), broad lifecycle/deprecated-code cleanup (Phase 19).
</deferred>