# 29-02 Summary: Gifting authority + persistence

## What was done
- Extended `BondSystem` in `src/systems/bond.js` with a `Phase 29: Hero Gifts` section: `GIFT_GAINS [13,8,5]` / `GIFT_TAIL 3` / `GIFT_WEEKLY_CAP 26` / `GIFT_WEEK_MS`, plus `giftWeekIndex`, `giftPairCount`, `giftWeekTotal`, `giveGift(heroId, giftKey, now?)`, and `normalizeGifts(flags)`.
- `giveGift` enforces, in order: known hero → roster membership (`not_liked`) → recruited (`not_recruited`) → active party, linger excluded (`inactive`) → affinity headroom (`maxed`) → per-gift `minTier` via `_tierMeets` (`tier_locked`, names the tier) → weekly-equivalent flag cap with partial grants (`capped`) → diminishing per pair. Consumption happens LAST via canonical `Economy.removeItemByName` (item located by `giftKey`); affinity routes via canonical `this.add` (tierUp surfaced). Nothing is consumed on any denial; every denial carries an explicit reason; never throws.
- Gift pair counts (`gift_<hero>_<giftKey>`) and weekly totals (`giftweek_`/`gifttotal_<hero>`) persist in `G.state.flags`; `normalizeGifts` clamps counts/totals, drops unknown-hero/unknown-gift/proto-pollution keys, keeps all other flags verbatim (linger/combo pattern).
- Wired `SaveSystem.migrate` in `src/systems/save.js` with the guarded `normalizeGifts` call (after combo block, before beastBond block). No new state branches.
- Created `tests/hero_gifts.test.js` (12 tests): 13/8/5 then 3-next-week diminishing, pair independence, cap denial without consumption, partial grants, week rollover, Sworn lock/grant boundary, all six no-consume denials, exactly-1 consumption + `add` routing + tierUp, normalize healing, absent-table degradation, hostile-key safety.

## Verification
- `node --check src/systems/bond.js src/systems/save.js` — clean.
- `node --test tests/hero_gifts_data.test.js tests/hero_gifts.test.js` — 20 pass, 0 fail.
- `git diff --check` — clean.
