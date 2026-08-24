# Mythika Architecture & Performance Audit

**Project:** Mythika: Echoes of the Divine  
**Date:** 2026-08-23  
**Status:** In Progress - Phase 1: Architecture Audit

---

## 1. Current Architecture Overview

### 1.1 Technology Stack
- **Runtime:** Vanilla JavaScript (ES6+) running in browser
- **Rendering:** HTML5 Canvas 2D API (400x720 logical, DPR-scaled)
- **Architecture Pattern:** Scene-based state machine with global `G` object
- **Module System:** IIFE modules loaded via `<script>` tags in index.html (no bundler)
- **Persistence:** localStorage (JSON) with auto-save every 30s
- **Audio:** Web Audio API (procedural synthesis, no audio files)
- **PWA:** Service Worker for offline support

### 1.2 Directory Structure
```
Mythika/
├── index.html                 # Entry point, script loading order
├── manifest.json              # PWA manifest
├── sw.js                      # Service worker
├── styles/game.css            # Minimal CSS for container scaling
├── src/
│   ├── main.js                # Boot sequence, scene registration
│   ├── engine/
│   │   ├── game.js            # Core game loop, global state (G), Fade, Notify
│   │   ├── scene.js           # Scene factory + registration
│   │   ├── scene-helpers.js   # Shared scene utilities (scroll, clip, draw)
│   │   ├── renderer.js        # All rendering primitives (R namespace)
│   │   ├── input.js           # Touch/mouse/keyboard input handling
│   │   └── audio.js           # Web Audio API wrapper (procedural)
│   ├── data/                  # Static game data (14 files)
│   ├── systems/               # Game logic systems (10 files)
│   ├── scenes/                # 30 scene implementations
│   └── ui/                    # Reusable UI components (7 files)
```

### 1.3 Global State (`G` object in game.js)
- **Canvas/Rendering:** `W`, `H`, `canvas`, `ctx`, `dpr`, `frameCount`, `dt`, `lastTime`
- **Game State:** `state` (player, party, inventory, currencies, cultivation, realm, etc.)
- **Scene Management:** `currentScene`, `scenes` (registry), `systems`
- **UI:** `ui` (empty object, unused)
- **Performance:** `_probe`, `_fpsT`, `_fpsN`, `_perfT`, `_perfN`, `_lowStreak`, `_errStreak`

---

## 2. Rendering Loop Analysis

### 2.1 Main Loop (`gLoop` / `gLoopFrame` in game.js:311-409)

**Current Flow:**
```javascript
requestAnimationFrame(gLoop)  // Schedule next frame FIRST (watchdog pattern)
try {
  gLoopFrame(time)            // Isolated frame execution
} catch (err) {
  // Error recovery: log, toast, continue loop
}
```

**Frame Operations (gLoopFrame):**
1. `dt` calculation (clamped to 50ms max)
2. `Notify.update(dt)` - toast/achievement animations
3. `R.updateEffects(dt)` - damage numbers, death bursts, screen shake
4. `R.updateProjectiles(dt)` - projectile movement
5. `R.updateLevelUp(dt)` - level-up particles
6. `R.updateClickFx(dt)` - click feedback effects
7. Enlightenment timer/buff decay
8. `Fade.update(dt)` - scene transition fade
9. Modal button updates
10. **Scene update:** `G.currentScene.update(dt)`
11. `ctx.clearRect(0, 0, G.W, G.H)` - full clear
12. `ctx.save()` + `ctx.translate(R.shakeX, R.shakeY)` - screen shake
13. `drawBackground()` - gradient background
14. **Scene render:** `G.currentScene.render(ctx)`
15. `ctx.restore()`
16. `R.renderProjectiles(ctx)`
17. `R.renderEffects(ctx)` - damage numbers, death bursts
18. `R.renderClickFx(ctx)` - click feedback
19. `R.renderLevelUp(ctx)` - level-up particles
20. `R.renderEnlightenmentAura(ctx, dt)` - full-screen glow
21. Enlightenment timer chip
22. `Fade.render(ctx)` - scene transition overlay
23. `Notify.render(ctx)` - toasts/achievements
24. First-frame splash removal
25. FPS probe logging (if `?probe`)
26. **Adaptive Reduce Motion** - auto-enable after 2 consecutive sub-30fps windows

### 2.2 Rendering Performance Concerns

| Issue | Location | Severity | Impact |
|-------|----------|----------|--------|
| **Full canvas clear every frame** | game.js:354 | Medium | Necessary for canvas, but could use dirty rects for static backgrounds |
| **No render culling for off-screen objects** | renderer.js:297-481 | High | `R.renderEffects`, `R.renderClickFx`, `R.renderProjectiles` iterate all objects without viewport culling |
| **Noise overlay redrawn every frame** | renderer.js:74-80 | Low | `R.renderNoise` draws full 400x720 image every frame |
| **Zone backgrounds use per-frame gradients** | game.js:411-425 | Medium | `drawBackground` creates new gradient every frame |
| **Particle systems unbounded** | renderer.js:246-328 | Medium | `damageNumbers`, `deathBursts`, `levelUpParticles`, `clickFx` arrays can grow |
| **No object pooling** | Multiple | High | Frequent GC pressure from particle/object allocation |

### 2.3 Scene Rendering Patterns

**Common Anti-patterns in Scenes:**
- Scenes rebuild button arrays in `enter()` but don't clean up properly in `leave()`
- `HeroMoment` created lazily in `render()` (ashram.js:378, cultivationScene.js:139)
- `PremiumShell` created fresh every render frame (cultivationScene.js:160, ashram.js:397)
- `FluidNav` created lazily in `render()` (ashram.js:443)
- No `leave()` cleanup for `_heroMoment`, `_fluidNav`, `_shell` references

---

## 3. Game State Management Analysis

### 3.1 State Structure (`G.state` in game.js:170-196)

**Current State Shape:**
```javascript
state: {
  scene: 'title',
  player: null,           // Active hero object
  party: [],              // Array of hero objects
  inventory: [],          // Array of item objects
  gold: 0,
  karma: 0,
  divineFragments: 0,
  prana: 0,
  cultivationBase: 0,
  realm: 'manushya',
  realmStage: 1,
  rebirthCount: 0,
  ashramLevel: 1,
  perks: {},              // { perkId: level }
  auras: [],              // Owned aura IDs
  equippedAuras: [],      // Equipped aura IDs (max 3-6)
  spiritBeasts: [],       // Owned beasts
  activeBeast: null,      // Equipped beast ID
  farmPlots: [],          // Farm plot objects
  fishCaught: 0,
  alchemyRecipes: [],     // Unlocked recipe IDs
  zoneProgress: {},       // { zoneId: percentage }
  tournamentWins: 0,
  totalPlayTime: 0,
  flags: {}               // Misc boolean flags
}
```

### 3.2 State Mutation Patterns

**Direct Mutations (Scattered):**
- Scenes directly mutate `G.state.*` (e.g., `G.state.gold += 100`)
- Systems mutate `G.state` (e.g., `CultivationSystem.addCultivationBase()`)
- No centralized state management (no Redux-like pattern)
- No immutable updates - direct property assignment

**State Synchronization Issues:**
- `SaveSystem.save()` does `JSON.parse(JSON.stringify(G.state))` - expensive deep clone
- `SaveSystem.load()` does `Object.assign(G.state, data.state)` - shallow merge, can leave stale references
- No state validation on load beyond `migrate()`
- Offline progress calculation in `SaveSystem.load()` mixes domain logic with persistence

### 3.3 Memory Leak Risks in State

| Risk | Location | Description |
|------|----------|-------------|
| **Unbounded arrays** | `G.state.inventory`, `G.state.party`, `G.state.farmPlots` | No max size enforcement |
| **Circular references** | Hero objects reference each other via party | `JSON.stringify` handles but expensive |
| **Stale scene references** | Scenes store `this._heroMoment`, `this._fluidNav` | Never nulled in `leave()` |
| **Event listener leaks** | `window.addEventListener('resize', fitGame)` | Never removed |
| **Interval leaks** | `SaveSystem._timer`, `Audio._musicInterval` | `stopAutoSave`/`stopMusic` exist but not always called |

---

## 4. System Architecture Analysis

### 4.1 System Coupling

**High Coupling (Circular Dependencies):**
```
Combat.js → Progression.js (perkValue)
Combat.js → AURAS (global, not imported)
Progression.js → AURAS (global)
CultivationSystem.js → Progression.js (getCultivationPerSecond)
JourneySystem.js → QuestSystem (global)
```

**Global Namespace Pollution:**
- `R` (renderer), `G` (game), `UI`, `Scene`, `Combat`, `Progression`, `SaveSystem`, `Economy`, `CultivationSystem`, `JourneySystem`, `QuestSystem`, `AchievementSystem`, `Audio`, `Notify`, `Fade`, `Input`, `ZONES`, `REALMS`, `HEROES`, `ENEMIES`, `ITEMS`, `PERKS`, `AURAS`, `CLASSES`, `SPIRIT_BEASTS`, `JOURNEYS`, `QUESTS`, `ALCHEMY_RECIPES`, `HERB_GROWTH`, `ENEMY_ABILITIES` - all globals

### 4.2 System Responsibilities

| System | Responsibility | Lines | Coupling |
|--------|---------------|-------|----------|
| `combat.js` | Turn-based combat, damage calc, AI | 462 | High (Progression, AURAS, Audio, R) |
| `progression.js` | XP, leveling, challenge scaling | 145 | Medium (AURAS, JourneySystem) |
| `cultivation_sys.js` | Realm progression, breakthrough | 103 | Low (data/cultivation.js) |
| `save.js` | Persistence, migration, offline calc | 180 | High (G.state, CultivationSystem) |
| `journey.js` | Journey progression, choices | ~200 | Medium (QuestSystem, Notify) |
| `alchemy.js` | Crafting, recipes | ~150 | Low |
| `economy.js` | Gold/karma/DF transactions | ~100 | Low |
| `achievements.js` | Achievement tracking | ~150 | Medium (Notify, Progression) |
| `quest.js` | Quest state machine | ~200 | Medium |
| `duel.js` | PvP-style combat | ~150 | Medium (Combat) |

---

## 5. Memory Leak Risk Assessment

### 5.1 Critical Risks (Must Fix)

| # | Risk | Location | Evidence | Fix Priority |
|---|------|----------|----------|--------------|
| 1 | **Particle arrays unbounded** | renderer.js:246, 269, 579, 335 | `damageNumbers`, `deathBursts`, `levelUpParticles`, `clickFx` push without max check in all paths | P0 |
| 2 | **Scene object retention** | ashram.js:378, cultivationScene.js:139 | `_heroMoment`, `_fluidNav`, `_shell` created in render, never cleaned | P0 |
| 3 | **Audio context never released** | audio.js:38 | `Audio._ctx` created once, never closed | P1 |
| 4 | **Interval timers not cleaned** | save.js:155, audio.js:203 | `SaveSystem._timer`, `Audio._musicInterval` | P1 |
| 5 | **Event listeners never removed** | game.js:456 | `resize`, `orientationchange` listeners | P1 |
| 6 | **Service worker registration** | main.js:4 | `navigator.serviceWorker.register` - no unregister | P2 |

### 5.2 Moderate Risks

| # | Risk | Location | Evidence |
|---|------|----------|----------|
| 7 | **Deep clone on every save** | save.js:10 | `JSON.parse(JSON.stringify(G.state))` every 30s |
| 8 | **Gradient creation per frame** | game.js:419 | `drawBackground` creates new gradient each frame |
| 9 | **Noise canvas never released** | renderer.js:62-72 | `R.noiseCanvas` persists for session |
| 10 | **Click FX array growth** | renderer.js:335-353 | `R.CLICKFX_MAX = 16` but shift only when >= max |

### 5.3 Low Risks

| # | Risk | Location |
|---|------|----------|
| 11 | **Font strings recreated on scale** | renderer.js:48-58 | `applyFontScale` rebuilds all font strings |
| 12 | **Zone background redraw** | renderer.js:663-748 | `drawZoneBackground` called every frame in zone scenes |

---

## 6. Optimization Vectors

### 6.1 Rendering Optimizations

| Optimization | Effort | Impact | Description |
|--------------|--------|--------|-------------|
| **Object pooling for particles** | Medium | High | Pre-allocate `damageNumbers`, `deathBursts`, `clickFx`, `levelUpParticles` arrays |
| **Dirty rectangle rendering** | High | Medium | Only clear/redraw changed regions (complex for canvas) |
| **Viewport culling for effects** | Low | High | Skip rendering particles/projectiles outside viewport |
| **Cache gradients/patterns** | Low | Medium | Create background gradients once, reuse |
| **Batch draw calls** | Medium | Medium | Group similar draw operations (text, rects) |
| **Reduce noise overlay frequency** | Low | Low | Render noise every N frames or use CSS filter |

### 6.2 State Management Optimizations

| Optimization | Effort | Impact | Description |
|--------------|--------|--------|-------------|
| **Centralized state store** | High | High | Single source of truth, enable devtools, time-travel debug |
| **Selective serialization** | Medium | High | Only serialize changed fields, not entire `G.state` |
| **State validation schema** | Medium | Medium | Validate loaded state against schema |
| **Immutable updates** | High | Medium | Use structured clone or Immer for predictable updates |

### 6.3 Architecture Optimizations

| Optimization | Effort | Impact | Description |
|--------------|--------|--------|-------------|
| **Module system (ESM)** | High | High | Replace script tags with ES modules, enable tree-shaking |
| **Scene lifecycle hooks** | Low | High | Standardize `enter`/`leave` with cleanup guarantees |
| **Dependency injection** | Medium | Medium | Pass dependencies instead of globals |
| **Scene registry with lazy loading** | Medium | Medium | Load scene scripts on demand |

### 6.4 Performance Monitoring

| Addition | Effort | Impact |
|----------|--------|--------|
| **Frame time histogram** | Low | High | Track p50/p95/p99 frame times |
| **Memory usage tracking** | Low | Medium | `performance.memory` (Chrome) |
| **GC pressure monitoring** | Medium | Medium | Track allocation rates |
| **Scene transition timing** | Low | Medium | Measure `Fade` transition duration |

---

## 7. Verification Plan (Evidence Path)

### 7.1 Claims to Verify

| Claim | Evidence Path | Status |
|-------|---------------|--------|
| "Particle arrays are bounded" | Check `R.CLICKFX_MAX` enforcement in all push paths | ⬜ |
| "Scene cleanup runs on leave" | Verify `leave()` nulls `_heroMoment`, `_fluidNav` | ⬜ |
| "Auto-save interval cleans up" | Verify `SaveSystem.stopAutoSave()` called on scene leave | ⬜ |
| "Audio context can be suspended" | Test `Audio._ctx.suspend()` on page hide | ⬜ |
| "FPS drops below 30 trigger reduce motion" | Simulate load, verify `G.state.reduceMotion` set | ⬜ |
| "Offline progress calculates correctly" | Mock `localStorage` with old timestamp, verify gains | ⬜ |
| "Save migration handles corrupt data" | Test with malformed localStorage entries | ⬜ |

### 7.2 Test Scenarios

1. **Stress Test:** Rapid scene transitions (100x) - check memory growth
2. **Long Session:** 30 min gameplay - check particle array bounds
3. **Offline Simulation:** Save with old timestamp, load - verify calculations
4. **Reduce Motion:** Force `prefers-reduced-motion` - verify animations disabled
5. **Low Memory:** Simulate memory pressure - verify no crashes

---

## 8. Phased Implementation Plan

### Phase 1: Critical Memory Leak Fixes (Week 1)
- [ ] Bound all particle arrays with circular buffers
- [ ] Implement `Scene.leave()` cleanup for all scenes
- [ ] Add `Audio.cleanup()` and call on page unload
- [ ] Remove event listeners on cleanup
- [ ] Clear intervals on scene leave

### Phase 2: Rendering Performance (Week 2)
- [ ] Implement object pooling for particles
- [ ] Add viewport culling for effects/projectiles
- [ ] Cache background gradients
- [ ] Optimize noise overlay rendering

### Phase 3: State Management (Week 3)
- [ ] Create centralized state store with selectors
- [ ] Implement selective serialization
- [ ] Add state validation schema
- [ ] Migrate systems to use store

### Phase 4: Architecture Modernization (Week 4)
- [ ] Convert to ES modules
- [ ] Implement dependency injection
- [ ] Add lazy scene loading
- [ ] Create module boundary tests

### Phase 5: Verification & Monitoring (Week 5)
- [ ] Implement frame time histogram
- [ ] Add memory tracking
- [ ] Run stress tests
- [ ] Document performance baselines

---

## 9. File Inventory for Modularization

### 9.1 Core Engine (Extract to `src/core/`)
- `game.js` → `core/GameLoop.ts`, `core/GlobalState.ts`, `core/SceneManager.ts`
- `scene.js` → `core/Scene.ts`
- `scene-helpers.js` → `core/SceneHelpers.ts`
- `renderer.js` → `core/Renderer.ts`, `core/RenderPrimitives.ts`, `core/Effects.ts`
- `input.js` → `core/InputManager.ts`
- `audio.js` → `core/AudioManager.ts`

### 9.2 Systems (Extract to `src/systems/`)
- Each system → own module with explicit dependencies
- `combat/` → `CombatEngine.ts`, `DamageCalculator.ts`, `EnemyAI.ts`
- `progression/` → `Progression.ts`, `ChallengeScaler.ts`
- `cultivation/` → `CultivationSystem.ts`, `RealmData.ts`
- `save/` → `SaveManager.ts`, `SaveMigrator.ts`, `OfflineProgress.ts`
- `journey/` → `JourneyManager.ts`, `JourneyData.ts`
- `alchemy/` → `AlchemySystem.ts`, `RecipeBook.ts`
- `economy/` → `Economy.ts`
- `achievements/` → `AchievementTracker.ts`
- `quest/` → `QuestManager.ts`

### 9.3 Scenes (Extract to `src/scenes/`)
- Base `Scene` class with lifecycle hooks
- Each scene → own file with `enter`/`leave`/`update`/`render`
- Shared UI components → `src/ui/components/`

### 9.4 Data (Extract to `src/data/`)
- JSON files for all static data (realms, zones, heroes, enemies, items, etc.)
- TypeScript interfaces for type safety

---

## 10. Next Steps

1. **Complete codemap initialization** - Run codemap.mjs to map all files
2. **Run verification planning** - Define evidence paths for each claim
3. **Begin Phase 1 implementation** - Fix critical memory leaks
4. **Set up performance monitoring** - Add frame time histogram
5. **Create test harness** - Automated stress testing

---

## Appendix: Key Metrics Baseline

| Metric | Current | Target |
|--------|---------|--------|
| Avg Frame Time | ~16ms (60fps) | <16ms (60fps) sustained |
| P99 Frame Time | Unknown | <33ms (30fps) |
| Memory (30min) | Unknown | <50MB |
| GC Pauses | Unknown | <5ms |
| Save Serialization | ~5ms | <1ms |
| Scene Transition | ~400ms | <200ms |
| Particle Count | Unbounded | <100 active |