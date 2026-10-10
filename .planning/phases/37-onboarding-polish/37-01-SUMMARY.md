---
phase: 37-onboarding-polish
plan: "01"
subsystem: onboarding
tags: [tour, ONB-01, firstBattle]
requires: [37-CONTEXT.md (tour system decision)]
provides: [TourSystem, first-battle callout, tap-to-advance]
key-files:
  created: [src/systems/tour.js]
  modified: [src/scenes/zoneExploration.js, index.html, sw.js]
key-decisions:
  - "Tour fires only when G.state.combatCount === 0 and tourSeen.firstBattle unset; persisted via G.state.tourSeen"
  - "Callouts intercept taps in update() (advance + return early) so buttons don't fire during tour"
requirements-completed: [ONB-01]
duration: 10min
completed: 2026-10-10
---

# Phase 37 Plan 01 Summary

Created `src/systems/tour.js` with 5-step first-battle callout system. Wired into `zoneExploration.js` (start on enter, advance on tap, render at end). Added to `index.html` script order and `sw.js` cache. Fresh-save trigger via `G.state.combatCount === 0`.

Commit: 095381e
