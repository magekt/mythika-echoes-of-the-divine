# 26-03 Summary: SpiritBeast Care Scene

## Objective
Surface hearts and feed/train care actions in spiritBeast.js (BST-01/BST-04 playable): hearts on list cards, hearts + XP progress in detail, three care buttons with explained denials, no new visual layer.

## Changes
- `src/scenes/spiritBeast.js` (extended, existing buttons untouched): list-card `Bond: ♥♥♡` line (R.colors.gold/xs, guarded); detail infoH 80→96 with `Bond: ♥♥♡  Bond XP: n/next (MAX)` progress line, passive/active line shifted +56→+74 only when BeastBond present; Feed (first eligible herb/draught + scaled gold), Train (25 prana), Intense Train (scaled gold) MagneticBtns before Back — all mutating via BeastBond only (zero direct gold/prana/inventory writes in the care block), every denial Toasted (capped/cooldown+seconds/missing-item/poor), heart-up plays Audio.levelUp + rebuilds detail; buttons hidden when BeastBond absent.
- `tests/beast_hearts.test.js` (appended): 5 scene-guard tests — delegation calls present, no direct economy writes in the care region, all four denial strings, hearts/progress/buttons present, combatScene reward call sites exactly-once + save healing intact.

## Verification
- `node --check src/scenes/spiritBeast.js` — pass
- `node --test tests/beast_hearts.test.js` — 18/18 pass
- `node --test tests/beast_care.test.js` — 7/7 pass
- `node --test tests/*.test.js` — 319/319 pass
- `tools/check_ui_invariants.sh` — all checks passed (93 files syntax, 20 system scripts)
- `git diff --check` — clean

## Notes
- Reward call sites live in combatScene.js (not combat.js) — the guard asserts there.
- Pre-existing level-up/fish buttons keep their legacy direct mutations; the no-direct-writes guard scopes to the Phase 26 care block.
