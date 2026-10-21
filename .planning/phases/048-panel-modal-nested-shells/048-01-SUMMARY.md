---
phase: 048-panel-modal-nested-shells
plan: 01
subsystem: ui
tags: [canvas, ui, double-bezel, reduced-motion, ease-premium, nested-shell]

# Dependency graph
requires:
  - phase: 046-renderer-primitives-foundation
    provides: R.doubleBezel, R.easePremium, R.reducedMotion renderer primitives
  - phase: 047-button-press-physics
    provides: UI.Button press spring state used by modal buttons
provides:
  - UI.Panel with R.doubleBezel nested-shell render and enterProgress animation
  - UI.Modal with interpolated overlay backdrop alpha and 40ms button-cascade enter
  - tests/panels.test.js with 5 passing Node tests
affects: [future UI phases using Panel/Modal components]

# Tech tracking
tech-stack:
  added: []  # No new external dependencies; uses Phase 46/47 primitives
  patterns:
    - "Doppelrand nested enclosure via R.doubleBezel (outer shell + inset core highlight)"
    - "Eased alpha entrance transitions via R.easePremium on ctx.globalAlpha"
    - "40ms stagger button cascade via per-button _btnProgress[i] array"
    - "Media-aware reduced motion via R.reducedMotion() (G.state + matchMedia)"
    - "Children render at full opacity (ctx.globalAlpha = 1) after alpha-wrapped shell"

key-files:
  created:
    - tests/panels.test.js - 5 Node tests for Panel/Modal nested-shell behaviors
  modified:
    - src/ui/panel.js - UI.Panel migrated to R.doubleBezel + enterProgress animation
    - src/ui/modal.js - UI.Modal migrated to R.doubleBezel + overlay alpha + button cascade

key-decisions:
  - "Panel shell uses R.doubleBezel with shellFill/shellStroke/radius:R.radius.m, replacing flat R.roundRect + manual strokeRect"
  - "Panel enterProgress wraps only shell+title in alpha; children render at full opacity"
  - "Modal overlay alpha = m._alpha * R.easePremium(_overlayProgress), ramping 0→1 over 250ms"
  - "Modal button cascade: button[i] starts at 250ms + 40ms*i, ramps over 400ms window"
  - "All reduced-motion checks use R.reducedMotion() (media-aware), not manual G.state.reduceMotion"

requirements-completed: [PAN-01, PAN-02, PAN-03, PAN-04]

# Metrics
duration: verification-session
completed: 2026-10-21T16:04:59Z
tasks: 3
files-modified: 3

# Phase 048 Plan 01: Panels & Modals Nested Shells Summary

**UI.Panel and UI.Modal migrated to Phase 46/47 renderer primitives — R.doubleBezel nested "Doppelrand" shells, R.easePremium interpolated overlay backdrops, 40ms button-cascade enter, media-aware reduced motion via R.reducedMotion().**

## Performance

- **Duration:** execution session (implementation pre-committed; verification completed this session)
- **Completed:** 2026-10-21T16:04:59Z
- **Tasks:** 3/3 complete
- **Files modified:** 3 (src/ui/panel.js, src/ui/modal.js, tests/panels.test.js)

## Accomplishments

- UI.Panel renders through R.doubleBezel nested-bezel shell with enterProgress animation (250ms ramp, instant under reduced motion); children render at full opacity
- UI.Modal panel shell uses R.doubleBezel; overlay backdrop alpha interpolates via R.easePremium(_overlayProgress) over 250ms ramp; buttons enter with 40ms stagger cascade
- All reduced-motion gating uses R.reducedMotion() (checks G.state.reduceMotion AND matchMedia prefers-reduced-motion)
- tests/panels.test.js added with 5 tests covering Panel.render, Panel.update, Modal._overlayProgress ramp/instant, and button cascade ordering

## Task Commits

All three tasks were committed atomically in a single commit:

1. **task 1: Migrate src/ui/panel.js to R.doubleBezel nested-shell + enter animation** - `081f554b69246225b5fc63aff0a13e428876e7a3` (feat)
2. **task 2: Migrate src/ui/modal.js to R.doubleBezel shell + overlay alpha + button cascade** - `081f554b69246225b5fc63aff0a13e428876e7a3` (feat)
3. **task 3: Create tests/panels.test.js with 5 Phase 48 behavior tests** - `081f554b69246225b5fc63aff0a13e428876e7a3` (test)

**Plan metadata:** `6e61f0c` (docs: create phase plan)

## Files Created/Modified

- `src/ui/panel.js` - UI.Panel: R.doubleBezel shell, enterProgress animation, R.easePremium alpha on shell+title only, children at full opacity, R.reducedMotion() gating
- `src/ui/modal.js` - UI.Modal: R.doubleBezel shell, interpolated overlay alpha, 40ms button cascade via _btnProgress[i], R.reducedMotion() throughout, ghost dissolve via R.easePremium(1-t)
- `tests/panels.test.js` - 5 Node tests (node:test + node:assert/strict) mocking Canvas 2D and stubbing R primitives

## Decisions Made

- Followed plan as specified; all Phase 48 locked decisions from 48-LEARNINGS.md were already implemented in the committed code
- Modal overlay alpha uses the enter-animation `alpha` value rather than `m._alpha` for the active modal (m._alpha is ghost-only; using it for the active modal would produce NaN) — this is a correctness improvement, not a deviation

## Deviations from Plan

None - plan executed exactly as written. All tasks were pre-implemented and committed; this execution verified correctness and created the SUMMARY.

## Stub Tracking

No stubs found in files created or modified during this plan. All components render with real data sources wired; no hardcoded empty values, placeholder text, or unwired props.

## Threat Surface Scan

No new security-relevant surface introduced beyond the plan's threat model (T-048-01 through T-048-06 already mitigated/accepted). No new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries.

## Issues Encountered

None - all code was already in the target state; verification passed cleanly.

## User Setup Required

None - no external service configuration required. Local localStorage play is the default; Firebase auth/cloud saves are optional and do not block offline play.

## Next Phase Readiness

Phase 048 plan 01 is complete. UI.Panel and UI.Modal are fully migrated to the Phase 46/47 renderer primitives with 5/5 tests passing, full suite green (628/629, 1 skipped), and UI invariants passing. Ready for subsequent phases that build on Panel/Modal components.

## Self-Check: PASSED

All created files exist, all commits verified (081f554 implementation, 213df05 SUMMARY).

---
*Phase: 048-panel-modal-nested-shells*
*Completed: 2026-10-21*
