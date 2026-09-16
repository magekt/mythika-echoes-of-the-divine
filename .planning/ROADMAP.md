# Roadmap: Mythika — Milestone 2: Living Map & World State

## Overview

Milestone 2 turns the existing Travel Map into a persistent, touch-first world surface. Work begins by making world state safe across legacy and current saves, then delivers a visual map, discoverable landmarks, player-driven regional influence, environmental echoes of narrative choices, and periodic world events. The final phase validates the complete living map under mobile performance, memory, and reduced-motion constraints. Existing zones, authoritative gameplay APIs, and immediate-mode Canvas architecture remain intact throughout.

## Phases

**Phase Numbering:** Milestone 1 completed Phases 1–5; Milestone 2 continues at Phase 6.

- [ ] **Phase 6: World-State Continuity** - Players' evolving world state survives reloads and legacy saves safely.
- [ ] **Phase 7: Visual Region Map** - Players navigate distinct existing regions through a clear touch-first map.
- [ ] **Phase 8: Landmark Discovery** - Players discover and inspect persistent points of interest in existing zones.
- [ ] **Phase 9: Regional Influence & Control** - Player actions visibly change regional influence and control.
- [ ] **Phase 10: Environmental Narrative Echoes** - Encounter choices visibly reshape regional presentation.
- [ ] **Phase 11: Dynamic World Events** - Periodic local events appear, progress, and resolve through the map.
- [ ] **Phase 12: Living Map Performance & Stability** - The complete map stays smooth, leak-free, and accessible on mobile.

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
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md — Define and test the canonical defensive world-state contract.
- [ ] 06-02-PLAN.md — Integrate legacy-safe save migration and prove round-trip continuity.

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
**Plans**: TBD
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
**Plans**: TBD
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
**Plans**: TBD
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
**Plans**: TBD
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
**Plans**: TBD
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
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 6. World-State Continuity | 0/TBD | Not started | - |
| 7. Visual Region Map | 0/TBD | Not started | - |
| 8. Landmark Discovery | 0/TBD | Not started | - |
| 9. Regional Influence & Control | 0/TBD | Not started | - |
| 10. Environmental Narrative Echoes | 0/TBD | Not started | - |
| 11. Dynamic World Events | 0/TBD | Not started | - |
| 12. Living Map Performance & Stability | 0/TBD | Not started | - |

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
