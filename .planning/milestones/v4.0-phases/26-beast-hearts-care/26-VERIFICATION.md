# Phase 26 Verification: Beast Hearts & Care Actions

## Plan verifies
- 26-01: `node --check src/systems/bond.js` + `node --test tests/beast_hearts.test.js` — 13 pass (thresholds, cost tables, battle XP + heartUp, feed flat-XP/caps/denials, train tracks/cooldown/shared cap, day rollover, statusFor, normalize).
- 26-02: `node --check src/systems/combat.js src/systems/save.js src/engine/game.js` + `node --test tests/beast_care.test.js` — 7 pass (active-only +8, heart-up Toast, no-op/fallback, Economy-call authority, getLoot identical, migrate healing + legacy boot) with beast_hearts still 13/13.
- 26-03: scene guards appended — 18 pass total (delegation, no-direct-writes region, four denial strings, hearts/progress/buttons, reward-path integrity); `node --test tests/*.test.js` + `tools/check_ui_invariants.sh` + `git diff --check` — green.

## Final results (2026-10-09)
- `node --test tests/beast_hearts.test.js`: 18 pass, 0 fail.
- `node --test tests/beast_care.test.js`: 7 pass, 0 fail.
- `node --test tests/*.test.js`: 319 pass, 0 fail.
- `tools/check_ui_invariants.sh`: all checks passed (93 files syntax, 20 system scripts).
- `git diff --check`: clean.

## Contract truths confirmed
- Hearts 0-3 derive from bond XP via [0, 30, 80, 160]; battle victory grants +8 to the active beast only through the existing awardBeastXP call; heart-up Toasts name the beast and heart count.
- Feed consumes one farm/alchemy item (herb OR consumable+recipeId OR HERB_GROWTH name) + round(20*1.2^hearts) gold for flat +11 XP, capped 3/beast/day.
- Prana train costs 25 prana for +6 XP with no cooldown; gold train costs round(40*1.2^hearts) for +14 XP with a 5-minute per-beast cooldown; both share a 5/beast/day pool; day rollover resets caps.
- Every denial returns an explicit reason surfaced as a Toast (capped/cooldown+seconds/missing-item/poor); failed checks perform zero mutations.
- beastBond persists under save versioning, heals crafted/legacy values (unknown ids + hostile keys dropped, xp clamped), leaves unrelated state verbatim.
- No reward duplication: combat gold/hero-XP/loot call sites byte-identical; all care mutations route through Economy.spendGold/removeItemByName (prana direct, no helper exists); scene performs no direct economy writes in the care block.

## Browser evidence
Deferred debt (same precedent as Phases 22-25): automated contracts green (319/319 + UI invariants); live-browser matrix (console silence, probe FPS, feed/train tap flows, reduced motion) pending in the v4.0 browser-evidence backlog.

## Requirements
- BST-01 (hearts grow via battle-together XP plus feed/train): met at contract level — thresholds, +8 battle bridge, +11/+6/+14 care gains with heart-up surfacing.
- BST-04 (feed consumes farm/alchemy items, training spends gold/prana, capped with cooldowns): met at contract level — item+gold feed, dual-track training, daily caps, per-beast gold cooldown, explained denials.
