# 12-01-SUMMARY: Per-Frame Render Optimization

**Plan:** 12-01 (wave 1)
**Status:** Complete ✓
**Commit:** be78b6b
**Date:** 2026-09-19

## Objective

Optimize the travel map's per-frame rendering: cache metrics/rects/wrapText, pre-render the grid to an offscreen canvas, and cull offscreen regions and connections.

## Changes

### src/scenes/travelMap.js

1. **Offscreen grid canvas** (`_buildGridCanvas` + `renderMapTexture`):
   - Grid lines are now drawn ONCE to an offscreen canvas (G.W+48 × G.H+48, 24px spacing)
   - Each frame draws the cached canvas via `drawImage(-24+drift, viewport.y-24)` — was ~51 `beginPath/stroke` calls per frame, now 1 `drawImage`
   - Canvas rebuilt only when viewport size changes (keyed by `G.W + 'x' + G.H`)
   - `typeof document === 'undefined'` guard keeps Node test sandboxes safe

2. **Per-frame metrics caching** (`getMapMetrics` → `data._cachedMetrics`):
   - Viewport/padding/scale computed once per render frame, reused by renderMap/renderRegion/renderConnections/clampPan
   - Zeroed at render start, cleared on leave

3. **Region rect caching** (`getRegionRect` → `data._cachedRects` Map):
   - Each zone's rect computed once per frame, keyed by zoneId
   - Map rebuilt on pan position change (mapX/mapY unequal to last frame)

4. **Viewport culling** (`_intersectsViewport`):
   - `renderMap` skips regions whose rect doesn't intersect the clipped viewport
   - `renderConnections` skips connections when the FROM rect, or either endpoint, is offscreen

5. **wrapText caching** (`data._descCache`):
   - Detail panel description lines cached by selection key (`zone_`/`landmark_`/`event_`)
   - Invalidated on selection change

### tests/travel_map_perf.test.js (new, 7 tests)

- `_cachedMetrics` populated after render
- `_cachedRects` is a Map with 6 entries
- `getMapMetrics` called at most once per render cycle
- Landmark selection populates `_descCache` with `landmark_` key
- Off-screen region skipped (mock R.roundRect count)
- Off-screen connection endpoints produce 0 strokes
- Caches cleared on resetState

## Verification

- Full suite: 60/60 green (was 48/48 before this phase)
- `node --test tests/travel_map_perf.test.js` → 7/7 pass
- No new dependencies, no new production files

## Success Criteria Met

- [x] Map metrics computed once per render frame, reused
- [x] wrapText results cached on selection change
- [x] Region rects computed once per frame and reused
- [x] Grid rendered via pre-drawn offscreen canvas (1 drawImage, was 51 strokes)
- [x] Off-screen region cells skipped
- [x] Off-screen connection pairs skipped
- [x] getMapMetrics at most once per frame