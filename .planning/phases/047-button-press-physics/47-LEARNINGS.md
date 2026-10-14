---
phase: 47
phase_name: Button Press Physics & CTA
project: "Mythika: Echoes of the Divine"
generated: "2026-10-14T12:00:00.000Z"
counts:
  decisions: 3
  lessons: 2
  patterns: 2
  surprises: 2
missing_artifacts: []
---

# Phase 47 Learnings: Button Press Physics & CTA

## Decisions

### 1. Base UI.Button uses centered spring scale (0.97 target)
**What:** Replaced the 1px positional shrink (dx/dy/dw/dh logic at lines 85-92) with a spring-driven centered scale animation. Added `_visualScale: 1` and `_scaleVel: 0` fields on the button object (allocated once at construction). In `update(dt)`, drives `_visualScale` toward `(pressed || held) ? 0.97 : 1` using `R.spring({ stiffness: 300, damping: 24, target: ... })`. Under `R.reducedMotion()`, snaps `_visualScale` to target directly. In `render()`, uses `ctx.translate(cx, cy); ctx.scale(_visualScale, _visualScale); ctx.translate(-cx, -cy)` around existing draw calls.
**Rationale:** Replaces the instant 1px snap with a physical spring that feels tactile. The centered scale (vs corner-anchored offset) keeps the button visually centered. Reduced-motion snaps instantly to avoid vestibular issues.
**Source:** Phase 47 task prompt BTN-01; `src/ui/button.js` lines 56-59 (state init), 65-72 (update), 75-114 (render)

### 2. MagneticBtn trailing icon in nested circle (Button-in-Button)
**What:** The trailing arrow icon (when `_trailingIcon` is set) is now ALWAYS rendered (not just on hover), wrapped in its own 24px nested circle at the button's right inner edge. The arrow translates diagonally (+2/+2) and scales up (1.05x) on press, driven by the existing spring state (`_iconSpringX`, `_iconSpringY`, `_springScale`). Unified press scale to 0.97 (was 0.98 at line 516).
**Rationale:** The old implementation only showed the icon on hover (desktop-only), making it invisible to touch users. The nested circle creates a "button-in-button" affordance that's visible on all input methods. Diagonal translate + scale on press adds tactile feedback.
**Source:** Phase 47 task prompt BTN-02; `src/ui/button.js` lines 471-531 (`MagneticBtn` trailing icon block)

### 3. Press scale unified to 0.97 (was 0.98 in MagneticBtn)
**What:** Unified the press scale target to 0.97 across both `UI.Button` and `UI.MagneticBtn` (was 0.98 at line 516 in MagneticBtn).
**Rationale:** Consistency across button types. The 0.97 target matches the design spec from the 45-UI-AUDIT.md and Phase 47 requirements.
**Source:** Phase 47 task prompt BTN-01; `src/ui/button.js` line 516 (changed from 0.98 to 0.97)

---

## Lessons

### 1. Centered scale transform requires translate-before-scale-then-translate-back
**What:** To scale a button around its center without shifting its visual position, you must: `ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy)` where `cx = x + w/2`, `cy = y + h/2`.
**Context:** The original `UI.Button` used `dx/dy/dw/dh` offsets (1px shift) which kept the top-left corner fixed, causing the button to appear to shift down-right on press. Centered scale keeps the button visually centered.
**Source:** Phase 47 implementation in `src/ui/button.js` lines 75-92 (render method)

### 2. Spring state must be allocated once, not per-frame
**What:** The `R.spring` factory returns a step function that carries its own velocity state. This step function must be created once (at construction) and reused each frame, not recreated per frame.
**Context:** Both `UI.Button` and `UI.MagneticBtn` now create their spring step function once at construction (`this._pressSpringStep = R.spring({...})`) and call it in `update(dt)`. The `_scaleVel` is stored on the button instance.
**Source:** Phase 47 implementation in `src/ui/button.js` lines 56-59 (state init), 65-72 (update)

---

## Patterns

### 1. Spring-driven visual state (scale, position, alpha)
**Pattern:** Use `R.spring(config)` factory to create a step function `(current, velocity, dt) => { value, velocity }`. Store the step function and current state (`_visualScale`, `_scaleVel`) on the component instance. In `update(dt)`, call `step(current, velocity, dt)` to get new value/velocity. In `render()`, apply the current value via `ctx.scale()` or `ctx.translate()`.
**When to use:** Any visual property that should feel springy — scale, translation, alpha, rotation. Replaces ad-hoc lerp, instant snaps, or manual velocity tracking.
**When to avoid:** Simple binary states (on/off) that don't benefit from spring physics.
**Source:** Phase 47 implementation in `src/ui/button.js`; Phase 46 `R.spring` primitive

### 2. Nested CTA affordance (Button-in-Button)
**Pattern:** Primary action buttons with a trailing action (arrow, chevron, etc.) should wrap the trailing element in its own small circle/pill at the button's inner edge. The nested element gets its own spring-driven micro-animations (translate + scale) driven by the parent's press state.
**When to use:** Primary CTAs with secondary affordances (dropdown arrows, external link icons, forward/back arrows). The nested circle creates clear visual hierarchy and the diagonal translate+scale on press provides haptic feedback.
**Source:** Phase 47 `UI.MagneticBtn` lines 471-531; 47-PLAN-SUMMARY.md

---

## Surprises

### 1. The 1px snap was perceived as "cheap" not "responsive"
**What:** The original `UI.Button` used a 1px positional shift (dx/dy = 1) on press. This felt like a UI bug or rendering glitch rather than intentional feedback.
**Impact:** Users perceived it as a rendering glitch. The spring-driven centered scale (0.97) feels intentional and premium — it communicates "this is a physical button being pressed."
**Source:** Phase 47 implementation; 47-PLAN-SUMMARY.md Notes

### 2. The trailing icon was invisible to touch users
**What:** The `MagneticBtn` trailing icon only rendered on hover (`this._hovered` check at line 471). On touch devices, there is no hover state, so the icon was never visible.
**Impact:** Touch users had no visual affordance for the trailing action (e.g., dropdown arrow). The fix makes the icon always visible when `_trailingIcon` is set, wrapped in its own circle for touch visibility.
**Source:** Phase 47 task prompt BTN-02; `src/ui/button.js` lines 471-487; 47-PLAN-SUMMARY.md

---

Generated: 2026-10-14T12:00:00.000Z