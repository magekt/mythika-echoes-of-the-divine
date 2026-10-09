# Phase 27 Verification: Beast Power & Evolution Assist

## Plan verifies
- 27-01: `node --check src/systems/bond.js` + `node --test tests/beast_power.test.js` — 8 pass (potency 1/1.1/1.2/1.3 boundaries, hostile-safe defaults, flat +10/+1x4 with fresh refs, 10 auras null below heart 2 + locked effect table + deep-copy safety, absent-G/SPIRIT_BEASTS degradation) with beast_hearts still 18/18.
- 27-02: `node --check src/data/spirit_beasts.js src/scenes/combatScene.js` + `node --test tests/beast_power_evo.test.js` — 8 pass (assist 10→5/25→12, canEvolve/getBeastEvolution/evolveBeast agreement, identical-form assist evolve, bonus stacking on base+evolved stats, pre-boost formula intact, potency-math mirror) with beast_power still 8/8; diff hunks confined to doBeastSkill (no button/layout/cooldown/loot changes).
- 27-03: scene power surfacing — `node --check src/scenes/spiritBeast.js`, added-block grep shows no new economy writes; full suite + invariants + diff clean (below).

## Final results (2026-10-09)
- `node --test tests/beast_power.test.js`: 8 pass, 0 fail.
- `node --test tests/beast_power_evo.test.js`: 8 pass, 0 fail.
- `node --test tests/*.test.js`: 335 pass, 0 fail.
- `tools/check_ui_invariants.sh`: all checks passed (93 files syntax, 20 system scripts).
- `git diff --check`: clean.

## Contract truths confirmed
- Each heart adds +10% elemental skill potency (mult 1 + 0.10×hearts, 2-decimal exact); damage/shield magnitudes scale floored, Howl/Fortify/Dark Veil bonus portions scale, ailments gain +heart turns, Rebirth revive gains +0.05/heart — all read once per skill use, defaulting to legacy magnitudes when BeastBond is absent.
- Heart 2 unlocks both halves of the passive: the universal flat boost (+10 HP, +1 str/agi/def/mag, folded into getBeastBonus on base and evolved-form stats) and one beast-specific aura (ember regen, stone ward, gale focus, …) fired on skill use via Combat.applyBuff (shield/buff) or clone HP clamp (heal) plus one log line; auraFor deep-copies and returns null below heart 2.
- Heart 3 halves evolution level requirements via requiredLevelFor (floor, min 1: 10→5, 25→12); canEvolve/getBeastEvolution/evolveBeast all honor it with identical forms/stats/passives/journey; materials/paths unchanged; absent BeastBond degrades to base levels.
- Authority preserved: combat mutations stay on battle clones through Combat.applyBuff; no gold/hero-XP/loot path changes; scene power reads are view-only (no new Economy/G.state/prana/inventory writes); save shape untouched (no new persisted fields — hearts stay derived).

## Browser evidence
Deferred debt (same precedent as Phases 22-26): automated contracts green (335/335 + UI invariants); live-browser matrix (console silence, probe FPS, beast-skill/aura log readability, evolution tap flow, reduced motion) pending in the v4.0 browser-evidence backlog.

## Requirements
- BST-02 (each heart raises beast skill potency; heart 2 unlocks one passive): met at contract level — potency mult + per-branch application, flat boost + aura data with in-combat firing and scene display.
- BST-03 (heart 3 counts toward beast evolution requirements): met at contract level — halved level gates with assist-active/locked scene hints, evolution output identical.
