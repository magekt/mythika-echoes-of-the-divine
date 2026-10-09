# 22-01 Summary: BondSystem Affinity Contract

## Objective
Create the BondSystem tier/accessor/normalize contract (AFF-01 read half, D-02 tiers, D-04 read rules).

## Changes
- `src/systems/bond.js` (new): global `BondSystem` with `TIERS` (Wary 0 / Trusted 25 / Sworn 50 / Legend 90), pure `tierFor`, `_safeKey`, `isRecruited` (party-gated, never throws), `valueFor` (read-only clamp 0-100), `get` (visible only when recruited, unknown/unsafe -> hidden Wary), `normalize` (plain-`{}` healer: drops unsafe + unknown keys, floor/clamp, never throws), `ensureSeed` (sole writer, seeds 0). No R dependency; `typeof module` guard for Node tests.
- `tests/bond_affinity.test.js` (new): vm-sandbox suite covering tier boundaries, valueFor clamps, get gating, normalize hostile-key healing + prototype cleanliness, non-object -> {}, ensureSeed semantics.
- `index.html`: registered `src/systems/bond.js` immediately before `src/systems/save.js` (synchronous classic tag).
- `sw.js`: added `src/systems/bond.js` to ASSETS before `src/systems/save.js`.

## Verification
- `node --check src/systems/bond.js` — pass
- `node --test tests/bond_affinity.test.js tests/save_coherence.test.js` — 10/10 pass
- `git diff --check` — clean

## Notes
- `normalize` returns a plain `{}` (not null-prototype) so `deepStrictEqual` against literals holds after JSON round-trip; vm cross-realm tests compare via JSON host copy.
- G-state absence tolerated throughout (legacy saves without `affinity` read as 0).
