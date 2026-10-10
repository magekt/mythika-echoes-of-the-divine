# Phase 12 Patterns: Living Map Performance & Stability

**Phase:** 12 — Living Map Performance & Stability
**Date:** 2026-09-18

---

## 1. Scene Lifecycle (Cleanup Analog)

**Pattern:** Scenes use `enter()` → `leave()` lifecycle via Scene.create factory.

| Method | What it does | Cleanup gap |
|--------|-------------|-------------|
| `enter()` | resetState() → buildButtons() → checkLandmarkDiscoveries() | Creates 3 MagneticBtn per enter |
| `leave()` | resetState() → nulls buttons array | Does NOT call .destroy() on MagneticBtn |
| `resetState()` | Nulls all data fields including buttons=[] | Buttons orphaned, not destroyed |

**Analog:** `cultivationScene.js` and `encounterScene.js` follow the same enter/leave pattern. None of them destroy buttons explicitly either — this is a codebase-wide convention, not a travelMap-specific bug.

**Recommendation:** Add `UI.destroyButtons(this.data.buttons)` helper in scene-helpers.js; call in resetState() before nulling the array. MagneticBtn should gain a `.destroy()` method that nulls closures.

---

## 2. Animation (Existing Patterns + Reduced-Motion Gaps)

**Existing animation sources in travelMap:**
- `renderMapTexture` (line 406): `performance.now() / 7000` grid drift — respects `reduced` check
- `renderEventIndicators` (line 524): `Math.sin(performance.now() / 400 + i) * 1.5` pulse — respects `reduced` check
- `renderLandmarkIndicators`: No animation (static positioning)
- `renderEchoIndicators`: No animation (static labels)

**Reduced-motion check pattern (consistent across travelMap):**
```js
const reduced = R.reducedMotion ? R.reducedMotion() : false;
// Then: if (reduced) { /* static fallback */ } else { /* animated */ }
```

**Reduced-motion gaps identified:**
- MagneticBtn spring physics (button.js) does NOT check reducedMotion — buttons always animate with spring even in reduced-motion mode
- Fade transitions (game.js) do NOT check reducedMotion — scene transitions always fade

**Analog:** Phase 08 (landmarks) and Phase 10 (echoes) added indicator rendering following the same pattern as events. No prior phase added reduce-motion checks to UI components.

---

## 3. Timer/Lifecycle (Cleanup Patterns)

**Timer sources in travelMap:**
- No explicit setTimeout/setInterval in travelMap.js
- All animation is frame-driven via render/update

**Engine-level timers:**
- `SaveSystem._timer` — 30s auto-save interval (set once in gInit, never cleared)
- `Hints._timer` — 3s hint display (set in enter, should be cleared in leave — check)
- `Notify.queue` — age-based removal in update
- `R.effects[]` — age-based removal in R.updateEffects
- `R.projectiles[]` — age-based removal in R.updateProjectiles

**Cleanup pattern:** Hints.show sets a setTimeout. On scene leave, the timer fires but Hints.hide is likely a no-op if the scene has changed. This is safe (no leak) but wasteful.

**Analog:** Cultivation scene and encounter scene have similar timer patterns. None explicitly clear timers on leave.

---

## 4. Save/State (Growth Patterns)

**Serialization chain:**
```
SaveSystem.save() → JSON.parse(JSON.stringify(G.state)) → localStorage.setItem
```

**Bounded growth (safe):**
- `world.events.active` — max 3 (enforced by generate)
- `world.events.history` — max 20 (enforced by pruneHistory)
- `world.notifications` — max 20 (enforced by push pattern)
- `world.oneTime` — first-write-wins, finite set of discoverable items

**Monotonic growth (monitor):**
- `world.landmarks` — discovered landmarks grow with play (bounded by total landmark count in LANDMARKS data)
- `world.echoes` — narrative echo records grow with play (bounded by total echo definitions)
- `world.transitions` — region transitions grow with play

**Analog:** Phase 06 established the canonical world-state shape with explicit bounds. Phase 11 added pruneHistory for event history. The pattern is: bound any array that grows per-occurrence; use first-write-wins for one-time records.

---

## 5. Memory/Allocation (Hot-Path Patterns)

**Per-frame allocations in travelMap render:**
- `getMapViewport()` → `{x,y,w,h}` — 1-2x/frame
- `getMapMetrics()` → `{viewport,padding,scale}` — 2-3x/frame  
- `getRegionRect(entry)` → `{x,y,w,h}` — 4-8x/frame (per zone × connections)
- Array allocations from `MapHelpers.getWorldEvents()` and `getNarrativeEchoes()` — per zone

**Renderer hot paths:**
- `R.roundRect()` — creates path per call, used for every cell, panel, button
- `R.textCenter()` / `R.text()` — sets font/fillStyle per call
- `ctx.save()`/`ctx.restore()` — used in renderMap for clip

**Analog:** The combat scene (`combatScene.js`) has similar per-frame rendering patterns. The cultivation scene uses `Scene.drawStatic` (pre-built draw commands) to avoid per-frame computation — this is the closest optimization analog.

---

## 6. UI Components (Creation/Destruction)

**MagneticBtn lifecycle:**
```js
const btn = UI.MagneticBtn(x, y, w, h, text, opts);
// btn = { x, y, w, h, text, visible, enabled, data, scrollY, 
//         onClick, update(dt), render(ctx), contains(x,y), _pressed, ... }
```

- Spring physics: stiffness=120, damping=22, always active during update
- Per-button cooldown: 120ms fire debounce
- No `.destroy()` method exists
- No per-button event listeners (all input is canvas-global)

**Modal lifecycle:**
```js
UI.Modal.show(content);  // Sets active modal
UI.Modal.clearAll();     // Called in Fade.toScene during transitions
```

**Notify lifecycle:**
```js
Notify.show(msg, duration, color);  // Adds to queue (max 3)
Notify.achievement(name, desc);     // Adds to achievements queue
```

**Analog:** All scenes create buttons in build*() and null the array in leave/resetState. The convention is consistent — no scene destroys buttons.

---

## 7. Testing (Verification Patterns)

**Existing test structure:**
- 48 tests across 7 files, all using Node.js built-in test runner
- vm sandbox pattern for scene testing (world_events.test.js, travel_map_events.test.js)
- Mock pattern: MapHelpers mock with instance-method stubs returning `[]`
- No performance-specific tests exist currently

**Test gap:** No tests verify:
- Scene enter/leave cycles don't accumulate state
- Reduced-motion mode actually disables animations
- Save serialization doesn't grow unbounded

**Analog:** Phase 11's 11-03 gap-closure plan fixed a test mock that drifted behind production API changes. This pattern suggests test mocks need periodic alignment with production API surface.

---

## 8. Closest Analog Map

| Phase 12 Task | Closest Analog | File | Pattern |
|---------------|---------------|------|---------|
| Grid canvas caching | Map render optimization | scene-helpers.js:drawStatic | Pre-computed rendering |
| Viewport culling | Clip rect in renderMap | travelMap.js:393-396 | Already clips output, extend to skip computation |
| Metrics caching | Scene data lifecycle | travelMap.js:data | Store computed values in data, invalidate on pan |
| Button cleanup | Modal.clearAll() | button.js + game.js:137 | Explicit cleanup on scene transition |
| Reduced-motion audit | R.reducedMotion() pattern | renderer.js:90 | Dual-check (state + matchMedia) |
| Save monitoring | pruneHistory bounds | world_events.js | Bounded arrays with explicit caps |
| Enter/leave cycle test | world_events.test.js mock pattern | tests/ | vm sandbox scene testing |

---

## PATTERNS COMPLETE
