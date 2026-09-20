# Roadmap: Mythika — Delivery Roadmap

## Completed Milestones

### v2.0 — Living Map & World State ✅ SHIPPED (2026-09-20)

7 phases, 17 plans, and 69/69 tests complete. REQ-013 through REQ-020 validated. Full phase history and requirement outcomes: [v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md) · [v2.0-REQUIREMENTS.md](milestones/v2.0-REQUIREMENTS.md) · [v2.0-phases/](milestones/v2.0-phases/). Final audit: [v2-MILESTONE-AUDIT.md](v2-MILESTONE-AUDIT.md) (`tech_debt`, no blockers).

Accepted residual browser evidence: existing-worker cache activation/legacy-save boot, Phase 11 event walkthrough, and Phase 12 mobile FPS/dense-map/reduced-motion walkthrough.

## Backlog

- New zones or realms.
- Backend synchronization, multiplayer control, and server-driven live events.
- Deep companion relationship systems.

## Phases

**Phase Numbering:** Milestone 1 completed Phases 1–5; Milestone 2 continues at Phase 6.

- [x] **Phase 6: World-State Continuity** - Players' evolving world state survives reloads and legacy saves safely. (completed 2026-09-19; automated v11/save evidence green, browser follow-up human-needed)
- [x] **Phase 7: Visual Region Map** - Players navigate distinct existing regions through a clear touch-first map. (completed 2026-09-17)
- [x] **Phase 8: Landmark Discovery** - Players discover and inspect persistent points of interest in existing zones. (completed 2026-09-17)
- [x] **Phase 9: Regional Influence & Control** - Player actions visibly change regional influence and control. (completed 2026-09-17)
- [x] **Phase 10: Environmental Narrative Echoes** - Encounter choices visibly reshape regional presentation. (complete)
- [x] **Phase 11: Dynamic World Events** - Periodic local events appear, progress, and resolve through the map. (completed 2026-09-20; manual browser check for 11-02 flagged in STATE.md)
- [x] **Phase 12: Living Map Performance & Stability** - The complete map stays smooth, leak-free, and accessible on mobile. (completed 2026-09-19; manual browser check waived by user)

## Phase Details

### Phase 6: World-State Continuity
**Goal**: Players can leave and return to an evolving world without losing, corrupting, or replaying its state.
**Depends on**: Milestone 1 complete
**Requirements**: REQ-015
**Success Criteria** (what must be TRUE):
  1. A new or legacy save opens with a valid world state and retains all unrelated player progress.
  2. Regional state, discovered landmarks, influence/control, narrative echoes, and event state survive save/load round trips.
  3. Partial or malformed world-state data falls back safely without crashing or making the Travel Map inaccessible.
  4. Reloading does not replay one-time discoveries, transitions, or resolved-event outcomes.
**Plans**: 3 plans

Plans:
- [x] 06-01-PLAN.md — Define and test the canonical defensive world-state contract.
- [x] 06-02-PLAN.md — Integrate legacy-safe save migration and prove round-trip continuity.
- [x] 06-03-PLAN.md — Close service-worker coherence evidence: verify authoritative v11, current precache/fetch strategy, and reconcile UAT metadata.

**UI hint**: yes

### Phase 7: Visual Region Map
**Goal**: Players can understand and navigate the existing world as distinct regions rather than a zone list.
**Depends on**: Phase 6
**Requirements**: REQ-013, REQ-019
**Success Criteria** (what must be TRUE):
  1. Every existing zone appears in a geographically distinct visual region with its canonical name and realm identity.
  2. Locked, available, active, and completed regions are distinguishable, with requirements and progress still readable.
  3. A tap selects the intended region and reveals its status and next available action without accidental activation during pan/scroll.
  4. The full select, inspect, back/close, and enter flow works on the 400×720 touch viewport and with a desktop pointer.
**Plans**: 2 plans

Plans:
- [x] 07-01-PLAN.md — Define map layout data and MapHelpers (zone status, lock reasons, influence queries).
- [x] 07-02-PLAN.md — Rewrite travelMap.js as a spatial visual region map with touch pan and detail panel.
**UI hint**: yes

### Phase 8: Landmark Discovery
**Goal**: Players can reveal and inspect persistent landmarks within existing regions as they explore.
**Depends on**: Phase 7
**Requirements**: REQ-014
**Success Criteria** (what must be TRUE):
  1. Existing regions visibly distinguish undiscovered, newly discovered, and known landmarks.
  2. Progress, encounter choices, or world-state conditions can reveal a landmark once without duplicate rewards or notices.
  3. Tapping a discovered landmark shows its lore, regional relevance, and any available action in a readable detail view.
  4. A discovered landmark remains discovered after leaving the map and reloading the game.
**Plans**: 2 plans

Plans:
- [x] 08-01-PLAN.md — Create landmark data definitions and discovery engine (landmarks.js + landmarks system).
- [x] 08-02-PLAN.md — Integrate landmark indicators and detail view into travel map scene.
**UI hint**: yes

### Phase 9: Regional Influence & Control
**Goal**: Players can see their canonical gameplay actions shift regional influence and control.
**Depends on**: Phase 8
**Requirements**: REQ-016
**Success Criteria** (what must be TRUE):
  1. Completing a qualifying zone, encounter, journey, or boss action changes the relevant region's influence exactly once.
  2. The map clearly shows each region's current alignment/control and progress toward its next state.
  3. After an influence change, the player can identify what changed and which action caused it.
  4. Regional control remains bounded, deterministic, and unchanged by merely rendering or reopening the map.
**Plans**: 2 plans

Plans:
- [x] 09-01-PLAN.md — Create influence rules data (influence_rules.js) and authoritative influence engine (influence.js).
- [x] 09-02-PLAN.md — Wire zone completion, boss defeat, encounter choice, and journey completion into Influence API.
**UI hint**: yes

### Phase 10: Environmental Narrative Echoes
**Goal**: Players can see prior encounter choices reflected in the world they revisit.
**Depends on**: Phase 9
**Requirements**: REQ-017
**Success Criteria** (what must be TRUE):
  1. Existing encounter consequence flags produce lore-appropriate markers, labels, descriptions, or effects in affected regions.
  2. At least two opposing encounter branches result in visibly different regional outcomes.
  3. The map communicates each consequence in player-facing language rather than exposing internal flags.
  4. Narrative echoes persist after reload and remain understandable with reduced motion enabled.
**Plans**: 2 plans

Plans:
- [x] 10-01-PLAN.md — Create narrative echo data definitions and NarrativeEchoes system API. (completed 2026-09-17)
- [x] 10-02-PLAN.md — Integrate echo markers and descriptions into Travel Map rendering. (completed 2026-09-17)
**UI hint**: yes

### Phase 11: Dynamic World Events
**Goal**: Players can notice, inspect, and resolve time-bound world activity through the map.
**Depends on**: Phase 10
**Requirements**: REQ-018
**Success Criteria** (what must be TRUE):
  1. Eligible existing regions visibly surface active events and distinguish active, expiring, resolved, and expired states.
  2. Selecting an event shows its location, narrative context, remaining time or expiry, and available action.
  3. Suspending or closing the game and returning later advances event timing correctly without requiring a backend.
  4. Resolving an event routes outcomes through canonical gameplay/reward systems and cannot reward the player twice.
  5. Repeated event cycles keep save history bounded and do not crowd the map with stale activity.
**Plans**: 4 plans

Plans:
- [x] 11-01-PLAN.md — World event data definitions and system API with generate/tick/resolve/history. (completed 2026-09-18)
- [x] 11-02-PLAN.md — Map integration: event indicators, detail panel, resolve action, human verification. (completed 2026-09-18; automated 48/48; manual browser verification pending)
- [x] 11-03-PLAN.md — Gap closure: fix stale MapHelpers mock in travel_map_landmarks.test.js so the full suite passes (test-only). (completed 2026-09-18)
- [x] 11-05-PLAN.md — Gap closure: persist offline world-event expiry and cadence generation without adding no-op saves. (completed 2026-09-20)

**UI hint**: yes

### Phase 12: Living Map Performance & Stability
**Goal**: Players can use the complete living map smoothly and reliably on representative mobile hardware.
**Depends on**: Phase 11
**Requirements**: REQ-020
**Success Criteria** (what must be TRUE):
  1. Panning, selecting, opening details, influence changes, and event updates remain smooth under the existing `?probe` checks on a mid-range mobile profile.
  2. Repeatedly entering and leaving the map does not accumulate controls, effects, timers, listeners, or stale selections.
  3. Dense combinations of regions, landmarks, narrative markers, and events remain readable without console errors or runaway save growth.
  4. Reduced-motion mode removes nonessential map animation while preserving all state distinctions and actions.
**Plans:** 4/4 plans complete
Plans:
- [x] 12-01-PLAN.md — Offscreen grid canvas, per-frame allocation caching, and viewport culling
- [x] 12-02-PLAN.md — Scene lifecycle stability, reduced-motion enforcement, map probe, human verification
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 6. World-State Continuity | 3/3 | Complete | 2026-09-19 |
| 7. Visual Region Map | 2/2 | Complete   | 2026-09-17 |
| 8. Landmark Discovery | 2/2 | Complete | 2026-09-17 |
| 9. Regional Influence & Control | 2/2 | Complete | 2026-09-17 |
| 10. Environmental Narrative Echoes | 2/2 | Complete | 2026-09-18 |
| 11. Dynamic World Events | 4/4 | Complete   | 2026-09-20 |
| 12. Living Map Performance & Stability | 2/2 | Complete | 2026-09-19 |

## Coverage

| Requirement | Assigned Phase |
|-------------|----------------|
| REQ-013 — Distinct Visual Regions | Phase 7 |
| REQ-014 — Discoverable Landmarks | Phase 8 |
| REQ-015 — Durable World-State Continuity | Phase 6 |
| REQ-016 — Regional Influence & Control | Phase 9 |
| REQ-017 — Environmental Narrative Echoes | Phase 10 |
| REQ-018 — Periodic World Events | Phase 11 |
| REQ-019 — Mobile-First Map Interaction | Phase 7 |
| REQ-020 — Smooth, Stable Map Rendering | Phase 12 |

**Coverage:** 8/8 active requirements mapped exactly once; no orphans or duplicates.

---
*Roadmap created 2026-09-15 for Milestone 2.*

## v3.0 — Screen & Gameplay Revamp (Planned)

**Milestone Goal:** Make the complete player journey cohesive and effective across every screen, with clean responsive UI and stronger internal architecture.

## Phases

**Phase Numbering:** Milestone 3 continues after completed v2.0 Phase 12 and begins at Phase 13.

- [x] **Phase 13: Responsive Screen Grammar & Navigation** - Players can understand and move through the core game journey consistently on phone and desktop.
- [x] **Phase 14: Combat & Gameplay Readability** - Players can act in combat, understand outcomes, and retain context through every combat state. (completed 2026-09-20; browser evidence deferred)
- [ ] **Phase 15: Character & Party Surfaces** - Players can understand hero identity and actionable progression consistently across character-focused screens.
- [ ] **Phase 16: Guidance & Progression Feedback** - Players know why actions are blocked, what changed, and what meaningful action comes next.
- [ ] **Phase 17: Canvas Backgrounds & Asset-Ready Presentation** - Screens gain purposeful, performant visual atmosphere and character moments without hiding gameplay.
- [ ] **Phase 18: Modular Navigation & Screen Seams** - High-connectivity screens use explicit compatibility-preserving architecture boundaries.
- [ ] **Phase 19: Lifecycle Safety & Deprecated-Code Cleanup** - Repeated play and migration paths remain stable while proven-obsolete code is removed.
- [ ] **Phase 20: Settings Diagnostics & Full-Loop Acceptance** - Players and maintainers can verify the complete loop with opt-in diagnostics and final evidence.

## Phase Details

### Phase 13: Responsive Screen Grammar & Navigation
**Goal**: Players can understand and move through the core game journey consistently on phone and desktop.
**Depends on**: Phase 12 / v2.0 complete
**Requirements**: REQ-021, REQ-022, REQ-023
**Success Criteria** (what must be TRUE):
  1. A player can move through title/load → Ashram → map → zone → combat → return using consistent labeled navigation, back behavior, and transitions.
  2. Each core screen clearly exposes its context, primary next action, and recoverable locked, empty, loading, or error state.
  3. Portrait, landscape, narrow desktop, and wide desktop layouts keep text, controls, safe areas, and Canvas hit-testing aligned.
  4. Touch drag/tap, mouse, and keyboard interactions reach the same player actions without hover-only dependencies.
**Plans**: 3 plans

Plans:
- [x] 13-01-PLAN.md — Establish shared responsive screen grammar, viewport scaling, safe-area behavior, and layout contracts.
- [x] 13-02-PLAN.md — Normalize labeled core navigation, back behavior, transitions, and origin-aware return flow.
- [x] 13-03-PLAN.md — Apply grammar across core screens and execute the responsive browser verification matrix.
**UI hint**: yes

### Phase 14: Combat & Gameplay Readability
**Goal**: Players can make informed combat decisions and understand results without visual overlap or lost context.
**Depends on**: Phase 13
**Requirements**: REQ-024
**Success Criteria** (what must be TRUE):
  1. Normal combat, incoming reaction, and result/reward states each show non-overlapping actions, turn/intent, log, and outcome information.
  2. A player can select an action, complete the reaction window when present, and see the resulting state change without mis-targeted input.
  3. Completing combat leads to an understandable reward/result state and a reliable return path to the originating gameplay screen.
**Plans**: 2 plans

Plans:
- [x] 14-01-PLAN.md — Implement explicit non-overlapping combat state bands and regression contracts.
- [x] 14-02-PLAN.md — Verify the attack-to-reward flow across responsive browser profiles and input modes (automated contract complete; live browser evidence deferred).
**UI hint**: yes

### Phase 15: Character & Party Surfaces
**Goal**: Players can recognize hero identity and make progression decisions consistently across character-focused screens.
**Depends on**: Phase 14
**Requirements**: REQ-025
**Success Criteria** (what must be TRUE):
  1. Party, combat, cultivation, equipment, and result views identify the relevant hero with consistent role, health/progression, and equipment semantics.
  2. A player can inspect a hero and identify available upgrades, equipped state, and meaningful next action without reconciling conflicting values.
  3. Character presentation remains readable and usable across phone and desktop layouts while preserving canonical progression and equipment state.
**Plans**: TBD
**UI hint**: yes

### Phase 16: Guidance & Progression Feedback
**Goal**: Players understand consequences, rewards, blockers, and the next effective step throughout the journey.
**Depends on**: Phase 15
**Requirements**: REQ-026, REQ-027
**Success Criteria** (what must be TRUE):
  1. Actions such as combat, cultivation, exploration, crafting, and equipment changes provide immediate confirmation and durable progression visibility.
  2. A locked or blocked action explains its reason and points to a valid unlock or recovery step using authoritative state.
  3. Contextual hints are dismissible, appear near the relevant decision, and do not interrupt normal play with a fixed tutorial tour.
  4. Feedback never grants duplicate rewards or creates presentation-owned progression state.
**Plans**: TBD
**UI hint**: yes

### Phase 17: Canvas Backgrounds & Asset-Ready Presentation
**Goal**: Players experience authored realm and character atmosphere while gameplay remains the visual and performance anchor.
**Depends on**: Phase 13
**Requirements**: REQ-028, REQ-029
**Success Criteria** (what must be TRUE):
  1. Revamped screens select semantic background/character slots and show cached authored imagery or deterministic fallback art when assets load slowly or fail.
  2. Backgrounds and character moments establish location or state without reducing text/control contrast or blocking screen entry.
  3. Reduced-motion mode removes nonessential visual motion while preserving all actions and state distinctions.
  4. Repeated rendering and screen cycling do not create unbounded asset, effect, or background allocations at representative phone and desktop sizes.
**Plans**: TBD
**UI hint**: yes

### Phase 18: Modular Navigation & Screen Seams
**Goal**: High-connectivity screen flows become easier to reason about without breaking the existing global runtime.
**Depends on**: Phase 13, Phase 14, Phase 15
**Requirements**: REQ-030
**Success Criteria** (what must be TRUE):
  1. Core navigation requests use canonical route IDs and transient parameters with one predictable transition and failure-recovery path.
  2. At least the Ashram → Travel Map → Zone Exploration → Combat slice consumes explicit screen context, selectors/commands, and lifecycle seams while legacy callers still work.
  3. Screen rendering reads derived presentation data and gameplay actions remain owned by canonical systems rather than screen-local mutations.
**Plans**: TBD
**UI hint**: yes

### Phase 19: Lifecycle Safety & Deprecated-Code Cleanup
**Goal**: Players can cycle screens and load existing saves reliably while the codebase sheds proven-obsolete behavior safely.
**Depends on**: Phase 18
**Requirements**: REQ-031, REQ-032
**Success Criteria** (what must be TRUE):
  1. Repeated entry and exit of core and migrated screens does not duplicate controls, callbacks, listeners, timers, modals, effects, caches, or stale selections.
  2. Deprecated helpers and aliases removed in this milestone have no verified runtime references and their replacement seams have contract coverage.
  3. Fresh saves, v2/legacy saves, direct boot, cached boot, and untouched scenes remain recoverable after cleanup.
  4. A lifecycle failure reports a recoverable state instead of leaving the player in a broken or inaccessible screen.
**Plans**: TBD
**UI hint**: yes

### Phase 20: Settings Diagnostics & Full-Loop Acceptance
**Goal**: Players get a clean default experience while maintainers can verify the complete journey with bounded local evidence.
**Depends on**: Phase 19, Phase 17
**Requirements**: REQ-033, REQ-034
**Success Criteria** (what must be TRUE):
  1. Settings contains a disabled-by-default debug toggle that enables bounded frame, transition, input/layout, persistence, and invariant diagnostics.
  2. Diagnostics can be cleared and disabled, do not mutate gameplay or retain scene references, and produce no noisy normal-play output when off.
  3. A fresh and existing-worker client can complete start/load → navigate → inspect → act → outcome → save → reload → return on representative phone and desktop profiles.
  4. The full loop has no unexpected console errors, stable probe performance, readable dense states, and correct reduced-motion behavior.
**Plans**: TBD
**UI hint**: yes

## v3.0 Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 13. Responsive Screen Grammar & Navigation | 3/3 | Complete | 2026-09-20 |
| 14. Combat & Gameplay Readability | 2/2 | Complete (browser evidence deferred) | 2026-09-20 |
| 15. Character & Party Surfaces | 0/TBD | Not started | - |
| 16. Guidance & Progression Feedback | 0/TBD | Not started | - |
| 17. Canvas Backgrounds & Asset-Ready Presentation | 0/TBD | Not started | - |
| 18. Modular Navigation & Screen Seams | 0/TBD | Not started | - |
| 19. Lifecycle Safety & Deprecated-Code Cleanup | 0/TBD | Not started | - |
| 20. Settings Diagnostics & Full-Loop Acceptance | 0/TBD | Not started | - |

## v3.0 Coverage

| Requirement | Assigned Phase |
|-------------|----------------|
| REQ-021, REQ-022, REQ-023 | Phase 13 |
| REQ-024 | Phase 14 |
| REQ-025 | Phase 15 |
| REQ-026, REQ-027 | Phase 16 |
| REQ-028, REQ-029 | Phase 17 |
| REQ-030 | Phase 18 |
| REQ-031, REQ-032 | Phase 19 |
| REQ-033, REQ-034 | Phase 20 |

**Coverage:** 14/14 v3.0 requirements mapped exactly once; no orphans or duplicates.
