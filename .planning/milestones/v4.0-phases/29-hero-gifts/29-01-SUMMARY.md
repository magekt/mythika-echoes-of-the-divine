# 29-01 Summary: Gift catalog + rosters + loot sourcing

## What was done
- Extended `src/data/items.js` with `ITEMS.gifts`: 19-item catalog sized 6 zone-flavored + 6 realm-flavored + 7 story-flavored (zones.js + REALMS + JOURNEYS counts). Each gift carries `type: 'gift'`, `giftKey`, `cost: 0`, `zones[]`, flavor tag, and desc; 6 top gifts declare `minTier: 'Sworn'`.
- Added `HERO_GIFTS` roster table: 5 heroes × 10 personality-matched giftKeys spanning early-to-late tiers (union covers all 19 gifts, no orphans); tier locks live on gift defs, not the table.
- Added an additive gift-drop branch to `generateLoot()` (~12%, zone-appropriate gift alongside equipment; unknown zones yield no gift, never throw). No shop sells gifts — no gift-vending source.
- Created `tests/hero_gifts_data.test.js` (8 tests): catalog scale/flavor split, def shape + per-zone coverage ≥3, exact Sworn-lock set, roster sizes/resolution/union coverage, Sworn+open mix per hero, loot-branch equipment invariance + zone-appropriate pick + unknown-zone safety.

## Verification
- `node --check src/data/items.js` — clean.
- `node --test tests/hero_gifts_data.test.js` — 8 pass, 0 fail.
- `git diff --check` — clean.
