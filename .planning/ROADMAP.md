# Roadmap: Mythika — Delivery Roadmap

## Milestones

- ✅ **v2.0 Living Map & World State** — Phases 6-12 (shipped 2026-09-20)
- ✅ **v3.0 Screen & Gameplay Revamp** — Phases 13-20 (shipped 2026-10-09)
- 🚧 **v4.0 Deep Companions & Living Zones** — Phases 21-29 (active)

## Completed Milestones

### v2.0 — Living Map & World State ✅ SHIPPED (2026-09-20)

7 phases, 17 plans, and 69/69 tests complete. REQ-013 through REQ-020 validated. Full phase history and requirement outcomes: [v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md) · [v2.0-REQUIREMENTS.md](milestones/v2.0-REQUIREMENTS.md) · [v2.0-phases/](milestones/v2.0-phases/). Final audit: [v2-MILESTONE-AUDIT.md](v2-MILESTONE-AUDIT.md) (`tech_debt`, no blockers).

Accepted residual browser evidence: existing-worker cache activation/legacy-save boot, Phase 11 event walkthrough, and Phase 12 mobile FPS/dense-map/reduced-motion walkthrough.

### v3.0 — Screen & Gameplay Revamp ✅ SHIPPED (2026-10-09)

8 phases, 23 plans, 14/14 requirements with passing automated contracts (suite 202/202 + UI invariants green). REQ-021 through REQ-034 validated at contract level. Full phase history and requirement outcomes: [v3.0-ROADMAP.md](milestones/v3.0-ROADMAP.md) · [v3.0-REQUIREMENTS.md](milestones/v3.0-REQUIREMENTS.md) · [v3.0-phases/](milestones/v3.0-phases/). Final audit: [v3.0-MILESTONE-AUDIT.md](milestones/v3.0-MILESTONE-AUDIT.md) (`gaps_found`, browser evidence only).

Accepted residual browser evidence (same precedent as v2.0): live-browser matrix deferred across all 8 phases — console silence, `?probe` FPS, dense states, reduced motion, existing-worker cache activation, and the 10-combination full-loop journey matrix (all rows pending in 20-VERIFICATION.md). Feedback integration gap closed 2026-10-09.

## Backlog

- New zones or realms.
- Backend synchronization, multiplayer control, and server-driven live events.
- Deep companion relationship systems.

## Phases

**Phase Numbering:** Milestone 1 completed Phases 1–5; Milestone 2 continued at Phase 6; Milestone 3 continued at Phase 13; Milestone v4.0 continues at Phase 21. Next milestone continues at Phase 30.

## v4.0 — Deep Companions & Living Zones 🚧 ACTIVE

**Goal:** Existing zones feel deeper through companion relationships — heroes and spirit beasts grow with the player and reshape how familiar regions play.

**Boundaries:** No new realm geography; no backend/multiplayer; no framework/renderer migration; companion state extends existing heroes/beasts/save contracts (no parallel stores); browser-evidence debt scheduled first, not re-deferred.

## Phases

- [x] **Phase 21: Browser Evidence Catch-Up** - Execute the combined v2.0 + v3.0 browser matrix early (completed 2026-10-09; harness green, journey deferred)
- [x] **Phase 22: Affinity Foundation & Persistence** - Hero affinity meter, tiers, and save-compatible state
- [x] **Phase 23: Choice-Driven Bonds & Dialogue** - Encounter choices grow affinity and unlock bond dialogue
- [x] **Phase 24: Combat Bonds** - Tier passives and pair synergy in active-party combat
- [x] **Phase 25: Signature Combos** - One Tier-3 duo skill on one hero before committing to all
- [x] **Phase 26: Beast Hearts & Care Actions** - Bond hearts via battle XP plus feed/train
- [x] **Phase 27: Beast Power & Evolution Assist** - Heart potency, passive, and earlier evolution
- [ ] **Phase 28: Living Zones** - Companion-gated encounters, landmarks, and narrative echoes
- [ ] **Phase 29: Hero Gifts** - Liked-item gifting with caps and diminishing returns

## Phase Details

### Phase 21: Browser Evidence Catch-Up
**Goal**: Deferred browser evidence is executed and recorded instead of re-deferred
**Depends on**: Nothing (first phase of v4.0)
**Requirements**: EVD-01
**Success Criteria** (what must be TRUE):
  1. Player can boot the game in a real browser with no console errors on legacy and current saves
  2. Player experiences smooth frame rates on dense map states and reduced-motion mode behaves correctly
  3. Returning player loads cached assets with the service worker active
  4. The 10-combination full-loop journey matrix shows executed evidence rows
**Plans**: 2 plans

Plans:
- [x] 21-01-PLAN.md — Headless Chrome boot matrix + 21-VERIFICATION.md skeleton
- [x] 21-02-PLAN.md (journey deferred) — 10-combination live journey matrix + defect triage

### Phase 22: Affinity Foundation & Persistence
**Goal**: Players can see and trust each recruited hero's affinity bond on the hero screen
**Depends on**: Phase 21
**Requirements**: AFF-01, SAV-01
**Success Criteria** (what must be TRUE):
  1. Player can see each recruited hero's affinity meter (0–100) and tier (Wary→Trusted→Sworn→Legend) on the hero screen
  2. Player reloads the game and finds affinity values, bond hearts, and bond flags intact
  3. Player loading a legacy or malformed save gets safe healed defaults instead of a crash
**Plans**: 3 plans

Plans:
- [ ] 22-01-PLAN.md — BondSystem tier/accessor/normalize contract + script registration
- [ ] 22-02-PLAN.md — HeroSurface affinity meter + tier display + recruit seeding
- [ ] 22-03-PLAN.md — Save persistence + migrate healing + matrix contract
**UI hint**: yes

### Phase 23: Choice-Driven Bonds & Dialogue
**Goal**: Player choices in encounters visibly deepen hero bonds through dialogue
**Depends on**: Phase 22
**Requirements**: AFF-02, AFF-03
**Success Criteria** (what must be TRUE):
  1. Player making an encounter choice with a party hero present sees that hero's affinity increase
  2. Player reaching a new tier unlocks a bond dialogue event (recruit → crisis → oath) in the encounter UI
  3. Player sees no affinity decay or loss from absence — bonds only grow or rest dormant
**Plans**: 3 plans

Plans:
- [ ] 23-01-PLAN.md — Choice-gain wiring (+2/+4 via BondSystem.add, eligibility-gated)
- [ ] 23-02-PLAN.md — Bond arc content + unlocks (15 recruit/crisis/oath scenes, replay caps)
- [ ] 23-03-PLAN.md — Matrix contract (gains, arcs, caps, persistence, isolation)
**UI hint**: yes

### Phase 24: Combat Bonds
**Goal**: Bonded heroes fight alongside the player with visible tier and synergy benefits
**Depends on**: Phase 23
**Requirements**: AFF-04, AFF-05
**Success Criteria** (what must be TRUE):
  1. Player entering combat with a bonded hero in the active party sees the tier passive bonus applied
  2. Player fighting alongside a bonded hero sees the small pair synergy buff take effect
  3. Player moving the hero out of the active party sees the bonuses removed
**Plans**: 3 plans

Plans:
- [x] 24-01-PLAN.md — BondSystem passive/role-stat/synergy/linger contract + unit tests
- [x] 24-02-PLAN.md — Combat application + scene surfacing + party bench action + HeroSurface bond state
- [x] 24-03-PLAN.md — End-to-end matrix + linger persistence + full-suite guard + 24-VERIFICATION.md

### Phase 25: Signature Combo Pilot
**Goal**: One hero's Tier-3 duo skill proves the fantasy payoff without regressing combat readability
**Depends on**: Phase 24
**Requirements**: AFF-06
**Success Criteria** (what must be TRUE):
  1. Player with one pilot hero at Tier 3 can unleash that hero's signature duo skill in combat
  2. Player can read what the combo did through existing combat feedback without confusion
  3. Pilot readability verdict is recorded: commit to all heroes or keep scope contained
**Plans**: TBD

### Phase 26: Beast Hearts & Care Actions
**Goal**: Players grow spirit-beast bonds through fighting together and caring actions
**Depends on**: Phase 22
**Requirements**: BST-01, BST-04
**Success Criteria** (what must be TRUE):
  1. Player sees beast bond hearts (0–3) grow from battle-together XP
  2. Player can feed farm/alchemy items and spend gold/prana on training to earn capped bond XP
  3. Player hitting daily caps or cooldowns gets a clear explanation instead of a silent denial
**Plans**: TBD
**UI hint**: yes

### Phase 27: Beast Power & Evolution Assist
**Goal**: Bonded beasts fight stronger and evolve earlier than unbonded ones
**Depends on**: Phase 26
**Requirements**: BST-02, BST-03
**Success Criteria** (what must be TRUE):
  1. Player sees each beast heart raise that beast's skill potency
  2. Player reaching heart 2 sees the beast's unlocked passive in effect
  3. Player with a heart-3 beast sees it qualify for evolution earlier via evolution assist
**Plans**: TBD

### Phase 28: Living Zones
**Goal**: Familiar zones play differently because of the player's companion bonds
**Depends on**: Phase 23, Phase 27
**Requirements**: ZON-01, ZON-02
**Success Criteria** (what must be TRUE):
  1. Player entering an existing zone with the required affinity/bond minimum meets a companion-gated encounter variant
  2. Player without the bond minimum gets the standard encounter with no dead ends or errors
  3. Player visiting zone landmarks and narrative echoes sees them reference their highest-bond companion
  4. Player sees no new zone IDs — all depth lives within current geography
**Plans**: TBD
**UI hint**: yes

### Phase 29: Hero Gifts
**Goal**: Players deepen bonds by giving heroes items they like, without gift-vending exploits
**Depends on**: Phase 23
**Requirements**: GFT-01
**Success Criteria** (what must be TRUE):
  1. Player giving a hero a liked item sees capped affinity gain
  2. Player repeating the same gift sees diminishing returns instead of full gains
  3. Player cannot farm unlimited affinity by bulk-gifting (caps hold)
**Plans**: TBD
**UI hint**: yes

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
| 28. Living Zones | v4.0 | 0/TBD | Not started | - |
| 29. Hero Gifts | v4.0 | 0/TBD | Not started | - |

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

**v4.0 Coverage:** 15/15 requirements mapped exactly once; no orphans or duplicates.

---
*Roadmap reorganized 2026-10-09 at v3.0 close. Detail archives: milestones/v2.0-ROADMAP.md, milestones/v3.0-ROADMAP.md.*
