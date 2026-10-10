# Phase 29 Verification: Hero Gifts

## Plan verifies
- 29-01: `node --check src/data/items.js` + `node --test tests/hero_gifts_data.test.js` — 8 pass (19-gift catalog at 6 zone + 6 realm + 7 story, def shape with ≥3 gifts per zone, exact 6-gift Sworn set, 5×10 personality rosters with full union coverage, loot-branch equipment invariance + zone-appropriate pick + unknown-zone safety).
- 29-02: `node --check src/systems/bond.js src/systems/save.js` + `node --test tests/hero_gifts.test.js` — 12 pass (13/8/5 then 3-next-week diminishing, pair independence, weekly-cap denial/partial/rollover, Sworn lock boundary at 50, six no-consume denials, exactly-1 canonical consumption with tierUp, normalize healing, absent-table + hostile-key degradation).
- 29-03: `node --check src/scenes/party.js` + gift suites re-run — 20 pass; full guard below.

## Final results (2026-10-09)
- `node --test tests/hero_gifts_data.test.js`: 8 pass, 0 fail.
- `node --test tests/hero_gifts.test.js`: 12 pass, 0 fail.
- `node --test tests/*.test.js`: 379 pass, 0 fail.
- `tools/check_ui_invariants.sh`: all checks passed (95 files syntax, 21 system scripts).
- `git diff --check`: clean.

## Contract truths confirmed
- Each hero holds a late-game-deep roster of liked gifts (19-item catalog = 6 zones + 6 cultivation realms + 7 story journeys; 10 personality-matched gifts per hero, union covers all 19) drawn from and added to `items.js`; gifts enter play only via additive loot drops — no shop sells gifts.
- Gifting grants steep diminishing affinity (+13/+8/+5, then +3) tracked per hero–item pair in flags, under BOTH a weekly-equivalent flag cap (26 affinity per hero per week, partial grants at the boundary) AND tier-locked gifts (6 top gifts effective at Sworn+ only).
- Economy owns item consumption (`Economy.removeItemByName`, consumed only on the success path); affinity routes through canonical `BondSystem.add`; every denial names its reason and consumes nothing — gifts supplement bonds, never replace them.
- Pair counts and weekly totals persist in `G.state.flags` under save versioning with normalize healing (clamp, drop unknown keys, proto-pollution guard); no new state branches.
- Party hero detail offers Give Gift with liked/locked indicators, tier-up celebration, and player-facing blocker reasons; Use/Equip paths untouched.

## Browser evidence
Deferred debt (same precedent as Phases 22-28): automated contracts green (379/379 + UI invariants); live-browser matrix (console silence, probe FPS, gift-picker readability, toast timing/legibility, reduced motion) pending in the v4.0 browser-evidence backlog.

## Requirements
- GFT-01 (hero-liked items grant capped affinity with diminishing returns, no gift-vending): met at contract level — diminishing pairs, dual caps, tier locks, canonical consumption, explained denials, healed persistence.
