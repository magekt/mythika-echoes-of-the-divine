# v3.0 Requirements — Screen & Gameplay Revamp

**Milestone:** v3.0
**Date:** 2026-09-20
**Goal:** Make the complete player journey cohesive and effective across every screen, with clean responsive UI and stronger internal architecture.

## v3.0 Requirements

### Screen Flow & Responsive Foundation

- **REQ-021:** A player can move between the title/load flow, Ashram, Travel Map, zone exploration, combat, party, cultivation, inventory/equipment, quests, and settings using consistent labeled navigation, back behavior, and transition handling.
- **REQ-022:** Every revamped screen presents a readable title/context, current state, one dominant next action, and a recoverable empty, locked, loading, or error state on phone and desktop layouts.
- **REQ-023:** Core screens reflow at narrow portrait, large portrait, landscape, and desktop viewport sizes while preserving readable text, visible controls, logical Canvas hit coordinates, safe-area margins, and touch/mouse/keyboard parity.

### Gameplay & Character Effectiveness

- **REQ-024:** Combat presents non-overlapping action, turn/intent, reaction, combat-log, and result states, and a player can complete an attack-to-reward flow without losing context.
- **REQ-025:** Party, combat, cultivation, equipment, and result screens present a consistent reusable hero identity surface showing the relevant hero, role, health/progression, equipment, and actionable upgrade state.
- **REQ-026:** Canonical gameplay actions expose immediate and persistent feedback for rewards, XP, currency, realm progress, unlocks, and state changes without duplicating authoritative mutations.
- **REQ-027:** Locked or blocked actions explain the reason and the next meaningful unlock step, while contextual guidance remains dismissible and does not interrupt normal play with a generic tour.

### Canvas Presentation & Assets

- **REQ-028:** Revamped screens use semantic Canvas-first background and character presentation slots with cached authored imagery or deterministic fallback layers that never block entry or obscure gameplay controls.
- **REQ-029:** Background and character presentation remains readable, reduced-motion compliant, and performant at representative mobile and desktop sizes, with no unbounded per-frame asset/effect allocation.

### Architecture & Diagnostics

- **REQ-030:** Core navigation and at least one high-connectivity player journey use explicit route, screen-context, selector/command, and lifecycle seams while existing global APIs remain compatible during migration.
- **REQ-031:** Scene, component, timer, listener, modal, effect, and cache ownership is explicit enough that repeated screen entry/exit does not retain stale controls, callbacks, selections, or transient state.
- **REQ-032:** Deprecated navigation/helpers and obsolete code are removed only after call-site/runtime compatibility evidence, with legacy saves, direct boot, cached boot, and untouched scenes remaining recoverable.
- **REQ-033:** Settings provides a disabled-by-default debug toggle that enables bounded local diagnostics for frame timings, scene transitions, input/layout state, persistence, and invariant failures without changing gameplay or logging noisy data in normal play.
- **REQ-034:** The complete player loop—load or start, navigate, inspect, act, receive outcome, save, reload, and return—works across representative phone and desktop profiles with no unexpected console errors, stable performance, and reduced-motion support.

## Future / Out of Scope

- Online backend, authentication, multiplayer, cloud synchronization, server-authoritative events, or remote telemetry.
- Framework, renderer, bundler, ES-module, or global/immediate-mode architecture replacement.
- New zones, realms, broad progression systems, deep companion relationships, or unrelated content expansion.
- Elaborate always-on particles/parallax, generic tutorial tours, icon-only critical actions, or a dense dashboard redesign.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REQ-021 | Phase 13 | Complete |
| REQ-022 | Phase 13 | Complete |
| REQ-023 | Phase 13 | Complete |
| REQ-024 | Phase 14 | Pending |
| REQ-025 | Phase 15 | Pending |
| REQ-026 | Phase 16 | Pending |
| REQ-027 | Phase 16 | Pending |
| REQ-028 | Phase 17 | Pending |
| REQ-029 | Phase 17 | Pending |
| REQ-030 | Phase 18 | Pending |
| REQ-031 | Phase 19 | Pending |
| REQ-032 | Phase 19 | Pending |
| REQ-033 | Phase 20 | Pending |
| REQ-034 | Phase 20 | Pending |

**Coverage:** 14/14 v3.0 requirements mapped exactly once; no orphans or duplicates.

## Archived Requirements

REQ-013–REQ-020 remain validated in `.planning/milestones/v2.0-REQUIREMENTS.md` and are not redefined in the active v3.0 scope.
