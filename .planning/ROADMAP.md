# Roadmap: Mythika — Delivery Roadmap

## Milestones

- ✅ **v2.0 Living Map & World State** — Phases 6-12 (shipped 2026-09-20)
- ✅ **v3.0 Screen & Gameplay Revamp** — Phases 13-20 (shipped 2026-10-09)
- ✅ **v4.0 Deep Companions & Living Zones** — Phases 21-29 (shipped 2026-10-09)
- 🚧 **v5.0 Layout Fixes & Early-Game Pacing** — Phases 30-35 (in planning)

## Completed Milestones

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

**Phase Numbering:** Milestone 1 completed Phases 1–5; Milestone 2 continued at Phase 6; Milestone 3 continued at Phase 13; Milestone v4.0 completed Phases 21–29. Milestone v5.0 continues at Phase 30 (Phases 30–35). Next milestone continues at Phase 36.

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

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
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

## v5.0 — Layout Fixes & Early-Game Pacing 🚧 IN PLANNING

**Goal:** Remove the visible layout collisions and pacing problems the play report found, so the first hour plays clean.

**Boundaries:** Layout and pacing fixes only — no new systems, zones, or progression content; combat-band (Phase 14/24/25), feedback, navigation, and lifecycle contracts must keep passing; no backend/multiplayer/framework/renderer changes; balance changes stay in data/tuning constants, no combat-rule rewrites.

**Sequencing:** Harness extension first (only proof for LAY-01–LAY-06) → LAY-05 before LAY-02 (shared Notify) → pacing last.

## Phases (v5.0)

- [x] **Phase 30: Layout Harness Extension** - Text-bounds proof harness + combat sim (LAY-00)
- [ ] **Phase 31: Toast Lifecycle Scoping** - Toasts die with their scene (LAY-05)
- [ ] **Phase 32: Combat Layout** - Header bands + uniform action grid with safe toast lane (LAY-01, LAY-02)
- [ ] **Phase 33: Bazaar & Zone Exploration Layout** - Rows, HUD, and encounter-gated buttons (LAY-03, LAY-04)
- [ ] **Phase 34: Fit & Finish Bundle** - Nav, title, map cards, Ashram, modal (LAY-06)
- [ ] **Phase 35: Early-Game Pacing & Empty States** - Combat stakes, zone-clear rate, populated starts (BAL-01, BAL-02, BAL-03)

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
- [ ] 30-01-PLAN.md — Text-bounds harness core (fillText injector, asserts, frozen fail-first fixture)
- [ ] 30-02-PLAN.md — Headless 200-fight combat simulator with BAL metrics
- [ ] 30-03-PLAN.md — Engine overlay-flag wiring + verify_matrix layout mode + fail-first proof

### Phase 31: Toast Lifecycle Scoping
**Goal**: Toasts never leak across scenes
**Depends on**: Phase 30
**Requirements**: LAY-05
**Success Criteria** (what must be TRUE):
  1. Real tap path locked-zone toast → Back → Ashram → Party shows no stale toast in the new scene
  2. Each toast carries a scene tag cleared on transition; only explicit achievement banners survive a scene change
  3. Harness regression test replays the same tap path green, and the concurrent-toast cap is documented
  4. Shared text-bounds criterion holds for toast-lane scenes (no toast text box intersects buttons or overflows its lane) at both viewports
**Plans**: TBD
**UI hint**: yes

### Phase 32: Combat Layout
**Goal**: Combat reads in clean bands and actions never collide with toasts
**Depends on**: Phase 31 (LAY-05 first — shared Notify)
**Requirements**: LAY-01, LAY-02
**Success Criteria** (what must be TRUE):
  1. Hero name, HP/MP bars, enemy name/HP, and target button sit in separate non-overlapping bands with the target button inside the enemy panel, at 1, 3, and 5 heroes
  2. Action buttons share one width/height/gap grid; engine defines one toast-lane constant in scene-helpers.js, Notify draws only inside it, and no scene places buttons or text in the lane
  3. Tutorial toasts never cover action buttons (including Gandiva + Rain of Arrows) in any scene
  4. Shared text-bounds criterion passes for combat 1v1 and 5v3 at 390x844 and 844x390
  5. Full 20-scene sweep at phase end (toast lane is engine-wide and may shift untargeted scenes)
**Plans**: TBD
**UI hint**: yes

### Phase 33: Bazaar & Zone Exploration Layout
**Goal**: Lists and zone screens read without collisions or live-button confusion
**Depends on**: Phase 30 (harness proof)
**Requirements**: LAY-03, LAY-04
**Success Criteria** (what must be TRUE):
  1. Bazaar name, description, stat, and price sit in separate columns/lines with tall-enough rows; resource HUD is clear of titles on both Buy and Sell tabs with 8+ rows
  2. Zone name, subtitle, progress bar, and labels never overlap; Attack/Skill/Flee are hidden or disabled with no encounter, with ≥8px gaps between adjacent buttons
  3. Shared text-bounds criterion passes for Bazaar Buy/Sell and zone exploration with and without encounter at 390x844 and 844x390
**Plans**: TBD
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
| 30. Layout Harness Extension | v5.0 | 0/0 | Not started | - |
| 31. Toast Lifecycle Scoping | v5.0 | 0/0 | Not started | - |
| 32. Combat Layout | v5.0 | 0/0 | Not started | - |
| 33. Bazaar & Zone Exploration Layout | v5.0 | 0/0 | Not started | - |
| 34. Fit & Finish Bundle | v5.0 | 0/0 | Not started | - |
| 35. Early-Game Pacing & Empty States | v5.0 | 0/0 | Not started | - |

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

**v5.0 Coverage:** 9/9 requirements mapped exactly once; no orphans or duplicates. (Phase 30 is a requirement-free harness enabler — the stated first build and sole proof for LAY-01–LAY-06.)

---
*Roadmap reorganized 2026-10-09 at v4.0 close. Detail archives: milestones/v2.0-ROADMAP.md, milestones/v3.0-ROADMAP.md, milestones/v4.0-ROADMAP.md.*
