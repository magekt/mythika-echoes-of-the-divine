# Phase 12 Research: Living Map Performance & Stability

**Requirement:** REQ-020 — Smooth, Stable Map Rendering
**Date:** 2026-09-18
**Analyzer:** Direct orchestrator analysis (subagent capacity unavailable)

---

## 1. Current State Analysis

### Map Rendering Pipeline (travelMap.js — 700+ lines)

The travel map scene is the most complex rendering surface in the game. Every frame:

1. **renderMapTexture** (line 404): Draws a scrolling grid across the entire viewport using `performance.now()` drift. Creates ~30+ `beginPath/moveTo/lineTo/stroke` calls per frame for grid lines.

2. **renderConnections** (line 423): Draws dashed lines between connected zones. Calls `getRegionRect()` twice per connection (from + to). With 4 zones and ~4 connections = ~8 object allocations per frame just for connection lines.

3. **renderRegion** (line 439): Called for EVERY zone entry per frame. Inside each call:
   - `MapHelpers.getStatus()` — reads zone progress, influence, access rules
   - `MapHelpers.getLockReason()` — high complexity (cyclomatic 25)
   - `MapHelpers.getCompletion()` — reads zone progress
   - `MapHelpers.getStatusColor()` — maps status to color
   - `renderLandmarkIndicators()` — iterates landmarks per zone
   - `renderEchoIndicators()` — iterates narrative echoes per zone
   - `renderEventIndicators()` — iterates world events per zone, uses `performance.now()` sine for pulse animation

### Per-Frame Object Allocations

| Method | Creates | Calls/Frame | Risk |
|--------|---------|-------------|------|
| `getMapViewport()` | `{x,y,w,h}` | 1-2x | Low |
| `getMapMetrics()` | `{viewport,padding,scale}` | 2-3x | Low |
| `getRegionRect()` | `{x,y,w,h}` | 4-8x (per zone × connections) | Medium |
| `getPointer()` | May reference Input internals | 1x | Low |
| `MapHelpers.getWorldEvents()` | Returns array from WorldEvents | 4x (per zone) | Low |
| `MapHelpers.getNarrativeEchoes()` | Returns array from NarrativeEchoes | 4x (per zone) | Low |

**Assessment:** Individual allocations are small, but the aggregate per-frame count (15-20+ objects) adds GC pressure on low-end mobile. The `getRegionRect()` calls are the highest-frequency offender.

### No Offscreen Culling

`renderRegion()` draws ALL zones regardless of whether they're visible in the current viewport. The clip rect in `renderMap()` clips output but doesn't prevent the computation. On a small mobile screen with panned map, 2-3 of 4 zones may be fully offscreen but still fully computed and drawn.

### Button Lifecycle (Potential Leak)

```
enter() → resetState() → buildButtons()
  buildButtons() creates 3 MagneticBtn instances
  Resets this.data.buttons = [backBtn, enterBtn, closeBtn]

leave() → resetState()
  Sets this.data.buttons = [] — does NOT call .destroy() on MagneticBtn instances
```

**MagneticBtn** (button.js line 128) uses spring physics (`stiffness=120, damping=22`) with `performance.now()` updates. The button object holds closures over scene context. While the array is nulled, the old instances are not explicitly cleaned up. On repeated enter/leave cycles:
- Old MagneticBtn instances are orphaned (no external reference after array nulled)
- Spring state objects become GC candidates
- No event listeners are attached per-button (Input is centralized on canvas)

**Assessment:** Low leak risk since no event listeners are per-button, but the pattern is fragile. A formal destroy/cleanup would be safer.

### Save System Growth

```
SaveSystem.save() → JSON.parse(JSON.stringify(G.state)) → localStorage.setItem
```

Full deep clone + JSON stringify on every save (30s auto-save interval). The `G.state` object includes:
- `world.events.history` — bounded at 20 entries via `pruneHistory()`
- `world.events.active` — bounded at 3 concurrent events
- `world.influence` — object per zone (4 zones × ~3 fields each)
- `world.landmarks` — grows monotonically with discoveries
- `world.echoes` — grows with narrative echo data
- `world.oneTime` — grows with one-time discoveries
- `world.notifications` — bounded at 20 entries

**Assessment:** Growth is bounded by design (pruneHistory, max active events). The 20-entry history cap and one-time record patterns from Phase 06 prevent unbounded save growth. However, `JSON.parse(JSON.stringify(...))` for full deep clone is expensive — consider whether selective cloning or a cheaper serialization strategy is warranted for mid-range mobile.

### Adaptive Reduce Motion (game.js)

The game loop (`gLoopFrame`, line 350, cyclomatic complexity 26) includes:
- Frame time clamping: `Math.min((time - G.lastTime) / 1000, 0.05)` — prevents spiral of death
- Error recovery watchdog: catches exceptions, logs, shows toast, continues loop
- `R.reducedMotion()` checks both `G.state.reduceMotion` AND `window.matchMedia('(prefers-reduced-motion: reduce)')` — proper dual-check

### Effects/Projectiles Lifecycle

`R.updateEffects(dt)`, `R.updateProjectiles(dt)`, `R.updateLevelUp(dt)`, `R.updateClickFx(dt)` are called globally every frame in `gLoopFrame`. These are scene-independent — they run even when the travel map is active. Effects are likely bounded by their own lifecycle (age-based removal).

---

## 2. Performance Risks (Ordered by Impact)

### HIGH: Grid Line Rendering (travelMap.js:404-420)
`renderMapTexture` draws ~30+ grid lines per frame with individual `beginPath/moveTo/lineTo/stroke` calls. This is the single most expensive per-frame operation.
- **Mitigation opportunity:** Pre-render grid to an offscreen canvas and `drawImage` with offset. Grid is uniform and only drifts slowly — update offscreen canvas every ~100ms or on pan, not every frame.

### HIGH: No Viewport Culling for Zone Rendering
All 4 zones are fully computed and drawn every frame regardless of visibility. With map panning, 1-3 zones may be offscreen.
- **Mitigation opportunity:** Skip `renderRegion()` for zones whose `getRegionRect()` doesn't intersect the viewport.

### MEDIUM: Per-Frame Object Allocations
15-20+ small object allocations per frame from `getMapViewport`, `getMapMetrics`, `getRegionRect`. On low-end mobile with limited GC budget, this adds micro-stutters.
- **Mitigation opportunity:** Cache metrics in `data` and update only on pan/resize. Use pre-allocated scratch objects.

### MEDIUM: Lock Reason Complexity (map_helpers.js:22)
`getLockReason` has cyclomatic complexity 25 — the most complex function in the scenes layer. Called per zone per frame during render.
- **Mitigation opportunity:** Cache lock reasons per zone; invalidate on state change rather than recomputing every frame.

### LOW: Button Lifecycle Fragility
MagneticBtn instances are orphaned (not destroyed) on scene leave. No per-button event listeners, so not a true leak, but the pattern is fragile.
- **Mitigation opportunity:** Add formal `.destroy()` to MagneticBtn or call cleanup in `resetState()`.

### LOW: Save Serialization Cost
`JSON.parse(JSON.stringify(G.state))` every 30s is a full deep clone. Acceptable for current state size but worth monitoring.
- **Mitigation opportunity:** Not urgent — growth is bounded. Flag for monitoring in Phase 12 verification.

---

## 3. Existing Performance Infrastructure

| Feature | Location | Purpose |
|---------|----------|---------|
| `?probe` FPS logging | game.js (URL param check) | Dev-time FPS monitoring |
| `R.reducedMotion()` | renderer.js:90 | Dual-check (state + matchMedia) |
| Adaptive frame clamping | game.js:351 | Prevents spiral of death |
| Error watchdog | game.js:328-347 | Recovers from render crashes |
| Input flood guards | input.js:18-28 | 70ms tap debounce, queue max 4 |
| Notify queue cap | game.js:5 | Max 3 toasts |
| Effect lifecycle | renderer.js | Age-based removal |
| Event history cap | world_events.js:pruneHistory | Max 20 entries |

---

## 4. Prior Art from Previous Phases

### Phase 06 (World-State Continuity)
- Established defensive world-state contract with null-prototype keyed maps
- Bounded one-time records with first-write-wins pattern
- Save migration pass normalizes nested world branch

### Phase 07 (Visual Region Map)
- Established MapHelpers as the authoritative zone query surface
- Touch pan with drag threshold (15px) to prevent accidental activation
- Scene-level data lifecycle (enter/resetState/buildButtons)

### Phase 08 (Landmark Discovery)
- Landmarks.getAll() returns enriched copies (callers cannot mutate canonical definitions)
- Landmark indicators positioned relative to region cells

### Phase 09 (Regional Influence)
- Influence changes route through one authoritative API
- Canonical gameplay hooks, never render-time mutation

### Phase 10 (Narrative Echoes)
- typeof-guard pattern for cross-system API calls (safe during stale sw cache)
- Echo indicators share rendering space with landmarks and events

### Phase 11 (Dynamic World Events)
- Event lifecycle: generate → active → tick/resolve → resolved with pruning
- Event indicators use performance.now() sine for pulse animation
- Resolve reuses Enter button as context action slot

---

## 5. Recommended Investigation Areas (Priority Order)

1. **Grid canvas caching** — Replace per-frame grid line drawing with offscreen canvas (HIGH impact, bounded scope)
2. **Viewport culling** — Skip offscreen zone rendering (HIGH impact, bounded scope)
3. **Metrics caching** — Eliminate per-frame object allocations in travelMap (MEDIUM impact)
4. **Lock reason caching** — Cache getLockReason results per zone (MEDIUM impact)
5. **Button cleanup** — Formal destroy pattern for MagneticBtn on scene leave (LOW impact, safety improvement)
6. **Reduced-motion audit** — Verify all animations check R.reducedMotion() (verification task)
7. **Save serialization** — Monitor and optionally optimize deep clone (LOW impact, monitoring only)
8. **Scene enter/leave cycle test** — Automated test for memory/listener retention across cycles (verification task)

---

## RESEARCH COMPLETE
