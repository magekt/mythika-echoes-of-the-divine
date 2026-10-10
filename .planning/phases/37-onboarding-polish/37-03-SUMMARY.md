---
phase: 37-onboarding-polish
plan: "03"
subsystem: onboarding
tags: [journey, ONB-03, HUD]
requires: [JOURNEYS data, JourneySystem API]
provides: [Ashram journey HUD badge when G.state.journeys.active]
key-files:
  modified: [src/scenes/ashram.js]
key-decisions:
  - "Badge drawn at y=248 (below resources row at 222, below zone row at 236); 200x28 rounded gold chip"
  - "Shows journey icon + name + 'tap to continue' hint; hidden when journey completed"
requirements-completed: [ONB-03]
duration: 5min
completed: 2026-10-10
---

# Phase 37 Plan 03 Summary

Added journey HUD badge to `src/scenes/ashram.js`. When `G.state.journeys.active` is set and the journey is not completed, a gold-bordered chip at y=248 shows the journey icon + name + "Journey — tap to continue" hint. No layout shift when no journey is active.

Commit: 095381e
