# 27-01 Summary: BeastBond Power Contract

Create the BeastBond potency/flat-boost/aura contract (BST-02 data half): mult 1+0.10*hearts, universal +10 HP/+1x4 stat boost at heart 2+, 10 beast-specific auras gated on heart 2+, all read-only and never-throw.

## Changes

- `src/systems/bond.js` (appended Phase 27 section, no existing function touched): `POTENCY_PER_HEART 0.10`, `HEART2_BOOST {hp:10,str:1,agi:1,def:1,mag:1}`, `BEAST_AURAS` (10 entries, effects limited to heal/shield/buff primitives); `potencyFor` (2-decimal mult), `statBoostFor` (fresh copies, zeros below heart 2), `auraFor` (null below heart 2, deep copies at 2+). Zero G.state mutations, no new dependencies.
- `tests/beast_power.test.js` (new): 8 tests following beast_hearts conventions (vm sandbox, host() JSON-copy for cross-realm strict deepEqual).

## Verification

- `node --check src/systems/bond.js` clean; `git diff --check` clean.
- `node --test tests/beast_power.test.js`: 8/8 pass.
- `node --test tests/beast_hearts.test.js`: 18/18 pass (no regressions).
