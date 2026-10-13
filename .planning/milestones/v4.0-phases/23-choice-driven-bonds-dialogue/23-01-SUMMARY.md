# 23-01 Summary: Choice Affinity Gains

Wave 1 (AFF-02) complete. Encounter choices now route affinity gains (+2 standard / +4 major sacrifice) through a gains-only, active-party-gated `BondSystem.add` writer.

## Changes
- `src/systems/bond.js`: added `GAIN_SMALL=2`, `GAIN_MAJOR=4`, `_isActiveInParty`, and `add(heroId, amount)` (safe-key/known-id guards, gains-only, recruited + active gate, clamp 100, tierUp flag, never throws).
- `src/systems/encounter.js`: `EncounterSystem.choose` routes `choice.affinity` through `BondSystem.add` after reward grants / before flags-ledger; pushes `{type:'affinity'}` grants; gold tier-up toast (guarded).
- `src/data/encounters.js`: annotated one choice per encounter (8/8) with values only 2/4, all 5 heroes reachable (`nagaBargain:arjuna+4`, `marutCrossing:bhima+2`, `rishiBoon:karna+2`, `asuraWhisper:draupadi+4`, `yakshaRiddle:hanuman+2`, `devaBlessing:bhima+2`, `tapasPilgrim:karna+4`, `nagaElder:draupadi+2`).
- `src/scenes/encounterScene.js`: `buildResult` renders affinity grants as `<Hero> +<n> bond (<Tier>)` via `BondSystem.get`, semantic colors only.
- `tests/choice_affinity.test.js`: new contract suite (gains, eligibility, no-decay, clamp, tierUp, data audit, choose integration).

## Verification
- `node --check` on all four source files: pass.
- `node --test tests/choice_affinity.test.js tests/bond_affinity.test.js`: 14 pass, 0 fail.
