---
phase: 39-combat-fx-ui-polish
plan: "01"
subsystem: art
tags: [ART-03, combat-FX, CombatFX]
key-files:
  created: [src/systems/combatFx.js]
  modified: [src/systems/combat.js, src/scenes/combatScene.js, index.html, sw.js]
key-decisions:
  - "5 elements (fire/ice/lightning/dark/holy) with distinct particle physics + colors"
  - "CombatFX.spawn hooked into combat.js attack completion (element from skill/attacker, default dark)"
  - "R.reducedMotion(): FX suppressed; update/render wired into combatScene.js"
requirements-completed: [ART-03]
duration: 12min
completed: 2026-10-10
---

# Phase 39 Plan 01 Summary

Created `src/systems/combatFx.js` (5 element particle systems, circular MAX_BURSTS=40). Hooked `CombatFX.spawn(el, G.W/2, G.H/2)` into `combat.js` attack completion path and wired `CombatFX.update/render` into `combatScene.js`.

Commit: feat(39)
