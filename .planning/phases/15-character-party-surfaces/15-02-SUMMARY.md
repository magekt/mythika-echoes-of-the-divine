---
phase: 15-character-party-surfaces
plan: 02
subsystem: character-surfaces
tags: [canvas, vanilla-javascript, hero-surface, party, equipment, cultivation, combat, regression-tests]

requires:
  - phase: 15-character-party-surfaces
    plan: 01
    provides: Shared read-only HeroSurface model and compact/detail/result render variants
provides:
  - Shared HeroSurface consumption across party, equipment, cultivation, combat roster, and result contexts
  - Cross-screen authority and legacy-state regression contracts
affects: [15-03, party, equipment, cultivation, combat]

tech-stack:
  added: []
  patterns: [global Canvas surface variants, dependency-free source contracts, read-only legacy fixtures]

key-files:
  created: [tests/character_party_integration.test.js]
  modified: [src/scenes/equipment.js]

decisions:
  - Preserve existing scene/system mutation ownership; HeroSurface remains presentation-only.
  - Exercise fresh, partial, defeated, ailment-active, unequipped, and legacy-shaped heroes through the shared selector.

metrics:
  duration: 5min
  completed: 2026-09-20
  tasks: 2
  files_modified: 5
---

# Phase 15 Plan 02: Character Surface Integration Summary

**Party, equipment, cultivation, combat, and result contexts now share HeroSurface identity semantics while authoritative gameplay and save ownership remain unchanged.**

## Accomplishments

- Verified the existing integration of compact, detail, cultivation, and result HeroSurface variants across all required character scenes.
- Removed an unused equipment-local model derivation so equipment rendering has one shared presentation path.
- Expanded integration coverage with executable fixtures for fresh, partially populated, defeated/ailment-active, unequipped, and legacy-shaped heroes.
- Asserted bounded health/XP fallbacks, stable role/status labels, read-only derivation, canonical next-action labels, equipment/cultivation/combat/save authority calls, and Phase 14 result-band separation.

## Task Commits

1. **task 1: replace divergent character summaries with shared variants** — `29d8bc0` (existing integration), `30f1e96` (remove unused local model)
2. **task 2: add cross-screen state and legacy-save regression coverage** — `2b4852c`

## Verification

- `node tests/character_party_integration.test.js` — passed (`all contracts passed`).
- `node tests/hero_surface.test.js` — passed (`RED contract is active`).
- `node --check src/scenes/party.js` — passed.
- `node --check src/scenes/equipment.js` — passed.
- `node --check src/scenes/cultivationScene.js` — passed.
- `node --check src/scenes/combatScene.js` — passed.
- `node tests/combat_readability.test.js` — passed (`all contracts passed`).
- `git diff --check` — passed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused equipment hero model derivation**
- **Found during:** task 1 verification.
- **Issue:** Equipment built a local HeroSurface model that was never consumed, leaving a divergent/dead presentation path.
- **Fix:** Removed the unused derivation; the existing shared `renderDetail` call remains authoritative for equipment presentation.
- **Files modified:** `src/scenes/equipment.js`
- **Commit:** `30f1e96`

## Known Stubs

None found in files modified by this plan.

## Threat Flags

None. This plan adds no endpoint, auth path, file access, or schema surface.

## Self-Check: PASSED

- `tests/character_party_integration.test.js` exists.
- `src/scenes/equipment.js` exists.
- Commits `29d8bc0`, `30f1e96`, and `2b4852c` exist in git history.
- No STATE.md or ROADMAP.md changes were made by this executor.

---
*Phase: 15-character-party-surfaces*
*Completed: 2026-09-20*
