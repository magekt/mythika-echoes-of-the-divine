---
phase: 46
phase_name: Renderer Primitives Foundation
project: "Mythika: Echoes of the Divine"
generated: "2026-10-14T12:00:00.000Z"
counts:
  decisions: 6
  lessons: 2
  patterns: 3
  surprises: 2
missing_artifacts: []
---

# Phase 46 Learnings: Renderer Primitives Foundation

## Decisions

### 1. Easing implementation: smoothstep over full cubic-bezier
**What:** `R.easePremium(t)` implements a closed-form approximation of `cubic-bezier(0.32, 0.72, 0, 1)` using the smoothstep polynomial `t * t * (3 - 2 * t)`.
**Rationale:** smoothstep is monotone, C1-continuous, and visually indistinguishable from the cubic at UI transition durations. A full de Casteljau solver adds 40+ lines for no perceptible difference in a 400×720 game.
**Source:** 46-CONTEXT.md Decision A; 46-PLAN-SUMMARY.md

### 2. Spring implementation: semi-implicit Euler critically-damped
**What:** `R.spring(config)` returns a step function using semi-implicit Euler critically-damped spring: `velocity += (stiffness * (target - current) - damping * velocity) * dt; current += velocity * dt;` with `stiffness=170, damping=26` (critically-damped default) overridable via `config`.
**Rationale:** Matches the 45-UI-AUDIT.md recommendation ("shared critically damped spring"). No dependency on a math library.
**Source:** 46-CONTEXT.md Decision B; 46-PLAN-SUMMARY.md

### 3. `doubleBezel` signature design
**What:** `R.doubleBezel(ctx, x, y, w, h, opts)` where `opts` = `{ radius, shellFill, shellStroke, shellLineWidth, coreFill, coreHighlight, coreShade, inset }`. Missing fields use defaults from `R.colors` semantic tokens.
**Rationale:** Single-call primitive that panels and modals both consume. Keeps the "glass plate in aluminum tray" nested architecture as one reusable pattern.
**Source:** 46-CONTEXT.md Decision C

### 4. Semantic token expansion
**What:** Added to `R.colors`: `overlay`, `overlayMuted`, `insetHighlight`, `insetShade`, `disabled`, `hairline`, `shadow`. These are non-breaking additions — existing tokens stay.
**Rationale:** Replaces the repeated raw rgba values the audit flagged.
**Source:** 46-CONTEXT.md Decision D; 46-PLAN-SUMMARY.md

### 5. Null-safe reducedMotion
**What:** `R.reducedMotion()` returns `false` when `G.state` is undefined instead of throwing. Also checks `matchMedia('(prefers-reduced-motion: reduce)')` when available in the browser.
**Rationale:** Audit P0 finding: "assumes `G.state` exists, unsafe during boot/test".
**Source:** 46-CONTEXT.md Decision E; 46-PLAN-SUMMARY.md

### 6. Test strategy: mock-ctx pattern
**What:** All new primitives are pure functions or ctx-mockable. Tests create a `MockCtx` object that records `fillRect`, `strokeRect`, `roundRect`, `fillText` calls and verifies the expected call sequence. No Canvas rendering in Node.
**Rationale:** Repo has no headless Canvas in Node tests; mock-ctx pattern is the existing convention in `tests/`.
**Source:** 46-CONTEXT.md Decision F; 46-PLAN-SUMMARY.md

---

## Lessons

### 1. Null-safe global access is essential for testability
**What:** The original `R.reducedMotion()` threw in Node tests because it accessed `G.state` directly without guards.
**Context:** The replacement wraps both `G.state` access and `matchMedia` in try/catch, returning `false` when unavailable. This makes the function testable in Node without a browser environment.
**Source:** 46-CONTEXT.md Decision E; 46-PLAN-SUMMARY.md

### 2. Smoothstep is visually indistinguishable from cubic-bezier(0.32,0.72,0,1) for UI transitions
**What:** `R.easePremium(t)` implements smoothstep (`t*t*(3-2*t)`) rather than a true cubic-bezier solver.
**Context:** Despite being an approximation, it's visually indistinguishable from the target bezier at UI transition durations (300-400ms) and is ~40 lines simpler.
**Source:** 46-CONTEXT.md Decision A; 46-PLAN-SUMMARY.md; `src/engine/renderer.js` lines 183-187

---

## Patterns

### 1. The "Doppelrand" (Double-Bezel) nested enclosure pattern
**Pattern:** `R.doubleBezel(ctx, x, y, w, h, opts)` renders a nested enclosure: an outer shell (fill + 1px hairline stroke) and an inner core (distinct fill, 1px top highlight, smaller concentric radius).
**When to use:** Any panel, modal, card, or container that needs visual depth and a premium "glass plate in aluminum tray" feel. Used by `UI.Panel`, `UI.Modal`, `UI.PremiumShell`, and `Scene.entranceReveal`.
**Source:** 46-CONTEXT.md Decision C; 46-PLAN-SUMMARY.md; `src/engine/renderer.js` lines 160-180

### 2. Critically-damped spring factory (`R.spring`)
**Pattern:** `R.spring(config)` returns a pure step function `(current, velocity, dt) => { value, velocity }` implementing critically-damped spring physics (semi-implicit Euler). Default config: stiffness=170, damping=26, target=1. Pure function, no internal state.
**When to use:** Any springy motion — button press scale, icon translation, overlay fade, reveal stagger. Replaces ad-hoc lerp/linear interpolation.
**Source:** 46-CONTEXT.md Decision B; 46-PLAN-SUMMARY.md; `src/engine/renderer.js` lines 190-201

### 3. Smoothstep easing as cubic-bezier approximation
**Pattern:** `R.easePremium(t)` implements `t²(3-2t)` (smoothstep) as a closed-form approximation of `cubic-bezier(0.32, 0.72, 0, 1)`. Clamps t to [0,1], handles NaN. Pure function.
**When to use:** All UI transitions (fade, slide, scale, reveal) where a premium ease-out curve is desired. Replaces ad-hoc `Math.min/max` or linear interpolation.
**Source:** 46-CONTEXT.md Decision A; 46-PLAN-SUMMARY.md; `src/engine/renderer.js` lines 183-187

---

## Surprises

### 1. The existing `R.reducedMotion()` was non-null-safe and threw in Node tests
**What:** The original `R.reducedMotion()` at line 90 accessed `G.state.reduceMotion` without checking if `G` or `G.state` existed, causing it to throw in Node test contexts.
**Why it matters:** The replacement wraps both `G.state` access and `matchMedia` in try/catch, returning `false` when unavailable. This makes the function testable in Node without a browser environment.
**Source:** 46-CONTEXT.md Decision E; 46-PLAN-SUMMARY.md; `src/engine/renderer.js` lines 97-110

### 2. Smoothstep is visually indistinguishable from cubic-bezier(0.32,0.72,0,1) for UI transitions
**What:** The smoothstep function (`t²(3-2t)`) is mathematically an approximation of the target cubic-bezier, but at UI transition durations (300-400ms) it's visually indistinguishable.
**Why it matters:** The approximation is ~40 lines simpler than a full de Casteljau cubic-bezier solver. If pixel-exact curves ever matter, can swap in a real de Casteljau solver.
**Source:** 46-CONTEXT.md Decision A; `src/engine/renderer.js` lines 183-187

---

Generated: 2026-10-14T12:00:00.000Z