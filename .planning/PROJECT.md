# Mythika: Echoes of the Divine

## What This Is

Mythika is a mobile-first cultivation RPG inspired by Indian mythology and lore. It combines idle progression with active tactical combat, party and build choices, exploration, farming, alchemy, and journeys through ascending realms.

Milestone 2 transformed the existing Travel Map from a zone list into a living world. Milestone v3.0 now makes the complete player journey cohesive and effective across every screen, with clean responsive UI, Canvas-first presentation, and stronger internal architecture—within the current vanilla JavaScript, Canvas, localStorage, and PWA architecture.

## Core Value

Every play session should feel like a meaningful cultivation journey: the player understands their next path, makes consequential choices, sees those choices reshape the world, and trusts that the resulting state persists.

## Current Shipped State

Milestone v3.0, **Screen & Gameplay Revamp**, shipped on 2026-10-09. The complete player journey is now cohesive across every screen: responsive grammar with canonical navigation, readable combat and hero surfaces, shared feedback, Canvas-first backgrounds, lifecycle guards, evidence-led cleanup, and opt-in diagnostics. The implementation remains vanilla JavaScript, immediate-mode Canvas, localStorage, and PWA-compatible.

Validated requirements: REQ-013 through REQ-034 (22/22). Final audit reports contract-level green (202/202 tests + UI invariants) with live-browser evidence deferred as accepted residual.

Milestone v4.0, **Deep Companions & Living Zones**, shipped on 2026-10-09. Familiar zones now play deeper through companion relationships: hero affinity bonds with dialogue, choices, and combat benefits; spirit-beast hearts with care actions, power, and evolution assist; companion-gated encounters, landmark/echo bond references, and capped hero gifting — all save-compatible, with zero new zone IDs.

Validated requirements: AFF-01 through AFF-06, BST-01 through BST-04, ZON-01, ZON-02, GFT-01, SAV-01 (14/14 functional). Final audit reports contract-level green (379/379 tests + UI invariants) with live-browser journey evidence (EVD-01) deferred as accepted residual.

Accepted remaining evidence debt: v2.0 worker/cache activation, legacy-save boot, event walkthrough, and mobile FPS/dense-map/reduced-motion walkthroughs — plus the v3.0 10-combination full-loop journey matrix (all rows pending) — plus v4.0 feature walkthroughs (affinity meter, bond scenes, combat log/Toast, duo button, feed/train taps, aura lines, variant tease, gift picker).

## Current Milestone: v5.0 Layout Fixes & Early-Game Pacing

**Goal:** Remove the visible layout collisions and pacing problems the play report found, so the first hour plays clean.

**Target features:**
- Combat, Bazaar, and zone-exploration overlap fixes
- Toast lifecycle, nav label, title, map-card, Ashram, and modal fixes
- Early-combat and zone-clear pacing rebalance

**Source:** 11 filed todos in `.planning/todos/pending/` from the 2026-10-09 headless-Chromium play report.

## Shipped Milestone v3.0 — Screen & Gameplay Revamp

**Goal (achieved):** Make the complete player journey cohesive and effective across every screen, with clean responsive UI and stronger internal architecture.

**Active requirements direction:** Deliver end-to-end screen interconnectivity, mobile/desktop UI revamp, Canvas-first backgrounds and character screens, modular seams with deprecated-code removal, configurable high-value diagnostics behind a Settings debug toggle, and clearer player guidance/gameplay effectiveness. Every change must preserve authoritative gameplay systems and make the next meaningful player action understandable.

**Context:** v2.0 established a persistent living map but left broader screen cohesion, responsive validation, combat/character readability, lifecycle cleanup, and browser evidence debt. Research recommends improving the existing immediate-mode Canvas/global architecture incrementally rather than introducing a framework, bundler, backend, or parallel state store.

**Date:** 2026-09-20

## Requirements

### Validated

- ✓ Active turn-based combat, cultivation, journeys, quests, achievements, economy, farming, alchemy, forge, party, equipment, and zone progression systems exist.
- ✓ Authoritative access gates, safe save hydration, canonical equipment handling, and stable combat math were established in Milestone 1.
- ✓ Mythology-driven narrative encounters already record persistent flags and consequences through save-backed local state.
- ✓ Canvas-based mobile-first screen architecture, semantic visual tokens, reduced-motion support, and PWA delivery are established.

### Validated — v2.0

- ✓ REQ-013 through REQ-020 — Living Map & World State

### Validated — v3.0

- ✓ REQ-021, REQ-022, REQ-023 — Responsive screen grammar, navigation flow, responsive viewports (Phase 13)
- ✓ REQ-024 — Combat readability bands and attack-to-reward flow (Phase 14)
- ✓ REQ-025 — Canonical hero identity surface across character screens (Phase 15)
- ✓ REQ-026, REQ-027 — Progression feedback and locked/blocked guidance (Phase 16)
- ✓ REQ-028, REQ-029 — Canvas backgrounds, asset-ready presentation, readability/perf/reduced-motion (Phase 17)
- ✓ REQ-030 — Modular navigation seams with legacy compatibility (Phase 18)
- ✓ REQ-031, REQ-032 — Lifecycle safety and evidence-led deprecated-code cleanup (Phase 19)
- ✓ REQ-033, REQ-034 — Settings diagnostics toggle and full-loop acceptance contracts (Phase 20)

### Validated — v4.0

- ✓ AFF-01 — Affinity meter + tiers on the hero surface (Phase 22)
- ✓ AFF-02, AFF-03 — Choice-driven gains + 15-event bond dialogue arc (Phase 23)
- ✓ AFF-04, AFF-05 — Tier combat passive + pair synergy buff (Phase 24)
- ✓ AFF-06 — Signature duo skills, all five heroes (Phase 25)
- ✓ BST-01, BST-04 — Beast hearts + feed/train care actions (Phase 26)
- ✓ BST-02, BST-03 — Heart potency/passive + evolution assist (Phase 27)
- ✓ ZON-01, ZON-02 — Companion-gated variants + landmark/echo bond references (Phase 28)
- ✓ GFT-01 — Hero gifts with diminishing returns and caps (Phase 29)
- ✓ SAV-01 — Affinity/linger/combo/gift/beastBond persistence + normalize healing (Phases 22+24–29)

### Shipped Milestone v4.0 — Deep Companions & Living Zones

**Goal (achieved):** Make familiar zones play differently through companion bonds, without new geography.

**Active requirements direction:** Deliver hero affinity bonds (meter, tiers, choice gains, dialogue arcs), combat bonds (passives, synergy, signature duos), beast bonding (hearts, care actions, power, evolution assist), living zones (gated variants, landmark/echo references), and capped hero gifting — all persisted through save-compatible world state. Every change must preserve authoritative gameplay systems (combat clones only, encounter exactly-once ledger, economy ownership) and add no new zone IDs.

**Context:** v3.0 left browser-evidence debt plus a defined 10-combination journey matrix. v4.0 scheduled that debt first (Phase 21: harness green, journey deferred) and then shipped companion depth as vertical slices on the existing vanilla-JS global architecture.

**Date:** 2026-10-09

### Out of Scope

- New realm geography or a broad expansion of the world map (deepening existing zones is v4.0 scope).
- Backend synchronization, multiplayer control, live-service scheduling, or server-authoritative events.
- Replacing the immediate-mode Canvas architecture or introducing a frontend framework.
- A broad rewrite of combat, cultivation, economy, or encounter systems beyond the integration points needed to affect world state.
- Unrelated content expansion outside companion/zone depth.

### v3.0 Boundaries

- No online backend, authentication service, multiplayer, cloud sync, or server authority.
- No framework, renderer, bundler, ES-module migration, or replacement of vanilla JS, Canvas 2D, script order, or global/immediate-mode conventions.
- No new zones, realms, broad progression systems, or unrelated lore/content expansion.
- Backgrounds and character presentation use asset-ready slots and authored/cached fallbacks; elaborate always-on particle/parallax treatment is deferred.
- Diagnostics are opt-in and local only; no telemetry upload or production debug noise.

### v4.0 Boundaries

- No new realm geography: deepen existing zones only (new landmarks, encounters, echoes within current zone IDs).
- No online backend, multiplayer, cloud sync, or server authority.
- No framework, renderer, bundler, or ES-module migration; vanilla JS, Canvas 2D, script order, and global/immediate-mode conventions stand.
- Companion systems are presentation + authoritative-state extensions of existing heroes, beasts, and save/world-state contracts — no parallel stores.
- Browser-evidence debt (v2.0 + v3.0 matrices) is scheduled early in v4.0, not re-deferred.

### v5.0 Boundaries

- Layout and pacing fixes only: no new systems, zones, or progression content.
- Combat-band (Phase 14/24/25), feedback, navigation, and lifecycle contracts must keep passing.
- No online backend, multiplayer, framework, renderer, or bundler changes.
- Balance changes stay in data/tuning constants; no combat-rule rewrites.

## Context

- Existing codebase: vanilla ES6, HTML5 Canvas 2D, Web Audio API, localStorage, PWA; `index.html` loads scripts in dependency order.
- Shipped v4.0 with 9 phases / 26 plans on 2026-10-09; 161 files changed (+17474/−82) since the v4.0 roadmap commit; suite at 379/379 + UI invariants green.
- New companion systems: single-authority `BondSystem` (affinity, arcs, combat bonuses, combos, gifts) + `BeastBond` in `src/systems/bond.js`; 12 `bondReq` variants in `zone_variants.js`; `LivingZones` system; `ITEMS.gifts` + `HERO_GIFTS` in `items.js`; extended `SaveSystem.migrate` healing chain (affinity → linger → combo → gifts → beastBond).
- New engine seams: `Navigation` (canonical routes + legacy `gScene` wrapper), `Scene.create` lifecycle auto-wrap, `R.Backgrounds` semantic slots, `UI.HeroSurface` read-only view-model, `UI.Feedback` toast/hint/badge/blocker library, `Diagnostics` opt-in collectors.
- The Travel Map is a persistent visual world surface (v2.0) now reached through canonical navigation with lifecycle guards and background presentation (v3.0).
- Existing encounter flags and consequence markers provide the foundation for environmental storytelling.
- Existing zone progress, journey, encounter, quest, achievement, and economy APIs remain the canonical sources of player actions and rewards.
- Root and folder `codemap.md` files document scene, system, data, UI, and engine boundaries.
- Browser-evidence debt now spans v2.0 + v3.0 and should be scheduled early next milestone rather than re-deferred.

## Constraints

- **Architecture**: Preserve vanilla JavaScript, global namespace conventions, script-order dependencies, and immediate-mode Canvas rendering.
- **Content**: Use existing zones and add landmarks within them; do not create new zones.
- **Persistence**: All world state remains local and save-compatible; malformed or legacy state must fail safe.
- **Interaction**: Design for touch first, with readable targets and coherent desktop behavior.
- **Performance**: The map must render smoothly on mid-range phones without unbounded effects, event records, or scene-local leaks.
- **Accessibility**: Respect `R.reducedMotion()` and existing semantic color/radius conventions.
- **Cultural direction**: Environmental details and event language must treat Indian mythology respectfully.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build on existing zones rather than adding geography | The milestone is about making the known world feel alive, not expanding scope | Existing zone IDs remain canonical |
| Establish persistent world state before visual reactions | Influence, landmarks, narrative echoes, and events need one safe source of truth | World-state continuity is the first delivery boundary |
| Treat the map as a vertical feature, not separate model/API/UI layers | Each phase should produce an observable player capability | Phases progress through complete map behaviors |
| Derive environmental storytelling from existing encounter flags | Reuses Milestone 1 consequences and avoids parallel narrative state | Encounter markers become map inputs |
| Run world events locally | Meets offline/PWA constraints and avoids backend scope | Event lifecycle uses deterministic local timestamps/state |
| Preserve authoritative gameplay APIs | Map actions must not create backdoor reward or progression mutations | Existing systems remain mutation owners |
| Preserve v2 as the validated baseline | v3.0 improves presentation and seams without reopening shipped world-state contracts | REQ-013–REQ-020 remain archived and unchanged |
| Use vertical screen slices over horizontal rewrites | Players receive complete, testable journeys while architecture improves incrementally | New facades adapt existing globals and systems |
| Gate diagnostics from Settings | Browser evidence needs high-value visibility without polluting normal play | Local bounded probes are disabled unless the debug toggle is enabled |
| Treat Canvas and asset slots as presentation seams | Authored backgrounds and character moments can evolve without changing gameplay authority | Semantic asset keys, cached/fallback layers, and immediate-mode drawing remain canonical |
| Migrate via compatibility facades, not rewrites | The vanilla-JS global runtime cannot break mid-milestone | Navigation.go + gScene wrapper, Scene.create auto-wrap, read-only selectors — all legacy callers still work ✓ Good |
| Remove deprecated code only with runtime evidence | Script order and indirect global references evade static search | 19-REMOVALS.md call-site/runtime proof + save-fixture hydration before deletion ✓ Good |
| Keep feedback presentation-owned but mutation-free | Toasts/hints must never duplicate authoritative rewards | Global drain in game loop; Feedback gap closed 2026-10-09 ✓ Good |
| Accept browser-evidence deferral at milestone scope (v2 precedent) | Human browser matrix is the bottleneck, not code | v3.0 shipped gaps_found with a defined 10-combination matrix; debt now spans two milestones — ⚠️ Revisit (schedule early next milestone) |
| Single-authority companion state (BondSystem + BeastBond, no parallel stores) | Companion depth must extend existing heroes/beasts/saves, not fork them | Encounter exactly-once ledger shared, economy ownership intact, combat clones only — ✓ Good |
| Commit signature-duo scope by readability verdict, not ambition | Tier-3 fantasy payoff must not regress combat readability | COMMIT-ALL-FIVE verdict recorded in Phase 25; all five heroes ship combos ✓ Good |
| Accept browser-evidence deferral a third time (v2/v3 precedent) | Phase 21 harness green; human journey matrix still the bottleneck | v4.0 shipped gaps_found with EVD-01 journey rows pending; debt now spans three milestones — ⚠️ Revisit (schedule owned browser slot next milestone) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-09 — v5.0 Layout Fixes & Early-Game Pacing started*
