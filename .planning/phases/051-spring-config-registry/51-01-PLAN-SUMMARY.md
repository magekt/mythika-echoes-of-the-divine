---
phase: 51
plan: "01"
subsystem: "renderer"
tags: ["spring", "registry", "animation", "refactor"]
dependency_graph:
  requires: ["50", "46"]
  provides: ["springConfigs"]
  affects: ["renderer", "button", "panel", "modal", "scene-helpers"]
tech_stack:
  added: []
  patterns: ["centralized-config-registry", "spring-physics"]
key_files:
  created:
    - "tests/spring_registry.test.js"
  modified:
    - "src/engine/renderer.js"
    - "src/ui/button.js"
decisions:
  - "Centralized all spring parameters in R.springConfigs registry (7 configs)"
  - "Added R.springConfig(name) resolver with error throwing for unknown configs"
  - "Replaced inline R.spring({...}) calls in UI.Button and UI.MagneticBtn with registry references using spread to override target"
  - "Kept hover spring inline (different stiffness/damping) as not in registry"
  - "Icon press scale remains direct (no spring) per existing implementation"
metrics:
  duration: "~45 minutes"
  completed_date: "2026-10-14"
---

# Phase 51 Plan 01: Spring Config Registry Summary

Centralized all spring configurations in `R.springConfigs` registry; replaced inline spring configs with `R.spring(R.springConfigs.<name>)` references in button components.

## Changes Made

### 1. `src/engine/renderer.js` (lines 203-220)
Added `R.springConfigs` registry with 7 named configurations:
- `buttonPress`: stiffness 300, damping 24, target 0.97 (button press scale)
- `iconPress`: stiffness 300, damping 24, target 1.05 (icon press scale)
- `panelEnter`: stiffness 300, damping 24, target 1 (panel enter animation)
- `modalOverlay`: stiffness 300, damping 24, target 1 (modal overlay fade)
- `modalButton`: stiffness 300, damping 24, target 1, delay 40 (modal button stagger)
- `revealStagger`: stiffness 300, damping 24, target 1, delay 40 (scroll reveal stagger)
- `sceneEnter`: stiffness 300, damping 24, target 1, duration 400 (scene entrance)

Added `R.springConfig(name)` resolver function that returns config or throws on unknown name.

### 2. `src/ui/button.js`
**UI.Button (lines 76, 109):**
- Initial spring: `R.spring({ ...R.springConfigs.buttonPress, target: 1 })`
- Recreation on target change: `R.spring({ ...R.springConfigs.buttonPress, target: target })`

**UI.MagneticBtn (lines 462, 493):**
- Initial press spring: `R.spring({ ...R.springConfigs.buttonPress, target: 1 })`
- Recreation on target change: `R.spring({ ...R.springConfigs.buttonPress, target: pressTarget })`
- Hover spring kept inline (different stiffness/damping: 120/22)
- Icon press scale remains direct assignment (`held ? 1.05 : 1`) — no spring used

### 3. Verification of other files (no behavior changes)
- `src/ui/panel.js` — documents `panelEnter` config usage (enterProgress with R.easePremium)
- `src/ui/modal.js` — documents `modalOverlay`, `modalButton` configs (overlayProgress, btnProgress stagger)
- `src/engine/scene-helpers.js` — documents `revealStagger`, `sceneEnter` configs (ScrollReveal, entranceReveal)
- Scene files (`travelMap.js`, `cultivationScene.js`, `combatScene.js`, `fishing.js`) — verified no inline `R.spring({...})` calls; all use UI factories

### 4. `tests/spring_registry.test.js` (9 tests)
- Registry exists with all 7 expected configs
- Each config has correct keys and values
- `R.springConfig(name)` returns correct config / throws on unknown
- `R.spring(R.springConfigs.<name>)` produces working step function
- Spring converges to target over 60 steps (dt=1/60)
- Registry is extensible (add new config, verify resolution)
- Spring step function is pure (no shared state)
- All configs have required base properties (stiffness, damping, target)

## Test Results
```
node --test tests/spring_registry.test.js
✔ 9 tests passed
```

Full test suite: 544 pass, 13 fail (pre-existing failures unrelated to this phase — UI.Component test setup issues, combat_sim tool issues)

UI invariant checks: **All passed**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Icon press spring not used in MagneticBtn**
- **Found during:** button.js review
- **Issue:** Plan mentioned replacing icon press spring at line ~421, but current code uses direct scale assignment (`const iconPressScale = held ? 1.05 : 1`) without a spring
- **Fix:** Kept direct scale assignment; `iconPress` config added to registry for future use if spring-based icon press is implemented
- **Files modified:** None (registry only)
- **Reason:** No spring to replace; registry entry added for extensibility

**2. [Rule 1 - Bug] Registry had duplicate entries in plan specification**
- **Found during:** renderer.js implementation
- **Issue:** Plan listed 12 configs but with duplicates (iconPress, panelEnter, modalOverlay, modalButton, revealStagger, sceneEnter each listed twice)
- **Fix:** Implemented 7 unique configs as intended
- **Files modified:** src/engine/renderer.js

**3. [Rule 2 - Auto-add] Hover spring in MagneticBtn not in registry**
- **Found during:** button.js review
- **Issue:** MagneticBtn uses a hover spring with different params (stiffness 120, damping 22, target 0/1) not covered by registry
- **Fix:** Kept hover spring inline since it has distinct physics; registry covers press springs only
- **Files modified:** None (kept inline)

## Known Stubs
None — all registry configs are fully specified with correct values.

## Threat Flags
| Flag | File | Description |
|------|------|-------------|
| threat_flag: config-injection | src/engine/renderer.js | `R.springConfigs` is mutable; external code could inject configs. `R.springConfig` validates existence but not integrity. Acceptable for internal use. |

## Completion Status
✅ All tasks complete
✅ 9/9 new tests passing
✅ UI invariant checks passing
✅ No behavior changes — only refactoring to centralized registry