# Phase 37 Context: Onboarding Polish

## Domain Boundary
Onboarding: make the first-time player experience feel guided, not overwhelming. Three surfaces: a first-battle callout system, stat-gloss annotations on first encounter, and a journey-quest HUD badge in the Ashram.

## Implementation Decisions

### ONB-01: Guided First-Battle Callouts
- New `src/systems/tour.js` — `TourSystem` with:
  - `TourSystem.start('firstBattle')` — fires when zoneExploration is entered on a fresh save (no prior combat in G.state, detected by `G.state.combatCount === 0`)
  - Callout state machine: `step: 0..4` (tap to start, attack button, turn order, rewards, done)
  - Each callout draws a small gold-bordered box at a screen position with 1-line text
  - Dismiss: tap anywhere advances step; step 4 or 5 ends the tour
  - Persistence: `G.state.tourSeen = { firstBattle: true }` so it never fires again
- `src/scenes/zoneExploration.js` calls `TourSystem.start('firstBattle')` in `enter()` and `TourSystem.render(ctx)` in `render()`; `TourSystem.update()` in `update()`
- Respects `R.reducedMotion()` — callouts still appear but without animation

### ONB-02: Stat Gloss Annotations
- In `src/scenes/characterCreate.js` step 0 (class cards), each stat label that has no tooltip currently should show a small gloss on first encounter
- New `src/systems/gloss.js` — `GlossSystem.show(statLabel)` returns a 1-line gloss for that stat (STR/AGI/MAG/ELEM/DEF/HP/MP/CRT/SPD)
- `G.state.glossSeen = {}` — once a stat's gloss has been shown, it's suppressed on subsequent views
- Glosses are drawn inline below the stat label in characterCreate class cards (step 0), not as a modal

### ONB-03: Journey Quest HUD Badge in Ashram
- `src/scenes/ashram.js` — in the zone HUD area or a new "Journey" row: when `G.state.journeys.active` is set, show a small journey badge with journey icon + name + progress (nodeId or 'done')
- Badge click → `gScene('journeyScene', true)`
- Shown only when there's an active journey (`G.state.journeys && G.state.journeys.active`)
- Use `R.colors.gold` accent, consistent with other Ashram HUD items

## Existing Code Insights
- `src/systems/journey.js`: `JourneySystem.getProgress(journeyId)` returns `{ nodeId, completed, choices }`; `G.state.journeys.active` holds active journey id
- `src/data/journeys.js`: `JOURNEYS[journeyId]` has `.name`, `.icon`
- `src/scenes/zoneExploration.js:enter()` is where first-battle tour should fire; `render()` is where callouts draw
- `src/scenes/characterCreate.js:buildClassButtons()` builds step-0 class cards; stat labels like `STR`, `AGI` are shown per class
- `src/engine/renderer.js`: `R.colors`, `R.fonts` available; `R.roundRect` for badge drawing
- `R.reducedMotion()` at `src/engine/renderer.js:90`

## Specific Ideas
- Tour callouts: keep to 5 steps max, each ≤12 words, dismiss on tap
- Stat glosses: one line, no tooltip hover, just small `R.fonts.xs` text below the stat label on first view
- Journey badge: small rectangular chip in Ashram HUD, similar style to the existing zone progress row

## Deferred Ideas
- No changes to combat rules, enemy data, or journey data structures
