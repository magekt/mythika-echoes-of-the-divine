---
phase: 39-combat-fx-ui-polish
plan: "02"
subsystem: ui
tags: [ART-04, card-polish, radius]
key-files:
  modified: [src/ui/card.js, src/ui/map-card.js]
key-decisions:
  - "card.js radius 6→8 with rgba(255,255,255,0.04) top highlight line"
  - "map-card.js radius 4→8 with rgba(255,255,255,0.05) top highlight; no functional changes"
requirements-completed: [ART-04]
duration: 3min
completed: 2026-10-10
---

# Phase 39 Plan 02 Summary

Card radius/tint polish done. card.js + map-card.js corners bumped to 8px with subtle top-highlight lines. Visual-only.

Commit: feat(39)
