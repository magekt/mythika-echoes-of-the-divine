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

## Phase P02 — Access-Gate Enforcement (Complete ✅)

**Goal**: All gated features validate at system/scene entry, not only via UI.

**Plans:** 2 plans — all complete

Plans:
- [x] 02-01-PLAN.md — Journey + Rebirth + Forge authority gates (3 tasks)
- [x] 02-02-PLAN.md — Recruit + Tournament + Trials authority gates + browser UAT (3 tasks)

**Tasks**
- [x] Journey start eligibility guard (`JourneySystem.start`, `getAvailableJourneys`).
- [x] Rebirth perk mutation-side validation (`punarjanma.js`, `perks.js`).
- [x] Persistent forge escalation authority (`forge.js`).
- [x] Recruit capacity & duplicate validation (party/recruit scenes).
- [x] Tournament fee/start authority (`tournament.js`, `duel.js`).
- [x] Trials entry authority (`trials.js`).
- [x] Per-gate browser tests.

**Gate**: Each gate has an acceptance-entry test and a failed-attempt side-effect check.
**Commits**: `71757ef` `352d1bd` `0feb2ea` `8b6c182` `20bad46`
**UAT**: Automated 6-gate browser UAT via browser-use CDP — all 6 gates pass

---

## Phase P03 — Mythological Narrative Encounters (Complete ✅)

**Goal**: Travel and zone exploration surface mythology-driven choices with immediate + persistent consequences.

**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Encounter core system: data registry, EncounterSystem, EncounterTrigger, state integration (3 tasks)
- [ ] 03-02-PLAN.md — Encounter UI scene + trigger wiring in zoneExploration and travelMap (2 tasks)
- [ ] 03-03-PLAN.md — Lore encounter library + marker chain + browser UAT (3 tasks)

**Tasks**
- [x] ENCOUNTERS registry with prerequisite/pool helpers (nagaBargain, marutCrossing)
- [x] EncounterSystem lifecycle (start/choose/setFlag/getChoices) with canonical reward routing
- [x] EncounterTrigger rollZone/rollTravel with NARRATIVE_CHANCE probability gate
- [x] Default state encounters: {} + save migration for encounters.seen ledger
- [ ] encounterScene choice UI (prompt, choice cards, result panel, origin resume)
- [ ] Zone exploration narrative roll hook
- [ ] Travel map narrative roll hook
- [ ] 8 lore-grounded encounters (5 zone + 3 travel)
- [ ] Choice-level flagsReq support
- [ ] Marker chain (nagaBargain → nagaElder)
- [ ] Phase-wide verification sweep + browser UAT

**Gate**: Encounter triggers → branch → consequence persists across save/load; no direct state mutation outside canonical APIs.

---

## Phase P04 — Combat UI Reflow (Planned)

**Goal**: Combat UI legible on all party sizes and screen heights.

**Plans:** 1 plan in 1 wave
Plans:
- [ ] 04-01-PLAN.md — Reflow combat layout: vertical stacking of hero strip and enemy panel (2 tasks)

**Tasks**
- [ ] Fix hero status strip overlap with selected-enemy header for party sizes 4–5.
- [ ] Maintain ≥48px tap targets for all combat actions.
- [ ] Ensure intent/reaction flow works after reflow.
- [ ] Verify reduced motion compliance.

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