---
phase: 053-component-factory-migration
reviewed: 2026-10-14T18:45:00Z
depth: deep
files_reviewed: 12
files_reviewed_list:
  - src/ui/component.js
  - src/ui/button.js
  - src/ui/panel.js
  - src/ui/modal.js
  - src/ui/list.js
  - src/ui/feedback.js
  - src/ui/heroSurface.js
  - src/ui/tabbar.js
  - src/engine/scene-helpers.js
  - tests/component_factory.test.js
  - tests/spring_registry.test.js
  - tests/renderer_extended.test.js
findings:
  critical: 14
  warning: 23
  info: 18
  total: 55
status: issues_found
---

# Phase 53: Code Review Report

**Reviewed:** 2026-10-14T18:45:00Z
**Depth:** deep
**Files Reviewed:** 12
**Status:** issues_found

## Summary

The Component Factory Migration (Phase 53) successfully migrates 9 UI components to the new `UI.Component` + mixins architecture. All 579 tests pass (0 failures). However, the review reveals **14 critical issues**, **23 warnings**, and **18 info items** that must be addressed before this code ships.

**Key Concerns:**
1. **Duplicate/Inconsistent Implementations** — Three components (EmptyState, ScrollReveal, FluidNav) exist in two places with different implementations; one version has a critical `setTimeout` bug.
2. **Global State Coupling** — Components tightly couple to `G`, `Input`, `R`, `Audio` globals, making testing brittle and creating hidden dependencies.
3. **Spring Registry Inconsistency** — Components use mixed patterns: direct `R.springConfigs` access, spread operators, `_target` hacks, and the new `R.spring.step` alias.
4. **Per-Frame Allocations** — Several hot paths allocate objects (mock ctx, arrays, closures) that should be zero-allocation.
5. **Game Time vs Wall Time** — Multiple components use `performance.now()` directly instead of game-frame time, breaking pause/resume and reduced-motion consistency.

---

## Critical Issues

### CR-01: UI.ScrollReveal in button.js uses `setTimeout` for stagger delays (breaks game time, pause, reduced-motion)

**File:** `src/ui/button.js:645-688` (UI.ScrollReveal factory)

**Issue:** The `update` method uses `setTimeout(() => { el._revealed = true; }, el._revealOpts.delay);` which:
- Runs on wall-clock time, not game time (dt)
- Doesn't pause when game pauses
- Fires even after component destruction (memory leak risk)
- Bypasses `R.reducedMotion()` check for the delay phase

**Fix:** Use elapsed-time tracking like `Scene.ScrollReveal` in `scene-helpers.js:234-292`:
```javascript
// In update hook:
if (el._revealStarted && !el._revealed) {
  const now = performance.now();
  if (now - el._revealStart >= el._revealOpts.delay * 1000) {
    el._revealed = true;
  }
}
```

### CR-02: UI.FluidNav in button.js has broken hit test (compares y to itself)

**File:** `src/ui/button.js:782`

**Issue:** Line 782: `if (Math.abs(y - y) < 30 && item.scene)` — always evaluates to `0 < 30` (true). Should compare against item position.

**Fix:**
```javascript
const itemY = G.H/2 - 60 + i * 50; // or use expandedRowY(i, true)
if (Math.abs(y - itemY) < 30 && item.scene) {
```

### CR-03: Duplicate EmptyState implementations (UI.EmptyState vs Scene.EmptyState)

**Files:** `src/ui/button.js:794-871` and `src/engine/scene-helpers.js:447-514`

**Issue:** Two implementations with different APIs, different CTA construction patterns, and different illustration sets. `UI.EmptyState` wraps in `UI.Component`; `Scene.EmptyState` returns plain object. Scenes use `Scene.EmptyState`; unclear which is canonical.

**Fix:** Consolidate to single implementation in `src/ui/` and have `Scene.EmptyState` delegate or remove.

### CR-04: Duplicate ScrollReveal implementations (UI.ScrollReveal vs Scene.ScrollReveal)

**Files:** `src/ui/button.js:645-688` and `src/engine/scene-helpers.js:234-292`

**Issue:** `Scene.ScrollReveal` correctly uses elapsed-time state; `UI.ScrollReveal` uses broken `setTimeout`. Both exported globally.

**Fix:** Remove `UI.ScrollReveal` from button.js; export `Scene.ScrollReveal` as `UI.ScrollReveal` or have scenes import from scene-helpers.

### CR-05: Duplicate FluidNav implementations (UI.FluidNav vs Scene.FluidNav)

**Files:** `src/ui/button.js:690-792` and `src/engine/scene-helpers.js:294-444`

**Issue:** `Scene.FluidNav` has proper spring stagger, correct hit testing, and expanded/collapsed states. `UI.FluidNav` has broken hit test (CR-02), simpler spring, and different item layout.

**Fix:** Consolidate to `Scene.FluidNav`; remove from button.js.

### CR-06: HeroSurface._renderHook reads `global.R` at render time (fragile global access)

**File:** `src/ui/heroSurface.js:128`

**Issue:** `const R = global.R;` inside render hook. If `global.R` is reassigned or unavailable, renders break. Should capture at module scope.

**Fix:**
```javascript
// At module top:
const R = globalThis.R || {};
// In render hook, use captured R
```

### CR-07: BlockerTooltip.getMaxLineWidth uses fake ctx with 6px/char estimate (incorrect text measurement)

**File:** `src/ui/feedback.js:395-404`

**Issue:** Creates mock `{ measureText: (s) => ({ width: s.length * 6 }) }` — assumes monospace 6px/char. Actual font is variable-width Geist. Tooltip width will be wrong.

**Fix:** Pass real canvas context or use `R.text` measurement utilities. Or measure once at construction with real ctx.

### CR-08: Scene.HeroMoment, Scene.EmptyState, Scene.FluidNav capture `G.W/G.H` at factory time (may be uninitialized)

**File:** `src/engine/scene-helpers.js:158, 497, 308`

**Issue:** `const cx = G.W/2;` at module load time. If `G` not fully initialized (e.g., during early load), `G.W` is undefined → NaN positions.

**Fix:** Defer layout computation to first render/update, or accept viewport dimensions as parameters.

### CR-09: Scene.FluidNav.activateItem directly mutates G.state.party (bypasses systems)

**File:** `src/engine/scene-helpers.js:334-337`

**Issue:** `for (const h of G.state.party) { h.hp = h.maxHp; h.mp = h.maxMp; }` — Direct state mutation without going through `Combat`, `Progression`, or `SaveSystem`. Breaks exactly-once semantics, skip validation, won't persist correctly.

**Fix:** Route through canonical system: `Progression.restoreParty()` or similar.

### CR-10: Toast queue is module-level global state (leaks across scenes if clearScene not called)

**File:** `src/ui/feedback.js:7, 125-133`

**Issue:** `let toastQueue = [];` at module scope. `Toast.clearScene()` exists but must be called at every scene transition. If missed, toasts persist incorrectly.

**Fix:** Bind toast queue to scene lifecycle via `G.state.toastQueue` or require explicit registration with scene.

### CR-11: InlineHint.render reads `G.inputX/G.inputY` directly (global coupling, breaks in tests)

**File:** `src/ui/feedback.js:195`

**Issue:** `const hover = h.contains(G.inputX || 0, G.inputY || 0);` — Requires `G` global with input coordinates. Fails in headless tests where `G.inputX` undefined.

**Fix:** Pass pointer position as parameter to render, or use `Input._mousePos`/`Input._touchCurrent` consistently.

### CR-12: ContextualBadge._updateHook reads `Input._touchCurrent || Input._mousePos` (internal Input API)

**File:** `src/ui/feedback.js:274`

**Issue:** Couples to non-public Input properties. If Input refactors, badge breaks.

**Fix:** Add `Input.getPointer()` public API returning `{x, y}` or `null`.

### CR-13: BlockerTooltip._updateHook uses `Input.peekTap()` (consumes input globally)

**File:** `src/ui/feedback.js:422`

**Issue:** `Input.peekTap()` checks for tap without consuming; but tooltip dismissal logic may conflict with other tap handlers. Also couples to global Input.

**Fix:** Pass tap event as parameter; use `Input.wasTapConsumed()` pattern.

### CR-14: spring_registry.test.js asserts exact config count (brittle, blocks extensibility)

**File:** `tests/spring_registry.test.js:67`

**Issue:** `assert.strictEqual(Object.keys(R.springConfigs).length, 7);` — Adding a new spring config (valid extensibility) breaks test. Registry is designed to be extensible (test line 127-140).

**Fix:** Change to `assert.ok(Object.keys(R.springConfigs).length >= 7);` or remove count assertion.

---

## Warnings

### WR-01: mixinContains only does rect check, ignores rounded corners

**File:** `src/ui/component.js:137-145`

**Issue:** Comment admits "For tighter corner exclusion, a full rounded-rect check could be added" but doesn't implement it. Components with large radius (e.g., `radius.l = 10`) have clickable dead zones in corners.

**Fix:** Implement rounded-rect point-in-path test:
```javascript
comp._containsHook = function(px, py, c) {
  const r = R.radius[radiusKey] || R.radius.s;
  if (px < c.x || px > c.x + c.w || py < c.y || py > c.y + c.h) return false;
  // Check corners
  if (px < c.x + r && py < c.y + r) {
    const dx = px - (c.x + r), dy = py - (c.y + r);
    if (dx*dx + dy*dy > r*r) return false;
  }
  // ... repeat for 4 corners
  return true;
};
```

### WR-02: mixinSpring step function closes over initial target (stale if config.target changes)

**File:** `src/ui/component.js:97-116`

**Issue:** `comp._springStep = R.spring(config);` captures `config.target` at creation. If consumer later does `comp._springConfig.target = newTarget`, the step function still uses old target. Button.js works around this by recreating step function and storing `_target` on it, but mixinSpring doesn't provide this pattern.

**Fix:** Either document that target is immutable, or provide `comp.setSpringTarget(target)` that recreates step function.

### WR-03: UI.Button/UI.MagneticBtn recreate spring step function on target change (works but hacky `_target` property)

**File:** `src/ui/button.js:76, 80, 108-111, 458-467, 488-491`

**Issue:** Pattern: `b._pressSpringStep = R.spring({ ...R.springConfigs.buttonPress, target: target }); b._pressSpringStep._target = target;`. Works but adds non-standard `_target` to step function. Should use `R.spring.step` alias with mutable state object.

**Fix:** Adopt `R.spring.step` pattern:
```javascript
b._springState = { value: 1, velocity: 0, _springFn: R.spring(R.springConfigs.buttonPress) };
// In update:
R.spring.step(b._springState, dt);
// To change target:
b._springState._springFn = R.spring({ ...R.springConfigs.buttonPress, target: newTarget });
```

### WR-04: R.reducedMotion() called multiple times per frame in hot paths (redundant computation)

**Files:** `src/ui/button.js:101, 128, 477, 518` and others

**Issue:** Each button calls `R.reducedMotion()` in update AND render. With many buttons, this repeats matchMedia check unnecessarily.

**Fix:** Cache result per frame in `G.state._reducedMotionFrame` or pass as parameter from game loop.

### WR-05: UI.Input creates DOM element in constructor (couples to DOM, hard to test, leaks if not destroyed)

**File:** `src/ui/button.js:188-342`

**Issue:** Constructor calls `document.createElement`, appends to `#game-container`. No SSR safety, no cleanup if exception thrown before `_dom` assigned. `destroy()` must be called explicitly.

**Fix:** Lazy-create DOM on first render/focus. Add finalization registry or weak ref for cleanup. Or document that `destroy()` is mandatory.

### WR-06: UI.HUD references CultivationSystem global directly (tight coupling)

**File:** `src/ui/button.js:381`

**Issue:** `const prog = CultivationSystem.getRealmProgress();` — HUD shouldn't know about cultivation system. Breaks if system not loaded.

**Fix:** Pass progression data as prop or use event bus.

### WR-07: UI.PremiumShell doesn't use UI.Component/mixins (inconsistent architecture)

**File:** `src/ui/button.js:391-423`

**Issue:** Returns plain object with `render` method. No `update`, `contains`, mixin support.

**Fix:** Convert to `UI.Component` + `mixinRender`.

### WR-08: UI.Dialog creates text children as anonymous objects per line (allocation at construction)

**File:** `src/ui/panel.js:102-108`

**Issue:** `for (const line of lines) { const t = { render: function(ctx) { ... } }; d.addChild({ render: t.render }); }` — Creates new object per line. Acceptable at construction but not zero-allocation pattern.

**Fix:** Store lines array and render in panel's `_renderHook` loop.

### WR-09: UI.Modal._updateHook uses performance.now() for animation timing (wall time, not game time)

**File:** `src/ui/modal.js:90, 96, 115-118`

**Issue:** `m._overlayProgress = Math.min(1, (performance.now() - m._created) / 250);` — Animations don't pause with game, drift under load.

**Fix:** Accumulate `dt` in `_elapsed` property:
```javascript
m._elapsed = (m._elapsed || 0) + dt;
m._overlayProgress = Math.min(1, m._elapsed / 0.25);
```

### WR-10: UI.Modal ghost dissolution uses performance.now() (same issue)

**File:** `src/ui/modal.js:198`

**Issue:** `const t = Math.max(0, Math.min(1, (performance.now() - g._closedAt) / 100));`

**Fix:** Use accumulated dt in ghost state.

### WR-11: UI.ScrollList._renderHook uses performance.now() for crossfade (wall time)

**File:** `src/ui/list.js:70`

**Issue:** `const fade = (!bt || (G.state && G.state.reduceMotion)) ? 1 : Math.min(1, (performance.now() - bt) / 90);`

**Fix:** Track elapsed time in component state.

### WR-12: UI.ScrollList.handleInput and _updateHook couple to global Input (hard to test)

**File:** `src/ui/list.js:53, 103-127`

**Issue:** Direct calls to `Input.getScrollDelta()`, `Input.peekTap()`, `Input.getTap()`.

**Fix:** Accept input state as parameter or use injected input adapter.

### WR-13: feedback.js defines local reduceMotion() duplicating R.reducedMotion()

**File:** `src/ui/feedback.js:15-17`

**Issue:** `function reduceMotion() { return !!(G.state && G.state.reduceMotion) || ... }` — Duplicates logic from `R.reducedMotion()`. If R changes, feedback.js diverges.

**Fix:** Use `R.reducedMotion()` directly (available globally).

### WR-14: Toast/InlineHint/ContextualBadge use hardcoded positions (not responsive)

**File:** `src/ui/feedback.js:87, 140-142, 248-249`

**Issue:** `ty = 470`, `x: 20, y: 600`, `size: 24` — Don't adapt to viewport.

**Fix:** Use `Scene.responsive()` or `R` layout helpers.

### WR-15: ContextualBadge tooltip positioning has hardcoded clamping values

**File:** `src/ui/feedback.js:320-325`

**Issue:** `if (tx < 5) tx = 5; if (tx + w > G.W - 5) tx = G.W - w - 5; if (ty < 5) ty = b.y + b.size + 8;` — Magic numbers.

**Fix:** Use `R.radius`, `R.layout` constants or pass viewport bounds.

### WR-16: HeroSurface.getModel silently swallows errors from global systems (masks bugs)

**File:** `src/ui/heroSurface.js:47-49, 54-56, 63-75, 78-94`

**Issue:** Multiple `try { ... } catch (e) {}` blocks that discard errors. If `calcHeroStats` or `BondSystem` throws, component renders with defaults — bugs go unnoticed.

**Fix:** Log errors in development: `catch (e) { if (typeof console !== 'undefined') console.warn('HeroSurface getModel:', e); }`

### WR-17: HeroSurface static compat methods create throwaway components (wasteful)

**File:** `src/ui/heroSurface.js:184-210`

**Issue:** `getModel`, `_render`, `renderCompact`, etc. each create `UI.HeroSurface(0,0,1,1)` just to call instance method.

**Fix:** Make `getModel` a pure function at module scope, not instance method.

### WR-18: TabBar active indicator uses fillRect not R.roundRect (inconsistent primitives)

**File:** `src/ui/tabbar.js:63-64`

**Issue:** `ctx.fillStyle = R.colors.orangeLight; ctx.fillRect(tx + 4, tb.y + tb.h - 3, tabW - 8, 3);` — Should use `R.rect` or `R.roundRect` for consistency.

**Fix:** `R.rect(ctx, tx + 4, tb.y + tb.h - 3, tabW - 8, 3, R.colors.orangeLight);`

### WR-19: TabBar.handleInput couples to global Input

**File:** `src/ui/tabbar.js:71-90`

**Issue:** Uses `Input.peekTap()`, `Input.getTap()` directly.

**Fix:** Inject input or use scene's input handler.

### WR-20: Scene.drawHeader uses hardcoded positions/colors (not themable)

**File:** `src/engine/scene-helpers.js:74-83`

**Issue:** `R.roundRect(ctx, 10, 6, G.W - 20, h, 8, R.colors.panel);` — Magic numbers for margins, radius, colors.

**Fix:** Accept options object or use `R.layout` constants.

### WR-21: Scene.responsive returns hardcoded layout objects (not extensible)

**File:** `src/engine/scene-helpers.js:86-94`

**Issue:** Fixed profiles with magic numbers. Adding new viewport requires modifying this function.

**Fix:** Data-driven layout config or CSS-like constraint system.

### WR-22: Scene.grammarState = Scene.recoverableState (confusing alias)

**File:** `src/engine/scene-helpers.js:116`

**Issue:** Two names for same function. `grammarState` suggests different semantics.

**Fix:** Remove alias or rename to clarify intent.

### WR-23: component_factory.test.js tests buggy UI.ScrollReveal (setTimeout version)

**File:** `tests/component_factory.test.js` (no explicit test for ScrollReveal, but imports button.js which defines it)

**Issue:** Test suite loads `button.js` which defines broken `UI.ScrollReveal`. No test catches the `setTimeout` bug.

**Fix:** Add test verifying stagger delays use game time, not setTimeout.

---

## Info

### IN-01: mixinUpdate is a no-op (could be removed or documented)

**File:** `src/ui/component.js:76-87`

**Suggestion:** Remove or add JSDoc explaining it's intentional placeholder.

### IN-02: mixinEase doesn't check R.easePremium existence (assumes global)

**File:** `src/ui/component.js:124-128`

**Suggestion:** Add guard: `if (!R.easePremium) return;` or document requirement.

### IN-03: UI.BtnGold/BtnSmall/BtnWide are simple wrappers (fine, but could be mixin variants)

**File:** `src/ui/button.js:171-181`

**Suggestion:** Consider `UI.Button({ variant: 'gold' })` pattern for consistency.

### IN-04: UI.makeTooltip is standalone function (not a component)

**File:** `src/ui/button.js:344-361`

**Suggestion:** Convert to `UI.Component` + mixins for consistency.

### IN-05: UI.HUD is plain object not UI.Component (inconsistent)

**File:** `src/ui/button.js:363-385`

**Suggestion:** Convert to component for lifecycle hooks.

### IN-06: Button.js line 886-886 modifies UI.Button.prototype (monkey-patch, fragile)

**File:** `src/ui/button.js:874-886`

**Suggestion:** Fix in `UI.Button._renderHook` directly; avoid prototype patching.

### IN-07: UI.Modal.confirm/alert are convenience wrappers (good pattern)

**File:** `src/ui/modal.js:270-294`

**Note:** Good API design — keep.

### IN-08: Scene.cullButtons is useful utility (good)

**File:** `src/engine/scene-helpers.js:64-70`

**Note:** Good pattern for viewport culling — keep.

### IN-09: Scene.clipContent correctly documents ctx.restore() requirement

**File:** `src/engine/scene-helpers.js:118-127`

**Note:** Good documentation — keep.

### IN-10: Scene.backButton/navigate are useful navigation helpers

**File:** `src/engine/scene-helpers.js:131-145`

**Note:** Good encapsulation of navigation logic — keep.

### IN-11: Toast queue MAX_TOASTS=3 is reasonable cap

**File:** `src/ui/feedback.js:8`

**Note:** Good UX constraint — keep.

### IN-12: InlineHint dismissal persistence bounded to 50 entries (good)

**File:** `src/ui/feedback.js:12`

**Note:** Prevents unbounded growth — keep.

### IN-13: ContextualBadge variants enum is well-organized

**File:** `src/ui/feedback.js:237-243`

**Note:** Clean declarative config — keep.

### IN-14: BlockerTooltip content structure (reason/requirement/action) is good UX

**File:** `src/ui/feedback.js:357-392`

**Note:** Structured blocker info — keep.

### IN-15: HeroSurface.getModel computes comprehensive model (good separation)

**File:** `src/ui/heroSurface.js:39-112`

**Note:** Good separation of data prep from render — keep.

### IN-16: HeroSurface convenience render methods (compact/detail/result) are useful

**File:** `src/ui/heroSurface.js:160-176`

**Note:** Good ergonomics for scene authors — keep.

### IN-17: spring_registry.test.js has good coverage of spring behavior

**File:** `tests/spring_registry.test.js`

**Note:** Tests convergence, purity, extensibility — good.

### IN-18: renderer_extended.test.js tests new primitives thoroughly

**File:** `tests/renderer_extended.test.js`

**Note:** Tests strokeRoundRect clamping, doubleBezel guards, easePremiumInv accuracy, spring.step, reducedMotion.watch — excellent coverage.

---

## Recommendations Priority

### Must Fix Before Ship (Critical)
1. CR-01: Fix UI.ScrollReveal setTimeout bug
2. CR-02: Fix UI.FluidNav hit test bug
3. CR-03/04/05: Consolidate duplicate EmptyState/ScrollReveal/FluidNav
4. CR-06: Fix HeroSurface global.R access
5. CR-07: Fix BlockerTooltip text measurement
6. CR-08: Defer Scene component layout to runtime
7. CR-09: Route FluidNav rest through Progression system
8. CR-10: Bind toast queue to scene lifecycle
9. CR-11/12/13: Decouple feedback components from global Input/G
10. CR-14: Fix spring_registry test brittleness

### Should Fix (Warnings)
1. WR-01: Implement proper rounded-rect hit testing
2. WR-02/03: Standardize spring target mutation pattern
3. WR-04: Cache reducedMotion per frame
4. WR-05: Lazy-create Input DOM or document destroy()
5. WR-07: Convert PremiumShell to Component
6. WR-09/10/11: Convert Modal/ScrollList to game-time animation
7. WR-13: Use R.reducedMotion() in feedback.js
8. WR-14/15: Make feedback positions responsive
9. WR-16: Log swallowed errors in HeroSurface
10. WR-17: Make HeroSurface.getModel pure function
11. WR-18: Use R.rect for TabBar indicator
12. WR-22: Remove confusing Scene.grammarState alias

### Nice to Have (Info)
1. IN-06: Fix disabled button contrast in Button._renderHook directly
2. Consider TypeScript/JSDoc for component prop types
3. Extract magic numbers to R.layout constants

---

_Reviewed: 2026-10-14T18:45:00Z_
_Reviewer: OpenCode (gsd-code-reviewer)_
_Depth: deep_