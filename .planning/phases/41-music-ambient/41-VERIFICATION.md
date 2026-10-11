# Phase 41 Verification

**Phase:** 41-music-ambient
**Requirements:** AUD-01, AUD-02, AUD-03
**Date:** 2026-10-11
**Status:** Automated contracts green; live audio confirmation deferred

## Automated
- `node --check audio.js`, `title.js`, `ashram.js`, `combatScene.js`, `fishing.js` — all clean
- `node --test tests/*.test.js` — 449/449 passed
- `tools/check_ui_invariants.sh` — 26 scripts, all passed

## AUD-01 ✓ (Title Ambient)
- 4-chord C major ambient drone with 6s crossfade, 600Hz lowpass, 0.65 feedback, ±6c detune
- Title scene: `playAmbient('title')` on enter, `stopAmbient()` on leave
- Fishing scene reuses title ambient for calm mood

## AUD-02 ✓ (Ashram Ambient)
- 4-chord D major ambient drone with 7s crossfade, 800Hz lowpass, 0.60 feedback, ±5c detune
- Ashram scene: `playAmbient('ashram')` on enter
- Scene-scoped start/stop via ambient loop lifecycle

## AUD-03 ✓ (Combat SFX + Ambient)
- combat_dark: A minor root, 400Hz cutoff, 0.70 feedback, ±12c detune, 4s crossfade
- combat_boss: E root, 350Hz cutoff, 0.75 feedback, ±14c detune, 3.5s crossfade
- Zone mapping: svarga→combat_boss, others→combat_dark
- All 8 combat SFX (attack, crit, skill, hit, heal, shield, dodge, combo) remain separate short blips via `ctx.destination`

## Unlock Flow
- `Audio.unlock()` routes pending tracks: ambient IDs (`title/ashram/combat_dark/combat_boss`) → `playAmbient()`, others → `playMusic()`
- Both ambient and melodic tracks are pending-tracked through `_pendingTrack`
