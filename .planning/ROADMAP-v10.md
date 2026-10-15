# Roadmap: Mythika v10.0 — Shared Library Foundations

**Source:** P0 findings from `.planning/phases/045-performance-optimizations/45-UI-AUDIT.md` + v9.0 retrospective
**Requirements:** `.planning/REQUIREMENTS.md` (25 total: COMP-01..07, SPR-01..04, REND-07..12, TEST-01..04)

## Phases

- [x] **Phase 50: UI Component Factory Foundation** — `UI.Component` base + `mixinRender`/`mixinUpdate`/`mixinSpring`/`mixinEase`/`mixinContains`; refactor `UI.Button`, `UI.Panel`, `UI.Modal` to compose from base + mixins
- [x] **Phase 51: Spring Config Registry** — `R.springConfigs` registry with 12 named configs; replace 8+ inline spring configs in `button.js`, `modal.js`, `panel.js`, `scene-helpers.js`, `travelMap.js`, `cultivationScene.js`, `combatScene.js`, `fishing.js`
- [x] **Phase 52: Renderer Primitive Hardening** — `R.strokeRoundRect` validation, `R.doubleBezel` `insetHighlight` support, `R.easePremiumInv`, `R.spring.step` alias, `R.reducedMotion.watch`, 4 new semantic tokens; extend `tests/renderer.test.js`
- [x] **Phase 53: Component Factory Migration + Test Suite** — migrate `UI.Button`, `UI.Panel`, `UI.Modal`, `UI.List`, `UI.Feedback`, `UI.HeroSurface`, `UI.TabBar`, `UI.List`, `UI.Input`, `UI.Dialog`, `UI.EmptyState`, `Scene.HeroMoment` to `UI.Component` + mixins; add `tests/component_factory.test.js` + `tests/spring_registry.test.js` + `tests/renderer_extended.test.js`; full suite green

## Phase Details

### Phase 50: UI Component Factory Foundation
**Goal**: Establish `UI.Component` base factory + 5 mixins (`mixinRender`, `mixinUpdate`, `mixinSpring`, `mixinEase`, `mixinContains`); refactor `UI.Button`, `UI.Panel`, `UI.Modal` to compose from base + mixins; zero per-frame allocation in any component.
**Depends on**: Nothing (first phase of v10.0)
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07
**Success Criteria**:
1. `UI.Component(x, y, w, h, opts)` returns object with `x, y, w, h, render, update, contains, onClick, data`
2. `mixinRender(comp, drawFn)` adds `render(ctx)` calling `drawFn(ctx, comp)`
3. `mixinUpdate(comp)` adds `update(dt)` calling `comp._updateHook?.(dt)`
4. `mixinSpring(comp, config)` adds `_springState`, `_springStep = R.spring(config)`, `update` advances spring
5. `mixinEase(comp)` adds `easedValue(t)` using `R.easePremium(t)`
6. `mixinContains(comp)` adds `contains(px, py)` using `R.radius`
7. `UI.Button`, `UI.Panel`, `UI.Modal` refactored to compose from `UI.Component` + mixins
8. Zero per-frame allocation in any component `render()`/`update()` — all state allocated at construction
**Key files**: `src/ui/component.js` (new), `src/ui/button.js`, `src/ui/panel.js`, `src/ui/modal.js`
**UI hint**: yes

### Phase 51: Spring Config Registry
**Goal**: Centralize all spring configurations in `R.springConfigs` registry; replace 8+ inline spring configs across `button.js` (2×), `modal.js`, `panel.js`, `scene-helpers.js` (2×), `travelMap.js` (3×), `cultivationScene.js`, `combatScene.js`, `fishing.js` with `R.spring(R.springConfigs.<name>)` references.
**Depends on**: Phase 50 (needs `R.spring` from Phase 46)
**Requirements**: SPR-01, SPR-02, SPR-03, SPR-04
**Success Criteria**:
1. `R.springConfigs` object exists with 12 named configs (see REQUIREMENTS.md SPR-01)
2. `R.springConfig(name)` returns config by name
3. All 8+ inline spring configs replaced with `R.spring(R.springConfigs.<name>)`
4. New spring configs can be added without modifying `R.spring` (open for extension)
4. `node --test tests/spring_registry.test.js` passes
**Key files**: `src/engine/renderer.js` (add `R.springConfigs`), `src/ui/button.js`, `src/ui/modal.js`, `src/ui/panel.js`, `src/engine/scene-helpers.js`, `src/scenes/travelMap.js`, `src/scenes/cultivationScene.js`, `src/scenes/combatScene.js`, `src/scenes/fishing.js`, `tests/spring_registry.test.js` (new)
**UI hint**: no

### Phase 52: Renderer Primitive Hardening
**Goal**: Harden `R` primitives added in Phase 46 — add validation, inverse easing, spring step alias, reactive reduced-motion, 4 new semantic tokens; extend test coverage.
**Depends on**: Phase 46 (renderer primitives exist)
**Requirements**: REND-07..12
**Success Criteria**:
1. `R.strokeRoundRect` — `lineWidth` validation (clamp ≥0.5), null-ctx guard
2. `R.doubleBezel` — `opts.insetHighlight` support for custom inner highlight; null-check `coreW/coreH ≤ 0`
3. `R.easePremiumInv(t)` — inverse function for progress-to-time mapping
4. `R.spring.step(springState, dt)` alias for cleaner caller code
4. `R.reducedMotion.watch(cb)` — reactive listener registration (opt-in)
5. 4 new semantic tokens: `focus`, `success`, `warning`, `danger` in `R.colors`
6. All new functions covered by `tests/renderer_extended.test.js`
**Key files**: `src/engine/renderer.js`, `tests/renderer_extended.test.js` (new)
**UI hint**: no

### Phase 53: Component Factory Migration + Test Suite
**Goal**: Migrate remaining UI components (`UI.List`, `UI.Feedback`, `UI.HeroSurface`, `UI.TabBar`, `UI.List`, `UI.Input`, `UI.Dialog`, `UI.EmptyState`, `Scene.HeroMoment`) to `UI.Component` + mixins; create comprehensive test suite.
**Depends on**: Phase 50, Phase 51
**Requirements**: COMP-01..07 (remaining), SPR-01..04 (integration), TEST-01..04
**Success Criteria**:
1. `UI.List`, `UI.Feedback`, `UI.HeroSurface`, `UI.TabBar`, `UI.List`, `UI.Input`, `UI.Dialog`, `UI.EmptyState`, `Scene.HeroMoment` refactored to `UI.Component` + mixins
2. Zero per-frame allocation in any component `render()`/`update()`
3. `tests/component_factory.test.js` — verifies factory + mixins produce correct shape
4. `tests/spring_registry.test.js` — verifies registry resolution + spring behavior
5. `tests/renderer_extended.test.js` — covers REND-07..12
5. Full suite: **≥520 pass / 0 fail**
**Key files**: `src/ui/list.js`, `src/ui/feedback.js`, `src/ui/heroSurface.js`, `src/ui/tabbar.js`, `src/ui/list.js`, `src/ui/input.js`, `src/ui/dialog.js`, `src/engine/scene-helpers.js` (HeroMoment), `tests/component_factory.test.js`, `tests/spring_registry.test.js`, `tests/renderer_extended.test.js`
**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 50: UI Component Factory | 0/7 | Not started | — |
| 51: Spring Config Registry | 0/4 | Not started | — |
| 52: Renderer Hardening | 0/6 | Not started | — |
| 53: Migration + Tests | 0/5 | Not started | — |

## Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| COMP-01..07 | 50 | Pending |
| SPR-01..04 | 51 | Pending |
| REND-07..12 | 52 | Pending |
| TEST-01..04 | 53 | Pending |

**Coverage:**
- v10.0 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

---

*Roadmap created: 2026-10-14*
*Next: `/gsd-plan-phase 50` to begin Phase 50*