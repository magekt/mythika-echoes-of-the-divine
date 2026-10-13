# Phase 41 Context: Music & Ambient

## Domain Boundary
Procedural ambient identity: title/ashram/combat drone loops with delay wash, wired scene-scoped. No external audio files; all Web Audio synthesized. Depends on Phase 40 foundation (toggles, mute, persistence, reducedMotion guards).

## Implementation Decisions

### Ambient design (user-confirmed): slow detuned drones + delay wash
- 4 sine oscillators per chord, random ±detune (5–14 cents per track).
- 2s linear gain attack to 0.035 per oscillator; 1s release on `stopAmbient()`.
- Lowpass filter per track (350–800Hz, Q=1.2) → dry/wet split → 0.7s feedback delay (0.60–0.75 feedback).
- Chord crossfade: `linearRampToValueAtTime` on frequency over 3s; chord index advances every `chordMs`. No clicks or gaps.

### Track definitions
- `title`: C major mystical, 6s crossfade, 600Hz cutoff, 0.65 feedback, ±6c.
- `ashram`: D major warm, 7s crossfade, 800Hz cutoff, 0.60 feedback, ±5c.
- `combat_dark`: A minor tense, 4s crossfade, 400Hz cutoff, 0.70 feedback, ±12c.
- `combat_boss`: E root ominous, 3.5s crossfade, 350Hz cutoff, 0.75 feedback, ±14c.

### Scene wiring
- title.js: `playAmbient('title')` on enter, `stopAmbient()` on leave.
- ashram.js: `playAmbient('ashram')` on enter.
- combatScene.js: zone map collapsed to `combat_dark` (all zones) / `combat_boss` (svarga boss path).
- fishing.js: reuses `title` ambient for calm mood.
- `Audio.unlock()` routes pending ambient IDs through `ambientIds` array, else falls back to melodic `playMusic()`.

### AUD-03 note
- The 8 combat SFX (attack, crit, skill, hit, heal, shield, dodge, combo) pre-existed as short oscillator blips on `ctx.destination`; they stay distinct from the ambient bed. Phase 41 adds the two combat ambient beds and layers SFX over them.

## Grey-Area Decision (auto-answered)
**Auto:** Fishing reuses the title ambient loop rather than a dedicated fifth track — calm mood match, minimal node cost.

## Existing Code Insights
- `_musicGain` (0.04) is the shared music master; ambient `masterGain` (0.5) feeds into it.
- `_pendingTrack` handles pre-gesture requests for both melodic and ambient tracks.
- `stopAll()` stops melodic interval + ambient interval + disconnects delay graph.

## Deferred Ideas
- Live browser listen-test for drone mood/seamlessness (accepted residual, same precedent as v2–v5).
