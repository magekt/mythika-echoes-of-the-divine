# Mythika: Echoes of the Divine — Roadmap

Milestone: refine existing game into reliable, modular Indian-mythology cultivation RPG with meaningful narrative encounters and polished cross-device UX.

---

## Phase P01 — Save Hydration & Equipment Authority (In Progress)

**Goal**: Authoritative save hydration and canonical equipment system.

**Tasks**
- Hydrate `G.state` from defaults on load, then migrate via `SaveSystem.hydrate()`.
- Implement shared `EquipmentSystem` with one canonical equip rule set.
- Remove legacy gear-cache stat double-counting in `Combat`.
- Align all equipment-consuming scenes (`party.js`, `equipment.js`) to the shared system.
- Align `ZoneAccess` and Travel Map locked-state UX.
- Browser UAT: hydration, incompatible-equip rejection, stale-save cleanup, locked-zone guards.

**Gate**: UAT test results in `.slim/deepwork/access-gates-combat-ui.md` reviewed; Phase 1 UAT document checked.

**Artifact**: `d06975b` (PROJECT.md), pending Phase 1 commit.

---

## Phase P02 — Access-Gate Enforcement (Future)

**Goal**: All gated features validate at system/scene entry, not only via UI.

**Tasks**
- Journey start eligibility guard (`JourneySystem.start`, `getAvailableJourneys`).
- Rebirth perk mutation-side validation (`punarjanma.js`, `perks.js`).
- Persistent forge escalation authority (`forge.js`).
- Recruit capacity & duplicate validation (party/recruit scenes).
- Tournament fee/start authority (`tournament.js`, `duel.js`).
- Trials entry authority (`trials.js`).
- Per-gate browser tests.

**Gate**: Each gate has an acceptance-entry test and a failed-attempt side-effect check.

---

## Phase P03 — Mythological Narrative Encounters (Future)

**Goal**: Travel and zone exploration surface mythology-driven choices with immediate + persistent consequences.

**Tasks**
- Encounter trigger system (zone-based, karma/flag-driven spawn; no unbounded array growth).
- Encounter data format with choices, immediate rewards, and persistent flag writes.
- Encounter choice handler that routes rewards through canonical systems (`Economy`, `Progression`, `AchievementSystem`, `QuestSystem`).
- Marker storage in `G.state` readable by future encounters, quests, achievements.
- UI screen for encounter display (choices, rewards, consequences preview).
- 6–10 sample encounters grounded in Indian mythology (devas, asuras, rishis, yakshas, nagas) — respectful tone.

**Gate**: Encounter triggers → branch → consequence persists across save/load; no direct state mutation outside canonical APIs.

---

## Phase P04 — Combat UI Reflow (Future)

**Goal**: Combat UI legible on all party sizes and screen heights.

**Tasks**
- Fix hero status strip overlap with selected-enemy header for party sizes 4–5.
- Maintain ≥48px tap targets for all combat actions.
- Ensure intent/reaction flow works after reflow.
- Verify reduced motion compliance.

**Gate**: Mobile screenshot at party 5; `?probe` frame pass.

---

## Phase P05 — Connected Systems Polish (Future)

**Goal**: Existing systems feel coherently linked; no isolated loops.

**Tasks**
- Cross-system hooks where encounter rewards feed quests/achievements.
- Badge/action parity review across Ashram → map → zone → encounter → Ashram loop.
- Performance/memory checks: no new unbounded arrays, scene leave cleanup valid.

**Gate**: Full-screen walk-through from Ashram → Travel → Encounter → Combat → Ashram; probe + memory check.

---

## Deferred (Outside Milestone)

- **DEF-001** Living-map landmarks and world-state visualization.
- **DEF-002** Deep companion/relationship systems.
- **DEF-003** Broad new zones/hero rosters, live-service backend.
- **DEF-004** Canvas architecture replacement or framework migration.

---

*Last updated: 2026-09-14 — fine-grained sequential delivery via YOLO mode.*