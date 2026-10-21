---
phase: 047-button-press-physics
plan: 01
subsystem: ui
tags: [button, spring-physics, canvas, ui, magnetic-btn, reduced-motion]

# Dependency graph
requires:
  - phase: 046-renderer-primitives-foundation
    provides: R.spring factory, R.reducedMotion(), R.springConfigs.buttonPress (stiffness 300, damping 24, target 0.97), UI.Component factory + mixins
provides:
  - UI.Button centered spring-scale press feedback (0.97 target, null-safe _visualScale/_scaleVel allocated once at construction)
  - UI.MagneticBtn trailing icon always visible in nested 24px circle with diagonal translate + scale on press
  - Unified 0.97 press scale across UI.Button and UI.MagneticBtn
affects:
  - Phase 048+ scenes using UI.Button/UI.MagneticBtn (CTAs, navigation, combat damage FX)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Zero per-frame allocation: spring state (_visualScale, _scaleVel, _pressSpringStep) allocated once at construction, mutated in place each frame
    - Additive-only changes to preserve existing consumers
    - Null-safe render hook (`if (!ctx) return;`) per threat model T-047-01
    - R.reducedMotion() snap-to-target respected in update and render

key-files:
  created: []
  modified:
    - src/ui/button.js - UI.Button press spring + MagneticBtn trailing icon + null-safe ctx guards

key-decisions:
  - "Used R.springConfigs.buttonPress (stiffness 300, damping 24, target 0.97) for the press spring, per Phase 46 convention"
  - "Added null-safe early return in both button render hooks (threat model T-047-01 mitigation) — Rule 2 deviation"
  - "MagneticBtn trailing icon rendered always when _trailingIcon is set (not hover-only), wrapped in nested 24px circle"

patterns-established:
  - "Spring state allocated once at construction + mutated in place (zero per-frame allocation)"
  - "Null-safe `if (!ctx) return;` at top of render hooks (matches R.strokeRoundRect / R.doubleBezel convention)"

requirements-completed: [BTN-01, BTN-02]

# Metrics
duration: ~15min
completed: 2026-10-21
---

# Phase 047 Plan 01: Button Press Physics & CTA Summary

**Centered spring-scale button press feedback (0.97 target) with null-safe rendering and always-visible MagneticBtn trailing icon in a nested 24px circle**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-10-21
- **Completed:** 2026-10-21
- **Tasks:** 2 complete
- **Files modified:** 1 (src/ui/button.js)

## Accomplishments

- UI.Button centered spring-scale press feedback toward 0.97 target, snapping back to 1 on release, driven by R.spring allocated once at construction
- UI.MagneticBtn trailing icon always visible when set, wrapped in nested 24px circle with diagonal translate (+1/+1) and scale (1.05x) on press
- Press scale unified to 0.97 across UI.Button and UI.MagneticBtn
- R.reducedMotion() respected: instant snap to target, no spring stepping
- Zero per-frame allocation; additive-only to preserve existing consumers
- Null-safe `if (!ctx) return;` guard in both render hooks (threat model T-047-01)

## task Commits

Each task was committed atomically:

1. **task 1: Add spring press physics + trailing icon to src/ui/button.js** - `e910183` (feat)
2. **task 2: Create tests/button.test.js with 3 tests** - no commit required (tests already existed and passed: 3/3)

**Plan metadata:** none (SUMMARY.md committed separately)

## Files Created/Modified

- `src/ui/button.js` - Modified: added null-safe ctx guards to UI.Button and UI.MagneticBtn render hooks; existing press-spring (0.97 target), MagneticBtn trailing icon, and unified scale already matched the plan
- `tests/button.test.js` - Verified existing (3 tests, all pass); no changes required

## Decisions Made

- Followed plan as specified; implementation already present for press spring, MagneticBtn icon, and unified 0.97 scale
- Added null-safe render guards per threat model T-047-01 (Rule 2 auto-fix)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added null-safe early return in button render hooks (ctx falsy)**
- **Found during:** task 1 verification (review against threat model T-047-01 and codebase convention in R.strokeRoundRect/R.doubleBezel)
- **Issue:** UI.Button._renderHook and UI.MagneticBtn._renderHook called `ctx.save()` without a null check, risking a render-loop crash when ctx is falsy (Denial of Service)
- **Fix:** Added `if (!ctx) return;` at the top of both render hooks
- **Files modified:** src/ui/button.js
- **Verification:** node --check src/ui/button.js passes; node --test tests/button.test.js passes (3/3); full suite 628 pass / 0 fail; tools/check_ui_invariants.sh passes
- **Committed in:** e910183 (task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Auto-fix necessary for correctness/security per threat model; no scope creep. All plan success criteria met.

## Issues Encountered

None — plan executed as specified; implementation already matched the plan for press spring, MagneticBtn icon, and unified 0.97 scale.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Button press physics foundation complete; UI.Button and UI.MagneticBtn ready for use in CTAs and navigation
- No blockers for next phase

---
*Phase: 047-button-press-physics*
*Completed: 2026-10-21*
