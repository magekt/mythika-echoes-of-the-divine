# Coding Conventions

**Analysis Date:** 2026-10-15

## Naming Patterns

### Global singletons / namespaces
- `G` — global game state + canvas metrics, used across engine/systems/scenes.
- `R` — render/design tokens + drawing helpers (colors, fonts, radii, easings, primitives).
- `UI` — UI component factory namespace (`UI.Component`, `UI.Button`, etc.).
- `Scene` — scene factory/registry helpers.
- `Input` — pointer/tap input pipeline (`Input.peekTap()`, `Input.getTap()`).
- `Fade` — scene transition helper.
- `Notify` — toast/achievement notification manager (`src/engine/game.js`).
- Systems follow `const SomeSystem = { ... }` pattern under `src/systems/*.js`.

### Scene modules
- Each scene is a dedicated file in `src/scenes/` exporting via global scene registration (scene table in `src/main.js`).
- Scene files are named with mixed styles in repo (`title.js`, `travelMap.js`, `characterCreate.js`). Don’t rename casually; follow existing filenames.

### Systems
- Pattern: `const SystemName = {}` with methods on the object.
- Methods mutate `G.state.*` directly unless explicitly documented as battle/scene-scoped.
- Helpers use `_` prefix for private-ish functions (`WorldState._cloneData`, `Combat._bondInterceptPctFor`).

## File Organization Patterns

- Engine core: `src/engine/*.js`
  - `game.js` owns global loop + scene transitions + `G`/`Fade` orchestration.
  - `renderer.js` provides `R` drawing helpers/tokens.
- Static data: `src/data/*.js` (declarative gameplay constants).
- Systems: `src/systems/*.js` (authoritative gameplay rules, mutate `G.state`).
- Scenes: `src/scenes/*.js` (screen lifecycle + scene-local UI building).
- UI components: `src/ui/*.js` (immediate-mode Canvas UI factories under `globalThis.UI`).

## Scene Registration

- `src/main.js` builds a scene table and registers scenes during boot.
- Boot gate validates classic globals exist before proceeding (`G`, `R`, `UI`, `Scene`, `Input`, `Fade`, and `registerScene`).

## Game/UI Architecture

### Immediate-mode Canvas rendering
- Scenes and UI components render every frame.
- No DOM UI for core visuals; Canvas primitives only.

### UI component factories (core pattern)
- `UI.Component(x, y, w, h, opts)` returns a plain object with:
  - `x,y,w,h,visible,enabled,data,onClick`
  - lifecycle: `render(ctx)`, `update(dt)`, `contains(px,py)`
  - delegation hooks: `_renderHook`, `_updateHook`, `_containsHook`
  - `contains` defaults to AABB; variants override via `UI.mixinContains`.
- Examples:
  - Base factory: `src/ui/component.js`
  - Panel: `src/ui/panel.js` (uses `_updateHook` + `_renderHook`)
  - Modal: `src/ui/modal.js` (global modal with `UI.Modal.active` + queue)

### Button handling convention
- Buttons are arrays of components.
- `src/ui/button.js` handles taps:
  - `Input.peekTap()` → find `b.contains(tap.x, tap.y - scrollY)`
  - Press state uses `_pressed` + `_pressTimer`
  - Per-button debounce using `b._lastFire` (120ms)
  - Click contract: `onClick(data)`; if it returns `false`, treat as rejected and call `R.stoneHit`.

## Design Tokens Usage (`R.*`)

- Colors/fonts/radii come from `R` tokens; avoid raw hex/string literals inside UI rendering.
- Token entry points used in repo:
  - `R.colors.*` (e.g. `R.colors.panel`, `R.colors.hairline`, `R.colors.gold`, `R.colors.overlay`)
  - `R.fonts.*` (e.g. `R.fonts.md`, `R.fonts.lg`, `R.fonts.sm`)
  - `R.radius.*` (e.g. `R.radius.m`, `R.radius.l`)
- UI visuals typically compose via renderer helpers:
  - `R.doubleBezel`, `R.textCenter`, easing helpers like `R.easePremium`, and spring helpers.

## Error Handling Patterns

- Prefer guarded calls around optional systems/effects:
  - `if (typeof FooSystem !== 'undefined' && FooSystem.method) FooSystem.method(...)`
  - `try/catch` used to prevent crash in degraded mode (combat systems explicitly degrade when `BondSystem` missing).
- Save + state normalization:
  - `SaveSystem.save()` wraps in `try/catch` and returns `false` on failure (`src/systems/save.js`).

## Save/Load Patterns

- Save key + auto-save config in `src/systems/save.js`:
  - `SaveSystem.SAVE_KEY = 'mythika_save'`
- Save capture:
  - Deep clone of `G.state` via `JSON.parse(JSON.stringify(G.state))`.
  - Diagnostics removed before persist (`delete snap.diagnostics`).
  - Persist shape includes `{ state, version, timestamp }`.
- Hydration:
  - `SaveSystem.hydrate(state)` validates input then:
    - creates `nextState` using `G.createDefaultState()`
    - assigns saved keys into `G.state` after clearing current keys
    - calls `SaveSystem.migrate()` for backward compatibility.
- State normalization for safety:
  - `WorldState` uses key allowlists + safe-cloning to avoid unsafe persisted keys (`src/systems/world_state.js`).

---

*Convention analysis: 2026-10-15*
