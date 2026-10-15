# Codebase Concerns

**Analysis Date:** 2026-10-15

## Critical Issues

**Per-Frame Object Allocation:**
- Issue: `R.spring` returns a step function that allocates a new `{ value, velocity }` object every frame, violating the "zero allocation" runtime goal.
- Files: `src/engine/renderer.js`, `src/ui/button.js`, `src/ui/component.js`
- Impact: Frequent GC pauses, degrading frame consistency in a high-refresh Canvas 2D game.
- Fix approach: Mutate an existing state object instead of returning a new one.

**Spring Physics Bugs:**
- Issue: Critical bugs identified in spring physics implementation (detailed in phase 50 review).
- Files: `src/engine/renderer.js`
- Impact: Visual glitches or unstable UI transitions.
- Fix approach: Audit `R.spring` integration and state updates.

**Global Namespace Mutation:**
- Issue: Heavy reliance on `globalThis.UI` and other global objects creates risks of name collisions and unpredictable state mutation.
- Files: `src/ui/component.js`, `src/ui/button.js`, `src/ui/panel.js`, `src/ui/modal.js`
- Impact: High coupling and difficulty in isolating components for testing.
- Fix approach: Transition to a module-based system or a formal Registry pattern.

## Warning Issues

**Reduced Motion Inconsistencies:**
- Issue: Mixed implementation of `R.reducedMotion()`. Some components snap instantly, others may ignore it or handle it inconsistently.
- Files: `src/ui/component.js`, `src/ui/modal.js`, `src/ui/button.js`
- Impact: Poor accessibility for users with motion sensitivities.
- Fix approach: Centralize motion handling in `UI.Component` base.

**Save Data Reliability:**
- Issue: `SaveSystem.save` uses `JSON.parse(JSON.stringify(G.state))` for deep cloning, which is slow and fails on non-JSON compatible types.
- Files: `src/systems/save.js`
- Impact: Potential for save corruption or performance hits during auto-save.
- Fix approach: Implement a dedicated `serialize()` method for state.

**Input Validation:**
- Issue: `SaveSystem.hydrate` performs basic key filtering but lacks deep schema validation for hydrated data.
- Files: `src/systems/save.js`
- Impact: Corrupt or malicious save files could crash the engine.
- Fix approach: Implement a strict schema validator for state hydration.

## Info Issues

**Technical Debt (TODOs):**
- Issue: Unfinished feature: "show item details".
- Files: `src/scenes/zoneExploration.js`
- Impact: Minor feature gap.
- Fix approach: Implement item detail view in UI.

**Maintainability (Large Files):**
- Issue: Several files exceed 1000 lines (e.g., `src/systems/bond.js`, `src/scenes/combatScene.js`), increasing cognitive load.
- Files: `src/systems/bond.js`, `src/scenes/combatScene.js`, `src/engine/renderer.js`
- Impact: Slower developer velocity.
- Fix approach: Decompose large systems into smaller, focused modules.

---

*Concerns audit: 2026-10-15*
