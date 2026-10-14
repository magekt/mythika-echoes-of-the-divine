---
phase: 48
phase_name: Panels & Modals Nested Shells
project: "Mythika: Echoes of the Divine"
generated: "2026-10-14T12:00:00.000Z"
counts:
  decisions: 4
  lessons: 3
  patterns: 3
  surprises: 2
missing_artifacts: []
---

# Phase 48 Learnings: Panels & Modals Nested Shells

## Decisions

### 1. Panel shell via R.doubleBezel primitive
**What:** Replaced `UI.Panel.render()`'s flat `R.roundRect` + manual `strokeRect` path (lines 33-52) with a single call to `R.doubleBezel(ctx, this.x, this.y, this.w, this.h, { shellFill: this.color || R.colors.surfaceElevated, shellStroke: this.borderColor || R.colors.hairline, radius: R.radius.m })`.
**Rationale:** Eliminates duplicate rounded-rect drawing code, centralizes the "Doppelrand" (nested bezel) aesthetic, and automatically provides the inner highlight strip. The outer shell gets a hairline stroke (`R.colors.hairline`, 1px), the inner core gets a 1px top highlight strip (`R.colors.insetHighlight`).
**Source:** Phase 48 SUMMARY.md; `src/ui/panel.js` lines 34-66

### 2. Panel enter animation with R.easePremium
**What:** Added `enterProgress: 0` field and `update(dt)` method to `UI.Panel`. If `R.reducedMotion()`, `enterProgress = 1` immediately; otherwise `enterProgress = Math.min(1, enterProgress + dt / 0.25)` (250ms ramp). In `render()`, wraps the double-bezel + title render in `ctx.globalAlpha = R.easePremium(enterProgress)`, restoring `globalAlpha = 1` before rendering children.
**Rationale:** Panels now fade-in + blur-in on creation, matching the modal entrance aesthetic. Children (buttons, content) render at full opacity since they manage their own alpha.
**Source:** Phase 48 SUMMARY.md; `src/ui/panel.js` lines 23-28 (update), 34-55 (render)

### 3. Modal overlay easing + button cascade
**What:** Added `_overlayProgress` (0→1 over 250ms via `R.easePremium`), `_btnProgress[i]` (40ms stagger per button, 400ms window). Overlay uses `R.colors.overlay` at `ctx.globalAlpha = m._alpha * R.easePremium(m._overlayProgress)`. Buttons render with `ctx.globalAlpha = R.easePremium(m._btnProgress[i])` in `_paint`. Ghost dissolve also uses `R.easePremium(1 - t)`.
**Rationale:** Creates a cohesive entrance choreography — overlay fades in, panel shell appears, then buttons cascade in at 40ms intervals. All driven by `R.easePremium` for consistent easing.
**Source:** Phase 48 SUMMARY.md; `src/ui/modal.js` lines 97-98, 125, 165-170

### 4. Media-aware reduced motion via R.reducedMotion()
**What:** Replaced all manual `G && G.state && G.state.reduceMotion` checks with `R.reducedMotion()` (which checks both `G.state.reduceMotion` AND `matchMedia('(prefers-reduced-motion: reduce)')`). Applied in `panel.js:35`, `modal.js:135-137`, and throughout.
**Rationale:** Phase 46 made `R.reducedMotion()` null-safe and media-aware. Centralizing the check ensures consistent behavior across all UI components and respects the OS-level `prefers-reduced-motion` setting.
**Source:** Phase 48 SUMMARY.md PAN-04; `src/ui/modal.js` lines 135-137; `src/ui/panel.js:35`

---

## Lessons

### 1. R.doubleBezel centralizes the "Doppelrand" aesthetic
**What:** Before Phase 48, panels, modals, and premium shells each had their own hand-rolled nested-rectangle drawing code (different radii, different stroke colors, no consistent inset highlight). Phase 46's `R.doubleBezel` unified this into one canonical primitive.
**Context:** Before: `panel.js` lines 33-52 (manual roundRect + strokeRect), `modal.js` lines 100-116 (manual roundRect + strokeRect), `button.js` lines 343-368 (`PremiumShell`). After: all three call `R.doubleBezel` with appropriate options. Consistency is now guaranteed; changes to the aesthetic only need to touch one function.
**Source:** Phase 48 SUMMARY.md; `src/ui/panel.js` lines 34-55; `src/ui/modal.js` lines 107-110

### 2. Alpha interpolation must wrap the shell only, not children
**What:** In `UI.Panel.render()`, the alpha from `R.easePremium(enterProgress)` wraps only the double-bezel + title render. Children (buttons, content) render at full opacity because they manage their own alpha (e.g., buttons have their own `_visualScale` and press state).
**Context:** Initially tried wrapping the entire render (including children) in the alpha, which caused buttons to fade in with the panel — looked wrong. The fix: `ctx.globalAlpha = R.easePremium(enterProgress)` before `R.doubleBezel` + title, then `ctx.globalAlpha = 1` before rendering children.
**Source:** Phase 48 implementation in `src/ui/panel.js` lines 34-55

### 3. Modal button cascade needs per-button progress tracking
**What:** The 40ms stagger requires each button to have its own progress value (`m._btnProgress[i]`), updated independently based on elapsed time since modal creation. The stagger starts 250ms after modal creation (after overlay begins), with 40ms per button.
**Context:** In `modal.js`, added `m._created = performance.now()` on first render, `_overlayProgress` (250ms ramp), and `_btnProgress = []` array. In `update(dt)`, each button's progress advances independently: `m._btnProgress[i] = Math.min(1, Math.max(0, (now - m._created - 250 - i * 40) / 400))`.
**Source:** Phase 48 SUMMARY.md; `src/ui/modal.js` lines 165-170, 125

---

## Patterns

### 1. The "Doppelrand" (Double-Bezel) nested enclosure pattern
**Pattern:** `R.doubleBezel(ctx, x, y, w, h, opts)` renders a nested enclosure: an outer shell (fill + 1px hairline stroke) and an inner core (distinct fill, 1px top highlight, smaller concentric radius).
**When to use:** Any panel, modal, card, or container that needs visual depth and a premium "glass plate in aluminum tray" feel. Used by `UI.Panel`, `UI.Modal`, `UI.PremiumShell`, and `Scene.entranceReveal`.
**Source:** Phase 46 CONTEXT.md Decision C; Phase 48 SUMMARY.md; `src/engine/renderer.js` lines 160-180

### 2. Eased alpha for entrance/exit transitions
**Pattern:** Use `R.easePremium(t)` to drive `ctx.globalAlpha` for enter/exit transitions. Compute progress `t` (0→1) based on elapsed time, then `ctx.globalAlpha = R.easePremium(t)` around the element's render call.
**When to use:** Any entrance/exit animation for panels, modals, toasts, overlays. The smoothstep easing (`t²(3-2t)`) provides a premium ease-out feel.
**Source:** Phase 48 (`panel.js` `enterProgress`, `modal.js` `_overlayProgress`); Phase 47 (`UI.Button` press scale); Phase 49 (`Scene.entranceReveal`)

### 3. Media-aware reduced motion via R.reducedMotion()
**Pattern:** `R.reducedMotion()` checks both `G.state.reduceMotion` AND `matchMedia('(prefers-reduced-motion: reduce)')` in a try/catch. Components call this once per frame/decision instead of manually checking `G.state.reduceMotion`.
**When to use:** Any animation, transition, spring, or delay that should respect the user's OS-level reduced-motion preference. Replaces manual `G && G.state && G.state.reduceMotion` checks.
**Source:** Phase 46 CONTEXT.md Decision E; Phase 48 PAN-04; `src/engine/renderer.js` lines 97-110

---

## Surprises

### 1. The existing modal.js had inconsistent reduced-motion checks
**What:** `modal.js` had three different reduced-motion checks: line 152 (`G.state.reduceMotion`), line 155 (`G.state.reduceMotion`), and line 193 (`G.state.reduceMotion`). None checked `matchMedia`. Phase 46's `R.reducedMotion()` unified this.
**Impact:** Centralizing to `R.reducedMotion()` ensures the `prefers-reduced-motion` media query is respected everywhere, not just when `G.state` happens to be populated.
**Source:** Phase 48 implementation in `src/ui/modal.js` lines 135-137, 152-155; Phase 48 SUMMARY.md PAN-04

### 2. Panel.update() has no global rAF hook — scenes must call it manually
**What:** Phase 48 added `UI.Panel.update(dt)` but there's no global rAF hook to call it automatically. Scenes that create `UI.Panel` instances must call `panel.update(G.dt)` in their update cycle.
**Impact:** Panels used in diagnostics are the only current consumer. The panel enter animation won't run unless the scene calls `update()`. This was explicitly called out as out of scope for Phase 48.
**Source:** Phase 48 SUMMARY.md Caveats (lines 61-65)

---

Generated: 2026-10-14T12:00:00.000Z