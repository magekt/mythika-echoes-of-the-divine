---
status: resolved
trigger: "Equipment screen opens, but browser reports three loop errors and a fresh save has no default items to verify equip/unequip."
created: 2026-09-20
updated: 2026-09-20
---

# Debug Session: equipment-loop-default-items

## Symptoms

- Expected: Fresh save opens Equipment without loop errors and includes at least one valid starter item for equip/unequip verification.
- Actual: Equipment screen renders but three `[Mythika] loop error` entries appear; inventory has no default items.
- Errors: Exact loop error payload is collapsed in screenshot; Firebase localhost OAuth warning is informational.
- Timeline: Reproduced during Phase 1 verification after entering Equipment.
- Reproduction: Boot fresh save, open Equipment, inspect console and Inventory tab.

## Current Focus

- hypothesis: Equipment scene still throws during repeated update/build or button handling, and fresh-save initialization does not seed starter inventory/equipment data required by the UI contract.
- test: Inspect expanded loop errors, equipment update/render paths, fresh-save defaults, item definitions, and existing tests.
- expecting: Identify all three recurring errors and define a deterministic starter-item fixture/default that preserves save migration semantics.
- next_action: gather initial evidence

## Evidence

- timestamp: 2026-09-20
  observation: Equipment screen is visible with an empty Inventory tab; DevTools shows three loop errors at game.js:356.
  source: user screenshot/browser report
- timestamp: 2026-09-20
  observation: The loop watchdog logs the first three consecutive frame exceptions; the underlying Equipment failure was the stale eager `UI.HeroSurface.getModel` call in `buildUI`, already removed by the preceding equipment-get-model fix. `renderDetail` is the canonical and defensive lookup.
  source: `src/engine/game.js:344-363`, `src/scenes/equipment.js:52-60`, `src/ui/heroSurface.js:55-67`
- timestamp: 2026-09-20
  observation: New-character creation explicitly reset inventory to an empty array, while Equipment correctly filtered and rendered an intentional empty state. No default equipment existed for a fresh hero.
  source: `src/scenes/characterCreate.js:358-363`, `src/scenes/equipment.js:101-121`
- timestamp: 2026-09-20
  observation: Added one deterministic common Leather Armor starter item after the new-save inventory reset. Existing hydrated saves never pass through character creation and remain unchanged; equip/unequip uses the existing canonical EquipmentSystem route.
  source: `src/scenes/characterCreate.js`, `src/data/items.js:115-178`

## Eliminated

## Resolution

- root_cause: The three loop entries were watchdog reports for the Equipment scene exception caused by the redundant optional `UI.HeroSurface.getModel` call; independently, fresh character creation intentionally cleared inventory without adding equipment, leaving no valid gear path to exercise.
- fix: Kept the prior removal of the eager model lookup and added one deterministic, universally compatible common Leather Armor item only in the new-character creation path. Existing inventories and legacy saves are not overwritten; the existing empty-inventory shell remains the graceful zero-item behavior.
- files_changed: `src/scenes/characterCreate.js`, `tests/equipment_scene_regression.test.js`, `.planning/debug/equipment-loop-default-items.md`
- verification: Targeted regression, `node --check` for changed JS, and `git diff --check` passed. Full test sweep ran; unrelated existing failures remain in service-worker asset coherence and travel-map tests because their isolated harness lacks `Scene.responsive`. No equipment-targeted failures.
