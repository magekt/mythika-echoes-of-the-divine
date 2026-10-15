# Codebase Structure

**Analysis Date:** 2026-10-15

## Directory Layout

```
/ (repo root)
├── index.html                       # Synchronous <script> boot + load overlay
├── styles/                          # CSS for canvas page + loading overlay
├── src/
│   ├── main.js                      # Boot IIFE; validates globals; registers scenes; starts flow
│   ├── engine/
│   │   ├── game.js                  # Defines global `G`, rAF loop, `Notify`, `Fade`
│   │   ├── renderer.js              # Defines `R` (colors/fonts/drawing helpers)
│   │   ├── viewport.js              # DPR/logical viewport math; canvas sizing helpers
│   │   ├── input.js                 # `Input` event capture -> queues taps/touches/scroll deltas
│   │   ├── navigation.js           # Route registry + transition helpers
│   │   ├── navigation_routes.js   # Route contracts: scene mapping + context/command schemas
│   │   ├── scene.js                # `Scene.create` lifecycle wrapper + `registerScene`
│   │   ├── scene-helpers.js        # Shared scene helpers: scroll + static draw recording
│   │   ├── lifecycle.js            # Lifecycle wrappers (enter/leave guards) [not read here]
│   │   ├── backgrounds.js          # Background slot registry
│   │   ├── audio.js                 # Audio helper facade (ambient/sfx)
│   │   ├── diagnostics.js          # Debug/diagnostics plumbing
│   │   ├── navigation_routes.js   # (see above) route schema registry
│   │   └── firebase-config*.js   # Firebase config template (template only)
│   ├── scenes/
│   │   ├── *.js                   # Screen implementations via `Scene.create`
│   │   ├── ashram.js              # Example: menu + autoboot actions + SaveSystem autosave
│   │   ├── travelMap.js          # Example: map exploration + pan/drag + discovery state
│   │   ├── map_helpers.js        # Map helpers used by travel scenes
│   │   └── (many more scenes)
│   ├── systems/
│   │   ├── *.js                   # Rule engines mutate `G.state` (quests, combat, save, etc.)
│   │   ├── save.js                # localStorage snapshot/hydration + migrations
│   │   ├── world_state.js         # safe state helpers + object normalization
│   │   ├── quest.js               # quest chains progress/availability
│   │   ├── journey.js             # journeys access/progress
│   │   └── (many more systems)
│   ├── ui/
│   │   ├── *.js                   # Immediate-mode UI components (buttons/panels/modals/text)
│   │   └── (component modules used by scenes)
│   └── data/
│       ├── *.js                   # Declarative gameplay content (heroes, zones, quests, items)
│       └── (tables consumed by systems)
└── tools/                           # Verification/QA helpers
```

## Directory Purposes

- `src/engine/`
  - Purpose: runtime surfaces (global state + canvas loop + input/render orchestration).
  - Key files: `src/engine/game.js`, `src/engine/renderer.js`, `src/engine/scene.js`.

- `src/scenes/`
  - Purpose: screen logic and interaction; owns per-screen UI composition and calls systems.
  - Key files: `src/scenes/ashram.js`, `src/scenes/travelMap.js`.

- `src/systems/`
  - Purpose: authoritative gameplay rules; mutates `G.state` and performs persistence.
  - Key files: `src/systems/save.js`, `src/systems/world_state.js`.

- `src/ui/`
  - Purpose: reusable immediate-mode canvas widgets built on renderer helpers.
  - Example files: `src/ui/button.js`, `src/ui/modal.js`, `src/ui/progressBar.js`.

- `src/data/`
  - Purpose: pure declarative tables used to drive gameplay (no mutation).
  - Example files: `src/data/quests.js`, `src/data/zones.js`, `src/data/heroes.js`.

## Key File Locations

### Entry points
- `index.html`
  - Purpose: synchronous dependency-ordered script boot; shows load progress overlay.
- `src/main.js`
  - Purpose: boot-time validation + scene registration + resilient start.

### Core engine
- `src/engine/game.js`
  - Purpose: defines `G` runtime and owns rAF update/render + `Fade` transition completion.
- `src/engine/scene.js`
  - Purpose: `Scene.create` standardizes lifecycle and returns scene objects into `G.scenes`.

### Scene pattern
- `src/scenes/*.js`
  - Purpose: define screens using `Scene.create({ name, data, enter, leave, update, render })`.
  - Example: `src/scenes/ashram.js` uses `enter()` to register backgrounds and start autosave.

### Rule engines
- `src/systems/*.js`
  - Purpose: compute progress and apply results to `G.state`.
  - Example: `src/systems/save.js` snapshots `G.state` and hydrates via `SaveSystem.hydrate()`.

### Declarative data
- `src/data/*.js`
  - Purpose: global tables like `QUESTS`, `JOURNEYS`, `ZONE_*`, consumed by systems.

## Script Loading Order (index.html)

`index.html` loads classic `<script>` tags in parse order and relies on global variables, so order is a runtime contract.

At a high level, load groups are:
1. **engine** (defines `G`, `R`, scene helpers, input/render loop foundations)
2. **data** (declarative gameplay constants/tables)
3. **systems** (rule engines that consume data)
4. **ui** (immediate-mode widgets)
5. **scenes** (screen implementations depending on engine/systems/ui)
6. **boot** (`src/main.js` boot IIFE that validates required globals + registers scenes)

Notable load-order detail:
- Scenes can reference globals safely only because `index.html` ensures engine/data/systems/ui are loaded before scenes.

## Naming Conventions

- Scenes: `src/scenes/<name>.js` exports a global scene object created via `Scene.create(...)`.
- Systems: `src/systems/<name>.js` defines `const <SystemName> = { ... }`.
- UI components: `src/ui/<name>.js` define immediate-mode helpers used by scenes.

## Where to Add New Code

- New screen / flow:
  - Implement in: `src/scenes/<newScene>.js`
  - Add registration routing via: `src/main.js` + route mapping in `src/engine/navigation_routes.js` (if using route contracts)
  - If scrollable: follow scroll conventions in `src/engine/scene-helpers.js`.

- New gameplay rule system:
  - Implement in: `src/systems/<newSystem>.js`
  - Reference it from scenes, mutate `G.state`.
  - Add/extend declarative inputs under: `src/data/`.

- New UI widget:
  - Implement in: `src/ui/<newWidget>.js`
  - Use renderer tokens from `src/engine/renderer.js` (the `R` global).

- New declarative content:
  - Add under: `src/data/<newTable>.js`.

## Unusual / Noteworthy Placement

- `Fade` transition lives in `src/engine/game.js` and performs the scene swap + calls prior/new `leave/enter`.
- Navigation has both:
  - `src/engine/navigation.js` (runtime registry)
  - `src/engine/navigation_routes.js` (route contract schemas)
  - Scenes may still work via legacy navigation mapping.

---

*Structure analysis: 2026-10-15*
