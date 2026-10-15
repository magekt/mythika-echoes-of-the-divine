# Roadmap: Mythika v11.0 — Combat Damage FX

**Source:** Winning sketch `.planning/sketches/combat-damages/variant-c-rich.html` + CONCERNS.md zero-allocation constraint
**Requirements:** `.planning/REQUIREMENTS.md` (10 total: DMG-01..10)

## Phases

- [ ] **Phase 54: Damage Floater Foundation** — extend `R.damageFloaters` + `R.damageNumber` with element/crit + pre-allocated spring state; spring-driven render via `R.springConfigs`; element tint/icon; reduced-motion path
- [ ] **Phase 55: Element Burst Particles** — pre-allocated radial particle burst on hit, element-colored; reduced-motion suppressed
- [ ] **Phase 56: Combat Integration + Tests** — wire `combatScene.js` hit sites to upgraded `R.damageNumber`; preserve `damageFlash` + Toast flow; `tests/damage_fx.test.js`; full suite green

## Phase Details

### Phase 54: Damage Floater Foundation
**Goal:** Upgrade `R.damageNumber` from flat text buffer to a spring-driven, element-aware floater with zero per-frame allocation.
**Depends on:** Phase 50 (UI.Component + mixins), Phase 51 (R.springConfigs), Phase 52 (R.reducedMotion.watch)
**Requirements:** DMG-01, DMG-02, DMG-03, DMG-04, DMG-05
**Success Criteria:**
1. `R.damageNumber(ctx,x,y,value,color,{element,crit})` works; old call sites (no opts) unaffected.
2. Floater spring state allocated once at spawn; no per-frame object literal in render/update.
3. Element tint + icon chip match `R.colors` tokens; crit renders larger + gold ring.
4. Reduced-motion: floater appears + fades with no spring bounce.

### Phase 55: Element Burst Particles
**Goal:** Add a lightweight pre-allocated element particle burst on impact.
**Depends on:** Phase 54
**Requirements:** DMG-06, DMG-07
**Success Criteria:**
1. 6-particle radial burst from impact point, element-colored.
2. Particle state pre-allocated, mutated in place (zero per-frame allocation).
3. Burst suppressed when `R.reducedMotion()` is active.

### Phase 56: Combat Integration + Tests
**Goal:** Wire the combat scene to the new FX and lock it down with tests.
**Depends on:** Phase 54, Phase 55
**Requirements:** DMG-08, DMG-09, DMG-10
**Success Criteria:**
1. `combatScene.js` target/enemy/counter hit sites pass element + isCrit + coords.
2. `damageFlash` + `UI.Feedback.Toast` flow unchanged; screen shake reduced-motion gated.
3. `tests/damage_fx.test.js` added; `node --test tests/*.test.js` full suite green.

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 54. Damage Floater Foundation | v11.0 | 0/1 | Not started | - |
| 55. Element Burst Particles | v11.0 | 0/1 | Not started | - |
| 56. Combat Integration + Tests | v11.0 | 0/1 | Not started | - |

## Coverage

| Requirement | Assigned Phase | Milestone |
|-------------|----------------|-----------|
| DMG-01..05 | Phase 54 | v11.0 |
| DMG-06..07 | Phase 55 | v11.0 |
| DMG-08..10 | Phase 56 | v11.0 |

**v11.0 Coverage:** 10/10 requirements mapped; no orphans or duplicates.

## Dependency Graph

```
Phase 54 (Damage Floater Foundation) — depends on Phases 50/51/52
Phase 55 (Element Burst Particles)   — depends on Phase 54
Phase 56 (Combat Integration + Tests) — depends on Phase 54, 55
```

*Next: `/gsd-plan-phase 54` to begin Phase 54.*
