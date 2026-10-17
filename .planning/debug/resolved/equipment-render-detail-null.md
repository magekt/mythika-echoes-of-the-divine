---
status: resolved
trigger: "Equipment still crashes every frame with TypeError: Cannot read properties of undefined (reading 'renderDetail') at equipment.js:58:54, despite the prior fix. User requests all screen render paths verified before manual testing and reports local JS load over 5000ms."
created: 2026-09-20
updated: 2026-09-20
---

# Debug Session: equipment-render-detail-null

## Symptoms

- Expected: Equipment renders without loop errors and manual screen verification can proceed.
- Actual: `equipment.js:58:54` reads `renderDetail` from undefined every frame; three loop errors are visible after boot/enter.
- Additional concern: more than 30 script tags produce over 5000ms local load time.
- Reproduction: Open `index.html?probe`, enter Equipment, inspect console.

## Current Focus

- hypothesis: the prior fix removed an eager model lookup but left an unguarded `UI.HeroSurface`/surface object call in the render path, or script registration order leaves the helper unavailable at runtime.
- test: Inspect exact equipment.js line 58, all screen render calls to shared UI surfaces, script load order, and scene lifecycle initialization; audit all screen paths for the same undefined-helper pattern.
- expecting: A concrete runtime-safe fix and a complete list of screens requiring the same guard/registration correction, plus a measured delivery optimization proposal.
- next_action: complete runtime boot verification; full interactive journey remains manual

## Evidence

- timestamp: 2026-09-20
  observation: `Object.render` in `equipment.js` throws `Cannot read properties of undefined (reading 'renderDetail')` repeatedly from `gLoopFrame`.
  source: user browser console report
- timestamp: 2026-09-20
  observation: User reports local JavaScript load exceeds 5000ms with more than 30 script tags.
  source: user browser report
- timestamp: 2026-09-20
  observation: `src/ui/button.js` declared a top-level lexical `const UI = {}` while `src/ui/heroSurface.js` registered `HeroSurface` on `globalThis.UI`; classic scripts therefore used different UI objects and `UI.HeroSurface` was undefined in Equipment and every other shared HeroSurface render path.
  source: source inspection of button.js, heroSurface.js, equipment.js, cultivationScene.js, combatScene.js, and party.js
- timestamp: 2026-09-20
  observation: `index.html` loads `heroSurface.js` before all scenes, so scene registration order was valid; the namespace split, not scene order, caused the crash.
  source: index.html load-order inspection
- timestamp: 2026-09-20
  observation: Fixed the namespace split by registering the shared UI object as `globalThis.UI` in button.js. Added a regression contract asserting that registration and preserving Equipment's canonical renderDetail call and empty-inventory state.
  source: source patch and tests/equipment_scene_regression.test.js
- timestamp: 2026-09-20
  observation: Targeted Equipment regression, all test files through the repository test loop except the pre-existing save coherence failure, node --check for changed runtime files, and git diff --check passed. The full loop fails because sw.js ASSETS omits src/ui/heroSurface.js.
  source: validation command output

- timestamp: 2026-09-20T20:31:34Z
  observation: Headless Chrome reproduced the reported local runtime failure on all profiles: six inline probe calls threw `Uncaught ReferenceError: __mythikaProbeGroup is not defined` before boot. This was caused by the helper being defined only inside an asynchronously evaluated module while classic scripts called it during parser execution.
  source: `tools/verify_matrix.py`, headless Chrome console capture

- timestamp: 2026-09-20T20:45:00Z
  observation: Added an early classic-script probe shim before the Firebase module and added `src/ui/heroSurface.js` to the service-worker precache. Runtime matrix now passes desktop, phone, and phone-land with no uncaught console errors; save coherence passes 4/4.
  source: `index.html`, `sw.js`, `python3 tools/verify_matrix.py --budget 6000`, `node --test tests/save_coherence.test.js`

## Eliminated

## Resolution

- root_cause: `UI` was a top-level lexical object in button.js but HeroSurface was attached to a separate globalThis.UI object, leaving `UI.HeroSurface` undefined at runtime.
- fix: Register button.js's shared UI object on globalThis so HeroSurface and all scenes share the same namespace; add an Equipment regression contract. Also exposed the probe helper before asynchronous module evaluation and precached heroSurface.js so runtime diagnostics and cached deployments use a coherent asset set.
- verification: `python3 tools/verify_matrix.py --budget 6000` passed all 3 profiles; `node --test tests/save_coherence.test.js` passed 4/4; changed runtime files pass `node --check`; `git diff --check` passed. Full suite baseline remains 61 passed / 19 failed, with the 19 failures concentrated in isolated Travel Map harnesses lacking `Scene.responsive`.
- files_changed: `index.html`, `sw.js`, `src/ui/button.js`, `src/scenes/equipment.js`, `src/scenes/characterCreate.js`, regression tests, and this debug artifact.
