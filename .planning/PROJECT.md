# Mythika: Echoes of the Divine

## What This Is

Mythika is a mobile-first cultivation RPG inspired by Indian mythology and lore. It combines idle progression with active tactical combat, party and build choices, exploration, farming, alchemy, and journeys through ascending realms.

Milestone 2 transforms the existing Travel Map from a zone list into a living world. Existing regions gain a visual geography, discoverable landmarks, persistent influence and control states, narrative consequences, and periodic world events—all within the current vanilla JavaScript, Canvas, localStorage, and PWA architecture.

## Core Value

Every play session should feel like a meaningful cultivation journey: the player understands their next path, makes consequential choices, sees those choices reshape the world, and trusts that the resulting state persists.

## Current Shipped State

Milestone v2.0, **Living Map & World State**, shipped on 2026-09-20. The Travel Map is now a persistent visual world surface with landmarks, regional influence/control, narrative echoes, and local dynamic events. The implementation remains vanilla JavaScript, immediate-mode Canvas, localStorage, and PWA-compatible.

Validated requirements: REQ-013 through REQ-020 (8/8). Final integration evidence reports no blockers and 69/69 automated tests pass.

Accepted remaining evidence debt: existing-worker cache activation and legacy-save browser boot; the Phase 11 event walkthrough; and the Phase 12 mobile FPS, dense-map, and reduced-motion walkthrough.

## Requirements

### Validated

- ✓ Active turn-based combat, cultivation, journeys, quests, achievements, economy, farming, alchemy, forge, party, equipment, and zone progression systems exist.
- ✓ Authoritative access gates, safe save hydration, canonical equipment handling, and stable combat math were established in Milestone 1.
- ✓ Mythology-driven narrative encounters already record persistent flags and consequences through save-backed local state.
- ✓ Canvas-based mobile-first screen architecture, semantic visual tokens, reduced-motion support, and PWA delivery are established.

### Validated — v2.0

- ✓ REQ-013 through REQ-020 — Living Map & World State

### Out of Scope

- New zones, realms, or a broad expansion of the world geography.
- Backend synchronization, multiplayer control, live-service scheduling, or server-authoritative events.
- Replacing the immediate-mode Canvas architecture or introducing a frontend framework.
- A broad rewrite of combat, cultivation, economy, or encounter systems beyond the integration points needed to affect world state.
- Deep companion-relationship systems or unrelated content expansion.

## Context

- Existing codebase: vanilla ES6, HTML5 Canvas 2D, Web Audio API, localStorage, PWA; `index.html` loads scripts in dependency order.
- The current `travelMap` scene is a scrollable grouped zone list with authoritative `ZoneAccess` integration.
- Existing encounter flags and consequence markers provide the foundation for environmental storytelling.
- Existing zone progress, journey, encounter, quest, achievement, and economy APIs should remain the canonical sources of player actions and rewards.
- Root and folder `codemap.md` files document scene, system, data, UI, and engine boundaries.

## Constraints

- **Architecture**: Preserve vanilla JavaScript, global namespace conventions, script-order dependencies, and immediate-mode Canvas rendering.
- **Content**: Use existing zones and add landmarks within them; do not create new zones.
- **Persistence**: All world state remains local and save-compatible; malformed or legacy state must fail safe.
- **Interaction**: Design for touch first, with readable targets and coherent desktop behavior.
- **Performance**: The map must render smoothly on mid-range phones without unbounded effects, event records, or scene-local leaks.
- **Accessibility**: Respect `R.reducedMotion()` and existing semantic color/radius conventions.
- **Cultural direction**: Environmental details and event language must treat Indian mythology respectfully.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build on existing zones rather than adding geography | The milestone is about making the known world feel alive, not expanding scope | Existing zone IDs remain canonical |
| Establish persistent world state before visual reactions | Influence, landmarks, narrative echoes, and events need one safe source of truth | World-state continuity is the first delivery boundary |
| Treat the map as a vertical feature, not separate model/API/UI layers | Each phase should produce an observable player capability | Phases progress through complete map behaviors |
| Derive environmental storytelling from existing encounter flags | Reuses Milestone 1 consequences and avoids parallel narrative state | Encounter markers become map inputs |
| Run world events locally | Meets offline/PWA constraints and avoids backend scope | Event lifecycle uses deterministic local timestamps/state |
| Preserve authoritative gameplay APIs | Map actions must not create backdoor reward or progression mutations | Existing systems remain mutation owners |

---
*Last updated: 2026-09-20 after v2.0 milestone*
