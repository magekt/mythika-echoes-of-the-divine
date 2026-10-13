---
phase: 37-onboarding-polish
plan: "02"
subsystem: onboarding
tags: [glosses, ONB-02]
requires: [37-CONTEXT.md (gloss system decision)]
provides: [GlossSystem, inline stat glosses in characterCreate step 0]
key-files:
  created: [src/systems/gloss.js]
  modified: [src/scenes/characterCreate.js, index.html, sw.js]
key-decisions:
  - "Glosses shown on first render of step-0 class cards only (HP/STR/MAG/MP); __step0GlossesShown flag in G.state.glossSeen suppresses repeats"
  - "Gloss text drawn at R.fonts.xs, R.colors.textDim, below the bonus line"
requirements-completed: [ONB-02]
duration: 5min
completed: 2026-10-10
---

# Phase 37 Plan 02 Summary

Created `src/systems/gloss.js` with 7-stat gloss map. Wired inline glosses into `characterCreate.js` step-0 class cards — each stat gloss (HP/STR/MAG/MP) renders in `R.fonts.xs` below the bonus line on first view only. Suppression via `G.state.glossSeen.__step0GlossesShown` flag.

Commit: 095381e
