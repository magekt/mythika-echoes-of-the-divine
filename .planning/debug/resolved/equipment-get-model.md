---
status: resolved
trigger: "Clicking Equipment crashes with TypeError: Cannot read properties of undefined (reading 'getModel') at equipment.js:58 during Phase 1 verification."
created: 2026-09-20
updated: 2026-09-20
---

# Debug Session: equipment-get-model

## Symptoms

- Expected: Equipment screen opens after clicking Equipment and supports equip/unequip verification.
- Actual: Scene enter fails with `TypeError: Cannot read properties of undefined (reading 'getModel')` at `equipment.js:58`.
- Errors: Firebase `127.0.0.1` OAuth authorized-domain warning is informational; game crash is the equipment `getModel` error.
- Timeline: Reproduced during current Phase 1 browser verification after fresh save load.
- Reproduction: Open the game, click Equipment.

## Current Focus

- hypothesis: Equipment scene reads a stale or missing hero/item model because the current canonical hero surface changed the expected data shape or selected-hero initialization.
- test: Inspect equipment scene line 58, callers, data model contracts, recent Phase 15 changes, and equipment tests.
- expecting: Identify the undefined owner and restore a defensive, canonical model lookup without masking invalid equipment state.
- next_action: gather initial evidence

## Evidence

- timestamp: 2026-09-20
  observation: `safeEnter` reports equipment scene failure at `equipment.js:58:40`, reading `getModel` from undefined.
  source: user browser console report
- timestamp: 2026-09-20
  observation: `UI.HeroSurface` is initialized by `src/ui/heroSurface.js`, while Equipment's line 58 eagerly called `UI.HeroSurface.getModel`; the returned model was unused because `renderDetail` performs the canonical lookup itself.
  source: `src/scenes/equipment.js:52-60`, `src/ui/heroSurface.js:16-59`
- timestamp: 2026-09-20
  observation: The canonical equip and unequip paths already operate on `G.state.player` and delegate to `EquipmentSystem.equip` / `EquipmentSystem.unequip`.
  source: `src/scenes/equipment.js:26-32,234-260`, `src/data/items.js:115-178`
- timestamp: 2026-09-20
  observation: Removed the redundant eager selector call and added regression assertions for Equipment's canonical render/equip/unequip routes.
  source: `src/scenes/equipment.js`, `tests/equipment_scene_regression.test.js`

## Eliminated

## Resolution

- root_cause: Equipment buildUI made a redundant direct call to `UI.HeroSurface.getModel`; in the failing browser load, that optional surface reference was undefined even though the actual detail renderer owns the canonical model lookup.
- fix: Removed the unused eager `getModel` call; Equipment now relies on `UI.HeroSurface.renderDetail`, which safely resolves the hero model, while preserving canonical equip/unequip delegation.
- files_changed: `src/scenes/equipment.js`, `tests/equipment_scene_regression.test.js`, `.planning/debug/equipment-get-model.md`
- verification: `node tests/equipment_scene_regression.test.js`; `node --check src/scenes/equipment.js`; `node --check tests/equipment_scene_regression.test.js`; `git diff --check` — all passed.
