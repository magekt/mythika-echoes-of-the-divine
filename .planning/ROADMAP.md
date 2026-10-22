# Roadmap: Mythika v12.0 — HUD Alignment Verification

**Status:** DRAFT — Awaiting approval
**Phases:** 57–64 (8 phases, fine granularity)
**Milestone:** v12.0 — HUD Alignment verification only (particles, shake features, combat FX features, zone content deferred to future milestones)

**Core Value**: Every play session should feel like a meaningful cultivation journey: the player understands their next path, makes consequential choices, sees those choices reshape the world, and trusts that the resulting state persists.

**Scope**: Verify HUD screen/scene alignment across all 5 viewport sizes (400×720, 540×900, 720×400, 1024×768, 1440×900) after v11.0 combat FX changes. All ~27 scenes checked; combatScene and travelMap verified as most likely regression points.

**Constraints**: Zero per-frame allocation, R.reducedMotion() gating, save-compatible, no new element types, no WebGL, vanilla JS immediate-mode Canvas, shake scoped to game loop only (HUD renders after ctx.restore()).

## Phases

- [ ] **Phase 57: Base Canvas Alignment** - HUD elements hold correct position at 400×720 base canvas
- [ ] **Phase 58: Portrait & Landscape Viewports** - HUD aligned at 540×900 tall portrait and 720×400 landscape
- [ ] **Phase 59: Desktop Viewports** - HUD aligned at 1024×768 desktop card and 1440×900 desktop
- [ ] **Phase 60: Shake Scoping & HUD Isolation** - Screen shake never displaces HUD/UI layers
- [ ] **Phase 61: Combat FX vs HUD Separation** - Combat FX never obscure critical HUD info at any viewport
- [ ] **Phase 62: Layout Harness Regression** - Layout harness tests pass at all 5 viewport sizes
- [ ] **Phase 63: UI Invariants Gate** - check_ui_invariants.sh reports clean after HUD alignment changes
- [ ] **Phase 64: Full Scene Alignment Audit** - All ~27 scenes maintain HUD alignment; combatScene & travelMap verified

## Phase Details

### Phase 57: Base Canvas Alignment
**Goal**: HUD elements (health, mana, status, currency) maintain correct position and visibility at the 400×720 base canvas size.
**Depends on**: Nothing (first phase)
**Requirements**: HUD-01
**Success Criteria** (what must be TRUE):
  1. User can see health, mana, status, and currency HUD elements at correct positions on the 400×720 base canvas.
  2. HUD elements remain fully visible (not cut off or clipped) at base canvas size.
  3. HUD alignment matches the base design reference at 400×720.
**Plans**: TBD
**UI hint**: yes

### Phase 58: Portrait & Landscape Viewports
**Goal**: HUD elements maintain correct position and visibility at 540×900 tall portrait and 720×400 landscape viewports.
**Depends on**: Phase 57
**Requirements**: HUD-02, HUD-03
**Success Criteria** (what must be TRUE):
  1. User can see all HUD elements at correct positions on the 540×900 tall portrait viewport.
  2. User can see all HUD elements at correct positions on the 720×400 landscape viewport.
  3. HUD elements are not cut off, clipped, or overlapping at either non-base viewport size.
**Plans**: TBD
**UI hint**: yes

### Phase 59: Desktop Viewports
**Goal**: HUD elements maintain correct position and visibility at 1024×768 desktop card and 1440×900 desktop viewports.
**Depends on**: Phase 57
**Requirements**: HUD-04, HUD-05
**Success Criteria** (what must be TRUE):
  1. User can see all HUD elements at correct positions on the 1024×768 desktop card viewport.
  2. User can see all HUD elements at correct positions on the 1440×900 desktop viewport.
  3. HUD elements are not cut off, clipped, or overlapping at either desktop viewport size.
**Plans**: TBD
**UI hint**: yes

### Phase 60: Shake Scoping & HUD Isolation
**Goal**: Screen shake never displaces HUD/UI layers — shake ctx.translate scoped to game loop render region only; HUD/Notify/Fade/toast render after ctx.restore().
**Depends on**: Phase 57
**Requirements**: HUD-06
**Success Criteria** (what must be TRUE):
  1. Screen shake translate is applied only within the game loop render region, never inside HUD/UI rendering.
  2. HUD, Notify, Fade, and toast layers render after ctx.restore() so shake never moves them.
  3. Shake intensity changes do not shift HUD element positions on screen.
**Plans**: TBD
**UI hint**: yes

### Phase 61: Combat FX vs HUD Separation
**Goal**: Combat FX (damage numbers, element bursts, shake) never obscure or overlap critical HUD information at any viewport size.
**Depends on**: Phase 59, Phase 60
**Requirements**: HUD-07
**Success Criteria** (what must be TRUE):
  1. Damage floaters and element bursts render below critical HUD info (health, mana, status, currency) at every viewport size.
  2. Combat FX never overlap or obscure the HUD layer at 400×720, 540×900, 720×400, 1024×768, or 1440×900.
  3. Critical HUD information remains fully readable during combat FX playback.
**Plans**: TBD
**UI hint**: yes

### Phase 62: Layout Harness Regression
**Goal**: Layout harness tests pass at all 5 viewport sizes after all HUD alignment changes.
**Depends on**: Phase 59
**Requirements**: HUD-08
**Success Criteria** (what must be TRUE):
  1. Layout harness test suite passes at 400×720 base canvas size.
  2. Layout harness test suite passes at 540×900, 720×400, 1024×768, and 1440×900 viewport sizes.
  3. No layout regressions introduced across all 5 viewport sizes after HUD alignment changes.
**Plans**: TBD
**UI hint**: yes

### Phase 63: UI Invariants Gate
**Goal**: check_ui_invariants.sh reports clean after HUD alignment changes.
**Depends on**: Phase 62, Phase 61
**Requirements**: HUD-09
**Success Criteria** (what must be TRUE):
  1. `check_ui_invariants.sh` exits clean (no violations) after HUD alignment changes.
  2. All script-loading invariants pass (classic globals, script order preserved).
  3. All UI syntax invariants pass (no new element types, no WebGL, Canvas 2D only).
**Plans**: TBD
**UI hint**: yes

### Phase 64: Full Scene Alignment Audit
**Goal**: All ~27 scenes maintain HUD alignment, with combatScene and travelMap verified as most likely regression points from FX changes.
**Depends on**: Phase 63
**Requirements**: HUD-10
**Success Criteria** (what must be TRUE):
  1. All scenes maintain correct HUD alignment across all 5 viewport sizes.
  2. combatScene verified for HUD alignment (no FX/HUD overlap, shake doesn't displace HUD).
  3. travelMap verified for HUD alignment (no FX/HUD overlap, shake doesn't displace HUD).
  4. Scene-toast lane alignment verified across all scenes.
**Plans**: TBD
**UI hint**: yes

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 57 - Base Canvas Alignment | 0/TBD | Not started | - |
| 58 - Portrait & Landscape Viewports | 0/TBD | Not started | - |
| 59 - Desktop Viewports | 0/TBD | Not started | - |
| 60 - Shake Scoping & HUD Isolation | 0/TBD | Not started | - |
| 61 - Combat FX vs HUD Separation | 0/TBD | Not started | - |
| 62 - Layout Harness Regression | 0/TBD | Not started | - |
| 63 - UI Invariants Gate | 0/TBD | Not started | - |
| 64 - Full Scene Alignment Audit | 0/TBD | Not started | - |

## Requirements Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| HUD-01 | Phase 57 | Pending |
| HUD-02 | Phase 58 | Pending |
| HUD-03 | Phase 58 | Pending |
| HUD-04 | Phase 59 | Pending |
| HUD-05 | Phase 59 | Pending |
| HUD-06 | Phase 60 | Pending |
| HUD-07 | Phase 61 | Pending |
| HUD-08 | Phase 62 | Pending |
| HUD-09 | Phase 63 | Pending |
| HUD-10 | Phase 64 | Pending |

**Coverage:** 10/10 v12.0 requirements mapped exactly once; no orphans or duplicates.

---

*Draft for approval — approve roadmap or provide feedback for revision.*
