# Mythika: Echoes of the Divine

## What This Is

Mythika is a mobile-first cultivation RPG inspired by Indian mythology and lore. It combines idle progression with active tactical combat, party and build choices, exploration, farming, alchemy, and journeys through ascending realms.

Milestone 2 transformed the existing Travel Map from a zone list into a living world. Milestone v3.0 now makes the complete player journey cohesive and effective across every screen, with clean responsive UI, Canvas-first presentation, and stronger internal architecture—within the current vanilla JavaScript, Canvas, localStorage, and PWA architecture.

## Core Value

Every play session should feel like a meaningful cultivation journey: the player understands their next path, makes consequential choices, sees those choices reshape the world, and trusts that the resulting state persists.

## Current Shipped State

Milestone v3.0, **Screen & Gameplay Revamp**, shipped on 2026-10-09. The complete player journey is now cohesive across every screen: responsive grammar with canonical navigation, readable combat and hero surfaces, shared feedback, Canvas-first backgrounds, lifecycle guards, evidence-led cleanup, and opt-in diagnostics. The implementation remains vanilla JavaScript, immediate-mode Canvas, localStorage, and PWA-compatible.

Validated requirements: REQ-013 through REQ-034 (22/22). Final audit reports contract-level green (202/202 tests + UI invariants) with live-browser evidence deferred as accepted residual.

Accepted remaining evidence debt: v2.0 worker/cache activation, legacy-save boot, event walkthrough, and mobile FPS/dense-map/reduced-motion walkthroughs — plus the v3.0 10-combination full-loop journey matrix (all rows pending).

## Shipped Milestone v3.0 — Screen & Gameplay Revamp

**Goal (achieved):** Make the complete player journey cohesive and effective across every screen, with clean responsive UI and stronger internal architecture.

**Active requirements direction:** Deliver end-to-end screen interconnectivity, mobile/desktop UI revamp, Canvas-first backgrounds and character screens, modular seams with deprecated-code removal, configurable high-value diagnostics behind a Settings debug toggle, and clearer player guidance/gameplay effectiveness. Every change must preserve authoritative gameplay systems and make the next meaningful player action understandable.

**Context:** v2.0 established a persistent living map but left broader screen cohesion, responsive validation, combat/character readability, lifecycle cleanup, and browser evidence debt. Research recommends improving the existing immediate-mode Canvas/global architecture incrementally rather than introducing a framework, bundler, backend, or parallel state store.

**Date:** 2026-09-20

## Requirements

### Validated

- ✓ Active turn-based combat, cultivation, journeys, quests, achievements, economy, farming, alchemy, forge, party, equipment, and zone progression systems exist.
- ✓ Authoritative access gates, safe save hydration, canonical equipment handling, and stable combat math were established in Milestone 1.
- ✓ Mythology-driven narrative encounters already record persistent flags and consequences through save-backed local state.
- ✓ Canvas-based mobile-first screen architecture, semantic visual tokens, reduced-motion support, and PWA delivery are established.

### Validated — v2.0

- ✓ REQ-013 through REQ-020 — Living Map & World State

### Validated — v3.0

- ✓ REQ-021, REQ-022, REQ-023 — Responsive screen grammar, navigation flow, responsive viewports (Phase 13)
- ✓ REQ-024 — Combat readability bands and attack-to-reward flow (Phase 14)
- ✓ REQ-025 — Canonical hero identity surface across character screens (Phase 15)
- ✓ REQ-026, REQ-027 — Progression feedback and locked/blocked guidance (Phase 16)
- ✓ REQ-028, REQ-029 — Canvas backgrounds, asset-ready presentation, readability/perf/reduced-motion (Phase 17)
- ✓ REQ-030 — Modular navigation seams with legacy compatibility (Phase 18)
- ✓ REQ-031, REQ-032 — Lifecycle safety and evidence-led deprecated-code cleanup (Phase 19)
- ✓ REQ-033, REQ-034 — Settings diagnostics toggle and full-loop acceptance contracts (Phase 20)

### Out of Scope

- New zones, realms, or a broad expansion of the world geography.
- Backend synchronization, multiplayer control, live-service scheduling, or server-authoritative events.
- Replacing the immediate-mode Canvas architecture or introducing a frontend framework.
- A broad rewrite of combat, cultivation, economy, or encounter systems beyond the integration points needed to affect world state.
- Deep companion-relationship systems or unrelated content expansion.

### v3.0 Boundaries

- No online backend, authentication service, multiplayer, cloud sync, or server authority.
- No framework, renderer, bundler, ES-module migration, or replacement of vanilla JS, Canvas 2D, script order, or global/immediate-mode conventions.
- No new zones, realms, broad progression systems, or unrelated lore/content expansion.
- Backgrounds and character presentation use asset-ready slots and authored/cached fallbacks; elaborate always-on particle/parallax treatment is deferred.
- Diagnostics are opt-in and local only; no telemetry upload or production debug noise.

## Context

- Existing codebase: vanilla ES6, HTML5 Canvas 2D, Web Audio API, localStorage, PWA; `index.html` loads scripts in dependency order.
- Shipped v3.0 with 8 phases / 23 plans; 55 files changed (+3862/−284) since v2.0; suite at 202/202 + UI invariants green.
- New engine seams: `Navigation` (canonical routes + legacy `gScene` wrapper), `Scene.create` lifecycle auto-wrap, `R.Backgrounds` semantic slots, `UI.HeroSurface` read-only view-model, `UI.Feedback` toast/hint/badge/blocker library, `Diagnostics` opt-in collectors.
- The Travel Map is a persistent visual world surface (v2.0) now reached through canonical navigation with lifecycle guards and background presentation (v3.0).
- Existing encounter flags and consequence markers provide the foundation for environmental storytelling.
- Existing zone progress, journey, encounter, quest, achievement, and economy APIs remain the canonical sources of player actions and rewards.
- Root and folder `codemap.md` files document scene, system, data, UI, and engine boundaries.
- Browser-evidence debt now spans v2.0 + v3.0 and should be scheduled early next milestone rather than re-deferred.

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
| Preserve v2 as the validated baseline | v3.0 improves presentation and seams without reopening shipped world-state contracts | REQ-013–REQ-020 remain archived and unchanged |
| Use vertical screen slices over horizontal rewrites | Players receive complete, testable journeys while architecture improves incrementally | New facades adapt existing globals and systems |
| Gate diagnostics from Settings | Browser evidence needs high-value visibility without polluting normal play | Local bounded probes are disabled unless the debug toggle is enabled |
| Treat Canvas and asset slots as presentation seams | Authored backgrounds and character moments can evolve without changing gameplay authority | Semantic asset keys, cached/fallback layers, and immediate-mode drawing remain canonical |
| Migrate via compatibility facades, not rewrites | The vanilla-JS global runtime cannot break mid-milestone | Navigation.go + gScene wrapper, Scene.create auto-wrap, read-only selectors — all legacy callers still work ✓ Good |
| Remove deprecated code only with runtime evidence | Script order and indirect global references evade static search | 19-REMOVALS.md call-site/runtime proof + save-fixture hydration before deletion ✓ Good |
| Keep feedback presentation-owned but mutation-free | Toasts/hints must never duplicate authoritative rewards | Global drain in game loop; Feedback gap closed 2026-10-09 ✓ Good |
| Accept browser-evidence deferral at milestone scope (v2 precedent) | Human browser matrix is the bottleneck, not code | v3.0 shipped gaps_found with a defined 10-combination matrix; debt now spans two milestones — ⚠️ Revisit (schedule early next milestone) |

---
*Last updated: 2026-10-09 after v3.0 milestone*
