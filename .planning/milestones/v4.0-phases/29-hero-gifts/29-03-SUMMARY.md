# 29-03 Summary: Party gift UI + phase close-out

## What was done
- Extended `src/scenes/party.js`: hero detail `actionCount` 6→7 with a secondary `Give Gift 🎁` action (after Use Item) opening `buildItemList('gift')`, which lists inventory `type: 'gift'` items with liked (`♥`) and tier-locked (`🔒<tier>`) suffixes via `giftSuffixFor()`.
- Gift taps route through `BondSystem.giveGift` only (scene never writes affinity/flags, never removes inventory): success toasts `+<applied> bond` plus a tier-up celebration and rebuilds detail (affinity meter refresh); denials toast player-facing blocker copy via `giftDenialCopy()` (names the tier/cap/requirement, never a bare refusal). Use/Equip branches byte-identical; absent `BondSystem` degrades to a Toast, never throws. No new animation, no new script registration.
- Full guard: gift suites 20/20, full Node suite 379/379, `tools/check_ui_invariants.sh` green (95 files syntax, 21 system scripts), `git diff --check` clean.
- Wrote `29-VERIFICATION.md` closing GFT-01 at contract level (browser evidence deferred per Phases 22–28 precedent).

## Verification
- `node --check src/scenes/party.js` — clean.
- `node --test tests/hero_gifts_data.test.js tests/hero_gifts.test.js` — 20 pass, 0 fail.
- `node --test tests/*.test.js` — 379 pass, 0 fail.
- `tools/check_ui_invariants.sh` — all checks passed.
- `git diff --check` — clean.
