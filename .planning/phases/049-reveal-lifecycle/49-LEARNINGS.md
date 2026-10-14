---
phase: 49
phase_name: Reveal Lifecycle & Scene Entrances
project: "Mythika: Echoes of the Divine"
generated: "2026-10-14T12:00:00.000Z"
counts:
  decisions: 5
  lessons: 4
  patterns: 3
  surprises: 2
missing_artifacts: []
---

# Phase 49 Learnings: Reveal Lifecycle & Scene Entrances

## Decisions

### 1. ScrollReveal.apply() signature change to accept render callback
**What:** Changed `ScrollReveal.apply(ctx, el)` to `ScrollReveal.apply(ctx, el, renderFn)` so the save/restore brackets the caller-provided render function.
**Rationale:** The original implementation called `ctx.save()` → set transform → `ctx.restore()` **before** any child content was drawn, making the transform never apply to the revealed content. The fix required the caller to pass a render function that executes inside the transformed context.
**Source:** Phase 49 REV-01 fix in `src/engine/scene-helpers.js` (ScrollReveal.apply at lines 212-219); Phase 49 SUMMARY.md REV-01

### 2. New Scene.entranceReveal() helper for full-screen entrances
**What:** Created `Scene.entranceReveal()` returning `{ t, update, render }` where `t` advances 0→1 over 400ms using `R.easePremium(t)`, with a 20px upward fade and 8px blur-to-sharp transition. Under `R.reducedMotion()`, the factory snaps `t=1` immediately (no fade/blur).
**Rationale:** Replaced the hardcoded 0.12s near-instant entrance (found in prior code) with a ≥0.35s premium entrance as required by REV-02. The 400ms duration and easePremium curve provide a premium feel while respecting reduced-motion.
**Source:** Phase 49 SUMMARY.md REV-02; `src/engine/scene-helpers.js` lines 197-231 (`Scene.entranceReveal` factory)

### 3. Replaced setTimeout with elapsed-time state in ScrollReveal
**What:** Removed `setTimeout(() => { el._revealed = true; }, delay)` from `ScrollReveal.update()`. Replaced with elapsed-time tracking: on first in-view, record `el._revealStart = performance.now()`; each frame checks `performance.now() - _revealStart >= delay * 1000`. Under `R.reducedMotion()`, skip delay entirely (immediate reveal).
**Rationale:** `setTimeout` is not frame-deterministic and cannot be cancelled cleanly on scene leave. Elapsed-time state is deterministic, cancellable on scene leave, and respects reduced-motion by skipping the delay entirely.
**Source:** Phase 49 SUMMARY.md REV-03; `src/engine/scene-helpers.js` lines 193-202 (update method)

### 4. Construct-once CTA buttons for EmptyState and HeroMoment
**What:** Both `Scene.EmptyState` and `Scene.HeroMoment` now construct their `UI.MagneticBtn` CTA once at factory time (when `cx`/`cy` are known) instead of allocating a new button on every `render()` call. The CTA is then driven per-frame via `update(dt)` + `render(ctx)`.
**Rationale:** The audit flagged per-frame allocation in `EmptyState.render()` and `HeroMoment` as an anti-pattern (per REV-04). By constructing once and driving `update(dt)` + `render(ctx)` per frame, we eliminate per-frame allocation while maintaining the same visual behavior.
**Source:** Phase 49 SUMMARY.md REV-04; `src/engine/scene-helpers.js` lines 376-435 (`EmptyState`), 152-180 (`HeroMoment`)

### 5. ScrollReveal delay replaced with elapsed-time state (not setTimeout)
**What:** Replaced `setTimeout(() => { el._revealed = true; }, delay)` with elapsed-time tracking using `performance.now()`. On first in-view, record `el._revealStart = performance.now()`; each frame checks `performance.now() - _revealStart >= delay * 1000`. Under `R.reducedMotion()`, delay is skipped entirely.
**Rationale:** `setTimeout` is not frame-deterministic and cannot be cancelled cleanly. Elapsed-time state is deterministic, cancellable on scene leave (by resetting `_revealStart`), and naturally skips delay under reduced motion.
**Source:** Phase 49 SUMMARY.md REV-03; `src/engine/scene-helpers.js` lines 193-202 (update method)

---

## Lessons

### 1. Save/restore must wrap the render call, not precede it
**What:** The `ScrollReveal.apply()` bug was caused by restoring the canvas context before rendering the child content. The fix was to move `ctx.restore()` **after** calling the render function.
**Context:** This is a classic Canvas pitfall — save/restore must bracket the actual drawing operations, not just state setup.
**Source:** Phase 49 REV-01 fix in `src/engine/scene-helpers.js` (lines 212-219); Phase 49 SUMMARY.md REV-01

### 2. `setTimeout` in update loops is an anti-pattern for frame-deterministic animations
**What:** Using `setTimeout` for reveal delays creates non-deterministic timing, cannot be cleanly cancelled on scene leave, and breaks under reduced-motion (where delay should be skipped).
**Context:** The original `ScrollReveal.update()` used `setTimeout` for the delay. The fix replaced it with elapsed-time tracking using `performance.now()`, which is frame-deterministic, cancellable (by resetting `_revealStart`), and naturally handles reduced-motion by skipping the delay check.
**Source:** Phase 49 REV-03; `src/engine/scene-helpers.js` lines 193-202 (update method)

### 3. Per-frame object allocation in render() is a silent performance killer
**What:** Both `EmptyState` and `HeroMoment` were constructing `UI.MagneticBtn` inside `render()` every frame. This allocates a new object (with spring state) every frame, creating GC pressure and losing spring state between frames.
**Context:** The audit (45-UI-AUDIT.md) flagged this as REV-04. The fix was to construct the CTA once at factory time (when layout dimensions are known) and store it on the object, then call `update(dt)` + `render(ctx)` per frame.
**Source:** Phase 49 REV-04; 45-UI-AUDIT.md lines 31-35; Phase 49 SUMMARY.md REV-04

### 4. `setTimeout` in update loops is non-deterministic and un-cancellable
**What:** Using `setTimeout` for animation delays creates non-deterministic timing and cannot be cleanly cancelled when the scene changes.
**Context:** The original `ScrollReveal` used `setTimeout` to trigger reveal after a delay. This meant the reveal could fire after the scene was already left, and there was no way to cancel it. The fix uses elapsed-time state checked each frame.
**Source:** Phase 49 REV-03; `src/engine/scene-helpers.js` lines 193-202

---

## Patterns

### 1. The "Doppelrand" (Double-Bezel) nested enclosure pattern
**Pattern:** `R.doubleBezel(ctx, x, y, w, h, opts)` renders a nested enclosure: an outer shell (fill + 1px hairline stroke) and an inner core (distinct fill, 1px top highlight strip, smaller concentric radius).
**When to use:** Any panel, modal, card, or container that needs visual depth and a premium "glass plate in aluminum tray" feel. Used by `UI.Panel`, `UI.Modal`, `UI.PremiumShell`, and `Scene.entranceReveal`.
**Source:** Phase 46 CONTEXT.md (Decision C); Phase 48 SUMMARY.md; `src/engine/renderer.js` lines 160-180

### 2. Critically-damped spring factory (`R.spring`)
**Pattern:** `R.spring(config)` returns a pure step function `(current, velocity, dt) => { value, velocity }` implementing critically-damped spring physics (semi-implicit Euler). Default config: stiffness=170, damping=26, target=1. Pure function, no internal state.
**When to use:** Any springy motion — button press scale, icon translation, overlay fade, reveal stagger. Replaces ad-hoc lerp/linear interpolation.
**Source:** Phase 46 CONTEXT.md (Decision B); Phase 46 SUMMARY.md; `src/engine/renderer.js` lines 190-201

### 3. Smoothstep easing as cubic-bezier approximation
**Pattern:** `R.easePremium(t)` implements `t²(3-2t)` (smoothstep) as a closed-form approximation of `cubic-bezier(0.32, 0.72, 0, 1)`. Clamps t to [0,1], handles NaN. Pure function.
**When to use:** All UI transitions (fade, slide, scale, reveal) where a premium ease-out curve is desired. Replaces ad-hoc `Math.min/max` or linear interpolation.
**Source:** Phase 46 CONTEXT.md (Decision A); Phase 46 SUMMARY.md; `src/engine/renderer.js:183-187`

### 4. Critically-damped spring factory with configurable defaults
**Pattern:** `R.spring(config)` returns a step function `(current, velocity, dt) => { value, velocity }` using semi-implicit Euler integration. Default config: stiffness=170, damping=26, target=1. Pure function — state is passed in, not stored.
**When to use:** Any springy motion where you want critically-damped feel (no overshoot). Used for button press scale, icon translation, overlay fade, reveal stagger.
**Source:** Phase 46 CONTEXT.md Decision B; `src/engine/renderer.js` lines 190-201

### 5. Semantic color token expansion for depth hierarchy
**Pattern:** Extended `R.colors` with depth/semantic tokens: `overlay`, `overlayMuted`, `insetHighlight`, `insetShade`, `disabled`, `hairline`, `shadow`. These replace raw `rgba()` literals throughout the codebase.
**When to use:** Any new UI component that needs depth, overlay, disabled state, or hairline borders. Ensures consistency and easy theming.
**Source:** Phase 46 CONTEXT.md Decision D; `src/engine/renderer.js` lines 37-41

### 4. Null-safe reduced motion check
**Pattern:** `R.reducedMotion()` wraps both `G.state.reduceMotion` and `matchMedia('(prefers-reduced-motion: reduce)')` in try/catch, returns `false` if neither is available. Never throws.
**When to use:** Any code that needs to respect reduced motion — animations, springs, transitions, reveal delays.
**Source:** Phase 46 CONTEXT.md Decision E; `src/engine/renderer.js` lines 97-110

---

## Surprises

### 1. The ScrollReveal save/restore bug was silently breaking all reveals
**What:** `ScrollReveal.apply(ctx, el)` was calling `ctx.restore()` **before** rendering the child content, so the alpha/translate/blur transforms were never applied to the actual content.
**Impact:** All ScrollReveal reveals were visually broken (no fade, no translate, no blur) but no test caught it because the API was never used in production code. The bug was only caught when writing the test for REV-01.
**Impact:** Required API change to `apply(ctx, el, renderFn)` to properly bracket the child render. All future callers must pass a render function.
**Source:** Phase 49 REV-01; `src/engine/scene-helpers.js` lines 212-219; Phase 49 SUMMARY.md REV-01

### 2. setTimeout in animation loops is an anti-pattern that silently breaks reduced-motion and scene transitions
**What:** The original `ScrollReveal.update()` used `setTimeout` to trigger reveal after a delay. This caused three problems: (1) non-deterministic timing, (2) couldn't cancel on scene leave, (3) reduced-motion couldn't skip the delay because the timeout was already queued.
**Impact:** The fix replaced `setTimeout` with elapsed-time state (`performance.now()`), which is frame-deterministic, cancellable (reset `_revealStart`), and naturally handles reduced-motion by skipping the delay check entirely.
**Source:** Phase 49 REV-03; `src/engine/scene-helpers.js` lines 193-202; 45-UI-AUDIT.md

### 3. Per-frame object allocation in render() is a silent performance killer
**What:** Both `EmptyState` and `HeroMoment` were constructing `UI.MagneticBtn` inside `render()` every frame, allocating a new object (with spring state) every frame. This creates GC pressure and loses spring state between frames.
**Impact:** The fix constructs the CTA once at factory time, stores it on the object, and drives it per-frame via `update(dt)` + `render(ctx)`. This required adding `update(dt)` to `MagneticBtn` (which it already had from Phase 47).
**Source:** Phase 49 REV-04; 45-UI-AUDIT.md; Phase 49 SUMMARY.md REV-04

### 4. The smoothstep function is visually indistinguishable from cubic-bezier(0.32,0.72,0,1) for UI transitions
**What:** `R.easePremium(t)` implements smoothstep (`t*t*(3-2*t)`) rather than a true cubic-bezier solver. Despite being an approximation, it's visually indistinguishable from the target bezier at UI transition durations (300-400ms) and is ~40 lines simpler.
**Impact:** Chose the simpler implementation. If pixel-exact curves ever matter, can swap in a real de Casteljau solver.
**Source:** Phase 46 CONTEXT.md Decision A; `src/engine/renderer.js` line 183-187

### 5. `setTimeout` in update loops is an anti-pattern that silently breaks reduced-motion
**What:** The `ScrollReveal.update()` used `setTimeout` to trigger reveal after a delay. This meant: (a) timing was non-deterministic, (b) couldn't cancel on scene leave, (3) reduced-motion couldn't skip the delay because the timeout was already queued.
**Impact:** The fix replaced `setTimeout` with elapsed-time state (`performance.now()`), which is frame-deterministic, cancellable, and naturally handles reduced-motion by skipping the delay check entirely.
**Source:** Phase 49 REV-03; `src/engine/scene-helpers.js` lines 193-202

### 6. Per-frame object allocation in render() is a silent performance killer
**What:** Both `EmptyState` and `HeroMoment` were constructing `UI.MagneticBtn` inside `render()` every frame. This allocates a new object (with spring state) every frame, creating GC pressure and losing spring state between frames.
**Impact:** The fix constructs the CTA once at factory time, stores it on the object, and drives it per-frame via `update(dt)` + `render(ctx)`. This required adding `update(dt)` to `MagneticBtn` (which it already had from Phase 47).
**Source:** Phase 49 REV-04; 45-UI-AUDIT.md; Phase 49 SUMMARY.md REV-04

---

## Missing Artifacts
None — all required artifacts (PLAN.md, SUMMARY.md, VERIFICATION.md) were present for phases 46-49.
---
Generated: 2026-10-14T12:00:00.000Z