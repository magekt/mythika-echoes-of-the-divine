# Coding Conventions

**Analysis Date:** 2026-09-19

This document records the coding conventions of **Mythika: Echoes of the Divine** — a vanilla JavaScript (ES6+) browser game rendered on HTML5 Canvas, loaded through ordered `<script>` tags in `index.html`. There is no bundler, no build step, and no module system in the browser runtime. The authoritative convention reference is `STYLE_GUIDE.md` at the repo root; this document distills the enforced and observed patterns with file references.

## Naming Patterns

**Files:**
- snake_case for JavaScript source files, matching their primary global: `combatScene.js`, `world_state.js`, `cultivation_sys.js`, `alchemy_recipes.js`
- Test files: `tests/*.test.js` (e.g., `tests/world_state.test.js`)
- The singular exception is `src/main.js` (boot entry). All scene files end in `Scene` (`combatScene.js`, `travelMap.js` does not — it defines `travelMapScene`).

**Global singletons / namespaces:**
- PascalCase: `G`, `R`, `UI`, `Scene`, `Input`, `Audio`, `Notify`, `Fade`, `Combat`, `Progression`, `CultivationSystem`, `SaveSystem`, `JourneySystem`, `AlchemySystem`, `Economy`, `AchievementSystem`, `QuestSystem`, `DuelSystem`, `WorldState`, `Influence`, `WorldEvents`, `Landmarks`
- Scene objects: camelCase ending in `Scene` where practical: `travelMapScene` (`src/scenes/travelMap.js:7`), `combatScene` (`src/scenes/combatScene.js`)

**Functions:**
- camelCase, verb-led: `startBattle`, `buildContinueButton`, `applyFontScale`, `handleButtons`, `updateButtons`, `createDefault`, `normalize` (`src/systems/world_state.js`)

**Variables:**
- camelCase, `const` preferred, `let` only for reassignment (`STYLE_GUIDE.md`)
- Internal component state uses a leading underscore: `_hovered`, `_pressed`, `_pressTimer` (`src/ui/button.js:18`), `_cachedMetrics`, `_descCache` (`src/scenes/travelMap.js:29-37`)

**Types (data shapes):**
- Constants in `UPPER_SNAKE_CASE` — actual examples: `TAP_THRESHOLD`, `GRID_SIZE`, `GRID_PADDING`, `REGION_H` (`src/scenes/travelMap.js:2-5`), `CRIT_MULTIPLIER`, `SAVE_KEY` (`STYLE_GUIDE.md`)
- Boolean values: predicate-style names: `isPlayerTurn`, `battleOver`, `fleeAttempted`, `discovered`, `didDrag`
- Data keys and IDs: stable camelCase or lowercase identifiers: `characterCreate`, `aryavarta`, `pushOn`
- Object keys are unquoted camelCase in static data: zone id `aryavarta` with `reqLevel`, `minLvl`, `maxLvl`, `explorationMax` (`src/data/zones.js:1-16`)

## Code Style

**Formatting:**
- Two-space indentation, semicolons, single-quoted strings (`STYLE_GUIDE.md`; observed throughout `src/`)
- Opening braces on the same line as declarations/control statements
- Trailing commas only where the surrounding file already uses them
- One-line guards and simple assignments kept on one line:

```js
if (!buttons) return;
if (this.data.damageFlash > 0) this.data.damageFlash -= dt;
```

- Multiple closely-related declarations combined for readability:

```js
const bw = 200, bh = 38;
const stiffness = 120, damping = 22;
```

- Arrow functions for small callbacks and defaults; `function` for singleton methods so `this` binds to the owning object (`STYLE_GUIDE.md`)

**Linting:**
- **No linter or formatter is configured** (`CONTRIBUTING.md`). There is no `.eslintrc*`, `eslint.config.*`, `.prettierrc*`, or `biome.json` anywhere in the repo.
- The de-facto standard is `STYLE_GUIDE.md` at the repo root plus "match the style of the surrounding file" (`CONTRIBUTING.md:49`)
- Syntax validation only: `node --check path/to/changed-file.js` (`CONTRIBUTING.md:45-47`)

## Module Organization (replaces "Import Organization")

There are **no imports or exports** in the browser runtime. Dependency order is encoded in `index.html`'s 72 `<script>` tags, and `src/main.js` is the last script (boot). The load-order rules (`STYLE_GUIDE.md:81-88`):

1. Define a script-global before any script that reads it; order is: engine foundations → data → systems → UI → scenes → `src/main.js`
2. Add new scenes before `src/main.js`
3. Do **not** introduce `import`/`export` into traditional scripts unless deliberately migrating the loading architecture

**Dual browser-global / CommonJS export pattern** (used by testable modules): a file defines a global singleton, then conditionally exports it so Node `require()` works in tests while the browser still gets the global:

```js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WorldState };
}
```

Applied in `src/systems/world_state.js:229-230`, `src/systems/influence.js:140-141`, `src/systems/landmarks.js:94-95`, `src/systems/world_events.js:278-279`, `src/data/zones.js:163-164`, `src/data/landmarks.js:141-142`, `src/data/map_layout.js:106-107`, `src/data/world_events.js:118-119`, `src/data/influence_rules.js:75-76`

## Module Design

**Dominant pattern — singleton object + attached methods:**

```js
const SaveSystem = {
  SAVE_KEY: 'mythika_save',
  autoSaveInterval: 30000
};

SaveSystem.save = function() {
  // ...
};
```

(`STYLE_GUIDE.md:55-66`; live example `src/systems/world_state.js:1-3` where internal helpers are `_underscore`-prefixed functions on the same object: `WorldState._plainObject = function(value) {...}`)

**Scene pattern — factory object via `Scene.create()`:**

```js
const travelMapScene = Scene.create({
  name: 'travelMap',
  data: { buttons: [], selectedZone: null, scrollY: 0, ... },
  enter: function() { ... },
  leave: function() { ... },
  update: function(dt) { ... },
  render: function(ctx) { ... }
});
```

(`src/scenes/travelMap.js:7-45`). Lifecycle contract: `data` declares scene-local mutable state; `enter()` initializes state/audio/buttons; `update(dt)` advances time-based state (dt is elapsed time, not frame count); `render(ctx)` redraws the complete scene every frame (immediate-mode); `leave()` stops audio, clears controls and cancels async work.

**UI component pattern — factory functions under `UI` returning an object with `render`/`update`/`contains`/`onClick`:**

```js
UI.Button = function(x, y, w, h, text, color, hoverColor, textColor) {
  return {
    x, y, w, h, text,
    color: color || R.colors.btn,
    ...
    render: function(ctx) { ... },
    update: function(dt) { ... },
    contains: function(px, py) { ... },
    onClick: null
  };
};
```

(`src/ui/button.js:44-48`; convention documented in `STYLE_GUIDE.md:129-152`). Prefer composition over inheritance; specialized buttons build on base button behavior.

**Button outcome convention** (`src/ui/button.js:30-38`, `STYLE_GUIDE.md:146-151`):
- Handler returns `false` → action rejected → `R.stoneHit` feedback
- Handler returns anything else (including `undefined`) → valid action → `Audio.click()` + `R.validTick` feedback
- `UI.handleButtons()` consumes the tap and dispatches feedback

**Barrel files:** None. `index.html` script tags are the only composition mechanism. `tsconfig`/path aliases: none.

## Error Handling

**Patterns:**
- **Guarded optional-global references** — a bare reference to a missing script throws `ReferenceError` and aborts boot, so resilient code checks `typeof` first (`STYLE_GUIDE.md:96-104`):

```js
if (typeof ZoneRewardSystem !== 'undefined' && ZoneRewardSystem.normalize) {
  ZoneRewardSystem.normalize();
}
```

- **Guarded FX calls** — effects that must never kill input or the game loop are guarded:

```js
if (R.stoneHit) R.stoneHit(tap.x, tap.y);   // missing effect must not kill a tap that already fired
if (b.enabled === false) { if (R.stoneHit) R.stoneHit(...); return true; }
```

(`src/ui/button.js:25-38` — the comment documents that an undefined click-FX once froze the whole loop)

- **try/catch with user messaging** for persistence/async boundaries — save/load and cloud operations surface failures via `Notify.show(...)` rather than throwing (e.g., `Notify.show('Cloud load failed: ' + e.message, 3, R.colors.red)` in save/load paths of `src/systems/save.js`; `world_state.js` normalization deliberately returns safe defaults instead of throwing)
- **Defensive input validation** in public mutation APIs — `world_state.js` validates identifiers and bounds influence/control values before writing (`WorldState._safeKey`, `_unsafeKeys` guard against `__proto__`/`constructor` pollution; `_cloneData` bounds depth at 20 and drops non-finite numbers, `src/systems/world_state.js:3-53`)
- **Null-prototype objects** for persisted record maps to avoid prototype pollution: `WorldState._newObject = function() { return Object.create(null); }` (`src/systems/world_state.js:27-29`)

## Logging

**Framework:** None. No `console.log`-based logging system exists; the game surfaces runtime info through `Notify` toasts (`src/engine/game.js:1-38`) and debug beacons.

**Patterns:**
- User-facing messages: `Notify.show(msg, duration, color)` — queue caps at 3, with word-wrapping (`Notify.wrap`, `src/engine/game.js:14-38`)
- Achievement/event notification: `Notify.achievement(name, desc, icon)`
- Boot/diagnostics: a `'[Mythika] booted dpr='` console beacon emitted by `gInit()` is grepped by the headless verification harness (`tools/verify_matrix.py`)
- Runtime diagnostics via URL flags: `?probe` (FPS logging), `?probe&selftest` (input-chain self-test) — `README.md:116-120`

## Comments

**When to Comment:**
- Explain non-obvious behavior and invariants, especially why code exists: e.g., `src/ui/button.js:20-21` ("Per-button cooldown: a queued tap landing on a button that already fired within 120ms is absorbed..."), `src/ui/button.js:35-36` ("an undefined click-FX once froze the whole loop here")
- Document invariants at their enforcement point: `src/systems/world_state.js:9-11` ("Control is intentionally a small closed domain so later map presentation never needs to interpret arbitrary persisted labels.")
- Section divider comments `// --- Name ---` and `// ============` banner blocks are used in larger files: `src/ui/button.js:336-338`, `src/systems/encounter.js:11,22,36`
- Cross-file dependency hints: `// import dependency: map_layout.js is loaded before this scene by index.html.` (`src/scenes/travelMap.js:1`)

**JSDoc:**
- Light usage, not enforced — `/** ... */` doc blocks appear for key functions in `src/systems/encounter.js` (7 blocks), `src/systems/narrative_echoes.js` (3), `src/systems/world_events.js` (6), `src/data/encounters.js` (5). Not required; most functions are documented inline or not at all.

## Function Design

**Size:** No enforced limits. The largest files are `src/scenes/combatScene.js` (1123 lines) and `src/engine/renderer.js` (844 lines); new code matches surrounding granularity — scenes group logic into named methods (`resetState`, `buildButtons`, `checkLandmarkDiscoveries` in `src/scenes/travelMap.js:40-68`), systems split helpers onto the singleton object.

**Parameters:** Positional parameters predominate in UI factories: `UI.Button(x, y, w, h, text, color, hoverColor, textColor)`. Options objects are used for data-heavy or optional configuration (tests use `loadScene(overrides = {})`; engine primitives accept config objects).

**Return Values:**
- Button handlers: `false` = rejected, anything else = valid (see outcome convention above)
- Scene factory object methods return nothing; update/render mutate `data`
- Validation helpers return booleans or normalized values: `WorldState._safeKey(key)` → boolean; `_cloneData(value, depth)` → cloned value or `undefined` for uncloneable input
- Mutations that can fail return success indicators consumed by callers (e.g., economy/achievement guards)

## Global State & State Management

- Persistent/cross-scene state lives in `G.state` and is mutated directly — no reducer, no immutable state layer (`STYLE_GUIDE.md:91-94`)
- Temporary screen state lives in the scene's `data` object
- Shared behavior accessed through established globals: `R`, `UI`, `Input`, `Audio`, `Notify`, `Fade`, system singletons
- `G.state.reduceMotion` is the global reduce-motion flag; always check `R.reducedMotion()` before nonessential animation (`CONTRIBUTING.md:41`)

## Rendering & Visual Tokens (UI code only)

- Use renderer helpers (`R.rect`, `R.roundRect`, `R.text`, `R.textCenter`) instead of raw Canvas setup (`STYLE_GUIDE.md:154-156`)
- Semantic color tokens (`R.colors.*`: `surface`, `textPrimary`, `accent`, `success`, `warning`, `danger`, ...); no raw hex in new scene/component code (static data may keep color values — `src/data/zones.js:15` `bgColor: '#0a1a20'`)
- Radius scale `R.radius.xs=3, s=5, m=8, l=10`; fonts via `R.fonts.*` (never hard-coded Canvas font strings)
- Wrap temporary Canvas state in `ctx.save()` / `ctx.restore()`; draw in the logical `400 × 720` game space
- Timer ownership: store timeout handles in scene `data`, null after firing, clear on leave; verify scene still active in delayed callbacks (combatScene `runId` pattern, `STYLE_GUIDE.md:125-127`)

## Anti-Patterns (explicitly prohibited)

- Raw `import`/`export` in traditional scripts (load order breaks) — `STYLE_GUIDE.md:88`
- Raw hexadecimal colors in new UI code when a token exists — `STYLE_GUIDE.md:168`
- Unanchored centered-scale back-translate patterns (`translate(-bw/2` etc.) — forbidden by the pre-deploy gate `tools/check_ui_invariants.sh`; all spring scaling must go through `R.withCenteredScale`
- `var` in new code (legacy boot code may use it) — `STYLE_GUIDE.md:27`

---

*Convention analysis: 2026-09-19*
