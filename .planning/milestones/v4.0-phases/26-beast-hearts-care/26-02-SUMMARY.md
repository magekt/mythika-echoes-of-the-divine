# 26-02 Summary: Battle XP Bridge + Persistence

## Objective
Wire battle-together XP and save persistence (BST-01 durable + SAV-01 pattern): bond XP rides the existing awardBeastXP call, beastBond defaults + migrate healing, economy-authority proof with zero reward duplication.

## Changes
- `src/systems/combat.js` (awardBeastXP only): guarded `BeastBond.addBattleXP(activeId)` bridge after the level-XP block; heart-up surfaces `UI.Feedback.Toast` (Notify fallback); absent BeastBond degrades to level-XP-only. getLoot/addGold/addPartyXP/loot paths untouched.
- `src/engine/game.js`: default `beastBond: { xp:{}, feed:{day:0,counts:{}}, train:{day:0,counts:{}}, trainCd:{} }` alongside affinity.
- `src/systems/save.js` (migrate only): `BeastBond.normalize` healing with inline fallback (drops unknown ids + hostile keys, clamps xp) producing the four-key shape; unrelated flags/state verbatim.
- `tests/beast_care.test.js` (new): 7-case integration suite — active-beast-only +8, heart-up Toast exactly once per cross, no-beast no-op, BondSystem-absent fallback, Economy stub-call authority (single spend/remove; zero mutations on denial), getLoot byte-identical with/without bridge, migrate healing + legacy boot (incl. fallback path).

## Verification
- `node --check src/systems/combat.js && node --check src/systems/save.js && node --check src/engine/game.js` — pass
- `node --test tests/beast_hearts.test.js` — 13/13 pass
- `node --test tests/beast_care.test.js` — 7/7 pass
- `git diff --check` — clean

## Notes
- Feed-item ordering (item check before cap check) means an empty inventory yields no_item, not capped — covered by giving the cap test ample stock.
- Scene surfacing deferred to Plan 03.
