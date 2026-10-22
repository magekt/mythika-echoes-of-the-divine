---
status: resolved
trigger: "Travel Map enter/back clicks crash with TypeError: gScene.push is not a function and gScene.pop is not a function; add a lazy loader animation after each click."
created: 2026-09-20
updated: 2026-09-20
---

# Debug Session: travel-map-scene-stack

## Symptoms

- Expected: Clicking Travel enters the next scene; Back returns to the previous scene. Click transitions should show a lightweight lazy-loader animation.
- Actual: Travel Map click handlers throw `TypeError: gScene.push is not a function` and `TypeError: gScene.pop is not a function`; the game becomes stuck in the scene.
- Errors: Firebase localhost OAuth authorized-domain warning; primary blocking errors originate at `travelMap.js` enter/back handlers.
- Timeline: Reproduced during Phase 1 browser verification after fresh save load.
- Reproduction: Open the game, navigate to Travel Map, click Travel/Enter and Back.

## Current Focus

- hypothesis: Phase 13 navigation changes made `gScene` a single scene object or factory result while Travel Map still treats it as a stack; enter/back must use the canonical scene transition API.
- test: Inspect scene manager, Travel Map handlers, and recent navigation changes; reproduce with syntax/tests and browser flow.
- expecting: Identify the authoritative transition mechanism and restore enter/back behavior without introducing parallel scene state.
- next_action: gather initial evidence

## Evidence

- timestamp: 2026-09-20
  observation: Travel Map `enterBtn.onClick` calls `gScene.push`; `backBtn.onClick` calls `gScene.pop`; both fail because those methods are unavailable.
  source: user browser console report
- timestamp: 2026-09-20
  observation: `src/engine/game.js` defines `gScene(name, fade, enterOptions)` as a function and `src/engine/scene-helpers.js` exposes `Scene.navigate(target, opts)` as the canonical wrapper. `Fade.toScene()` already provides the lightweight transition/loading veil.
  source: source inspection
- timestamp: 2026-09-20
  observation: Travel Map now routes Back to Ashram and Enter Zone to Zone Exploration through `Scene.navigate` with `fade: true`; lifecycle regression tests cover both handlers.
  source: `tests/travel_map_lifecycle.test.js`
- timestamp: 2026-09-20
  observation: Targeted lifecycle tests pass; `node --check` passes for changed JavaScript and `git diff --check` reports no whitespace errors.
  source: verification commands

## Eliminated

## Resolution

- root_cause: Phase 13 replaced the scene stack with the function-based `gScene` transition API, but Travel Map retained obsolete object-style `push`/`pop` calls.
- fix: Replaced both calls with canonical `Scene.navigate` transitions; the existing Fade layer supplies the lightweight click/navigation loader effect, so no separate click-handler loader was added.
- verification: `node --test tests/travel_map_lifecycle.test.js`; `node --check src/scenes/travelMap.js`; `node --check tests/travel_map_lifecycle.test.js`; `git diff --check`.
- files_changed: `src/scenes/travelMap.js`, `tests/travel_map_lifecycle.test.js`, `.planning/debug/travel-map-scene-stack.md`
