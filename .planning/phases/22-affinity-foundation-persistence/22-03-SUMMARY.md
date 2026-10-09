# 22-03 Summary: Affinity Persistence + Matrix Contract

## Objective
Persist `G.state.affinity` through the save envelope with migrate-time healing (SAV-01, roadmap criteria 2-3, D-04 persistence half).

## Changes
- `src/engine/game.js` — `createDefaultGameState` gains a top-level `affinity: {}` next to `flags`/`encounters` (plain literal; per-hero seeding stays in `ensureSeed`). Single factory confirmed by grep; no version change.
- `src/systems/save.js` — `SaveSystem.migrate` heals affinity right after the `WorldState.normalize` branch: uses `BondSystem.normalize` when present, else an identical inline fallback (plain object, safe-key filter, `HERO_IDS` allowlist when present, coerce/floor/clamp 0-100). Single insertion covers all hydrate paths (`load`, `importFile`, `cloudLoad`); `save`/`exportFile`/version-1 envelope untouched; unrelated state preserved.
- `tests/affinity_persistence.test.js` (new) — vm-sandbox matrix: fresh-state default, save-load round trip intact, legacy missing-key heal, malformed clamp/clean (range, string/NaN, unknown, hostile, non-object), BondSystem-absent fallback, version-1 + unrelated-state preservation.

## Verification
- `node --check src/engine/game.js` + `node --check src/systems/save.js` — pass
- `node --test tests/affinity_persistence.test.js tests/save_coherence.test.js tests/bond_affinity.test.js` — 17/17 pass
- `tools/check_ui_invariants.sh` — pass (run in phase verification)
