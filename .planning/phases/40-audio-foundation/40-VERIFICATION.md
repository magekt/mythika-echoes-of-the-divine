# Phase 40 Verification

**Phase:** 40-audio-foundation
**Requirements:** AUD-04, AUD-05
**Date:** 2026-10-11
**Status:** Automated contracts green; live audio confirmation deferred

## Automated
- `node --check audio.js`, `settings.js`, `game.js` — all clean
- `node --test tests/*.test.js` — 449/449 passed
- `tools/check_ui_invariants.sh` — 26 scripts, all passed

## AUD-04 ✓
- Three UI SFX defined: `toast`, `modalOpen`, `btnTap`
- `toast` wired into `Notify.show()` (game.js:5)
- `modalOpen` wired into `UI.Modal.show()` (modal.js:24)
- `btnTap` wired into settings toggle buttons (settings.js:57,68,79)
- All three check `Audio.sfxOn` + `Audio.mute` + `R.reducedMotion()` before creating nodes
- Gain node separation: SFX oscillators connect directly to `ctx.destination`, music through `_musicGain`

## AUD-05 ✓
- Three toggles in Settings: Mute, SFX, Music
- Mute master: `toggleMute()` sets `mute=true` + forces `musicOn=false` + `sfxOn=false` + `stopMusic()`
- SFX/Music toggles disabled while Mute active
- `Audio.loadPrefs()` / `Audio.savePrefs()` persist to localStorage key `mythika_audio`
- `Audio.loadPrefs()` called at boot in `game.js` after `initAudio()`
- Autoplay gate: `AudioContext` created on first user gesture (`pointerdown`/`touchend`/`keydown`)

## Mute Logic
- `Audio.mute` gates: `beep()`, `playMusic()`, `toast()`, `modalOpen()`, `btnTap()`
- Individual toggles (`musicOn`, `sfxOn`) work independently when `mute=false`
- `stopAll()` stops both melodic and ambient tracks on cleanup
