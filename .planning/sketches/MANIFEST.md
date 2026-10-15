# Sketch Manifest

**Project:** Mythika: Echoes of the Divine
**Created:** 2026-10-15
**Mode:** Frontier analysis (no existing sketches)

## Frontier Gaps Identified

Based on codebase analysis, three design areas have no prior sketches:

| # | Gap | Target Scene | Priority |
|---|-----|-------------|----------|
| 1 | Combat action feedback (spring-driven hit, damage floaters, elemental FX) | combatScene.js | High |
| 2 | Travel map region interaction (tap-to-inspect, landmark reveal, drag-to-pan) | travelMap.js | High |
| 3 | Cultivation breakthrough moment (hero surface, realm transition, progress ring) | cultivationScene.js | Medium |

## Proposals

1. **Sketch: Combat Damage Floater System** — 3 variants: minimal (text only), medium (text + element icon), rich (text + icon + spring bounce + fade). Goal: pick the right density for 400x720 mobile.
2. **Sketch: Travel Map Region Card** — 3 variants: compact (1-line label + status), standard (label + sublabel + region art thumbnail), expanded (full zone detail with landmarks list). Goal: consistent card grammar across all zones.
3. **Sketch: Cultivation Breakthrough Overlay** — 3 variants: radial progress ring, stacked chakra pips, dual meter (prana + insight). Goal: communicate breakthrough threshold without cluttering the cultivation panel.

## Status

- [ ] combat-damages — not started
- [ ] travel-region-card — not started
- [ ] cultivation-breakthrough — not started
