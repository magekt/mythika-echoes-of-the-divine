<!-- refreshed: 2026-10-08 -->
# Architecture

**Analysis Date:** 2026-10-08

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                        index.html                            │
│  (synchronous script load order → global namespace)          │
├──────────────────┬──────────────────┬───────────────────────┤
│  Firebase SDK    │  Engine Core     │  Game Data (src/data/)│
│  (ES Module)     │  (src/engine/)   │  20 declarative files │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Systems Layer (src/systems/)                                │
│  Authoritative rules, mutate G.state, no rendering           │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (src/ui/)                                          │
│  Immediate-mode components (button, panel, list, modal...)  │
├─────────────────────────────────────────────────────────────┤
│  Scenes Layer (src/scenes/)                                  │
│  26 screens implementing enter/update/render/leave           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Persistence                                                 │
│  localStorage (primary) → Firestore (optional cloud sync)    │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `G` | Global game object: canvas, ctx, state, scenes, systems, loop timing | `src/engine/game.js:212-226` |
| `R` | Renderer helpers: shapes, text, effects, projectiles, click FX | `src/engine/renderer.js` |
| `Scene` | Base scene contract (enter/update/render/leave) | `src/engine/scene.js` |
| `gScene` / `Fade` | Scene transitions with fade veil | `src/engine/game.js:120-170, 475-489` |
| `Input` | Touch/click/keyboard normalization, tap queue | `src/engine/input.js` |
| `Audio` | Web Audio API wrapper, sound pooling | `src/engine/audio.js` |
| `Notify` | Toast queue + achievement banners | `src/engine/game.js:1-118` |
| `SaveSystem` | LocalStorage + Firestore sync, migration, import/export | `src/systems/save.js` |
| `Auth` | Firebase Auth wrapper, cloud save bridge | `src/engine/auth.js` |
| `Combat` | Turn-based combat logic, damage calc, status effects | `src/systems/combat.js` |
| `Progression` | XP, realm advancement, rebirth (punarjanma) | `src/systems/progression.js` |
| `WorldState` | World map, landmarks, influence, narrative echoes | `src/systems/world_state.js` |

## Pattern Overview

**Overall:** Immediate-mode Canvas 2D game with global namespace architecture

**Key Characteristics:**
- **No modules/imports for game code** — all scripts load synchronously via classic `<script>` tags in `index.html` (lines 112-199), populating global namespace
- **Single global game object `G`** — holds canvas, context, state, scene registry, frame timing
- **Declarative data** — `src/data/*.js` are pure data objects (enemies, zones, items, quests...)
- **Authoritative systems** — `src/systems/*.js` own game rules, mutate `G.state` directly
- **Scenes as screens** — each scene implements `enter`, `update(dt)`, `render(ctx)`, `leave`
- **Immediate-mode UI** — `src/ui/*.js` return `{ render, update, click, contains }` objects, no retained tree
- **Deterministic boot** — `main.js` IIFE runs synchronously after scripts load, validates globals, registers scenes, starts loop

## Layers

**Entry Point (`index.html`):**
- Purpose: Synchronous script orchestration, Firebase SDK bootstrap, canvas mount
- Location: `index.html` (root)
- Contains: Module script for Firebase, then 85+ classic script tags in dependency order
- Depends on: Firebase CDN, all local scripts
- Used by: Browser

**Engine Core (`src/engine/`):**
- Purpose: Runtime infrastructure — loop, rendering, input, audio, scenes, transitions
- Location: `src/engine/`
- Contains: `game.js` (loop, G, Fade, Notify), `renderer.js`, `input.js`, `audio.js`, `scene.js`, `scene-helpers.js`, `auth.js`, `firebase-config.js`
- Depends on: Browser APIs (Canvas, Web Audio, localStorage, Service Worker)
- Used by: All systems, scenes, UI

**Data Layer (`src/data/`):**
- Purpose: Declarative gameplay content (read-only at runtime)
- Location: `src/data/`
- Contains: 20 files — `heroes.js`, `enemies.js`, `zones.js`, `items.js`, `quests.js`, `classes.js`, `perks.js`, `auras.js`, `spirit_beasts.js`, `cultivation.js`, `alchemy_recipes.js`, `journeys.js`, `landmarks.js`, `map_layout.js`, `encounters.js`, `narrative_echoes.js`, `world_events.js`, `influence_rules.js`, `achievements.js`, `quests.js`
- Depends on: Nothing (pure data)
- Used by: Systems, scenes for content lookup

**Systems Layer (`src/systems/`):**
- Purpose: Authoritative game rules, state mutation, persistence
- Location: `src/systems/`
- Contains: 18 files — `combat.js`, `progression.js`, `save.js`, `world_state.js`, `quest.js`, `encounter.js`, `journey.js`, `farm.js`, `alchemy.js`, `cultivation_sys.js`, `influence.js`, `landmarks.js`, `zone_rewards.js`, `economy.js`, `duel.js`, `achievements.js`, `hints.js`, `narrative_echoes.js`, `world_events.js`
- Depends on: `G`, `R`, `Scene` (for data access), `src/data/*`
- Used by: Scenes, `SaveSystem`, game loop (tick functions)

**UI Layer (`src/ui/`):**
- Purpose: Reusable immediate-mode components
- Location: `src/ui/`
- Contains: `button.js`, `panel.js`, `progressBar.js`, `text.js`, `list.js`, `tabbar.js`, `modal.js`, `card.js`, `heroSurface.js`
- Pattern: Factory returns `{ render(ctx, data), update(dt, data), click(x,y,data), contains(x,y,data) }`
- Uses: `R.colors`, `R.fonts`, `R.radius`, `R.reducedMotion()`
- Depends on: `R`, `G` (for DPR, viewport)
- Used by: Scenes

**Scenes Layer (`src/scenes/`):**
- Purpose: Screens — each owns a full-screen interaction
- Location: `src/scenes/`
- Contains: 26 files — `title.js`, `characterCreate.js`, `ashram.js`, `travelMap.js`, `zoneExploration.js`, `combatScene.js`, `party.js`, `cultivationScene.js`, `alchemyScene.js`, `punarjanma.js`, `spiritBeast.js`, `questLog.js`, `forge.js`, `tournament.js`, `trials.js`, `bazaar.js`, `farm.js`, `fishing.js`, `settings.js`, `achievementsScene.js`, `equipment.js`, `welcome.js`, `debug.js`, `journeyScene.js`, `encounterScene.js`, `authScene.js`
- Contract: `enter(opts?)`, `update(dt)`, `render(ctx)`, `leave()`
- Depends on: `G`, `R`, `UI`, `Input`, `Audio`, `Fade`, `Notify`, Systems, Data
- Used by: `gScene()` transition, `main.js` registration

## Data Flow

### Primary Request Path (Game Loop)

1. **rAF tick** → `gLoop(time)` (`game.js:344`) schedules next frame, wraps in try/catch watchdog
2. **Frame delta** → `gLoopFrame(time)` (`game.js:366`) computes `G.dt` (clamped 50ms)
3. **Global updates** → `Notify.update`, `R.updateEffects`, `R.updateProjectiles`, `R.updateClickFx`, `FarmSystem.tick`, `WorldEvents.tick`
4. **Scene update** → `G.currentScene.update(G.dt)` (`game.js:388`)
5. **Clear + transform** → `ctx.clearRect`, `ctx.translate(shakeX, shakeY)`
6. **Background** → `drawBackground()` (zone-aware gradient)
7. **Scene render** → `G.currentScene.render(G.ctx)` (`game.js:393`)
8. **Overlay layers** → Projectiles, effects, click FX, level-up, enlightenment aura, Fade veil, Notify toasts
9. **Probe/perf** → FPS logging, adaptive reduce-motion check
10. **Loop** → back to step 1

### Scene Transition

1. Call `gScene('sceneName', fade?, enterOptions?)` (`game.js:475`)
2. If `fade !== false` and current scene exists: `Fade.toScene()` sets target alpha=1, speed=6.7
3. `Fade.update(dt)` drives alpha → 1 over ~150ms
4. At alpha=1: `currentScene.leave()`, swap `G.currentScene`, `G.state.scene = name`, `safeEnter(newScene)`
5. `Fade.target = 0`, speed=4 → reveal over ~250ms
6. If `fade === false`: immediate swap, no veil

### Save / Load

**Save:** `SaveSystem.save()` → JSON.stringify `G.state` → `localStorage.setItem('mythika_save')` → optional `Auth.saveToCloud()`
**Load:** `SaveSystem.load()` → parse localStorage → `hydrate()` merges into fresh default state → `migrate()` heals legacy fields → `FarmSystem.tick(elapsed)`, `WorldEvents.tick(elapsed)` → offline cultivation/prana gain

### Cloud Sync

1. User signs in → `Auth.init()` → `onAuthStateChanged` → `Auth.loadAfterAuth()`
2. `Auth.loadFromCloud()` → `getDoc(game_saves/{uid})` → `Object.assign(G.state, cloudData)` → `SaveSystem.migrate()`
3. Auto-save (`SaveSystem.startAutoSave`) → `Auth.saveToCloud(G.state)` → `setDoc(game_saves/{uid})`

**State Management:**
- Single source of truth: `G.state` (plain object, created by `createDefaultGameState()`)
- All mutations direct: `G.state.gold += 100`, `G.state.party.push(hero)`
- Systems mutate during `update(dt)` or event handlers
- Scenes read `G.state` in `render` and `update`
- No Redux, no Context, no signals — plain object + disciplined ownership

## Key Abstractions

**Scene:**
- Purpose: Screen lifecycle contract
- Examples: `titleScene`, `combatScene`, `travelMapScene` (in `src/scenes/`)
- Pattern: Object with `enter`, `update`, `render`, `leave`; registered via `registerScene(name, sceneObj)` in `scene-helpers.js`

**UI Component Factory:**
- Purpose: Reusable immediate-mode widget
- Examples: `UI.Button`, `UI.Panel`, `UI.List`, `UI.Modal` (in `src/ui/`)
- Pattern: `function createButton(cfg) { return { render, update, click, contains } }`

**System:**
- Purpose: Domain logic namespace
- Examples: `Combat`, `Progression`, `SaveSystem`, `WorldState`
- Pattern: Object with pure functions + `tick(dt)` for loop-driven work; mutates `G.state`

**Render Helper (`R`):**
- Purpose: Drawing primitives + effects
- Examples: `R.roundRect`, `R.textCenter`, `R.zoneBgColor`, `R.updateEffects`, `R.renderProjectiles`
- Pattern: Static methods on `R` object (defined in `renderer.js`)

## Entry Points

**`index.html` (line 1):**
- Location: Repository root
- Triggers: Browser navigation
- Responsibilities: Load Firebase SDK (module), inject config, load 85 scripts in order, mount canvas, start boot probe

**`src/main.js` (IIFE):**
- Location: `src/main.js:1`
- Triggers: Script execution (last script before boot probe)
- Responsibilities: Validate globals, register 26 scenes resiliently, start `bootGame()` immediately + `window.load` fallback, init Auth if Firebase ready, call `gInit()`

**`gInit()` (`game.js:244`):**
- Location: `src/engine/game.js:244`
- Triggers: `bootGame()` in `main.js:109`
- Responsibilities: Canvas setup (DPR scaling), `fitGame()`, init Input/Audio/SceneManager, start `gLoop()`

## Architectural Constraints

- **Threading:** Single-threaded event loop (main thread only). No Web Workers. All work in `requestAnimationFrame` callback.
- **Global state:** `G` (game.js:212), `R` (renderer.js), `UI` (ui/*.js), `Scene` (scene.js), `Input` (input.js), `Audio` (audio.js), `Notify` (game.js:1), `Fade` (game.js:120), `Combat` (combat.js), `Progression` (progression.js), `SaveSystem` (save.js), `Auth` (auth.js), `WorldState` (world_state.js), `FarmSystem` (farm.js), `WorldEvents` (world_events.js), `ZoneRewardSystem` (zone_rewards.js), `EquipmentSystem` (equipment.js scene), `Hints` (hints.js) — all classic script globals.
- **Circular imports:** Not applicable (no ES modules for game code). Script load order in `index.html` enforces dependency DAG.
- **Script order is a runtime contract:** Engine → Data → Systems → UI → Scenes → Main. Changing order breaks globals.
- **No `defer`/`async`/`type="module"` on game scripts** — synchronous execution required for global registration.
- **DPR-aware canvas:** Logical 400×720, backing store scaled by `devicePixelRatio` (capped at 3). All game code uses logical coordinates.
- **Reduced motion:** `R.reducedMotion()` reads `G.state.reduceMotion` (user setting + auto-detected). All animations respect it.

## Anti-Patterns

### Direct DOM Manipulation in Scenes

**What happens:** Scenes occasionally create/remove DOM elements (e.g., auth input overlays in `authScene.js`)
**Why it's wrong:** Breaks immediate-mode paradigm; DOM elements persist across scene transitions unless explicitly cleaned in `leave()`
**Do this instead:** Use `UI.Modal` or `UI.Panel` for overlays; if native input required, create in `enter`, destroy in `leave` (see `authScene.js` cleanup)

### Mutating Data Layer Objects

**What happens:** Code pushes to arrays in `src/data/*.js` (e.g., `G.state.quests.push(data.quests[0])`)
**Why it's wrong:** Data files are shared singletons; mutation leaks across saves/sessions
**Do this instead:** Always copy: `const quest = { ...data.quests[0], id: generateId() }` — see `QuestSystem.acceptQuest` (`quest.js`)

### Skipping `SafeEnter` Guard

**What happens:** Direct `scene.enter()` call without try/catch
**Why it's wrong:** A throwing `enter()` leaves scene half-built — no buttons, dead screen
**Do this instead:** Always use `gScene()` (which calls `safeEnter`) or call `safeEnter(scene)` directly (`game.js:464`)

## Error Handling

**Strategy:** Watchdog + graceful degradation

**Patterns:**
- **Game loop watchdog** (`game.js:349-363`): `requestAnimationFrame` scheduled first, then frame in try/catch. Errors logged, toast shown (first 2 + every 25th), loop continues.
- **Scene enter guard** (`safeEnter`, `game.js:464`): Try/catch around `scene.enter()`, toast on failure, scene stays active.
- **Scene registration resilience** (`main.js:64-71`): `try/catch` per scene; missing/broken scene logs warning, boot continues.
- **Save/Load resilience** (`save.js:8-23, 87-122`): Try/catch with `console.warn`, return boolean success, never throw.
- **Firebase optional** (`auth.js:9-14`): `init` guards all methods; if not initialized, return `{ error: 'Auth not initialized' }`.

## Cross-Cutting Concerns

**Logging:** `console.log`/`warn`/`error` with `[Mythika]` prefix. Probe mode adds timing logs.

**Validation:** `SaveSystem.migrate()` (save.js:39-85) heals save data on every load — type checks, array filters, numeric clamping, default restoration.

**Authentication:** Firebase Auth via `Auth` singleton. Gate cloud operations behind `if (Auth.user && window.firebaseAuth && window.firebaseDb)`. Offline play fully functional.

---

*Architecture analysis: 2026-10-08*