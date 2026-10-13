# 27-02 Summary: Evolution Assist + Combat Application

Make hearts fight stronger and evolve earlier: bond-aware evolution checks in spirit_beasts.js, potency-scaled + aura-firing doBeastSkill in combatScene.js, proven by tests/beast_power_evo.test.js.

## Changes

- `src/data/spirit_beasts.js`: new `requiredLevelFor(beastId, stageIdx)` (heart 3 → floor(level/2), min 1: 10→5, 25→12; Infinity unknown; absent BeastBond → base); `canEvolve`/`getBeastEvolution`/`evolveBeast` compare against it (base data untouched, same forms/stats/passives/journey); `getBeastBonus` adds guarded `BeastBond.statBoostFor` deltas (+10 HP, +1×4) on base and evolved-form stats.
- `src/scenes/combatScene.js` (doBeastSkill only, all hunks lines 385–535): guarded one-time bond read (defaults heart 0/mult 1/no aura); damage/shield × mult (floored), Howl/Fortify/Dark Veil bonus portions × mult, ailments +heart turns, Rebirth revive 0.30+0.05×heart; heart-2 aura fires post-switch via Combat.applyBuff (shield/buff) or clone HP clamp (heal) + one log line, all try/catch guarded.
- `tests/beast_power_evo.test.js` (new): 8 tests (vm sandbox, real bond.js + spirit_beasts.js).

## Verification

- `node --check` clean on both sources; `git diff --check` clean; diff hunks confined to doBeastSkill (no button/layout/cooldown/loot changes).
- `node --test tests/beast_power_evo.test.js`: 8/8 pass; `tests/beast_power.test.js`: 8/8 still pass.
