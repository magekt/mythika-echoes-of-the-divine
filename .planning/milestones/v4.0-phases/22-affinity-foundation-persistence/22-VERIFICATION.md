# Phase 22 Verification: Affinity Foundation & Persistence

## Plan Results
- **22-01** (BondSystem contract): `node --check src/systems/bond.js && node --test tests/bond_affinity.test.js tests/save_coherence.test.js` — 10/10 pass.
- **22-02** (meter + seeding): `node --check src/ui/heroSurface.js && node --test tests/hero_affinity_display.test.js tests/bond_affinity.test.js` — 12/12 pass.
- **22-03** (persistence matrix): `node --check src/engine/game.js + src/systems/save.js && node --test tests/affinity_persistence.test.js tests/save_coherence.test.js tests/bond_affinity.test.js` — 17/17 pass.

## Full-Gate Results
- `node --test tests/*.test.js` — **221/221 pass**, 0 fail.
- `tools/check_ui_invariants.sh` — pass (92 syntax files, 20 system scripts, no forbidden patterns).
- `git diff --check` — clean.

## Success Criteria Mapping
- tierFor(24)=Wary, tierFor(25)=Trusted, tierFor(50)=Sworn, tierFor(90)=Legend — locked by `bond_affinity` boundary tests.
- Unrecruited `get()` returns `visible:false` — locked by gating + display tests; `_render` emits no meter/tier text when hidden.
- `normalize({arjuna:200, __proto__:{}})` -> `{arjuna:100}` with clean prototype — locked by heal tests.
- `save_coherence` green (precache covers `bond.js`; bond loads before `save.js`).
- Roadmap criterion 2 (reload intact) — proven by round-trip row in `affinity_persistence`.
- Roadmap criterion 3 (legacy + malformed healed, no crash) — proven by legacy, malformed, non-object, and fallback rows.
- Save envelope version stays 1; no unrelated state mutated — asserted in persistence suite.

## Files Changed
- `src/systems/bond.js` (new), `tests/bond_affinity.test.js` (new)
- `src/ui/heroSurface.js`, `src/scenes/party.js`, `tests/hero_affinity_display.test.js` (new)
- `src/engine/game.js`, `src/systems/save.js`, `tests/affinity_persistence.test.js` (new)
- `index.html`, `sw.js` (script registration + precache)
