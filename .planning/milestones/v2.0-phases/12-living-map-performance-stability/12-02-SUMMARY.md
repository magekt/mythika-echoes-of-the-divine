# 12-02-SUMMARY: Lifecycle Stability + Reduced-Motion + Map Probe

**Plan:** 12-02 (wave 2)
**Status:** Complete ✓
**Commit:** 5cd716c
**Date:** 2026-09-19

## Objective

Validate scene lifecycle stability, enforce reduced-motion completeness across the travel map and UI components, add map-specific performance probe, and verify the full automated suite.

## Changes

### src/ui/button.js — MagneticBtn reduced-motion guard

- Spring scale (`stiffness=120, damping=22`) now checks `R.reducedMotion()` at the top of `update()`
- In reduced motion: `spring.scale` snaps instantly to `targetScale` (no spring animation)
- Magnetic icon physics reuses the same `reduceMotion` const (was computed separately)

### src/engine/game.js — Fade instant-transition + ?probe&map

- **Fade.update()**: when reduced motion is active, `alpha` snaps directly to `target` (no fade-to-black), then the pending-scene handoff still executes (identical semantics, zero-duration transition)
- **?probe&map**: when `?probe` URL param is present AND `&map` is present, boot navigates to `travelMap` scene after game loop starts (100ms delay, after `SaveSystem.load()`), enabling automated FPS measurement of the map scene specifically

### tests/travel_map_lifecycle.test.js (new, 5 tests)

- Repeated enter/leave cycles (10x) keep buttons array ≤ 3
- After leave, no stale selections survive (selectedZone/selectedLandmark/selectedEvent all null)
- After leave, all state fields cleared (scrollY, mapX, mapY, isDragging, didDrag)
- Repeated enter/leave (5x) keeps buttons array at exactly 3 every time
- Caches (_cachedMetrics/_cachedRects/_descCache) cleared on resetState

## Verification

- Full suite: 60/60 green
- `node --test tests/travel_map_lifecycle.test.js` → 5/5 pass
- Reduced-motion enforcement verified at code level (spring + fade + grid drift all guarded)

## Success Criteria Met

- [x] Repeated enter/leave cycles do not grow buttons beyond 3
- [x] No stale selections after leave
- [x] All travel map animation guarded by R.reducedMotion()
- [x] MagneticBtn spring scale instantly resolves in reduced-motion
- [x] Scene fade transitions instant in reduced-motion
- [x] ?probe&map boots directly into travel map
- [x] Full automated suite passes (60/60)

## Remaining Manual Step

Human browser verification checkpoint (this plan is `autonomous: false`):
- Open `index.html?probe&map` → verify boots straight into REGION MAP
- Observe map-specific FPS stable (>30fps sustained) while panning, selecting regions, opening landmark/event details
- Repeat enter/leave cycles (enter map, back, re-enter) → no console errors, no growing retained state
- Enable Reduce Motion → verify no animated grid drift, no spring buttons, instant scene transitions
- Verify dense combination of regions + landmarks + echoes + events is readable