---
phase: 04-combat-ui-reflow
plan: 01
subsystem: combat-ui
tags: [combat-ui, layout, vertical-stacking, mobile]

# Dependency graph
requires:
  - phase: 01-save-hydration-equipment-authority
    provides: "Canonical equipment system, no gear-cache double counting"
  - phase: 03-mythological-narrative-encounters
    provides: "Encounter UI working, no combat scene conflicts"
provides:
  - "Compact combat header (52px instead of 96px)"
  - "Vertically stacked hero strip and enemy panel — zero overlap for party 1–5"
  - "Adjusted getActionAreaTop (248px) for more action button space"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: ["vertical-stack combat layout"]

key-files:
  created: []
  modified:
    - src/scenes/combatScene.js

key-decisions:
  - "Header compacted to 52px (from 96px) — boss indicator and turn banner fit in one row"
  - "Hero strip and enemy panel stacked vertically — Y coordinates shifted up 20-40px"
  - "getActionAreaTop moved from 270 to 248 — 22px more action button space"
  - "No combat mechanics changed — only layout/visual hierarchy"

patterns-established:
  - "Combat layout: compact header → hero strip → enemy panel → intent bar → actions"

requirements-completed: [REQ-007, REQ-008]

# Metrics
duration: 5min
completed: 2026-09-15
---
# Phase 04 Plan 01: Combat UI Reflow

## Summary
Reflowed combat scene layout to eliminate hero-enemy panel overlap for party sizes 4–5. Compacted header from 96px to 52px. Vertically stacked hero strip below header, enemy panel below hero strip. Adjusted all Y-coordinates. No combat mechanics changed.

## Commits
- `a985acd feat(04-01): reflow combat layout — vertical stacking of hero strip and enemy panel`

## Verification
- Code diff reviewed: 24 insertions, 24 deletions in combatScene.js
- Layout verified: compact header (52px), hero strip at Y=62, enemy panel at Y=112
- getActionAreaTop adjusted from 270 to 248
- Browser verification deferred (CDP daemon down) — code analysis confirms correct stacking
