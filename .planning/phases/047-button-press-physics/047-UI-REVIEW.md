# Phase 047 — UI Review

**Audited:** 2026-10-21
**Baseline:** abstract 6-pillar standards (no UI-SPEC.md exists)
**Screenshots:** not captured (no dev server — code-only audit)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Strong domain-specific copy but missing loading-state text for async button actions |
| 2. Visuals | 3/4 | Clear press feedback hierarchy via spring scale; missing loading visual state |
| 3. Color | 2/4 | ~16 hardcoded `rgba()` values bypass `R.colors` semantic tokens added in Phase 46 |
| 4. Typography | 3/4 | Consistent font usage via `R.fonts`; no new typography introduced by this phase |
| 5. Spacing | 3/4 | Consistent coordinate-based spacing (0.5px offset, inset=6, 1px strips); no CSS spacing violations |
| 6. Experience Design | 3/4 | Strong disabled-state handling and null-safe rendering; missing loading states for async actions |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **Hardcoded `rgba()` values bypass `R.colors` design tokens** — ~16 raw `rgba()` calls in `makeTooltip`, `PremiumShell`, `FluidNav`, and `EmptyState` violate the Phase 46 design system — replace each with `R.colors` semantic tokens — **WARNING**
2. **Leading icon still hover-only while trailing icon is always visible** — line 624 gates `_leadingIcon` behind `b._hovered`, creating inconsistent touch affordance — remove the hover guard — **WARNING**
3. **No loading states for button actions** — `onClick` may trigger async operations with no pending feedback — add `_loading` flag and loading visual — **WARNING**

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Evidence:** `src/ui/button.js`

- **No generic labels** — All button labels are domain-specific; no "Submit/Click Here/OK/Cancel/Save" patterns found.
- **No empty-state copy** — N/A for a button component library; empty states belong to scene implementations.
- **No error-state copy** — N/A for a button component library; error copy belongs to scene implementations.
- **Missing loading-state copy** — `onClick` may trigger async operations but no pending/loading feedback text exists. Add `_loading` flag with accompanying loading text to communicate async action state.

### Pillar 2: Visuals (3/4)

**Evidence:** `src/ui/button.js`

- **Clear focal point** — Centered spring-scale press (0.97 target) creates a clear pressed-state focal point; MagneticBtn trailing icon provides secondary affordance.
- **Visual hierarchy** — Spring scale (0.97 → 1) provides pressed-state differentiation; trailing icon in nested 24px circle creates button-in-button affordance.
- **Icon-only buttons** — Trailing icon is always visible (not hover-only), addressing touch accessibility; no aria-label gaps identified.
- **No loading visual** — No pending/loading state for async `onClick` operations; user has no visual feedback during async action execution.

### Pillar 3: Color (2/4)

**Evidence:** `src/ui/button.js` lines 357-358, 398-401, 732-733, 766, 805-842

- **Hardcoded colors** — ~16 raw `rgba()` calls bypass `R.colors` semantic tokens:
  - Lines 357-358, 398-401: `makeTooltip` tooltip colors hardcoded
  - Lines 732-733, 766: `PremiumShell` colors hardcoded
  - Lines 805-842: `FluidNav` and `EmptyState` colors hardcoded
- **Phase 46 semantic tokens ignored** — Phase 46 added `overlay`, `overlayMuted`, `insetHighlight`, `insetShade`, `disabled`, `hairline`, `shadow` tokens specifically to replace hardcoded colors; Phase 47 does not use them.
- **Accent overuse** — Well over 10 unique elements use hardcoded colors, violating the accent-discipline established in Phase 46.

### Pillar 4: Typography (3/4)

**Evidence:** `src/ui/button.js`

- **No new typography introduced** — Phase 47 adds no new font sizes or weights; uses existing `R.fonts` conventions.
- **Consistent usage** — All text rendering uses existing font tokens; no ad-hoc font declarations.

### Pillar 5: Spacing (3/4)

**Evidence:** `src/ui/button.js`

- **Consistent coordinate-based spacing** — 0.5px pixel-snapped offset for hairline strokes, inset=6 for doubleBezel core, 1px highlight strip; all derive from `R.radius` scale or explicit small integers.
- **No arbitrary values** — No `[..px]` or `[..rem]` CSS values; all spacing is immediate-mode Canvas coordinates.
- **No CSS spacing classes** — N/A for immediate-mode Canvas renderer; no Tailwind/pixel-class violations.

### Pillar 6: Experience Design (3/4)

**Evidence:** `src/ui/button.js`

- **Disabled states present** — `b.enabled === false` guard with stone-hit FX guard (lines 27-32); `pointer-events: none` pattern.
- **Loading states missing** — No `_loading` flag or pending visual for async `onClick` operations; user has no feedback during async execution.
- **Empty states** — N/A for button component library.
- **Destructive-action confirmation** — N/A; confirmation patterns belong to scene implementations.
- **Reduced motion respected** — `R.reducedMotion()` snap-to-target in update and render; no spring stepping under reduced motion.
- **Null-safe rendering** — `if (!ctx) return;` guard in both render hooks (lines 122, 523) prevents render-loop crashes.

---

## Registry Safety Audit

`components.json` does not exist and no `UI-SPEC.md` lists third-party registries. Registry Safety audit skipped entirely. (0 third-party blocks checked, no flags.)

---

## Files Audited

- `src/ui/button.js` — `UI.Button` constructor (lines 60-114), `UI.MagneticBtn` trailing icon block (lines 471-531), null-safe render hooks (lines 122, 523), `UI.updateButtons` (lines 5-10), `UI.handleButtons` (lines 12-44)
- `tests/button.test.js` — 3 Node tests covering load, press scale, magnetic icon, reduced motion
- `.planning/phases/047-button-press-physics/47-LEARNINGS.md` — Decisions, lessons, patterns, surprises
- `.planning/phases/047-button-press-physics/047-01-PLAN.md` — Execution plan and intent
- `.planning/phases/047-button-press-physics/047-01-SUMMARY.md` — Execution summary

---
