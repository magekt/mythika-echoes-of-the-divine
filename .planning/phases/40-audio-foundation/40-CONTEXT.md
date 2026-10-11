# Phase 40 Context: Audio Foundation

## Domain Boundary
Audio engine foundation: 3 UI SFX plus independent Music/SFX/Mute toggles with localStorage persistence. No new music content; no ambient loops (Phase 41).

## Implementation Decisions

### AUD-04: 3 UI SFX
- `Audio.toast()` — triangle sweep 600→900Hz, 0.06s, gain 0.03. Fires from `Notify.show()`.
- `Audio.modalOpen()` — sine sweep 440→880Hz, 0.08s, gain 0.04. Fires from `UI.Modal.show()`.
- `Audio.btnTap()` — sine drop 300→150Hz, 0.04s, gain 0.05. Fires from Settings toggle buttons.
- All three gate on `Audio.ready()` + `Audio.sfxOn` + `Audio.mute` + `R.reducedMotion()`.

### AUD-05: Audio toggles
- Settings Audio section: Mute (master), SFX, Music — three independent toggles.
- Mute ON forces `musicOn=false` + `sfxOn=false` and stops music; SFX/Music buttons disabled while muted.
- Persistence: localStorage key `mythika_audio` stores `{mute, musicOn, sfxOn}`; `Audio.loadPrefs()` runs at boot after `initAudio()`.
- Gain separation: SFX oscillators connect directly to `ctx.destination`; music routes through `_musicGain`.
- Autoplay policy unchanged: `AudioContext` created on first pointer/touch/key gesture.

## Grey-Area Decision (auto-answered)
**Auto:** Mute = master override (music OFF + SFX OFF simultaneously). Unmuting restores both channels to ON rather than tracking pre-mute per-channel state, per user confirmation.

## Existing Code Insights
- `Audio.beep()` is the SFX choke point; adding mute/reducedMotion guards there covers all combat SFX.
- `Audio.playMusic()` is the music choke point; mute guard added there.
- `Audio.cleanup()` on `pagehide` suspends context; `stopAll()` stops melodic + ambient tracks.
- Settings toggles rebuild buttons after each click (`settingsScene.buildButtons()`).

## Deferred Ideas
- Ambient drone loops, combat beds (Phase 41).
- Live listen-test confirmation in a real browser (accepted residual, same precedent as v2-v5).
