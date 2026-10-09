# 26-01 Summary: BeastBond Contract

## Objective
Create the BeastBond hearts/costs/caps/cooldown contract (BST-01/BST-04 rules half): hearts 0-3 from bond XP, battle +8, feed +11 with 1.2^hearts gold, prana/gold training tracks, daily caps, per-beast gold cooldown, normalize healing.

## Changes
- `src/systems/bond.js` (extended, no existing function touched): new `BeastBond` global with `HEART_THRESHOLDS [0,30,80,160]`, `BATTLE_XP 8`, `FEED_XP 11`, `PRANA_TRAIN_XP 6`/`PRANA_COST 25` (no cooldown), `GOLD_TRAIN_XP 14`/`GOLD_TRAIN_BASE 40` (5-min per-beast cooldown), `FEED_GOLD_BASE 20`, `FEED_CAP 3`, shared `TRAIN_CAP 5`, day-equivalent via overridable `_now`. `heartFor/xpFor/get` read-only; `feedGoldFor/trainGoldFor` = round(base*1.2^hearts); `isFeedItem` (herb OR consumable+recipeId OR HERB_GROWTH name); `addBattleXP/feed/pranaTrain/goldTrain` with explicit reasons (unknown_beast/no_item/capped/no_gold/no_prana/cooldown+retryMs); check-then-mutate atomicity (zero partial writes); `statusFor` view-only; `normalize` (drops unknown ids + hostile keys, clamps xp 0..9999). Mutations only via Economy.spendGold/removeItemByName (prana direct, no helper exists). All never-throw, no R/UI dependency.
- `tests/beast_hearts.test.js` (new): 13-case vm-sandbox suite for thresholds, cost tables, battle XP + heartUp, feed flat-XP/caps/denials, train tracks/cooldown/shared-cap, day rollover, statusFor, normalize.

## Verification
- `node --check src/systems/bond.js` — pass
- `node --test tests/beast_hearts.test.js` — 13/13 pass (pre-Plan-03 guards)
- `git diff --check` — clean

## Notes
- `'__proto__' in obj` is true via the prototype chain; normalize tests assert via hasOwnProperty.
- Combat/save/scene wiring deferred to Plans 02/03.
