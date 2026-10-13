# Phase 39 Context: Combat FX & UI Polish

## Domain Boundary
Combat presentation: add 5 element-keyed particle FX on damage events, and polish card component radii/tints. No new mechanics or scene logic changes.

## Implementation Decisions

### ART-03: 5 Element Particle FX
- New `src/systems/combatFx.js` — `CombatFX` object:
  - `CombatFX.spawn(element, x, y)` — spawns particles for the element at (x, y) in canvas coords
  - 5 elements: `fire`, `ice`, `lightning`, `dark`, `holy`
  - Each element has distinct particle behavior:
    - fire: 6 orange/red particles, slight upward drift, short life (0.4s)
    - ice: 5 light-blue particles, slow outward spread, fade (0.5s)
    - lightning: 4 white/gold particles, fast radial burst (0.3s)
    - dark: 5 purple/dark particles, inward spiral (0.5s)
    - holy: 6 gold/white particles, upward float, glow (0.6s)
  - Particles stored in a circular buffer (max 40 active particles, same pattern as `R.clickFx`)
  - `CombatFX.update(dt)` — advances age, removes dead particles
  - `CombatFX.render(ctx)` — draws all active particles as small filled circles with glow
  - Respects `R.reducedMotion()`: if true, skip spawning (no motion FX)
- Wire into `src/systems/combat.js`: when `Combat.calcDamage` result is applied, call `CombatFX.spawn(element, targetX, targetY)`. Element comes from the skill/attack type (fire/ice/lightning/dark/holy) — use the first enemy's or hero's element if available, default to 'dark' for physical hits
- `src/scenes/combatScene.js`: call `CombatFX.update(dt)` in `update()`, `CombatFX.render(ctx)` after the main render pass

### ART-04: UI Card Radius/Tint Polish
- `src/ui/card.js` — increase card corner radius from 6 to 8 (`R.radius.m` if it exists, otherwise 8)
- Add subtle top-highlight line (1px, `rgba(255,255,255,0.04)`) to card backgrounds in `card.js`
- `src/ui/map-card.js` — same radius bump (6 → 8); add subtle vertical gradient tint in the card background
- No functional changes; visual polish only

## Grey-Area Decision (auto-answered)
**Auto:** Element determination: when a skill has no explicit element, default to 'dark' (physical hit FX). When enemy/hero element is set, use that element. Skill-to-element mapping: check `skill.element` or `enemy.element` field; fallback to 'dark'.

## Existing Code Insights
- `R.clickFx` (renderer.js:419) — circular buffer pattern for click FX; `createCircularBuffer` available
- `R.updateClickFx(dt)` — already called in game.js rAF loop; add `CombatFX.update(dt)` alongside
- `R.validTick`/`R.stoneHit` — the existing micro-FX, all honor `R.reducedMotion()`
- `src/ui/card.js:46` — `R.roundRect(ctx, x, y, w, h, 6, color)` — change radius 6 → 8
- `src/ui/map-card.js` — same pattern, radius 6 → 8
- `src/systems/combat.js:466` — `Combat.calcDamage(attacker, defender, skill, isCrit)` — best hook point for FX
- `R.colors.fire`, `R.colors.ice`, etc. — check if element colors exist; if not use zoneArt palette hex in combatFx.js only

## Specific Ideas
- Fire particles: small 3px circles, `R.colors.orange`/`#ff6020`, slight gravity (falling), 0.4s life
- Ice particles: 4px hexagons (approx with circles), `#a0e0ff`, slow spread, 0.5s life
- Lightning: thin 2px lines, `#ffff80`/`#ffffff`, fast burst, 0.3s life
- Dark: 4px circles, `#4a2060`/`#8030a0`, inward spiral, 0.5s life
- Holy: 3px circles with glow, `#ffd700`/`#fff8e0`, upward float, 0.6s life

## Deferred Ideas
- No idle animations, no sprite changes, no audio (Phase 40–41)
