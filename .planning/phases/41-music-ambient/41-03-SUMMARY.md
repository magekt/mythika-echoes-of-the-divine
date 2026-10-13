---
phase: 41-music-ambient
plan: "03"
subsystem: audio
tags: [AUD-03, combat, ambient, SFX-layering]
key-files:
  modified: [src/engine/audio.js, src/scenes/combatScene.js]
key-decisions:
  - "combat_dark: A minor tense bed, 4s crossfade, 400Hz cutoff, 0.70 feedback, ±12c detune"
  - "combat_boss: E root ominous bed, 3.5s crossfade, 350Hz cutoff, 0.75 feedback, ±14c detune"
  - "Zone mapping: svarga boss path → combat_boss; all other zones → combat_dark"
  - "8 combat SFX stay as short direct-to-destination blips, distinct from the washed ambient bed"
requirements-completed: [AUD-03]
duration: 4min
completed: 2026-10-11
---

# Phase 41 Plan 03 Summary

Combat ambient beds implemented with dissonant low-end drones. Boss fights get the lower, more intense `combat_boss` bed; all other zones use `combat_dark`. Existing combat SFX layer crisply over the washed bed since they bypass the delay chain.
