---
phase: 51-spring-config-registry
reviewed: 2026-10-14T22:30:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/engine/renderer.js
  - src/ui/button.js
  - src/ui/panel.js
  - src/ui/modal.js
  - src/engine/scene-helpers.js
  - src/ui/component.js
  - tests/spring_registry.test.js
findings:
  critical: 3
  warning: 4
  info: 4
  total: 11
status: issues_found
---

# Phase 51: Spring Config Registry — Code Review Report

**Reviewed:** 2026-10-14T22:30:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Phase 51 centralizes spring physics parameters into `R.springConfigs` registry (7 named configurations) and adds `R.springConfig(name)` resolver. Inline `R.spring({...})` calls in `UI.Button` and `UI.MagneticBtn` were replaced with registry references using spread syntax to override `target`. Other UI files (`panel.js`, `modal.js`, `scene-helpers.js`) and scene files were verified to have no inline spring calls — they use `R.easePremium` or manual progress tracking instead.

The implementation is functionally correct and all 9 new tests pass. However, several issues ranging from input validation gaps to registry mutability concerns were identified.

---

## Critical Issues

### CR-01: `R.springConfig` lacks input type validation

**File:** `src/engine/renderer.js:265-268`

```javascript
R.springConfig = function(name) {
  var cfg = R.springConfigs[name];
  if (!cfg) throw new Error('Unknown spring config: ' + name);
  return cfg;
};
```

**Issue:** The function only checks `if (!cfg)` which catches `null`, `undefined`, and empty string `''`, but does not validate that `name` is a string. Passing a number, object, or array will either:
- Return `undefined` from `R.springConfigs[name]` (objects/arrays coerce to `"[object Object]"` key)
- Throw with a confusing message like `"Unknown spring config: [object Object]"`

**Fix:**
```javascript
R.springConfig = function(name) {
  if (typeof name !== 'string' || name === '') {
    throw new Error('springConfig name must be a non-empty string, got: ' + typeof name);
  }
  var cfg = R.springConfigs[name];
  if (!cfg) throw new Error('Unknown spring config: ' + name);
  return cfg;
};
```

---

### CR-02: `R.springConfigs` registry is globally mutable

**File:** `src/engine/renderer.js:254-262`

```javascript
R.springConfigs = {
  buttonPress: { stiffness: 300, damping: 24, target: 0.97 },
  iconPress: { stiffness: 300, damping: 24, target: 1.05 },
  panelEnter: { stiffness: 300, damping: 24, target: 1 },
  modalOverlay: { stiffness: 300, damping: 24, target: 1 },
  modalButton: { stiffness: 300, damping: 24, target: 1, delay: 40 },
  revealStagger: { stiffness: 300, damping: 24, target: 1, delay: 40 },
  sceneEnter: { stiffness: 300, damping: 24, target: 1, duration: 400 }
};
```

**Issue:** The registry object is exposed directly on `R.springConfigs`. Any code (including third-party scripts, browser extensions, or compromised dependencies) can mutate the registry:
```javascript
R.springConfigs.buttonPress.stiffness = 9999;  // breaks all button press animations
R.springConfigs.malicious = { stiffness: 0, damping: 0, target: 0 };  // injects invalid config
```
While the plan documents this as "acceptable for internal use," it violates the principle of least privilege and creates a configuration injection surface.

**Fix:** Freeze the registry or provide a controlled mutation API:
```javascript
// Option A: Deep freeze (prevents all mutation)
R.springConfigs = Object.freeze({
  buttonPress: Object.freeze({ stiffness: 300, damping: 24, target: 0.97 }),
  // ... other configs
});

// Option B: Controlled extension API (preferred for extensibility)
R.registerSpringConfig = function(name, config) {
  if (typeof name !== 'string' || name === '') throw new Error('Invalid config name');
  if (R.springConfigs[name]) throw new Error('Config already exists: ' + name);
  // Validate config shape
  if (typeof config.stiffness !== 'number' || config.stiffness <= 0) throw new Error('stiffness must be positive number');
  if (typeof config.damping !== 'number' || config.damping <= 0) throw new Error('damping must be positive number');
  if (typeof config.target !== 'number') throw new Error('target must be number');
  R.springConfigs[name] = Object.freeze({ ...config });
};
```

---

### CR-03: `UI.mixinSpring` in component.js bypasses registry entirely

**File:** `src/ui/component.js:97-99`

```javascript
globalThis.UI.mixinSpring = function(comp, config) {
  comp._springState = { value: config.target || 1, velocity: 0 };
  comp._springStep = R.spring(config);  // Direct R.spring(config) call
  // ...
};
```

**Issue:** The generic `UI.mixinSpring` accepts any config object and passes it directly to `R.spring()`, completely bypassing the registry. This defeats the purpose of centralization — new components using this mixin will continue to use inline configs. The mixin should either:
1. Accept a registry key name and resolve via `R.springConfig()`
2. Be deprecated in favor of direct registry usage

**Fix:**
```javascript
globalThis.UI.mixinSpring = function(comp, configOrName) {
  var config = (typeof configOrName === 'string')
    ? R.springConfig(configOrName)  // Resolve from registry
    : configOrName;                 // Allow inline for one-off cases (with warning?)
  comp._springState = { value: config.target || 1, velocity: 0 };
  comp._springStep = R.spring(config);
  comp._springConfig = config;
  // ...
};
```

---

## Warnings

### WR-01: Hover spring in `UI.MagneticBtn` uses inline config not in registry

**File:** `src/ui/button.js:459`

```javascript
_hoverSpringStep: R.spring({ stiffness: 120, damping: 22, target: 0 }),
```

**Issue:** The hover spring uses different physics (stiffness 120, damping 22) than the registry configs (all stiffness 300, damping 24). While the plan acknowledges this as intentional ("different physics"), it creates an inconsistency — the hover spring is not discoverable in the registry, not testable via registry tests, and cannot be centrally tuned.

**Fix:** Add `hover` config to registry:
```javascript
// In renderer.js
hover: { stiffness: 120, damping: 22, target: 0 },

// In button.js line 459
_hoverSpringStep: R.spring({ ...R.springConfigs.hover, target: 0 }),
```

---

### WR-02: `iconPress` config exists in registry but is unused

**File:** `src/engine/renderer.js:256` and `src/ui/button.js:584`

```javascript
// renderer.js
iconPress: { stiffness: 300, damping: 24, target: 1.05 },

// button.js line 584
const iconPressScale = held ? 1.05 : 1;  // Direct assignment, no spring
```

**Issue:** The `iconPress` config was added to the registry "for future use" but the actual icon press animation uses a direct ternary assignment without any spring physics. This creates dead code in the registry and misleads developers into thinking icon press uses a spring.

**Fix:** Either:
- Remove `iconPress` from registry (since it's unused)
- Or implement spring-based icon press scaling using the registry config

---

### WR-03: `R.spring` default values differ from registry values

**File:** `src/engine/renderer.js:228-230` vs `src/engine/renderer.js:254-262`

```javascript
// R.spring defaults (line 228-230)
var stiffness = config.stiffness !== undefined ? config.stiffness : 170;
var damping = config.damping !== undefined ? config.damping : 26;
var target = config.target !== undefined ? config.target : 1;

// Registry configs (all use stiffness: 300, damping: 24)
```

**Issue:** The `R.spring` factory defaults (stiffness=170, damping=26) differ from all registry configs (stiffness=300, damping=24). Code using `R.spring({})` with no args gets different physics than any registry config. This is a footgun for future developers.

**Fix:** Align defaults with registry standard, or document the divergence clearly:
```javascript
// Option: Update defaults to match registry
var stiffness = config.stiffness !== undefined ? config.stiffness : 300;
var damping = config.damping !== undefined ? config.damping : 24;
var target = config.target !== undefined ? config.target : 1;
```

---

### WR-04: Spread pattern creates new object on every target change

**File:** `src/ui/button.js:76,109,458,489`

```javascript
// Initial creation
_pressSpringStep: R.spring({ ...R.springConfigs.buttonPress, target: 1 }),

// Recreation on target change
b._pressSpringStep = R.spring({ ...R.springConfigs.buttonPress, target: target });
```

**Issue:** Every time the press target changes (press → release or release → press), a new config object is created via spread, then passed to `R.spring()` which creates a new step function. While this is the intended pattern (step function recreation only on target change), it allocates a temporary config object each transition. In a high-frequency scenario (rapid tap/release), this creates GC pressure.

**Fix:** Pre-create step functions for both targets:
```javascript
// In UI.Button factory
const pressConfig = { ...R.springConfigs.buttonPress, target: 0.97 };
const releaseConfig = { ...R.springConfigs.buttonPress, target: 1 };
_pressSpringStep: R.spring(releaseConfig),
_pressSpringStepPressed: R.spring(pressConfig),
_releaseConfig: releaseConfig,  // Keep reference for recreation if needed
_pressConfig: pressConfig,

// In update hook
if (b._pressSpringStep._target !== target) {
  b._pressSpringStep = target === 0.97 ? b._pressSpringStepPressed : b._pressSpringStep;
  b._pressSpringStep._target = target;
}
```

---

## Info

### IN-01: Registry contains exactly 7 configs, not 12 as originally planned

**File:** `src/engine/renderer.js:254-262`

**Issue:** The plan summary mentions "Plan listed 12 configs but with duplicates... Implemented 7 unique configs as intended." The current registry has 7 entries. This is correct behavior but the discrepancy between plan (12) and implementation (7) should be documented in the registry comment.

**Suggestion:** Update the registry comment to reflect the final count:
```javascript
// Spring configuration registry — 7 centralized spring parameters.
// Replace inline R.spring({...}) with R.spring(R.springConfigs.<name>).
```

---

### IN-02: Magic numbers (300, 24) repeated across all registry configs

**File:** `src/engine/renderer.js:254-262`

All 7 configs use `stiffness: 300, damping: 24`. These are magic numbers with no named constants.

**Suggestion:** Extract to constants for maintainability:
```javascript
const SPRING_STIFFNESS = 300;
const SPRING_DAMPING = 24;

R.springConfigs = {
  buttonPress: { stiffness: SPRING_STIFFNESS, damping: SPRING_DAMPING, target: 0.97 },
  // ...
};
```

---

### IN-03: Test coverage gaps in `spring_registry.test.js`

**File:** `tests/spring_registry.test.js`

The 9 tests cover happy paths well but miss edge cases:
- `R.springConfig` with non-string inputs (number, object, array)
- Spring step function with `dt=0`, negative `dt`, `NaN`, `Infinity`
- Spring step function with `NaN`/`Infinity` current/velocity values
- Registry mutation after freeze (if CR-02 is fixed)

**Suggestion:** Add tests for input validation and edge cases.

---

### IN-04: `UI.mixinSpring` wraps existing `_updateHook` but order may matter

**File:** `src/ui/component.js:103-115`

```javascript
const prevHook = comp._updateHook;
comp._updateHook = function(dt, c) {
  if (prevHook) prevHook(dt, c);
  // Advance spring AFTER prevHook
  // ...
};
```

**Issue:** The spring advancement runs *after* the previous hook. If the previous hook modifies state that the spring depends on (or vice versa), order matters. This is a subtle coupling that should be documented.

**Suggestion:** Add comment explaining the order:
```javascript
// Spring runs AFTER consumer hook so consumer can modify config/target
// before spring step calculates the frame.
```

---

_Reviewed: 2026-10-14T22:30:00Z_
_Reviewer: OpenCode (gsd-code-reviewer)_
_Depth: standard_