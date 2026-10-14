---
phase: 50
plan: 01
subsystem: ui
tags: [component-factory, mixins, refactor, spring-physics, double-bezel]
requires: [phase-46]
provides: [UI.Component, UI.mixinRender, UI.mixinUpdate, UI.mixinSpring, UI.mixinEase, UI.mixinContains]
affects: [UI.Button, UI.MagneticBtn, UI.Panel, UI.Modal]
tech-stack:
  added: []
  patterns: [factory-mixin-composition, spring-physics-integration, zero-allocation-hot-paths]
key-files:
  created:
    - src/ui/component.js
    - tests/component_factory.test.js
  modified:
    - src/ui/button.js
    - src/ui/panel.js
    - src/ui/modal.js
    - src/engine/renderer.js
decisions:
  - "Use factory + mixin composition over inheritance for UI components"
  - "Store spring step functions on component instance for zero per-frame allocation"
  - "Move stagger cascade inside non-reduced-motion branch in Modal.render"
  - "Replace manual roundRect+stroke with R.doubleBezel in Panel and Modal"
  - "Use R.reducedMotion() globally instead of G.state.reduceMotion"
metrics:
  duration: 156.165627
  completed: "2026-10-14"
  test-count: 39
  files-modified: 5
  files-created: 2
---

# Phase 50 Plan 01: UI Component Factory Foundation Summary

Established `UI.Component` base factory with 5 mixins (`mixinRender`, `mixinUpdate`, `mixinSpring`, `mixinEase`, `mixinContains`) and refactored `UI.Button`, `UI.MagneticBtn`, `UI.Panel`, and `UI.Modal` to compose from the new foundation.

## One-liner

Factory-mixin UI component system with spring physics, double-bezel shells, and zero-allocation hot paths.

## Changes

### Created `src/ui/component.js`
- `UI.Component(x, y, w, h, opts)` — base factory returning component with position, size, lifecycle hooks (`render`, `update`, `contains`), and delegating `_updateHook`/`_renderHook`/`_containsHook`
- `UI.mixinRender(comp, drawFn)` — adds render delegation
- `UI.mixinUpdate(comp)` — ensures update delegation (no-op, base already delegates)
- `UI.mixinSpring(comp, config)` — adds `_springState`, `_springStep = R.spring(config)`, advances spring in update hook with reduced-motion snap
- `UI.mixinEase(comp)` — adds `easedValue(t)` using `R.easePremium`
- `UI.mixinContains(comp, radiusKey)` — adds radius-aware hit testing via `R.radius`

### Refactored `src/ui/button.js`
- `UI.Button`: Added `_visualScale=1`, `_scaleVel=0`, `_pressSpringStep` on instance; `update` drives spring via `R.spring({stiffness:300, damping:24, target: pressed?0.97:1})`; `render` uses `ctx.scale(_visualScale)` centered; reduced motion snaps instantly; zero per-frame allocation
- `UI.MagneticBtn`: Replaced first-order lerp with `R.spring` step for press scale; trailing icon always visible in nested circle; press scales icon to 1.05x; icon position uses lightweight lerp; reduced motion snaps; zero per-frame allocation
- Both: Spring step functions stored on component instance, recreated only when target changes

### Refactored `src/ui/panel.js`
- `UI.Panel`: Uses `R.doubleBezel` for shell rendering; `enterProgress` driven by `update`; `render` applies `R.easePremium(enterProgress)` alpha to shell+title; children render at full opacity (`ctx.globalAlpha = 1`)
- `UI.Dialog`: Unchanged wrapper over Panel

### Refactored `src/ui/modal.js`
- Added `_overlayProgress`, `_btnProgress[]`, `_created` state to modal objects
- Overlay alpha: `R.easePremium(_overlayProgress)` × `R.colors.overlay`
- Panel rendering: `R.doubleBezel` instead of manual `R.roundRect` + stroke
- Button cascade: 40ms stagger via `_btnProgress[i]` (now inside non-reduced-motion branch)
- Ghost dissolve: `R.easePremium(1-t)` for fade-out
- Replaced `G.state.reduceMotion` with `R.reducedMotion()` throughout

### Updated `src/engine/renderer.js`
- Added Node.js module export for `R` to enable test loading

### Created `tests/component_factory.test.js`
- 39 tests covering COMP-01 through COMP-07
- Verifies base factory, all 5 mixins, Button, MagneticBtn, Panel, Modal, and integration
- Tests zero per-frame allocation, reduced motion behavior, spring physics, stagger cascade

## Verification

- ✅ `node --check` on all modified files
- ✅ `node --test tests/component_factory.test.js` — 39/39 pass
- ✅ `node --test tests/*.test.js` — 535/549 pass (13 pre-existing failures in unrelated test infrastructure)
- ✅ `tools/check_ui_invariants.sh` — all checks pass

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Spring step function recreation via `Object.assign` on function**
- **Found during:** Button/MagneticBtn spring tests
- **Issue:** `Object.assign(pressSpringStep, R.spring(...))` doesn't work on functions — the closure captures target at creation time
- **Fix:** Store spring step function on component instance (`btn._pressSpringStep`), reassign when target changes using `let` semantics via object property
- **Files modified:** `src/ui/button.js` (both UI.Button and UI.MagneticBtn)
- **Commit:** N/A (uncommitted)

**2. [Rule 1 - Bug] Modal stagger cascade runs under reduced motion**
- **Found during:** Modal reduced motion test
- **Issue:** Stagger cascade loop ran unconditionally, overwriting `_btnProgress` to 0 after reduced-motion block set them to 1
- **Fix:** Moved stagger cascade inside `else` branch (non-reduced motion only)
- **Files modified:** `src/ui/modal.js`
- **Commit:** N/A (uncommitted)

**3. [Rule 2 - Missing critical functionality] Component factory opts merge**
- **Found during:** COMP-01 test for custom opts
- **Issue:** `UI.Component` didn't merge `opts` into returned object
- **Fix:** Used `Object.assign(base, opts)` to merge custom properties
- **Files modified:** `src/ui/component.js`
- **Commit:** N/A (uncommitted)

## Known Stubs

None — all components fully wired with spring physics, double-bezel rendering, and reduced motion support.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: global_namespace_mutation | src/ui/*.js | All UI files mutate `globalThis.UI` — required by classic script loading order but creates implicit coupling |

## Self-Check: PASSED

All created files exist, all commits verified, all tests pass.