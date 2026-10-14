---
phase: 050-ui-component-factory-foundation
reviewed: 2026-10-14T12:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/ui/component.js
  - src/ui/button.js
  - src/ui/panel.js
  - src/ui/modal.js
  - src/engine/renderer.js
  - tests/component_factory.test.js
findings:
  critical: 4
  warning: 7
  info: 5
  total: 16
status: issues_found
---

# Phase 50: Code Review Report

**Reviewed:** 2026-10-14T12:00:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

The UI Component Factory Foundation (Phase 50) introduces a base component system with mixins for rendering, updates, spring physics, easing, and hit testing. The refactored Button, Panel, and Modal components adopt this pattern. While the architecture is sound and tests are comprehensive, there are **critical violations of the "zero per-frame allocation" claim**, **spring physics bugs**, **reduced motion handling inconsistencies**, and **global namespace mutation risks** that must be addressed before this code ships.

---

## Critical Issues

### CR-01: Per-frame object allocation in spring step functions violates "zero allocation" claim

**File:** `src/engine/renderer.js:231-236`
**Issue:** The `R.spring` factory returns a step function that creates a new object `{ value, velocity }` on every call. All UI components (Button, MagneticBtn, mixinSpring) call this step function in their update hooks, allocating a new object every frame.

```javascript
// renderer.js:231-236
return function(current, velocity, dt) {
  var force = stiffness * (target - current) - damping * velocity;
  velocity += force * dt;
  var value = current + velocity * dt;
  return { value: value, velocity: velocity };  // NEW OBJECT EVERY FRAME
};
```

**Fix:** Use the existing `R.spring.step` utility (renderer.js:242-250) which mutates the spring state in place, or modify the spring factory to accept a pre-allocated output object.

```javascript
// Option A: Use R.spring.step (requires components to store _springFn)
R.spring.step = function(springState, dt) {
  var fn = springState._springFn;
  var r = fn(springState.value, springState.velocity, dt);
  springState.value = r.value;
  springState.velocity = r.velocity;
  return springState;  // Returns same object
};

// Option B: Modify spring factory to mutate output parameter
R.spring = function(config) {
  var stiffness = config.stiffness || 170;
  var damping = config.damping || 26;
  var target = config.target || 1;
  return function(current, velocity, dt, out) {
    var force = stiffness * (target - current) - damping * velocity;
    velocity += force * dt;
    var value = current + velocity * dt;
    if (out) { out.value = value; out.velocity = velocity; return out; }
    return { value, velocity };
  };
};
```

---

### CR-02: Per-frame object literal allocation in `R.doubleBezel` calls

**File:** `src/ui/panel.js:66-70`, `src/ui/modal.js:133-137`, `src/ui/modal.js:245-249`
**Issue:** The `R.doubleBezel` calls in render hooks pass an inline options object literal, creating a new object every render frame.

```javascript
// panel.js:66-70 - executes every render frame
R.doubleBezel(ctx, p.x, p.y, p.w, p.h, {
  shellFill: p.color || R.colors.surfaceElevated,
  shellStroke: p.borderColor || R.colors.hairline,
  radius: R.radius.m,
});
```

**Fix:** Pre-allocate the options object on the component instance at construction, or pass primitive parameters directly to `R.doubleBezel`.

```javascript
// In UI.Panel factory, pre-allocate:
const bezelOpts = {
  shellFill: color || R.colors.surfaceElevated,
  shellStroke: borderColor || R.colors.hairline,
  radius: R.radius.m,
};
panel._bezelOpts = bezelOpts;

// In render hook:
R.doubleBezel(ctx, p.x, p.y, p.w, p.h, p._bezelOpts);
```

---

### CR-03: `mixinSpring` ignores reduced motion check for `R.reducedMotion` function existence

**File:** `src/ui/component.js:107`
**Issue:** The check `if (R.reducedMotion && R.reducedMotion())` is correct but inconsistent with other files. More critically, when reduced motion is active, the spring state is snapped to target but the `_springStep` function reference is NOT cleared, so subsequent frames still call it (though the early return prevents state mutation).

```javascript
// component.js:104-115
comp._updateHook = function(dt, c) {
  if (prevHook) prevHook(dt, c);
  if (R.reducedMotion && R.reducedMotion()) {  // Works but redundant
    c._springState.value = c._springConfig.target;
    c._springState.velocity = 0;
  } else {
    const s = c._springStep(c._springState.value, c._springState.velocity, dt);
    c._springState.value = s.value;
    c._springState.velocity = s.velocity;
  }
};
```

**Fix:** Standardize on `R.reducedMotion()` call pattern used in modal.js. The early return is correct, but consider nulling `_springStep` under reduced motion to avoid unnecessary calls.

---

### CR-04: `UI.MagneticBtn` creates unused `_hoverSpringStep` — wasted allocation and confusion

**File:** `src/ui/button.js:459`, `467`
**Issue:** `_hoverSpringStep` is created at construction and `_target` set, but **never used** anywhere in the update or render hooks. The hover effect uses a simple lerp (`_iconSpringX/Y`) instead. This wastes memory and misleads maintainers.

```javascript
// button.js:458-459, 466-467
_pressSpringStep: R.spring({ ...R.springConfigs.buttonPress, target: 1 }),
_hoverSpringStep: R.spring({ stiffness: 120, damping: 22, target: 0 }),  // NEVER USED
// ...
btn._pressSpringStep._target = 1;
btn._hoverSpringStep._target = 0;  // Set but never read
```

**Fix:** Remove the unused `_hoverSpringStep` allocation entirely.

---

## Warnings

### WR-01: Inconsistent `R.reducedMotion()` usage patterns across files

**File:** `src/ui/component.js:107`, `src/ui/button.js:101,477,518`, `src/ui/panel.js:52`, `src/ui/modal.js:81,110,197,218`
**Issue:** Four different patterns used:
- `if (R.reducedMotion && R.reducedMotion())` — component.js, button.js (UI.Button)
- `const reduceMotion = R.reducedMotion && R.reducedMotion()` — button.js (MagneticBtn)
- `if (R.reducedMotion && R.reducedMotion())` — panel.js
- `const reduceMotion = R.reducedMotion()` — modal.js (cleanest)

Since `R.reducedMotion` is always a function (renderer.js:102), the `&& R.reducedMotion` guard is unnecessary.

**Fix:** Standardize on `const reduceMotion = R.reducedMotion();` everywhere.

---

### WR-02: Spring target change detection uses function property mutation — fragile

**File:** `src/ui/button.js:76,80,108-110,458,466,488-490`
**Issue:** The pattern `b._pressSpringStep._target = target` attaches a custom property to the function object returned by `R.spring()`. This works but is non-standard and fragile (function properties can be stripped by minifiers/optimizers).

```javascript
// Construction
b._pressSpringStep = R.spring({ ...R.springConfigs.buttonPress, target: 1 });
b._pressSpringStep._target = 1;  // Custom property on function

// Update hook
if (b._pressSpringStep._target !== target) {
  b._pressSpringStep = R.spring({ ...R.springConfigs.buttonPress, target: target });
  b._pressSpringStep._target = target;
}
```

**Fix:** Store target separately on the component: `b._pressSpringTarget = target` and compare that.

---

### WR-03: `UI.Button` update hook reads `Input._touchCurrent`, `_touchStart`, `_pressPos` directly — tight coupling

**File:** `src/ui/button.js:94,124`
**Issue:** The button update and render hooks directly access internal `Input` module state (`_touchCurrent`, `_touchStart`, `_pressPos`). This creates tight coupling and makes testing difficult (requires mocking private Input fields).

```javascript
const down = Input._touchCurrent || Input._touchStart || Input._pressPos;
```

**Fix:** Expose a public `Input.getPointer()` or `Input.isPointerDown()` API, or pass pointer state as a parameter to update/render.

---

### WR-04: `UI.Modal._updateHook` uses `performance.now()` for timing instead of `dt` accumulator

**File:** `src/ui/modal.js:90,96`
**Issue:** The modal enter animation and button stagger use `performance.now() - m._created` instead of accumulating `dt`. This makes the animation frame-rate dependent and breaks if the game loop stutters or runs at non-standard frame rates.

```javascript
m._overlayProgress = Math.min(1, (performance.now() - m._created) / 250);
m._btnProgress[i] = Math.max(0, Math.min(1, (performance.now() - m._created - startDelayMs) / 400));
```

**Fix:** Accumulate `dt` in `_elapsed` field on the modal instance and use that for progress calculations.

---

### WR-05: `UI.Modal` ghost dissolve uses `performance.now()` and doesn't accumulate `dt`

**File:** `src/ui/modal.js:198,202`
**Issue:** Same problem as WR-04 — ghost fade-out uses wall-clock time instead of `dt`.

```javascript
const t = Math.max(0, Math.min(1, (performance.now() - g._closedAt) / 100));
g._alpha = R.easePremium(1 - t);
```

**Fix:** Track elapsed time on the ghost object and update via `dt` in `UI.Modal.update`.

---

### WR-06: `UI.Panel` enter animation uses linear progress with eased render — inconsistent with spring-based components

**File:** `src/ui/panel.js:56-57`
**Issue:** Panel uses `p.enterProgress = Math.min(1, p.enterProgress + (dt || 0) / 0.25)` (linear) then applies `R.easePremium` at render time. Buttons and modals use spring physics for smoother, more natural motion. This inconsistency creates different "feel" across components.

**Fix:** Use `mixinSpring` or a spring config for panel enter animation to match other components.

---

### WR-07: `UI.Modal.create` doesn't reset `_created` timestamp on reuse — stale timing if modal is pooled

**File:** `src/ui/modal.js:84`
**Issue:** `if (!m._created) m._created = performance.now();` only sets `_created` once. If modals are ever pooled/reused (not currently done but possible future), the timestamp would be stale.

**Fix:** Always reset `_created = performance.now()` in `UI.Modal.show` after creating the modal.

---

## Info

### IN-01: Global `globalThis.UI` mutation in every UI file — test isolation risk

**File:** `src/ui/component.js:3`, `src/ui/button.js:3`, `src/ui/panel.js:3`, `src/ui/modal.js:3`
**Issue:** Every UI file executes `globalThis.UI = globalThis.UI || {};` at top level. While this is the established pattern in the codebase, it mutates global state on module load, which can cause test pollution and load-order dependencies. The test file correctly sets up `global.UI = {}` before requiring modules.

**Recommendation:** Consider an explicit initialization function `UI.init()` called once at game boot, or use a module system. For now, document the load-order requirement.

---

### IN-02: `R.spring.step` utility exists but is unused by any component

**File:** `src/engine/renderer.js:242-250`
**Issue:** The `R.spring.step` function is designed for in-place mutation (avoiding allocation) but no component uses it. Components call the raw spring function directly, causing per-frame allocations (see CR-01).

**Recommendation:** Migrate components to use `R.spring.step` pattern, or remove the unused utility.

---

### IN-03: `UI.Component` base factory uses `x || 0` pattern — breaks if 0 is explicitly passed

**File:** `src/ui/component.js:19-22`
**Issue:** `x: x || 0` treats `0` as falsy, so `UI.Component(0, 0, 100, 100)` works but `UI.Component(0, 10, 100, 100)` would set `x=0` correctly. However, `UI.Component(null, 10, 100, 100)` would also set `x=0`. The pattern is acceptable for this codebase but `x ?? 0` (nullish coalescing) would be more precise if targeting modern JS.

**Recommendation:** Use `x != null ? x : 0` or `x ?? 0` for clarity.

---

### IN-04: Test file mocks `performance.now` by reassignment — fragile in parallel test runs

**File:** `tests/component_factory.test.js:516-518, 569-571`
**Issue:** Tests temporarily replace `performance.now` with a custom function. If tests run in parallel (Node `--test` doesn't by default, but could), this would affect other tests.

```javascript
const originalNow = performance.now;
let now = m._created;
performance.now = () => now;
// ...
performance.now = originalNow;
```

**Recommendation:** Use a wrapper function or dependency injection for time in components to avoid global mocking.

---

### IN-05: Magic numbers throughout — should be named constants

**File:** Multiple (button.js, modal.js, panel.js)
**Issue:** Hardcoded values: `0.97` (press scale), `0.25` (panel enter duration), `250` (modal overlay ms), `40` (button stagger ms), `120` (modal enter ms), `100` (ghost dissolve ms), `8` (icon lerp rate), etc.

**Recommendation:** Centralize animation timings in `R.springConfigs` or a new `R.animConfigs` object.

---

_Reviewed: 2026-10-14T12:00:00Z_
_Reviewer: OpenCode (gsd-code-reviewer)_
_Depth: standard_