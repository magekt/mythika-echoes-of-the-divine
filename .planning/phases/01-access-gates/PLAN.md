# Phase 01 — Save Hydration & Equipment Authority (Complete)

## Goal
Enforce progression and access rules authoritatively at system/scene entry points: save hydration from defaults with migration, canonical equipment handling via shared `EquipmentSystem`, authoritative `ZoneAccess`, and aligned Travel Map / Ashram UI.

## Tasks
- [x] Implement `SaveSystem.hydrate()` in `src/systems/save.js`.
- [x] Implement shared `EquipmentSystem` in `src/data/items.js`.
- [x] Remove legacy gear-cache stat double-counting in `src/systems/combat.js`.
- [x] Align `party.js` and `equipment.js` to shared `EquipmentSystem`.
- [x] Implement `ZoneAccess` in `src/data/zones.js`.
- [x] Align Travel Map locked-state UX and action callbacks in `src/scenes/travelMap.js`.
- [x] Guard direct `zoneExploration` entry in `src/scenes/zoneExploration.js`.
- [x] Update Ashram badges/actions to reflect `ZoneAccess` in `src/scenes/ashram.js`.
- [x] Update `codemap.md` and source codemaps.
- [x] Browser UAT: hydration, incompatible-equip rejection, stale-save cleanup, locked-zone guards.
- [x] Commit Phase 01 changes.

## Plan
See `.slim/deepwork/access-gates-combat-ui.md` for implementation plan and decision context.

## Evidence
Browser UAT is tracked in `.planning/phases/01-access-gates/1-UAT.md`. UAT completed 2026-09-14 with 4/4 tests passing.

## Status
**COMPLETE** (2026-09-14) — implementation committed (`f0f150d`) and browser UAT 4/4 passed (see 1-UAT.md, status: complete). Closed with the v1.0 milestone (git `d339303`). *Status corrected 2026-10-11; previously recorded here as "UAT pending user response" — the UAT record shows all tests passed.*

## Notes
- Combat UI overlap fix (Phase 04) deferred to avoid merge conflicts with Phase 01.
- External oracle/council review unavailable; relying on internal + user manual review.
- Travel Map fixes (`src/scenes/travelMap.js`) shipped in commit `f0f150d` with mobile hierarchy improvements.

---
*Last updated: 2026-10-11 (status correction)*