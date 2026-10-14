# Requirements: Mythika — v10.0 Shared Library Foundations

**Defined:** 2026-10-14
**Milestone:** v10.0 — Shared Library Foundations
**Source:** P0 findings from `.planning/phases/045-performance-optimizations/45-UI-AUDIT.md` + v9.0 retrospective
**Core Value:** Every play session should feel like a meaningful cultivation journey: the player understands their next path, makes consequential choices, sees those choices reshape the world, and trusts that the resulting state persists.

## v10.0 Requirements

### UI Component Factory (Foundation Layer)

- [ ] **COMP-01**: `UI.Component(x, y, w, h, opts)` base factory returns `{ x, y, w, h, render(ctx), update(dt), contains(px, py), onClick: null, data: null }` — base object shared by all UI components
- [ ] **COMP-02**: `UI.mixinRender(component, drawFn)` mixin adds `render(ctx)` that calls `drawFn(ctx, component)`; used by `UI.Button`, `UI.Panel`, `UI.Modal`, `UI.List`, `UI.Feedback`, `UI.HeroSurface`, `UI.TabBar`, `UI.Input`, `UI.Dialog`, `UI.EmptyState`, `Scene.HeroMoment`
- [ ] **COMP-03**: `UI.mixinUpdate(component)` mixin adds `update(dt)` that calls `component._updateHook?.(dt)`; used by components needing per-frame logic (buttons, panels, modals, lists, scene CTAs)
- [ ] **COMP-04**: `UI.mixinSpring(component, config)` mixin adds `_springState` + `_springStep = R.spring(config)`; `update(dt)` advances spring and stores result in `component._springValue`
- [ ] **COMP-05**: `UI.mixinEase(component)` mixin adds `easedValue(t)` using `R.easePremium(t)` for entrance/exit transitions
- [ ] **COMP-06**: `UI.mixinContains(component)` mixin adds `contains(px, py)` using `R.radius` scale for hit-testing
- [ ] **COMP-06**: All existing UI factories (`UI.Button`, `UI.Panel`, `UI.Modal`, `UI.List`, `UI.Feedback`, `UI.HeroSurface`, `UI.TabBar`, `UI.List`, `UI.Input`, `UI.Dialog`, `UI.EmptyState`, `Scene.HeroMoment`) refactored to compose from `UI.Component` + mixins instead of hand-rolled objects
- [ ] **COMP-07**: No per-frame object allocation in any component `render()` or `update()` — all state allocated once at construction, mutated in place

### Spring Config Registry

- [ ] **SPR-01**: `R.springConfigs` object exists with named configs for all spring use-cases:
  - `buttonPress: { stiffness: 300, damping: 24, target: 0.97 }` — button press scale
  - `iconPress: { stiffness: 300, damping: 24, target: 1.05 }` — icon press scale
  - `panelEnter: { stiffness: 300, damping: 24, target: 1 }` — panel enter animation
  - `modalOverlay: { stiffness: 300, damping: 24, target: 1 }` — modal overlay fade
  - `modalButton: { stiffness: 300, damping: 24, target: 1, delay: 40 }` — modal button cascade
  - `revealStagger: { stiffness: 300, damping: 24, target: 1, delay: 40 }` — reveal stagger delay
  - `sceneEnter: { stiffness: 300, damping: 24, target: 1, duration: 400 }` — scene entrance
  - `iconPress: { stiffness: 300, damping: 24, target: 1.05 }` — icon press scale
  - `panelEnter: { stiffness: 300, damping: 24, target: 1 }` — panel enter
  - `modalOverlay: { stiffness: 300, damping: 24, target: 1 }` — modal overlay
  - `modalButton: { stiffness: 300, damping: 24, target: 1, delay: 40 }` — modal button cascade
  - `revealStagger: { stiffness: 300, damping: 24, target: 1, delay: 40 }` — reveal stagger
  - `sceneEnter: { stiffness: 300, damping: 24, target: 1, duration: 400 }` — scene entrance
- [ ] **SPR-02**: `R.springConfig(name)` returns config by name; callers use `R.spring(R.springConfigs.buttonPress)` instead of inline objects
- [ ] **SPR-03**: All 8+ inline spring configs in `button.js` (2×), `modal.js`, `panel.js`, `scene-helpers.js` (2×), `travelMap.js` (3×), `cultivationScene.js`, `combatScene.js`, `fishing.js` replaced with `R.springConfigs.*` references
- [ ] **SPR-04**: New spring configs can be added without modifying `R.spring` — registry is open for extension

### Renderer Primitive Hardening

- [ ] **REND-07**: `R.strokeRoundRect` — add `lineWidth` parameter validation (clamp to ≥0.5), add `R.strokeRoundRect` to renderer test suite
- [ ] **REND-08**: `R.doubleBezel` — add `opts.insetHighlight` support for custom inner highlight color; add null-check for `coreW/coreH ≤ 0`
- [ ] **REND-09**: `R.easePremium` — add `R.easePremiumInv(t)` inverse function for progress-to-time mapping
- [ ] **REND-10**: `R.spring` — add `R.spring.step(springState, dt)` alias for cleaner caller code
- [ ] **REND-11**: `R.reducedMotion()` — add `R.reducedMotion.watch(cb)` for reactive listeners (opt-in)
- [ ] **REND-12**: Semantic tokens — add `focus`, `success`, `warning`, `danger` tokens to `R.colors` for consistent state colors

### Test Coverage Requirements

- [ ] **TEST-01**: `tests/component_factory.test.js` — verifies `UI.Component` + mixins produce objects with correct shape, no per-frame allocation
- [ ] **TEST-02**: `tests/spring_registry.test.js` — verifies `R.springConfigs` all resolve, `R.spring(R.springConfigs.*)` produces working step functions
- [ ] **TEST-03**: `tests/renderer_extended.test.js` — covers REND-07..12
- [ ] **TEST-04**: All new tests pass `node --test tests/*.test.js` (target: ≥520 pass, 0 fail)

### Out of Scope for v10.0

| Item | Reason |
|------|--------|
| Full Tailwind/DOM migration | Never — immediate-mode Canvas is the runtime contract |
| Scene lifecycle overhaul (enter/leave/update/render) | Scene-specific logic varies too much; defer to v11 |
| Full Tailwind/DOM migration | Never — immediate-mode Canvas is the runtime contract |
| Gameplay/system overhaul | Out of scope — this milestone is shared-UI foundations only |
| Build step / bundler | Never — zero-build is a core constraint |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| COMP-01..07 | Phase 50 | Pending |
| SPR-01..04 | Phase 51 | Pending |
| REND-07..12 | Phase 52 | Pending |
| TEST-01..04 | Phase 53 | Pending |

**Coverage:**
- v10.0 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0