# Phase 22: Affinity Foundation & Persistence - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Per-hero affinity (0–100 with tier thresholds) visible on the hero surface and persisted through save-compatible world state. This phase builds the meter + save shape only; gains, dialogue, and bonuses come in Phases 23–24.

</domain>

<decisions>
## Implementation Decisions

### Affinity Display
- Thin meter bar under the hero portrait + tier name, matching the HP/MP bar pattern on `UI.HeroSurface` compact and detail variants.

### Tiers
- DAO-style thresholds: Wary 0, Trusted 25, Sworn 50, Legend 90. Legend is a hard-earned peak.

### Unrecruited Heroes
- Affinity hidden until recruited; no meter, no gains while absent. Recruitment seeds 0 (Wary).

### Save Shape
- `G.state.affinity = { heroId: 0–100 }` alongside party state; `SaveSystem.migrate` defaults missing map to {}; world-state normalize clamps 0–100, drops unknown hero keys, guards proto-pollution (same pattern as `WorldState`).

### OpenCode's Discretion
- Exact bar geometry, colors per tier, and migrate-version bump mechanics.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UI.HeroSurface` compact/detail renderers (party.js card pattern: bars + right-gutter values).
- `SaveSystem.migrate` defaults + `WorldState` normalize/clamp/drop-unknown-keys pattern.
- `src/data/heroes.js` hero IDs as affinity keys.

### Established Patterns
- Read-only view-models; canonical systems own mutations (affinity writes belong to a small `BondSystem` or encounter hook in later phases — this phase: state shape + display + persistence only).
- `R.reducedMotion()` for any meter animation; semantic `R.colors`.

### Integration Points
- HeroSurface compact (party list, combat) + detail (party inspect, equipment, cultivation).
- Save/load round-trip (`save_coherence.test.js` conventions).

</code>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decided display/tier/recruitment rules.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
