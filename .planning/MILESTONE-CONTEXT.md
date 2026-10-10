# Milestone v6.0 — Ship Polish, Art & Audio, Onboarding

**Context source:** External game review (Magekt, 2026-10-10). Reviewer flagged 4 areas; user chose Full Sweep.

## What Shipped (v5.0)
All layout fixes and early-game pacing work is complete and shipped. The foundation is now contract-stable (449/449 tests, invariants green). v6.0 is the first milestone focused on ship-readiness and presentation polish, not core mechanic depth.

## Scope

### 1. Ship Fixes (priority: fast, low-risk, high-visibility)
- **LICENSE**: Add `MIT` (or `GPLv3` — decide) to repo root; add SPDX identifier comment header to top-of-file for the main entry points (`index.html`, `src/main.js`) or just the root LICENSE file.
- **Firebase 404 noise**: The GitHub Pages build fetches `firebase-config.js` which 404s when repo secrets aren't configured. Currently the error is caught but still logs a noisy warning. Fix: add a silent `?` fallback or suppress the log when `firebase-config.js` is intentionally absent (local play default). Make the "Firebase init failed" warning only appear in `?probe` mode.
- **Debug scene in shipped build**: Find and remove (or gate behind `?debug`) any debug/diagnostic scene that is registered in the production code path but not intended for end users.
- **Console cleanliness**: Target zero unhandled errors/warnings on first load in the deployed GitHub Pages build (except `?probe`).

### 2. Onboarding (guided first battle + welcome)
- **Guided first battle**: After character creation, walk the player through their first zone encounter with inline step-by-step callouts (tap to start, attack button location, turn order explanation, reward collection). 3–5 taps, non-blocking.
- **Welcome scene density**: Review and lighten the 3-step character creation + welcome flow. The stat-abbreviation wall (STR/AGI/MAG/ELEM/MP-regen) should be deferred or annotated with 1-line glosses on first encounter.
- **Journey quest visibility**: The personalized journey quest (e.g., Arjuna's Resolve) should be surfaced more prominently in the Ashram HUD — not just buried in the Quest Log.

### 3. Art (visual polish, procedural → painted)
**Goal: Transform from text-card UI to a game that looks like a cultivation RPG.**
- **Zone backdrops** (8 zones): Painted/static canvas-drawn backgrounds per zone, replacing current procedural gradients. Style: dark, atmospheric, consistent with existing dark-navy/gold palette.
- **Enemy portraits** (61 enemy types → top 20 by encounter priority): Small canvas-drawn portrait icons for enemy cards in combat and exploration UIs. Silhouette/ink style acceptable; no external assets required.
- **Hero sprite polish**: The "Mount Meru" sprite on the title screen and hero portraits on combat HUDs should be more distinctive.
- **Combat FX**: Simple particle/canvas effects for attack hits (slash arc, fire particles, ice shards) — 3–5 effects keyed to element type.
- **UI cards**: Reduce text-dense card feel; add subtle background tints per zone; card corners can use the existing `R.roundRect` at a slightly larger radius for a less utilitarian look.

**Constraints:**
- No external image files. All art is canvas-drawn (procedural). This keeps the no-build-step / no-asset-pipeline constraint.
- Use `R.colors` and `R.fonts` exclusively — no raw hex in scene code.
- New art code goes in `src/systems/` or `src/ui/` (not inline in scenes unless it's a one-off decorative element).
- Respect `R.reducedMotion()` — all new particle/animation code must check for it.

### 4. Audio (music + SFX, procedural Web Audio)
**Goal: Elevate from thin bleeps to an audio identity matching the title "Echoes of the Divine."**
- **Title screen music**: Ambient loop, 30–60s, procedural Web Audio (oscillator + gain node + delay/reverb-ish). Mood: mystical, slow, droning. No melody, just atmosphere.
- **Ashram ambient**: Low-volume ambient loop (bells, wind) that plays while in Ashram hub.
- **Combat SFX** (5–8 sounds): Attack hit (slash/shockwave), enemy hit, dodge, victory jingle (3-note), defeat thud, level-up chime, potion brew (bubble), spirit beast summon (pulse).
- **UI SFX** (2–3 sounds): Button tap (subtle click), modal open, toast notification.
- **Audio toggle**: Add a persistent mute/music/SFX toggle in Settings scene, stored in localStorage.
- **Autoplay policy**: Audio only starts after first user gesture (the "New Game" tap). No autoplay before that.

**Constraints:**
- No external audio files. All audio is Web Audio API synthesized.
- Audio engine should be in `src/systems/audio/` or a new `src/systems/audio.js`.
- SFX and music on separate gain nodes so they can be toggled independently.
- `R.reducedMotion()` → disable SFX that depend on frame-timing (keep music/SFX on demand only).

## REQ IDs (roadmapper to confirm and expand)
- SHP-01: LICENSE added
- SHP-02: Firebase 404 noise suppressed in prod; only logs in `?probe`
- SHP-03: Debug scene removed or gated behind `?debug`
- SHP-04: Console clean on first load (prod, no `?probe`)
- ONB-01: Guided first-battle walkthrough (3–5 non-blocking callouts)
- ONB-02: Character creation stat-glosses on first encounter (deferred 1-liners)
- ONB-03: Journey quest surfaced in Ashram HUD
- ART-01: 8 zone backdrops (procedural, dark-navy/gold palette)
- ART-02: 20 enemy portrait icons (canvas-drawn silhouettes)
- ART-03: 5 element combat FX (particles)
- ART-04: UI card radius/tint polish
- AUD-01: Title screen ambient loop (procedural)
- AUD-02: Ashram ambient loop
- AUD-03: 8 combat SFX
- AUD-04: 3 UI SFX
- AUD-05: Audio toggle (music/SFX/mute) in Settings

## Non-goals for v6.0
- No new mechanics, new zones, or new heroes
- No external asset files (images/audio)
- No framework migration
- No gameplay balance changes beyond what the review flagged (BAL-02 was already accepted as-is in v5.0)

## Phase estimate (roadmapper to refine)
4–6 phases, ~18–22 plans total. Ship fixes (1 phase) → Onboarding (1 phase) → Art (1–2 phases) → Audio (1–2 phases).

## Suggested phase breakdown (starting point)
1. **Phase 36 — Ship Readiness**: LICENSE + Firebase 404 + debug scene + console clean
2. **Phase 37 — Onboarding Polish**: guided first battle + stat glosses + journey HUD
3. **Phase 38 — Zone & Enemy Art**: 8 backdrops + 20 enemy portraits
4. **Phase 39 — Combat FX & UI Polish**: element particles + card radius/tint
5. **Phase 40 — Audio Foundation**: audio engine + toggle + UI SFX
6. **Phase 41 — Music & Ambient**: title loop + Ashram ambient + combat SFX
