# Architecture

**Analysis Date:** 2026-10-15

## System Overview

Immediate-mode Canvas 2D game driven by a single global game state (`G`) and a scene manager (`G.scenes` + `G.currentScene`). Rendering is frame-based (rAF loop) and UI is drawn directly to the canvas.

```
[Entrypoint + boot] -> [Game loop + state] -> [Active Scene] -> [Render/UI + input handling]
                                     \-> [Systems] update/mutate `G.state`
                                     \-> [Fade/Navigation] manage scene transitions
                                     \-> [Data] declarative gameplay content used by systems/scenes
```

## Component Responsibilities

| Component | Responsibility | File |
|---|---|---|
| `G` | Global state container + boot/runtime flags | `src/engine/game.js` |
| `gInit` / rAF loop | Canvas sizing, input/audio init, per-frame update/render | `src/engine/game.js` |
| `gScene` | Transition helper (delegates to `Fade` + scene enter/leave) | `src/engine/game.js` and `src/engine/navigation.js` / `src/engine/lifecycle.js` (as applicable) |
| `Scene` | Scene factory + lifecycle hooks wrapper | `src/engine/scene.js` |
| `Fade` | Scene transition alpha tween + pending scene swap | `src/engine/game.js` |
| Scenes | Screen logic: `enter/update/render/leave`, input + UI composition | `src/scenes/*.js` (e.g. `src/scenes/ashram.js`) |
| Systems | Rule engines that compute/advance gameplay and mutate `G.state` | `src/systems/*.js` |
| UI primitives | Immediate-mode widgets drawn to canvas and updated from state | `src/ui/*.js` |
| Data definitions | Declarative tables used by systems (heroes, quests, encounters, etc.) | `src/data/*.js` |

## Pattern Overview

**Overall:** Scene-based immediate-mode canvas app.

**Key characteristics:**
- Canvas 2D immediate rendering per frame (no DOM UI for gameplay screens)
- Scene lifecycle contract: `enter(options)`, `update(dt)`, `render(ctx)`, `leave()`
- Global API surfaces scene/system interaction: `G`, `R`, `UI`, `Scene`, `Input`, `Audio`, `Notify`, `Fade`, `Combat`, `Progression`, `SaveSystem`
- Central transition: `Fade.toScene(name, enterOptions)` swaps scenes safely

## Layers

### Engine runtime (`src/engine/*`)
- Purpose: own loop, transitions, global surfaces, input/audio/render orchestration.
- Location: `src/engine/`
- Depends on: canvas element + scripts loaded in `index.html` order.
- Used by: scenes and systems.

### Scene layer (`src/scenes/*`)
- Purpose: compose UI and drive user interaction; call into navigation/systems.
- Location: `src/scenes/`
- Depends on: engine globals (`G`, `R`, `UI`, `Scene`, `Input`, `Fade`, `Notify`) and shared scene helpers.
- Used by: navigation/boot when changing `G.currentScene`.

### Systems layer (`src/systems/*`)
- Purpose: authoritative gameplay rules; mutates `G.state` (e.g. world progression, quests, combat state, persistence).
- Location: `src/systems/`
- Depends on: declarative data (`src/data/*`) and/or helper globals.
- Used by: scenes and sometimes other systems.

### UI layer (`src/ui/*`)
- Purpose: reusable immediate-mode widgets and drawing helpers used by scenes.
- Location: `src/ui/`
- Depends on: renderer globals (`R`) and canvas context.
- Used by: scenes.

### Data layer (`src/data/*`)
- Purpose: declarative content tables (maps, zones, quests, items, encounters, etc.).
- Location: `src/data/`
- Depends on: none; loaded for global consumption.
- Used by: systems and some scenes.

## Data Flow

### Primary request/update path (per frame)
1. rAF loop calls engine update (in `src/engine/game.js`) using `G.currentScene`.
2. Scene `update(dt)` handles `Input` state and may call system functions that mutate `G.state`.
3. Scene `render(ctx)` draws the current screen using `UI` components and renderer helpers (`R`).
4. Engine applies overlays: `Notify.render(ctx)` and optionally `Fade.render(ctx)`.

### State transitions
- Scenes navigate by calling `Scene.navigate(target, opts)` (or via navigation helpers).
- `Scene.navigate` uses `gScene(known, fade, enterOptions)`.
- `Fade.toScene(name, enterOptions)` sets `Fade.pendingScene` and animates alpha.
- When alpha reaches target, engine swaps:
  - `G.currentScene = G.scenes[name]`
  - `G.state.scene = name`
  - calls prior scene `leave()` then new scene `enter(options)`
  - clears interaction state via `Input.clear()` and `UI.Modal.clearAll()`.

### Persistence / hydration path
- `SaveSystem.save()` snapshots `G.state` into `localStorage`.
- `SaveSystem.hydrate(state)` creates defaults (`G.createDefaultState()`) then merges/hydrates persisted keys and runs `SaveSystem.migrate()`.

## Key Abstractions

### Scene objects (`Scene.create`)
- Purpose: standardize scene lifecycle and data holder (`scene.data`).
- Examples:
  - `src/engine/scene.js`
  - `src/scenes/ashram.js`

### Global state (`G.state`)
- Purpose: single source of truth for gameplay and UI-driving state.
- Primary definition: `createDefaultGameState()` in `src/engine/game.js`.

### Navigation registry (`Navigation`)
- Purpose: route IDs map to scene names plus context/command schemas.
- Files: `src/engine/navigation.js`, `src/engine/navigation_routes.js`.

### World/System APIs
- Purpose: rule engines like `QuestSystem`, `JourneySystem`, `Combat`.
- Examples:
  - `src/systems/quest.js` (`QuestSystem.init`, `getQuests`, `getAvailableQuests`)
  - `src/systems/journey.js` (`JourneySystem.getProgress`, `enter` access checks)
  - `src/systems/save.js` (`SaveSystem.save/hydrate/migrate`)

## Dependency Relationships (major modules)

- `src/main.js`
  - Depends on scenes being loaded (`titleScene`, `ashramScene`, etc.).
  - Registers scene objects into `G.scenes` via `registerScene`.
- `src/engine/game.js`
  - Owns `G` runtime surfaces; depends on renderer (`src/engine/renderer.js`), `Scene` (`src/engine/scene.js`), `Input` (`src/engine/input.js`), and `UI`/`Audio` globals.
  - Provides `Fade` scene switching used by scene navigation.
- `src/engine/navigation.js` + `src/engine/navigation_routes.js`
  - Depends on scene names/route contracts.
  - Used by scenes (or via legacy scene navigation) to enforce explicit context/command contracts.
- `src/scenes/*.js`
  - Depend on `Scene.create`, engine global APIs (`G`, `R`, `Input`, `UI`, `Fade`, `Notify`).
  - Call systems (`QuestSystem`, `Combat`, `SaveSystem`, etc.) to mutate `G.state`.
- `src/systems/*.js`
  - Depend on declarative tables from `src/data/*.js`.
  - Mutate `G.state`.
- `src/ui/*.js`
  - Depend on renderer helpers (`R`) for consistent drawing and on `UI` container module.
  - Export immediate-mode component builders used by scenes.
- `src/data/*.js`
  - Pure data globals consumed by systems.

## Architectural Constraints

- **Threading:** single-threaded JS; rAF loop drives updates/renders.
- **Global state:** module-level globals used intentionally (e.g. `G`, `R`, `UI`, `Scene`, `Input`, `Fade`, `Notify`).
- **Circular imports:** Not applicable via ES modules; scripts share globals and rely on `index.html` synchronous load order.
- **Script order dependency:** engine must load before scenes; data before systems/scenes depending on usage.

## Error Handling

- Boot guards exist in `src/main.js`:
  - missing required surfaces prevent boot via `failBoot()`.
  - scene registration uses `try/catch` per scene.
- Scene enter is wrapped so `enter()` exceptions don’t prevent boot.

## Cross-Cutting Concerns

- Logging: `console.error/warn` used during boot + scene enter failures.
- Validation: `main.js` validates required globals once before boot loop.
- Scene scoping: `Notify.clearScene()` supports dropping regular toasts on scene changes (keeps achievement banners separate).

---

*Architecture analysis: 2026-10-15*
