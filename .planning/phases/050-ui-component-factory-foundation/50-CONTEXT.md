# Phase 50: UI Component Factory Foundation — Context

## Grey Area Decisions (auto-accepted, yolo mode)

### A. Base factory signature
- **Decision:** `UI.Component(x, y, w, h, opts)` returns `{ x, y, w, h, render(ctx), update(dt), contains(px, py), onClick: null, data: null }`
- **Rationale:** Minimal base object shared by all UI components. Position/size are required; optional `opts` for initial state (color, text, etc.). No lifecycle methods in base — those come from mixins.
- **Source:** REQUIREMENTS.md COMP-01

### 2. Mixin composition strategy
- **Decision:** Five orthogonal mixins (`mixinRender`, `mixinUpdate`, `mixinSpring`, `mixinEase`, `mixinContains`) applied via `Object.assign` or spread. Each mixin adds a single capability.
- **Rationale:** Orthogonal composition avoids diamond inheritance; each mixin is a pure function adding one capability. Components compose exactly what they need.
- **Source:** REQUIREMENTS.md COMP-02..05

### 3. Spring mixin state allocation
**Decision:** `mixinSpring(component, config)` adds `_springState` + `_springStep = R.spring(config)` to the component object. The spring step function is created once at mixin application time (construction), not per-frame.
- **Rationale:** Zero per-frame allocation requirement (COMP-07). The step function and its velocity state are allocated once at mixin application time.
- **Source:** REQUIREMENTS.md COMP-04

### 4. Ease mixin usage
**Decision:** `mixinEase(component)` adds `easedValue(t)` method that delegates to `R.easePremium(t)`. Used for entrance/exit transitions.
**Rationale:** Centralizes easing logic; components don't need to import `R` directly.
**Source:** REQUIREMENTS.md COMP-05

### 5. Contains mixin with R.radius
**Decision:** `mixinContains(component)` adds `contains(px, py)` using `R.radius` scale for hit-testing padding.
**Rationale:** Consistent hit-testing across all components. Uses existing `R.radius` scale (xs/s/m/l).
**Source:** REQUIREMENTS.md COMP-05 (listed as COMP-06 in requirements)

### 5. Base factory signature
**Decision:** `UI.Component(x, y, w, h, opts)` where `opts` is optional and merges into the returned object. Returns object with `{ x, y, w, h, render, update, contains, onClick: null, data: null }` plus any `opts` properties.
**Rationale:** Minimal base; all specialization via mixins. Matches existing `UI.Button`/`UI.Panel` signatures.
**Source:** REQUIREMENTS.md COMP-01

### 6. Migration strategy for existing components
**Decision:** Refactor `UI.Button`, `UI.Panel`, `UI.Modal` to compose from `UI.Component` + mixins. Keep existing API surface identical (same constructor signatures, same method names). No breaking changes to callers.
**Rationale:** Zero breaking changes for callers. Internal implementation changes only.
**Source:** REQUIREMENTS.md COMP-06

### 7. Zero per-frame allocation enforcement
**Decision:** All state (spring state, eased values, hover/pressed flags) allocated once at construction. `update(dt)` and `render(ctx)` mutate in place. No object/array literals in hot paths.
**Source:** REQUIREMENTS.md COMP-07

---

## File Structure

### New file: `src/ui/component.js`
```javascript
// Base factory + 5 mixins
const UI = globalThis.UI = globalThis.UI || {};

UI.Component = function(x, y, w, h, opts) { ... };

UI.mixinRender = function(comp, drawFn) { ... };
UI.mixinUpdate = function(comp) { ... };
UI.mixinSpring = function(comp, config) { ... };
UI.mixinEase = function(comp) { ... };
UI.mixinContains = function(comp) { ... };
```

### Modified files
- `src/ui/button.js` — refactor `UI.Button` and `UI.MagneticBtn` to use `UI.Component` + mixins
- `src/ui/panel.js` — refactor `UI.Panel` to use `UI.Component` + mixins
- `src/ui/modal.js` — refactor `UI.Modal` to use `UI.Component` + mixins (modal is more complex, may need special handling)

### New test file
- `tests/component_factory.test.js` — verifies factory + mixins produce correct shape, no per-frame allocation

---

## Success Criteria (from REQUIREMENTS.md)

1. `UI.Component(x, y, w, h, opts)` returns object with `x, y, w, h, render, update, contains, onClick, data`
2. `mixinRender(comp, drawFn)` adds `render(ctx)` calling `drawFn(ctx, comp)`
3. `mixinUpdate(comp)` adds `update(dt)` calling `comp._updateHook?.(dt)`
4. `mixinSpring(comp, config)` adds `_springState`, `_springStep = R.spring(config)`, `update` advances spring
5. `mixinEase(comp)` adds `easedValue(t)` using `R.easePremium(t)`
5. `mixinContains(comp)` adds `contains(px, py)` using `R.radius`
6. `UI.Button`, `UI.Panel`, `UI.Modal` refactored to compose from `UI.Component` + mixins
6. Zero per-frame allocation in any component `render()`/`update()` — all state allocated at construction

---

## Verification

- `node --check src/ui/component.js`
- `node --check tests/component_factory.test.js`
- `node --test tests/component_factory.test.js` → pass
- `node --test tests/*.test.js` → 509+ pass, 0 fail
- `tools/check_ui_invariants.sh` → all pass

---

## Source Attribution

- Decisions from: REQUIREMENTS.md (COMP-01..07), ROADMAP-v10.md Phase 50
- Phase goal: "Establish UI.Component base factory + 5 mixins; refactor UI.Button, UI.Panel, UI.Modal"
- Dependencies: Phase 46 (R.spring, R.easePremium, R.reducedMotion, R.doubleBezel exist)
- UI hint: yes (affects button press feel, panel/modal enter animations)