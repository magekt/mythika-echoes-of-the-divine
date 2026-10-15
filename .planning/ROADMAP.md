# Roadmap: Mythika — Delivery Roadmap

## Milestones

- ✅ **v1.0 Core Systems Foundation** — Phases 1-5 (shipped 2026-09-15)
- ✅ **v2.0 Living Map & World State** — Phases 6-12 (shipped 2026-09-20)
- ✅ **v3.0 Screen & Gameplay Revamp** — Phases 13-20 (shipped 2026-10-09)
- ✅ **v4.0 Deep Companions & Living Zones** — Phases 21-29 (shipped 2026-10-09)
- ✅ **v5.0 Layout Fixes & Early-Game Pacing** — Phases 30-35 (shipped 2026-10-10)
- ✅ **v6.0 Ship Polish, Art & Audio, Onboarding** — Phases 36-41 (shipped 2026-10-11)
- ✅ **v7.0 Adaptive Viewport** — Phase 42 (shipped 2026-10-13)
- ✅ **v9.0 Premium UI/UX Foundations** — Phases 46-49 (shipped 2026-10-14)
- ✅ **v10.0 Shared Library Foundations** — Phases 50-53 (shipped 2026-10-14)
- 🚧 **v11.0 Combat Damage FX** — Phases 54-56 (in progress, Phase 54 shipped 2026-10-15)

## Completed Milestones

### v1.0 — Core Systems Foundation ✅ SHIPPED (2026-09-15)

5 phases, 10 plans, all executed and closed via the milestone close-out record (commit `d339303`, "milestone complete — all 5 phases executed"). REQ-001 through REQ-010 (trustworthy progression, reliable save/migration, mythological encounters, persistent consequences, connected loop, authoritative access gates, combat integrity, legible mobile combat UI, clear travel-map locked-state UX, cross-screen consistency) validated through per-gate browser UAT matrices at milestone close. No separate v1.0 archive exists in `milestones/`; the phase directories under `phases/` (01–05) are the primary record, with the historical close-out STATE preserved in git history at `d339303`.

Delivered: authoritative `SaveSystem.hydrate()` with migrations; canonical shared `EquipmentSystem` (gear-cache double-counting removed); `ZoneAccess` + 6 authority gates (journey, rebirth, forge, recruit, tournament, trials); mythological narrative encounter system (registry, triggers, choice UI, 8 lore encounters with marker chains, canonical reward routing); combat UI reflow (52px compact header, vertical stacking, ≥48px tap targets); cross-system polish (QuestSystem.trackEncounter hooks, narrative_enthusiast achievement, loop-coherence and performance audits).

### v2.0 — Living Map & World State ✅ SHIPPED (2026-09-20)

7 phases, 17 plans, and 69/69 tests complete. REQ-013 through REQ-020 validated. Full phase history and requirement outcomes: [v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md) · [v2.0-REQUIREMENTS.md](milestones/v2.0-REQUIREMENTS.md) · [v2.0-phases/](milestones/v2.0-phases/). Final audit: [v2-MILESTONE-AUDIT.md](v2-MILESTONE-AUDIT.md) (`tech_debt`, no blockers).

Accepted residual browser evidence: existing-worker cache activation/legacy-save boot, Phase 11 event walkthrough, and Phase 12 mobile FPS/dense-map/reduced-motion walkthrough.

### v3.0 — Screen & Gameplay Revamp ✅ SHIPPED (2026-10-09)

8 phases, 23 plans, 14/14 requirements with passing automated contracts (suite 202/202 + UI invariants green). REQ-021 through REQ-034 validated at contract level. Full phase history and requirement outcomes: [v3.0-ROADMAP.md](milestones/v3.0-ROADMAP.md) · [v3.0-REQUIREMENTS.md](milestones/v3.0-REQUIREMENTS.md) · [v3.0-phases/](milestones/v3.0-phases/). Final audit: [v3.0-MILESTONE-AUDIT.md](milestones/v3.0-MILESTONE-AUDIT.md) (`gaps_found`, browser evidence only).

Accepted residual browser evidence (same precedent as v2.0): live-browser matrix deferred across all 8 phases — console silence, `?probe` FPS, dense states, reduced motion, existing-worker cache activation, and the 10-combination full-loop journey matrix (all rows pending in 20-VERIFICATION.md). Feedback integration gap closed 2026-10-09.

### v4.0 — Deep Companions & Living Zones ✅ SHIPPED (2026-10-09)

9 phases, 26 plans, 14/15 requirements with passing automated contracts (suite 379/379 + UI invariants green). AFF-01 through GFT-01 plus SAV-01 validated at contract level; EVD-01 journey rows deferred. Full phase history and requirement outcomes: [v4.0-ROADMAP.md](milestones/v4.0-ROADMAP.md) · [v4.0-REQUIREMENTS.md](milestones/v4.0-REQUIREMENTS.md) · [v4.0-phases/](milestones/v4.0-phases/). Final audit: [v4.0-MILESTONE-AUDIT.md](milestones/v4.0-MILESTONE-AUDIT.md) (`gaps_found`, live-browser journey evidence only).

Accepted residual browser evidence (same precedent as v2.0/v3.0): Phase 21 headless harness green (3/3 profiles, 3 defects fixed); F1–F5/W1–W5 live journey rows pending plus feature walkthroughs across Phases 22–29 (affinity meter, bond scenes, combat log/Toast, duo button, feed/train taps, aura lines, variant tease, gift picker).

## Backlog

- New zones or realms.
- Backend synchronization, multiplayer control, and server-driven live events.
- Deep companion relationship systems.

## Phases

**Phase Numbering:** Milestone 1 completed Phases 1–5; Milestone 2 continued at Phase 6; Milestone 3 continued at Phase 13; Milestone v4.0 completed Phases 21–29. Milestone v5.0 completed Phases 30–35; Milestone v6.0 completed Phases 36–41. Milestone v7.0 completed Phase 42. Next milestone continues at Phase 43.

## v4.0 — Deep Companions & Living Zones ✅ SHIPPED (2026-10-09)

**Goal (achieved):** Existing zones feel deeper through companion relationships — heroes and spirit beasts grow with the player and reshape how familiar regions play.

**Boundaries held:** No new realm geography; no backend/multiplayer; no framework/renderer migration; companion state extends existing heroes/beasts/save contracts (no parallel stores); browser-evidence debt scheduled first (Phase 21 harness green, journey deferred as accepted residual).

## Phases

*Phases 21–29 shipped 2026-10-09. Full details: [v4.0-ROADMAP.md](milestones/v4.0-ROADMAP.md).*

- [x] **Phase 21: Browser Evidence Catch-Up** (2 plans — harness green, journey deferred)
- [x] **Phase 22: Affinity Foundation & Persistence** (3 plans)
- [x] **Phase 23: Choice-Driven Bonds & Dialogue** (3 plans)
- [x] **Phase 24: Combat Bonds** (3 plans)
- [x] **Phase 25: Signature Combos** (3 plans)
- [x] **Phase 26: Beast Hearts & Care Actions** (3 plans)
- [x] **Phase 27: Beast Power & Evolution Assist** (3 plans)
- [x] **Phase 28: Living Zones** (3 plans)
- [x] **Phase 29: Hero Gifts** (3 plans)

## Phase Details

*Phases 6–20 details live in prior archives: [v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md), [v3.0-ROADMAP.md](milestones/v3.0-ROADMAP.md). Phases 21–29 details: [v4.0-ROADMAP.md](milestones/v4.0-ROADMAP.md).*

<details>
<summary>✅ v4.0 Deep Companions & Living Zones (Phases 21-29) — SHIPPED 2026-10-09</summary>

- [x] Phase 21: Browser Evidence Catch-Up (2/2 plans; harness green, journey deferred) — completed 2026-10-09
- [x] Phase 22: Affinity Foundation & Persistence (3/3 plans) — completed 2026-10-09
- [x] Phase 23: Choice-Driven Bonds & Dialogue (3/3 plans) — completed 2026-10-09
- [x] Phase 24: Combat Bonds (3/3 plans) — completed 2026-10-09
- [x] Phase 25: Signature Combos (3/3 plans) — completed 2026-10-09
- [x] Phase 26: Beast Hearts & Care Actions (3/3 plans) — completed 2026-10-09
- [x] Phase 27: Beast Power & Evolution Assist (3/3 plans) — completed 2026-10-09
- [x] Phase 28: Living Zones (3/3 plans) — completed 2026-10-09
- [x] Phase 29: Hero Gifts (3/3 plans) — completed 2026-10-09

</details>

<details>
<summary>✅ v2.0 Living Map & World State (Phases 6-12) — SHIPPED 2026-09-20</summary>

- [x] Phase 6: World-State Continuity (3/3 plans) — completed 2026-09-19
- [x] Phase 7: Visual Region Map (2/2 plans) — completed 2026-09-17
- [x] Phase 8: Landmark Discovery (2/2 plans) — completed 2026-09-17
- [x] Phase 9: Regional Influence & Control (2/2 plans) — completed 2026-09-17
- [x] Phase 10: Environmental Narrative Echoes (2/2 plans) — completed 2026-09-18
- [x] Phase 11: Dynamic World Events (4/4 plans) — completed 2026-09-20
- [x] Phase 12: Living Map Performance & Stability (2/2 plans) — completed 2026-09-19

</details>

<details>
<summary>✅ v3.0 Screen & Gameplay Revamp (Phases 13-20) — SHIPPED 2026-10-09</summary>

- [x] Phase 13: Responsive Screen Grammar & Navigation (3/3 plans) — completed 2026-09-20
- [x] Phase 14: Combat & Gameplay Readability (2/2 plans) — completed 2026-09-20 (browser evidence deferred)
- [x] Phase 15: Character & Party Surfaces (3/3 plans) — completed 2026-10-08 (browser evidence deferred)
- [x] Phase 16: Guidance & Progression Feedback (3/3 plans) — completed 2026-10-08 (browser evidence deferred)
- [x] Phase 17: Canvas Backgrounds & Asset-Ready Presentation (3/3 plans) — completed 2026-10-08
- [x] Phase 18: Modular Navigation & Screen Seams (3/3 plans) — completed 2026-10-09 (browser evidence deferred)
- [x] Phase 19: Lifecycle Safety & Deprecated-Code Cleanup (3/3 plans) — completed 2026-10-09 (browser evidence deferred)
- [x] Phase 20: Settings Diagnostics & Full-Loop Acceptance (3/3 plans) — completed 2026-10-09 (browser evidence deferred)

</details>

<details>
<summary>✅ v1.0 Core Systems Foundation (Phases 01-05) — SHIPPED 2026-09-15</summary>

### Phase 01: Save Hydration & Equipment Authority
- [x] Complete — 2026-09-14 · commit `f0f150d` · browser UAT 4/4 (locked-zone guard, eligible/completed-zone play, equipment validation, hydration)
- `SaveSystem.hydrate()` defaults+migration; canonical shared `EquipmentSystem`; gear-cache double-counting removed; `ZoneAccess` authority; Travel Map locked-state UX aligned

### Phase 02: Access-Gate Enforcement
- [x] Complete — 2026-09-14 · 2/2 plans · 6-gate browser UAT all pass · commits `71757ef` `352d1bd` `0feb2ea` `8b6c182` `20bad46`
- JourneyAccess, RebirthAccess, ForgeAccess, RecruitAccess, TournamentAccess, TrialsAccess authority gates; invalid attempts return `{allowed:false}` without side effects

### Phase 03: Mythological Narrative Encounters
- [x] Complete — 2026-09-15 · 3/3 plans · commit `603bdc4`
- ENCOUNTERS registry with prerequisite/pool/weight helpers; EncounterSystem + EncounterTrigger (rollZone/rollTravel); encounterScene choice UI; 8 lore-grounded encounters with marker chains; canonical reward routing only

### Phase 04: Combat UI Reflow
- [x] Complete — 2026-09-15 · 1/1 plan · commit `a985acd`
- 52px compact header; vertical stacking of hero strip and enemy panel; ≥48px tap targets; reduced-motion preserved

### Phase 05: Connected Systems Polish
- [x] Complete — 2026-09-15 · 3/3 plans · commits `8fc1d56` `74be246` `fc05ca0` `59fed48`
- QuestSystem.trackEncounter + narrative_enthusiast achievement; encounter Continue button + journey grant routing through JourneySystem.start; performance audit (state mutation, unbounded arrays, scene cleanup, save serialization) — all checks pass

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Save Hydration & Equipment Authority | v1.0 | 1/1 | Complete (browser UAT 4/4) | 2026-09-14 |
| 2. Access-Gate Enforcement | v1.0 | 2/2 | Complete (6-gate browser UAT) | 2026-09-14 |
| 3. Mythological Narrative Encounters | v1.0 | 3/3 | Complete (8 encounters, marker chains) | 2026-09-15 |
| 4. Combat UI Reflow | v1.0 | 1/1 | Complete | 2026-09-15 |
| 5. Connected Systems Polish | v1.0 | 3/3 | Complete (audit all-pass) | 2026-09-15 |
| 6. World-State Continuity | v2.0 | 3/3 | Complete | 2026-09-19 |
| 7. Visual Region Map | v2.0 | 2/2 | Complete | 2026-09-17 |
| 8. Landmark Discovery | v2.0 | 2/2 | Complete | 2026-09-17 |
| 9. Regional Influence & Control | v2.0 | 2/2 | Complete | 2026-09-17 |
| 10. Environmental Narrative Echoes | v2.0 | 2/2 | Complete | 2026-09-18 |
| 11. Dynamic World Events | v2.0 | 4/4 | Complete | 2026-09-20 |
| 12. Living Map Performance & Stability | v2.0 | 2/2 | Complete | 2026-09-19 |
| 13. Responsive Screen Grammar & Navigation | v3.0 | 3/3 | Complete | 2026-09-20 |
| 14. Combat & Gameplay Readability | v3.0 | 2/2 | Complete (browser evidence deferred) | 2026-09-20 |
| 15. Character & Party Surfaces | v3.0 | 3/3 | Complete (browser evidence deferred) | 2026-10-08 |
| 16. Guidance & Progression Feedback | v3.0 | 3/3 | Complete (browser evidence deferred) | 2026-10-08 |
| 17. Canvas Backgrounds & Asset-Ready Presentation | v3.0 | 3/3 | Complete | 2026-10-08 |
| 18. Modular Navigation & Screen Seams | v3.0 | 3/3 | Complete (browser evidence deferred) | 2026-10-09 |
| 19. Lifecycle Safety & Deprecated-Code Cleanup | v3.0 | 3/3 | Complete (browser evidence deferred) | 2026-10-09 |
| 20. Settings Diagnostics & Full-Loop Acceptance | v3.0 | 3/3 | Complete (browser evidence deferred) | 2026-10-09 |
| 21. Browser Evidence Catch-Up | v4.0 | 2/2 | Complete (harness green; journey deferred) | 2026-10-09 |
| 22. Affinity Foundation & Persistence | v4.0 | 3/3 | Complete (automated; browser deferred) | 2026-10-09 |
| 23. Choice-Driven Bonds & Dialogue | v4.0 | 3/3 | Complete (automated; browser deferred) | 2026-10-09 |
| 24. Combat Bonds | v4.0 | 3/3 | Complete (automated; browser deferred) | 2026-10-09 |
| 25. Signature Combos | v4.0 | 3/3 | Complete (automated; browser deferred) | 2026-10-09 |
| 26. Beast Hearts & Care Actions | v4.0 | 3/3 | Complete (automated; browser deferred) | 2026-10-09 |
| 27. Beast Power & Evolution Assist | v4.0 | 3/3 | Complete (automated; browser deferred) | 2026-10-09 |
| 28. Living Zones | v4.0 | 3/3 | Complete (automated; browser deferred) | 2026-10-09 |
| 29. Hero Gifts | v4.0 | 3/3 | Complete (automated; browser deferred) | 2026-10-09 |

## Coverage

| Requirement | Assigned Phase | Milestone |
|-------------|----------------|-----------|
| REQ-013 — Distinct Visual Regions | Phase 7 | v2.0 ✅ |
| REQ-014 — Discoverable Landmarks | Phase 8 | v2.0 ✅ |
| REQ-015 — Durable World-State Continuity | Phase 6 | v2.0 ✅ |
| REQ-016 — Regional Influence & Control | Phase 9 | v2.0 ✅ |
| REQ-017 — Environmental Narrative Echoes | Phase 10 | v2.0 ✅ |
| REQ-018 — Periodic World Events | Phase 11 | v2.0 ✅ |
| REQ-019 — Mobile-First Map Interaction | Phase 7 | v2.0 ✅ |
| REQ-020 — Smooth, Stable Map Rendering | Phase 12 | v2.0 ✅ |
| REQ-021, REQ-022, REQ-023 | Phase 13 | v3.0 ✅ |
| REQ-024 | Phase 14 | v3.0 ✅ |
| REQ-025 | Phase 15 | v3.0 ✅ |
| REQ-026, REQ-027 | Phase 16 | v3.0 ✅ |
| REQ-028, REQ-029 | Phase 17 | v3.0 ✅ |
| REQ-030 | Phase 18 | v3.0 ✅ |
| REQ-031, REQ-032 | Phase 19 | v3.0 ✅ |
| REQ-033, REQ-034 | Phase 20 | v3.0 ✅ |

**Coverage:** 8/8 v2.0 + 14/14 v3.0 requirements mapped exactly once; no orphans or duplicates.

| Requirement | Assigned Phase | Milestone |
|-------------|----------------|-----------|
| EVD-01 — Browser evidence matrix | Phase 21 | v4.0 |
| AFF-01 — Affinity meter + tiers | Phase 22 | v4.0 |
| SAV-01 — Save-compatible persistence | Phase 22 | v4.0 |
| AFF-02 — Choice-driven affinity gains | Phase 23 | v4.0 |
| AFF-03 — Bond dialogue events | Phase 23 | v4.0 |
| AFF-04 — Tier combat bonus | Phase 24 | v4.0 |
| AFF-05 — Pair synergy buff | Phase 24 | v4.0 |
| AFF-06 — Signature duo skill | Phase 25 | v4.0 |
| BST-01 — Beast bond hearts | Phase 26 | v4.0 |
| BST-04 — Feed/train actions | Phase 26 | v4.0 |
| BST-02 — Heart potency + passive | Phase 27 | v4.0 |
| BST-03 — Evolution assist | Phase 27 | v4.0 |
| ZON-01 — Companion-gated encounters | Phase 28 | v4.0 |
| ZON-02 — Landmark/echo bond references | Phase 28 | v4.0 |
| GFT-01 — Hero gift preferences | Phase 29 | v4.0 |

**v4.0 Coverage:** 15/15 requirements mapped exactly once; no orphans or duplicates. 14/15 checked off; EVD-01 journey rows deferred (accepted residual).

## v5.0 — Layout Fixes & Early-Game Pacing ✅ SHIPPED (2026-10-10)

**Goal:** Remove the visible layout collisions and pacing problems the play report found, so the first hour plays clean.

**Boundaries:** Layout and pacing fixes only — no new systems, zones, or progression content; combat-band (Phase 14/24/25), feedback, navigation, and lifecycle contracts must keep passing; no backend/multiplayer/framework/renderer changes; balance changes stay in data/tuning constants, no combat-rule rewrites.

**Sequencing:** Harness extension first (only proof for LAY-01–LAY-06) → LAY-05 before LAY-02 (shared Notify) → pacing last.

## Phases (v5.0)

- [x] **Phase 30: Layout Harness Extension** - Text-bounds proof harness + combat sim (LAY-00)
- [x] **Phase 31: Toast Lifecycle Scoping** - Toasts die with their scene (LAY-05) — complete 2026-10-10
- [x] **Phase 32: Combat Layout** - Header bands + uniform action grid with safe toast lane (LAY-01, LAY-02, LAY-07) — complete 2026-10-10
- [x] **Phase 33: Bazaar & Zone Exploration Layout** - Rows, HUD, and encounter-gated buttons (LAY-03, LAY-04) — complete 2026-10-10
- [x] **Phase 34: Fit & Finish Bundle** - Nav, title, map cards, Ashram, modal (LAY-06) — complete 2026-10-10
- [x] **Phase 35: Early-Game Pacing & Empty States** - Combat stakes, zone-clear rate, populated starts (BAL-01, BAL-02, BAL-03) — complete 2026-10-10

## Phase Details (v5.0)

### Phase 30: Layout Harness Extension
**Goal**: Every layout fix in v5.0 is provable by an automated text-bounds check
**Depends on**: Phase 29 (v4.0 shipped)
**Requirements**: LAY-00
**Success Criteria** (what must be TRUE):
  1. Harness fails on the known-bad fixture (current combat header + Bazaar rows) and passes on a clean one
  2. Headless 200-fight combat simulator reports HP-loss/death-rate/clear-rate numbers for BAL-01/BAL-02
  3. `tools/verify_matrix.py` wraps `R.text`/`R.textCenter`, recording measured text boxes per frame at 390x844 and 844x390
  4. Harness settles animations then asserts no two rendered text boxes intersect and no text box extends past its containing panel across the checked set (all 20 scenes via gScene with seeded save, combat 1v1 and 5v3, zone exploration with/without encounter, Bazaar Buy and Sell, Confirm Creation modal)
  3. Intentional overlays (toast lane, modal over dimmed scene) are excluded by tagging, not by blanket exception
**Plans**: 3 plans

Plans:
- [x] 30-01-PLAN.md — Text-bounds harness core (fillText injector, asserts, frozen fail-first fixture)
- [x] 30-02-PLAN.md — Headless 200-fight combat simulator with BAL metrics
- [x] 30-03-PLAN.md — Engine overlay-flag wiring + verify_matrix layout mode + fail-first proof

### Phase 31: Toast Lifecycle Scoping
**Goal**: Toasts never leak across scenes
**Depends on**: Phase 30
**Requirements**: LAY-05
**Starting step**: Reproduce via the harness real-entry mode (travel-map locked-zone toast → Back → Ashram → Party) BEFORE any code change; record reproduced vs not-reproducible (combat was unreachable pre-c381180, so the original sighting may not exist on the current tree) and let the outcome select the fix-vs-harden branch.
**Success Criteria** (what must be TRUE):
  1. Real tap path locked-zone toast → Back → Ashram → Party shows no stale toast in the new scene
  2. Each toast carries a scene tag cleared on transition; only explicit achievement banners survive a scene change
  3. Harness regression test replays the same tap path green, and the concurrent-toast cap is documented
  4. Shared text-bounds criterion holds for toast-lane scenes (no toast text box intersects buttons or overflows its lane) at both viewports
**Plans**: 2 plans

Plans:
- [x] 31-01-PLAN.md — R.Backgrounds binding-split crash fix + repro-or-rule-out the stale-toast path (fix-vs-harden branch)
- [x] 31-02-PLAN.md — Scene-tagged toast lifecycle in both toast systems + regression test + lane bounds evidence
- [x] 31-03-PLAN.md — Recruit-view gap closure: explicit recruit render branch + stale-selection clearing + regression test (31-UAT test 5)
**UI hint**: yes

### Phase 32: Combat Layout
**Goal**: Combat reads in clean bands and actions never collide with toasts
**Depends on**: Phase 31 (LAY-05 first — shared Notify)
**Requirements**: LAY-01, LAY-02, LAY-07
**Success Criteria** (what must be TRUE):
  1. Target pairs re-derived from a harness run on the current tree (report screenshots are advisory only)
  2. Hero name, HP/MP bars, enemy name/HP, and target button sit in separate non-overlapping bands with the target button inside the enemy panel, at 1, 3, and 5 heroes
  2. Action buttons share one width/height/gap grid; engine defines one toast-lane constant in scene-helpers.js, Notify draws only inside it, and no scene places buttons or text in the lane
  3. Tutorial toasts never cover action buttons (including Gandiva + Rain of Arrows) in any scene
  4. Shared text-bounds criterion passes for combat 1v1 and 5v3 at 390x844 and 844x390
  5. Full 20-scene sweep at phase end (toast lane is engine-wide and may shift untargeted scenes)
  6. Backgrounds paint in every revamped scene (split-R fixed); harness samples ≥4 points per scene (corners + center) with minimum channel delta vs clear color and per-scene expected colors recorded from the first correct render
  7. Fixed pairs move from expected_pairs to the must-stay-clean list in the same commit (fixture retirement rule: CI fails on regressions AND on pairs vanishing without a matching code change)
**Plans**: 3 plans

Plans:
- [x] 32-01-PLAN.md — Combat band rebuild (enemy-panel targets, 5-hero clearance, D-01 result bands)
- [x] 32-02-PLAN.md — Toast-lane constant + uniform action grid + guidance clearance
- [x] 32-03-PLAN.md — Pair re-derivation + backgrounds evidence + 20-scene sweep + fixture retirement
**UI hint**: yes

### Phase 33: Bazaar & Zone Exploration Layout
**Goal**: Lists and zone screens read without collisions or live-button confusion
**Depends on**: Phase 30 (harness proof)
**Requirements**: LAY-03, LAY-04
**Success Criteria** (what must be TRUE):
  1. Bazaar name, description, stat, and price sit in separate columns/lines with tall-enough rows; resource HUD is clear of titles on both Buy and Sell tabs with 8+ rows
  2. Zone name, subtitle, progress bar, and labels never overlap; Attack/Skill/Flee are hidden or disabled with no encounter, with ≥8px gaps between adjacent buttons
  3. Shared text-bounds criterion passes for Bazaar Buy/Sell and zone exploration with and without encounter at 390x844 and 844x390
**Plans**: 2 plans in 1 wave
- [x] 33-01-PLAN.md — Variable-height Bazaar rows with text wrapping and HUD clarity
- [x] 33-02-PLAN.md — Zone exploration HUD bands and dimmed-but-visible action buttons
**UI hint**: yes

### Phase 34: Fit & Finish Bundle
**Goal**: Navigation, title, map cards, Ashram, and modals look finished at both orientations
**Depends on**: Phase 30 (harness proof)
**Requirements**: LAY-06
**Success Criteria** (what must be TRUE):
  1. Nav More slot shows a consistent icon+label; title wordmark is legible with centered footer and the hero sprite renders through the asset pipeline (never a bare square)
  2. Map lock icons read correctly and card heights fit their content; Ashram shows a single border with the gold coin icon
  3. Confirm Creation modal height fits its content with buttons following the body at a fixed gap
  4. Shared text-bounds criterion passes for all touched screens at 390x844 and 844x390
  5. If the phase overruns, split the title wordmark off first (only item needing art decisions)
**Plans**: TBD
**UI hint**: yes

### Phase 35: Early-Game Pacing & Empty States
**Goal**: The first hour plays with real stakes, honest pacing, and no dead screens
**Depends on**: Phases 30–34 (pacing last)
**Requirements**: BAL-01, BAL-02, BAL-03
**Success Criteria** (what must be TRUE):
  1. Headless sim of 200 first-zone fights: Lv1 hero loses ≥15% HP on average over the first five fights, ≥5% of zone-1 runs see a hero death, and Threat reads Normal on a fresh Lv1 save
  2. Aryavarta takes 12–20 fights to reach 100% clear (16%/fight baseline confirmed from sim first); later zones scale from that baseline
  3. Party, Alchemy, Spirit Beasts, and Quest Log show explanatory empty-state panels at new game naming the populating action or unlock, confirmed by screenshot review
  4. Balance changes stay in data/tuning constants with no combat-rule rewrites; combat-band, feedback, navigation, and lifecycle contracts keep passing
**Plans**: TBD
**UI hint**: yes

## Progress (v5.0)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 30. Layout Harness Extension | v5.0 | 3/3 | Complete | 2026-10-09 |
| 31. Toast Lifecycle Scoping | v5.0 | 3/3 | Complete | 2026-10-10 |
| 32. Combat Layout | v5.0 | 3/3 | Complete | 2026-10-10 |
| 33. Bazaar & Zone Exploration Layout | v5.0 | 2/2 | Complete | 2026-10-10 |
| 34. Fit & Finish Bundle | v5.0 | 4/4 | Complete | 2026-10-10 |
| 35. Early-Game Pacing & Empty States | v5.0 | 2/2 | Complete | 2026-10-10 |

## Coverage (v5.0)

| Requirement | Assigned Phase | Milestone |
|-------------|----------------|-----------|
| LAY-05 — Toast lifecycle | Phase 31 | v5.0 |
| LAY-01 — Combat header bands | Phase 32 | v5.0 |
| LAY-02 — Combat buttons + toast lane | Phase 32 | v5.0 |
| LAY-03 — Bazaar | Phase 33 | v5.0 |
| LAY-04 — Zone exploration | Phase 33 | v5.0 |
| LAY-06 — Fit-finish bundle | Phase 34 | v5.0 |
| BAL-01 — Combat difficulty | Phase 35 | v5.0 |
| BAL-02 — Zone-clear rate | Phase 35 | v5.0 |
| BAL-03 — Empty screens | Phase 35 | v5.0 |

**v5.0 Coverage:** 11/11 requirements mapped exactly once (LAY-00–07, BAL-01–03); no orphans or duplicates. (Phase 30 carries LAY-00, the harness requirement itself — the stated first build and sole proof for LAY-01–LAY-06.)

---

## v6.0 — Ship Polish, Art & Audio, Onboarding ✅ SHIPPED (2026-10-11)

**Goal:** Make the game shippable and beautiful — clean the console, fix licensing, polish onboarding, upgrade procedural art, and build a real audio identity. No new mechanics, zones, or heroes. No external asset files. No framework migration.

**Boundaries held:** No new gameplay mechanics, zones, or heroes; all art is canvas-drawn/procedural (no external image files); all audio is Web Audio synthesized (no external audio files); `R.colors`/`R.fonts` exclusively in scene code; no raw hex in scenes; new art code lives in `src/systems/` or `src/ui/`, not inline in scenes; all new particle/animation code checks `R.reducedMotion()`; audio only starts after first user gesture (autoplay policy); local play remains the default, Firebase optional and must not block offline play.

**Sequencing:** Ship fixes first (low-risk, high-visibility, unblocks everything) → onboarding polish → zone/enemy art → combat FX/UI polish → audio foundation → music & ambient SFX.

## Phases (v6.0)

- [x] **Phase 36: Ship Readiness** — LICENSE, Firebase 404 suppression, debug-scene gate, clean prod console — complete 2026-10-10
- [x] **Phase 37: Onboarding Polish** — guided first-battle walkthrough, stat glosses, journey HUD badge — complete 2026-10-10
- [x] **Phase 38: Zone & Enemy Art** — 8 zone backdrops, 20 enemy portrait icons — complete 2026-10-10
- [x] **Phase 39: Combat FX & UI Polish** — 5 element particle FX, card radius/tint polish — complete 2026-10-10
- [x] **Phase 40: Audio Foundation** — audio engine extensions, 3 UI SFX, music/SFX/mute toggle in Settings — complete 2026-10-11
- [x] **Phase 41: Music & Ambient** — title ambient loop, Ashram ambient loop, 8 combat SFX — complete 2026-10-11

## Phase Details (v6.0)

### Phase 36: Ship Readiness
**Goal**: The deployed build is clean, legally licensed, and free of developer-facing surfaces
**Depends on**: Nothing (first phase of v6.0)
**Requirements**: SHP-01, SHP-02, SHP-03, SHP-04
**Success Criteria** (what must be TRUE):
  1. `LICENSE` file exists at repo root with MIT (or GPLv3) text; `index.html` and `src/main.js` carry an SPDX license identifier comment header
  2. On first load without `firebase-config.js` (default local play), the console shows zero Firebase-related warnings or errors; with `?probe` appended, the warning is visible
  3. The debug scene is not reachable in a normal session; it is only reachable when `?debug` is in the URL or `G.state.debugMode` is set via a dev-only code path
  4. `python3 -m http.server 3000` + opening the game in Chrome/Chromium with DevTools open shows zero unhandled errors or warnings in the console on first load (prod, no `?probe`, no `?debug`); `tools/check_ui_invariants.sh` passes; `node --test tests/*.test.js` passes
**Plans**: 3 plans

Plans:
- [x] 36-01-PLAN.md — LICENSE file + SPDX headers on entry points
- [x] 36-02-PLAN.md — Firebase 404 silent fallback + ?probe-gated warning; debug scene gated behind ?debug
- [x] 36-03-PLAN.md — Console-clean proof: full Node suite + UI invariants + manual boot verification recorded

### Phase 37: Onboarding Polish
**Goal**: A first-time player understands the basics within one battle without reading a manual
**Depends on**: Phase 36
**Requirements**: ONB-01, ONB-02, ONB-03
**Success Criteria** (what must be TRUE):
  1. After character creation, the first zone encounter shows 3–5 inline callouts (tap-to-start, attack button location, turn-order explanation, reward collection); each callout is dismissible (tap-to-continue) and non-blocking — the player can tap past any callout without being stuck; a regression test confirms all 3–5 callouts fire in order on a fresh save
  2. On first encounter with each stat abbreviation (STR, AGI, MAG, ELEM, MP-regen), a 1-line gloss appears inline (not a modal wall); glosses are shown once and suppressed on subsequent encounters; a Node test asserts the gloss map has entries for all five stat keys
  3. When a journey quest is active, the Ashram HUD displays a visible badge or indicator (not just in the Quest Log); the badge is absent when no journey is active; the nav item at `ashram.js:129` shows the active journey name or a "No journey" state; a screenshot or harness render confirms the badge is visible in the Ashram scene with an active journey
**Plans**: 3 plans

Plans:
- [x] 37-01-PLAN.md — Guided first-battle callout system (state machine, dismiss-on-tap, fresh-save trigger)
- [x] 37-02-PLAN.md — Stat gloss inline system (first-encounter trigger, suppression on repeat)
- [x] 37-03-PLAN.md — Journey quest HUD badge in Ashram scene

**UI hint**: yes

### Phase 38: Zone & Enemy Art
**Goal**: Zone exploration and combat screens look painted, not utilitarian text cards
**Depends on**: Phase 37
**Requirements**: ART-01, ART-02
**Success Criteria** (what must be TRUE):
  1. All 8 zone backdrops are canvas-drawn with a dark-navy/gold palette; each zone has a distinct visual identity; `R.colors` and `R.fonts` used exclusively (no raw hex in scene code); backdrops render through `registerSlot`/`renderBackground` in `src/engine/backgrounds.js`; a visual proof (screenshot per zone) confirms all 8 render correctly
  2. 20 enemy portrait icons are canvas-drawn silhouettes/ink-style; each maps to a named enemy type; portraits appear on enemy cards in both combat and exploration UIs; a Node test or render assertion confirms all 20 portrait slots are populated
  3. All new art code lives in `src/systems/` or `src/ui/`; `R.reducedMotion()` is checked for any animated backdrop layer
**Plans**: 2 plans

Plans:
- [x] 38-01-PLAN.md — 8 zone backdrop implementations (dark-navy/gold, one per zone ID)
- [x] 38-02-PLAN.md — 20 enemy portrait icons + card rendering integration

**UI hint**: yes

### Phase 39: Combat FX & UI Polish
**Goal**: Combat hits feel alive and UI cards feel less utilitarian
**Depends on**: Phase 38
**Requirements**: ART-03, ART-04
**Success Criteria** (what must be TRUE):
  1. Five element-keyed particle effects (fire, ice, lightning, earth, spirit or equivalent) are visible on attack hits in combat; each effect uses `ctx` particle drawing (not inline `fillRect` only); particles respect `R.reducedMotion()` (disabled or static fallback when set); a combat-sim or screenshot proves all 5 elements produce distinct visual FX
  2. UI card radius and tint polish applied: cards use `R.roundRect` with a slightly larger radius than before; subtle per-zone background tint applied to cards; a visual diff (before/after screenshot) confirms the change; `R.colors`/`R.radius` used (no raw values in scene code)
  3. `node --test tests/*.test.js` and `tools/check_ui_invariants.sh` pass
**Plans**: 2 plans

Plans:
- [x] 39-01-PLAN.md — 5 element particle FX system (canvas particle emitter keyed to element type)
- [x] 39-02-PLAN.md — UI card radius/tint polish across card components

**UI hint**: yes

### Phase 40: Audio Foundation
**Goal**: The audio engine supports SFX and music on separate gain nodes with user-controllable toggles
**Depends on**: Phase 36 (plus serialize-after-38 in practice: both edit adjacent `initAudio()` lines in `src/engine/game.js` — 38 adds `ZoneArt.registerAll()`, 40 adds `Audio.loadPrefs()`)
**Requirements**: AUD-04, AUD-05
**Success Criteria** (what must be TRUE):
  1. Three UI SFX (button tap, modal open, toast notification) are defined in the audio engine and fire on the corresponding UI interactions; SFX are silent when `Audio.sfxOn` is false; a Node test or manual verification confirms each SFX fires on its trigger
  2. Settings scene has three independent toggles: Music on/off, SFX on/off, Mute (master); toggles persist to `localStorage`; a regression test confirms all three toggle states survive a save/reload cycle
  3. Music and SFX are on separate gain nodes; toggling music does not silence SFX and vice versa; audio only starts after first user gesture (autoplay policy respected)
  4. `Audio.enabled` respects `Audio.reducedMotion` where appropriate (audio cues suppressed or reduced when `R.reducedMotion()` is true)
**Plans**: 2 plans

Plans:
- [x] 40-01-PLAN.md — 3 UI SFX definitions + trigger wiring + gain-node separation verification
- [x] 40-02-PLAN.md — Settings audio toggle (music/SFX/mute) + localStorage persistence + autoplay gate

### Phase 41: Music & Ambient
**Goal**: The game has a real audio identity — ambient loops for title and Ashram, and combat SFX for key moments
**Depends on**: Phase 40
**Requirements**: AUD-01, AUD-02, AUD-03
**Success Criteria** (what must be TRUE):
  1. Title screen plays a 30–60s procedural ambient loop (oscillator + gain + delay/reverb-like nodes); mood is mystical/slow/drone; loop is seamless (no audible click or gap); plays only after first user gesture; silent when `Audio.musicOn` is false; a manual listen-test confirms the loop
  2. Ashram hub plays a low-volume ambient loop (bells/wind texture) that starts on Ashram enter and stops on leave; loop is seamless; silent when music is toggled off; a manual listen-test confirms it
  3. Eight combat SFX (attack hit, enemy hit, dodge, victory jingle, defeat thud, level-up chime, potion brew, spirit-beast summon pulse) are defined and fire on their corresponding combat events; SFX are silent when `Audio.sfxOn` is false; a combat-sim or manual verification confirms each SFX fires on its event
  4. All new audio code is in `src/engine/audio.js` (or a new `src/systems/audio.js` module); no external audio files; `Audio.reducedMotion` respected for non-essential cues
**Plans**: 3 plans

Plans:
- [x] 41-01-PLAN.md — Title screen ambient loop (procedural, 30–60s, seamless)
- [x] 41-02-PLAN.md — Ashram ambient loop (procedural, scene-scoped start/stop)
- [x] 41-03-PLAN.md — 8 combat SFX definitions + combat-event wiring

## Progress (v6.0)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 36. Ship Readiness | v6.0 | 3/3 | Complete | 2026-10-10 |
| 37. Onboarding Polish | v6.0 | 3/3 | Complete | 2026-10-10 |
| 38. Zone & Enemy Art | v6.0 | 2/2 | Complete | 2026-10-10 |
| 39. Combat FX & UI Polish | v6.0 | 2/2 | Complete | 2026-10-10 |
| 40. Audio Foundation | v6.0 | 2/2 | Complete | 2026-10-11 |
| 41. Music & Ambient | v6.0 | 3/3 | Complete | 2026-10-11 |

## Coverage (v6.0)

| Requirement | Assigned Phase | Milestone |
|-------------|----------------|-----------|
| SHP-01 — LICENSE added | Phase 36 | v6.0 |
| SHP-02 — Firebase 404 suppressed in prod | Phase 36 | v6.0 |
| SHP-03 — Debug scene removed or gated behind ?debug | Phase 36 | v6.0 |
| SHP-04 — Console clean on first load (prod, no ?probe) | Phase 36 | v6.0 |
| ONB-01 — Guided first-battle walkthrough | Phase 37 | v6.0 |
| ONB-02 — Character creation stat glosses | Phase 37 | v6.0 |
| ONB-03 — Journey quest surfaced in Ashram HUD | Phase 37 | v6.0 |
| ART-01 — 8 zone backdrops (procedural, dark-navy/gold) | Phase 38 | v6.0 |
| ART-02 — 20 enemy portrait icons | Phase 38 | v6.0 |
| ART-03 — 5 element combat FX (particles) | Phase 39 | v6.0 |
| ART-04 — UI card radius/tint polish | Phase 39 | v6.0 |
| AUD-04 — 3 UI SFX | Phase 40 | v6.0 |
| AUD-05 — Audio toggle (music/SFX/mute) in Settings | Phase 40 | v6.0 |
| AUD-01 — Title screen ambient loop | Phase 41 | v6.0 |
| AUD-02 — Ashram ambient loop | Phase 41 | v6.0 |
| AUD-03 — 8 combat SFX | Phase 41 | v6.0 |

**v6.0 Coverage:** 16/16 requirements mapped exactly once; no orphans or duplicates.

## Dependency Graph (v6.0)

```
Phase 36 (Ship Readiness)
  └─→ Phase 37 (Onboarding Polish)
        └─→ Phase 38 (Zone & Enemy Art)
              └─→ Phase 39 (Combat FX & UI Polish)

Phase 36 (Ship Readiness)
  └─→ Phase 40 (Audio Foundation)
        └─→ Phase 41 (Music & Ambient)
```

Art and audio tracks are independent after Phase 36; they can be executed in parallel or interleaved.

## v7.0 — Adaptive Viewport ✅ SHIPPED (2026-10-13)

**Goal:** The whole game fills any phone screen edge-to-edge with nothing cut, so mobile play feels clean.

**Boundaries held:** No backend/multiplayer; no framework/renderer migration; no new zones/content; input mapping untouched (`getBoundingClientRect` scaling is resolution-independent); fixed 400-wide logical coordinates preserved (height adapts).

## Phases (v7.0)

- [x] **Phase 42: Adaptive Fill Viewport** - Safe-area-aware sizing, visualViewport/DPR refit, background extension + HUD anchors (LAY-08) (completed 2026-10-13)

## Phase Details (v7.0)

### Phase 42: Adaptive Fill Viewport
**Goal**: The whole game fills any phone screen edge-to-edge with nothing cut, in portrait and landscape
**Depends on**: Nothing (standalone; touches `fitGame`, `game.css`, canvas backing, scene anchors)
**Requirements**: LAY-08
**Success Criteria** (what must be TRUE):
  1. At 390x844 portrait and 844x390 landscape the full game is visible with zero clipped content and no dead bars beyond safe-area insets; desktop 1440x900 behavior is unchanged (centered, scale capped at 1)
  2. Rotation, resize, and browser-chrome show/hide refit without clipping or stale DPR blur — canvas backing matches the refit size and text stays crisp
  3. Backgrounds paint the extended area on tall/short viewports (LAY-07 slot contract holds); HUD primary/back actions anchor to the real viewport bottom; scroll/cull regions use the real content height
  4. Full Node suite (`node --test tests/*.test.js`) + `tools/check_ui_invariants.sh` green; `verify_matrix.py` boot profiles clean
**Plans**: 3 plans (estimated)

Plans:
- [x] 42-01-PLAN.md — Fitting core: safe-area-aware `fitGame`, `visualViewport` refit triggers, container `box-sizing`/origin fix, per-refit DPR backing
- [x] 42-02-PLAN.md — Fill: background extension, HUD top/bottom anchors, `Scene.responsive` landscape values, scroll/cull height consistency
- [x] 42-03-PLAN.md — Verification across the responsive set (390x844, 844x390, 400x720, 540x900, 720x400, 1024x768, 1440x900)

## Progress (v7.0)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 42. Adaptive Fill Viewport | v7.0 | 3/3 | Complete    | 2026-10-13 |

## Progress (v8.0)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 43. Loading Overlay and Progress Reporting | v8.0 | 1/1 | Complete | 2026-10-13 |
| 44. Input Guarding | v8.0 | 1/1 | Complete | 2026-10-13 |

## Coverage (v7.0)

| Requirement | Assigned Phase | Milestone |
|-------------|----------------|-----------|
| LAY-08 — Adaptive fill viewport | Phase 42 | v7.0 |

**v7.0 Coverage:** 1/1 requirements mapped exactly once; no orphans or duplicates.

## Coverage (v8.0)

| Requirement | Assigned Phase | Milestone |
|-------------|----------------|-----------|
| INPUT-01 — No user input processed during boot | Phase 44 | v8.0 |
| INPUT-05 — Input._ready checked at UI consumer side | Phase 44 | v8.0 |

**v8.0 Coverage:** 2/2 requirements mapped exactly once; no orphans or duplicates.

## Dependency Graph (v7.0)

```
Phase 42 (Adaptive Fill Viewport) — standalone, no dependencies
```

## Dependency Graph (v8.0)

```
Phase 43 (Loading Overlay and Progress Reporting) — standalone, no dependencies
Phase 44 (Input Guarding) — standalone, no dependencies
```

---

## v8.0 — Performance & Loading Architecture ✅ SHIPPED (2026-10-13)

*Full details: [ROADMAP-v8.md](ROADMAP-v8.md)*

- [x] **Phase 43:** Loading Overlay and Progress Reporting (1/1 plan)
- [x] **Phase 44:** Input Guarding (1/1 plan)

## v9.0 — Premium UI/UX Foundations ✅ SHIPPED (2026-10-14)

*Full details: [milestones/v9.0-ROADMAP.md](milestones/v9.0-ROADMAP.md)*

- [x] **Phase 46:** Renderer Primitives Foundation (1/1 plan)
- [x] **Phase 47:** Button Press Physics (1/1 plan)
- [x] **Phase 48:** Panel Modal Nested Shells (1/1 plan)
- [x] **Phase 49:** Reveal Lifecycle (1/1 plan)

---

## v10.0 — Shared Library Foundations ✅ SHIPPED (2026-10-14)

**Goal (achieved):** Established shared UI component factory with mixins, spring config registry, renderer primitive hardening, and migrated all components to the new foundation.

*Full details: [v10.0-ROADMAP.md](milestones/v10.0-ROADMAP.md)*

- [x] **Phase 50:** UI Component Factory Foundation (1/1 plan)
- [x] **Phase 51:** Spring Config Registry (1/1 plan)
- [x] **Phase 52:** Renderer Primitive Hardening (1/1 plan)
- [x] **Phase 53:** Component Factory Migration (1/1 plan)

## v11.0 — Combat Damage FX 🚧 IN PROGRESS (2026-10-15)

**Goal:** Upgrade combat damage feedback from the flat `R.damageNumber` text buffer to a spring-driven, element-aware damage floater system — consistent with the v10.0 `UI.Component` + mixin foundation and the project's zero-per-frame-allocation constraint.

*Full details: [ROADMAP-v11.md](ROADMAP-v11.md)*

- [x] **Phase 54:** Damage Floater Foundation (1/1 plan)
- [ ] **Phase 55:** Element Burst Particles (0/1 plan)
- [ ] **Phase 56:** Combat Integration + Tests (0/1 plan)

---

## Milestone Phase Index

Phases tracked in milestone-specific roadmap files (not duplicated in this file):

- v8.0 (Phases 43-45): [ROADMAP-v8.md](ROADMAP-v8.md)
- v9.0 (Phases 46-49): [milestones/v9.0-ROADMAP.md](milestones/v9.0-ROADMAP.md)
- v10.0 (Phases 50-53): [milestones/v10.0-ROADMAP.md](milestones/v10.0-ROADMAP.md)
- v11.0 (Phases 54-56): [ROADMAP-v11.md](ROADMAP-v11.md)

---
*Roadmap reorganized 2026-10-10 at v5.0 close. Detail archives: milestones/v2.0-ROADMAP.md, milestones/v3.0-ROADMAP.md, milestones/v4.0-ROADMAP.md. v6.0 section appended 2026-10-10. v8.0 section added 2026-10-13. v10.0 archived 2026-10-15.*
