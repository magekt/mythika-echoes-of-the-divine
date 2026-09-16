# Mythika: Echoes of the Divine — Milestone 2 Requirements

Status legend: `VALIDATED` (delivered previously) · `ACTIVE` (in this milestone) · `DEFERRED` (later roadmap)

---

## 1. Living Map

### REQ-013 — Distinct Visual Regions (ACTIVE)
The player can navigate a visual world map where every existing zone has a distinct, recognizable regional representation.

**Acceptance criteria**
- The Travel Map presents existing zones as spatial regions or nodes rather than only as a vertical list.
- Each region is visually distinguishable while preserving its canonical name, realm, lock state, and completion progress.
- Selecting a region clearly reveals its status and available next action.
- No new zones are introduced.

**Evidence**: Mobile and desktop map walkthrough covering locked, available, active, and completed zones.

### REQ-014 — Discoverable Landmarks (ACTIVE)
The player can discover and inspect points of interest attached to existing zones.

**Acceptance criteria**
- Landmarks are data-driven and reference canonical existing zone IDs.
- Discovery conditions use existing progress, encounter flags, or world-state values.
- Undiscovered, newly discovered, and discovered landmarks have clear map states.
- A discovered landmark can be tapped to inspect its name, description, and relevance or available action.
- Discovery persists across save/load without duplicating rewards or notices.

**Evidence**: Trigger one landmark discovery, inspect it, reload, and verify its discovered state remains.

---

## 2. Persistent World State

### REQ-015 — Durable World-State Continuity (ACTIVE)
The living world's mutable state is safe, deterministic, and persistent across sessions.

**Acceptance criteria**
- `G.state` has a canonical world-state shape covering regional state, influence/control, landmark discoveries, narrative echoes, and world events.
- Save hydration rebuilds missing world-state fields from defaults and migrates legacy/partial state without losing player progress.
- Malformed world-state entries fail safe instead of crashing the map.
- Reloading restores the same observable map state and does not replay one-time transitions.

**Evidence**: Default, legacy, partial, malformed, and round-trip save tests for world state.

### REQ-016 — Regional Influence & Control (ACTIVE)
Canonical player actions can alter regional influence or control, and the player can see that impact.

**Acceptance criteria**
- Existing actions such as zone progress, encounters, journeys, or bosses feed influence through one authoritative world-state API.
- Influence changes are bounded and deterministic; repeated rendering or scene entry cannot apply them again.
- Regions visibly communicate current alignment/control and meaningful progress toward the next state.
- The player can identify what changed and which action caused it.

**Evidence**: Complete a qualifying action, observe one influence transition, reload, and verify the same control state remains.

### REQ-017 — Environmental Narrative Echoes (ACTIVE)
Persistent narrative choices visibly alter the map environment.

**Acceptance criteria**
- Existing encounter consequence flags map to lore-appropriate region markers, labels, descriptions, or effects.
- At least two distinct encounter branches produce visibly different map outcomes.
- The map explains the consequence without requiring the player to inspect raw flags.
- Narrative echoes persist across save/load and respect reduced motion.

**Evidence**: Compare two save states with opposing encounter choices and capture their distinct regional presentation.

---

## 3. Dynamic World Activity

### REQ-018 — Periodic World Events (ACTIVE)
The player can see, inspect, and resolve periodic local world events on the map.

**Acceptance criteria**
- Events appear only in eligible existing zones and expose clear active, expiring, resolved, and expired states.
- Selecting an event shows its location, narrative context, remaining duration or expiry, and available action.
- Event generation and expiry remain correct after app suspension, offline time, and save/load.
- Resolving an event uses canonical gameplay/reward APIs and cannot grant completion twice.
- Active/history records are bounded so events cannot grow save data indefinitely.

**Evidence**: Generate, inspect, resolve, reload, and expire events using controlled timestamps; verify no duplicate reward.

---

## 4. Interaction & Performance

### REQ-019 — Mobile-First Map Interaction (ACTIVE)
Touch users can navigate and inspect the living map smoothly and without accidental activation.

**Acceptance criteria**
- Region, landmark, event, back, and primary-action targets meet the existing minimum touch-target convention.
- Pan/scroll gestures do not accidentally trigger selections, and taps select the intended overlapping map object.
- Selection details remain readable without obscuring essential map context on the 400×720 logical viewport.
- Pointer/mouse navigation remains coherent on desktop.

**Evidence**: Touch and mouse walkthrough of pan, select, inspect, close/back, and primary action flows.

### REQ-020 — Smooth, Stable Map Rendering (ACTIVE)
The living map remains responsive and memory-stable on representative mobile hardware.

**Acceptance criteria**
- Normal navigation, selection, influence changes, and event updates remain smooth under `?probe` on a representative mid-range mobile profile.
- Map rendering avoids per-frame unbounded allocations and culls or simplifies offscreen/nonessential detail.
- Repeated map enter/leave cycles do not retain buttons, effects, timers, or event listeners.
- Reduced-motion mode removes nonessential motion while retaining readable state distinctions.

**Evidence**: Probe run, repeated scene-cycle check, and reduced-motion walkthrough with no console errors or growing retained state.

---

## 5. Validated from Milestone 1

- REQ-001 through REQ-012 are validated by the completed Milestone 1 roadmap and remain regression constraints.
- In particular, reliable hydration, authoritative access gates, persistent encounter consequences, connected canonical APIs, mobile readability, reduced motion, and performance stability must not regress.

## 6. Deferred

- New zones or realms.
- Multiplayer or shared regional control.
- Backend-driven live events or cross-device world-state synchronization.
- Deep companion relationship systems.

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REQ-013 | Phase 7 | Pending |
| REQ-014 | Phase 8 | Pending |
| REQ-015 | Phase 6 | Pending |
| REQ-016 | Phase 9 | Pending |
| REQ-017 | Phase 10 | Pending |
| REQ-018 | Phase 11 | Pending |
| REQ-019 | Phase 7 | Pending |
| REQ-020 | Phase 12 | Pending |

**Coverage:** 8/8 active Milestone 2 requirements mapped exactly once.

---
*Defined for Milestone 2: Living Map & World State — 2026-09-15*
