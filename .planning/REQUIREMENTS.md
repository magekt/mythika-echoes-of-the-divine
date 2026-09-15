# Mythika: Echoes of the Divine — Requirements

Status legend: `VALIDATED` (works today) · `ACTIVE` (in this milestone) · `DEFERRED` (later roadmap)

---

## 1. Player Experience

### REQ-001 — Trustworthy Progression (ACTIVE)
The player must be able to trust that access, reward, equipment, and save outcomes are correct regardless of UI state.

**Acceptance criteria**
- Every locked feature refuses entry at the system/scene entry-point level, not only via disabled buttons.
- No stale-session state leaks across scenes (gold, flags, perks, zone progress).
- Equipment operations use one canonical rule set shared by all screens.
- A battle cannot double-count stats from stale gear caches.

**Evidence**: Browser test of each gate: attempt entry while locked → verified blocked; hydrate from stale save → verified cleared; equip invalid item → rejected.

### REQ-002 — Reliable Save & Migration (ACTIVE)
Saves load, hydrate, migrate, and persist without data loss or corruption.

**Acceptance criteria**
- `SaveSystem.hydrate()` rebuilds from defaults and then applies migrations deterministically.
- Old saves migrate without losing player identity, party, or progress.
- Malformed localStorage entries fail safe (defaults) instead of crashing.
- Autosave and offline progress remain correct after hydration changes.

**Evidence**: Hydration test with stale save (partial completion status); migration test with legacy save; malformed-entry test.

### REQ-003 — Meaningful Mythological Encounters (ACTIVE)
Travel and exploration surface mythology-driven narrative encounters whose choices matter.

**Acceptance criteria**
- Encounters appear during zone exploration and travel with lore-grounded characters (devas, asuras, rishis, yakshas, nagas — always respectful of Indian mythology).
- Each encounter offers at least two choices with visibly different outcomes.
- Choices resolve immediately (reward granted, scene updated) and leave persistent markers.

**Evidence**: Encounter triggered in a zone; both branches grant distinct rewards; save/load preserves the choice marker.

### REQ-004 — Persistent Consequences (ACTIVE)
Encounter choices must echo forward into the world, not just grant one-shot loot.

**Acceptance criteria**
- Choices write durable flags/karma/world-state entries into `G.state`.
- Future encounters (or quests/achievements) can read those markers and branch.
- Consequences survive save/load and are visible to the player (text, badges, or effects).

**Evidence**: Choose branch A in encounter 1 → encounter 2 (or quest/achievement) reacts; marker persists across reload.

### REQ-005 — Connected Player Loop (ACTIVE)
Existing systems (zones, journeys, quests, achievements, economy, farm, alchemy, forge) must feel connected, not isolated.

**Acceptance criteria**
- Encounter rewards feed existing systems through their canonical APIs (Economy, Progression, AchievementSystem, QuestSystem).
- No new backdoor currency/stat mutation paths are introduced.
- Travel → encounter → combat → Ashram progression loop is coherent.

**Evidence**: Encounter grant flows through existing system functions; no direct `G.state` currency edits in new code.

---

## 2. Reliability & Rules

### REQ-006 — Authoritative Access Gates (ACTIVE)
All feature entry points enforce ownership, capacity, cost, and progress rules authoritatively.

**Scope (Phase 01 — in progress)**
- Zone map/actions/entry (`ZoneAccess`) — implemented, uncommitted.
- Save hydration + canonical `EquipmentSystem` — implemented, uncommitted.
- Combat gear cache removal — implemented, uncommitted.

**Scope (Phase 02 — pending)**
- Journey start eligibility (`getAvailableJourneys` + `JourneySystem.start`).
- Rebirth perk mutation-side validation (`punarjanma.js` / `perks.js`).
- Persistent forge escalation authority (`forge.js` / `game.js`).
- Recruit capacity & duplicate validation (party/recruit scenes).
- Tournament fee/start authority (`tournament.js`, `duel.js`).
- Trials entry authority (`trials.js`).

**Acceptance criteria**
- Each gated call site validates state, cost, and ownership before mutating.
- Invalid attempts return `false`/`null` without side effects and surface a user message.
- UI mirrors the authority (buttons disabled + reason text), but never replaces it.

**Evidence**: Per-gate browser test matrix; failed attempts leave state unchanged.

### REQ-007 — Combat Integrity (ACTIVE)
Combat math must be stable, free of double-counting, and legible in the UI.

**Acceptance criteria**
- Stat sources resolve once: base + gear (canonical) + buffs + passives; no duplicate stacking.
- Battlefield header does not overlap hero status strip at party sizes 3–5.
- Intents, reactions, and turn flow remain functional after any UI reflow.

**Evidence**: Combat smoke test party of 5; `?probe` frame checks; no overlap screenshot.

---

## 3. UI/UX

### REQ-008 — Legible Mobile Combat UI (ACTIVE)
Combat must remain readable and tappable on mobile and desktop.

**Acceptance criteria**
- All actions ≥48px effective tap targets.
- Enemy intent and party status not occluded at any party size.
- Reduced motion respected for animations.

**Evidence**: Overlap screenshot fixed; reduced-motion run.

### REQ-009 — Clear Travel Map & Locked-State UX (ACTIVE)
The Travel Map clearly communicates what a player can do, why zones are locked, and what to do next.

**Acceptance criteria**
- Locked zones show requirement text and disabled actions (implemented, uncommitted — verify and commit).
- Selected-zone info panel works on mobile heights.
- Route preview: next unlocked zone is obvious.

**Evidence**: Mobile-height screenshot; locked-zone click shows reason; disabled actions non-interactive.

### REQ-010 — Cross-Screen Consistency (ACTIVE)
Reachable screens must respect the same access/state rules the core systems enforce.

**Acceptance criteria**
- Ashram, Journey, Party, Equipment, Forge, Bazaar, Trials, Tournament badges and buttons match authoritative state.
- No navigation path reaches a locked feature.

**Evidence**: Walk-through of all nav paths from Ashram; badge/action parity check.

---

## 4. Cross-Device & Performance

### REQ-011 — Mobile-First Responsiveness (ACTIVE)
The game must be comfortable on both small phones and desktop-scaled canvas.

**Acceptance criteria**
- No required tap target under 48px; no content clipped on 360×640.
- Desktop 900×1600+ canvas scales without layout breakage.
- Scrolling, tap queue, swipe inputs work after UI changes.

**Evidence**: Screenshots at 360×640 and 900×1600; input smoke tests.

### REQ-012 — Performance & Memory Stability (ACTIVE)
No regressions in frame time, memory, or save cost from this milestone.

**Acceptance criteria**
- Scene leave paths clean up per-scene UI state (no binding leak regressions).
- No unbounded array growth introduced by encounters.
- `?probe` FPS and 30-min memory check pass.

**Evidence**: Probe run; 30-min session memory trace.

---

## 5. Deferred (Later Roadmap)

- **DEF-001** Living-map landmarks and world-state visualization.
- **DEF-002** Deep companion/relationship systems.
- **DEF-003** Broad new zones, hero rosters, live-service backend.
- **DEF-004** Framework/UI architecture replacement (Canvas preserved).

---

*Last updated: 2026-09-14 — derived from PROJECT.md and codebase research.*