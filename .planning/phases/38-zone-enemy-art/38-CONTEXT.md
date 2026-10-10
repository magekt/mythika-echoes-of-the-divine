# Phase 38 Context: Zone & Enemy Art

## Domain Boundary
Visual presentation: 8 procedural zone backdrops and 20 canvas-drawn enemy portrait icons. No external asset files; everything is code drawing to the existing offscreen-canvas LRU in `backgrounds.js`.

## Implementation Decisions

### ART-01: 8 Zone Backdrops
- Create `src/systems/zoneArt.js` with `ZoneArt.registerAll()` that calls `R.Backgrounds.registerSlot('zone:' + id)` for each of the 8 zone IDs in `ZONES`, then paints a distinct procedural scene per zone
- Each backdrop is a 400x720 offscreen canvas; zones use layered painting: gradient sky + terrain silhouette + accent particles
- Zone color palettes (dark-navy base, gold accent, one distinct accent per zone):
  - aryavarta: golden plains (warm gold + dark navy)
  - dandaka: shadow forest (deep purple-black + mist)
  - meru: cosmic peak (indigo + teal glow)
  - patala: underworld (deep red-black + orange embers)
  - svarga: celestial (light blue + white clouds)
  - tapobhumi: austerity (sand + ochre)
  - The remaining 2 zones (if 8 in ZONES beyond these 6) get distinct variants
- `ZoneArt` is called from `src/systems/save.js` or `game.js` boot so all slots register at init
- All drawing uses `R.colors` semantic tokens where possible; zone-specific hex values allowed in `zoneArt.js` only (scene files must not have raw hex)

### ART-02: 20 Enemy Portrait Icons
- Create `src/systems/enemyPortraits.js` with `EnemyPortrait.render(ctx, x, y, w, h, enemyId)`
- Draws a 60x60 procedural silhouette portrait: a distinctive head shape per enemy type, filled with zone-appropriate dark color, gold outline
- 20 highest-priority enemies (top 20 by encounter frequency in `ZONES.enemies` arrays); any enemy not in the map falls back to a generic silhouette
- Portraits are drawn onto an offscreen canvas per enemy (LRU cached, same as backgrounds)
- `combatScene.js` and `zoneExploration.js` replace the current emoji/name-based enemy icon with `EnemyPortrait.render(ctx, ...)` when the enemy card is drawn
- Portrait canvas: 60x60; scale factor 0.85 in combat, 1.0 in exploration

## Grey-Area Decision (auto-answered)
**Auto:** Zone backdrops are static (no animation loop); the existing `bgAlpha` fade-in in scene enter() handles the transition. Enemy portraits are static per-enemy silhouettes — no idle animation (that would be Phase 39 scope).

## Existing Code Insights
- `src/engine/backgrounds.js:31` — `fallbackGenerators.zone` uses `createLinearGradient`; `registerSlot` + `renderBackground(ctx, 'zone:' + id)` is the API
- `src/data/zones.js` — 8 zones: aryavarta, dandaka, meru, patala, svarga, tapobhumi + 2 more (svarga/tapobhumi + check for additional); each has `bgColor` hex
- `src/data/enemies.js` — `ENEMIES` object keyed by id; `createEnemyState(e, lvl, tier)` returns enemy state
- `src/scenes/combatScene.js:104,1056,1059` — background slot usage in combat
- `src/scenes/zoneExploration.js:55,334,337` — background + character moment
- `UI.MapCard` in `src/ui/map-card.js` — draws zone cards on travel map (not enemy cards)
- Enemy card rendering in `combatScene.js` and `zoneExploration.js` — uses `enemy.name` + HP bar; no portrait currently

## Specific Ideas
- Zone backdrop: 3-layer composition — gradient sky, mid-ground silhouette (treeline/mountain/wave), foreground accent particles
- Enemy portrait: circle head + simple shoulders, filled with zone-tinted dark color, gold rim light on one side; 8 distinct head shapes (horned, reptile, bird, antler, hooded, bare, crowned, masked)
- Use `R.colors.gold` for rim accent, `R.colors.textDim` for shadow side

## Deferred Ideas
- No idle animation (Phase 39+), no combat sprites (Phase 39+), no audio (Phase 40–41)
