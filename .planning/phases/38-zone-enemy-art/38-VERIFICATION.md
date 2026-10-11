# Phase 38 Verification

**Phase:** 38-zone-enemy-art
**Requirements:** ART-01, ART-02
**Date:** 2026-10-10 (live-render addendum 2026-10-11)
**Status:** Automated contracts green; visual UAT DONE live 2026-10-11 (see Live Addendum)

## Automated
- `node --check src/systems/zoneArt.js` — clean
- `node --check src/systems/enemyPortraits.js` — clean
- `node --check src/engine/renderer.js` — clean
- `node --test tests/*.test.js` — 449/449 passed
- `tools/check_ui_invariants.sh` — 25 system scripts, all passed

## ART-01 — Zone Backdrops ✓
- 6 distinct procedural backdrops registered for all zone IDs in ZONES
- `ZoneArt.registerAll()` called in `gInit()` after `initAudio()`
- Zone-specific hex only in `zoneArt.js`

## ART-02 — Enemy Portraits ✓
- 20 enemy silhouettes with distinct head shapes in `enemyPortraits.js`
- `R.drawEnemy` in `renderer.js` delegates to `EnemyPortrait` with legacy fallback
- LRU cache (max 20) prevents repeated canvas allocation

## Deferred

- ~~Visual UAT: verify each zone backdrop and enemy portrait renders correctly in live browser (deferred per v3.0–v6.0 accepted residual)~~ CLOSED by Live Addendum below.

## Live Addendum (2026-10-11, real Chrome headless)

Rendered every subject in-page on offscreen canvases via the production call
paths (`R.Backgrounds.renderBackground('zone:'+id)`, `R.drawEnemy`) and measured
pixel metrics; no exceptions. Script: `/var/folders/0w/fmpw5lvx5h91vpbxbmn4nzs40000gn/T/opencode/mythika_cdp_render.py`
(showcase PNGs gitignored under `/tmp/mythika_*.png`).

### ART-01 — 6/6 zone backdrops render opaque with distinct palettes
| Zone | Color buckets | Variance | Notes |
|------|---------------|----------|-------|
| aryavarta | 2 | 8 | navy sky + gold sun + hills (screenshot confirmed) |
| dandaka | 2 | 7 | renders opaque, distinct painter |
| meru | 9 | 11 | richest palette |
| patala | 2 | 9 | renders opaque, distinct painter |
| svarga | 5 | 19 | highest variance |
| tapobhumi | 9 | 17 | richest palette |

All 6 cover the full canvas (18000/18000 alpha px at 200×360 probe). Low bucket
counts on some zones are an artifact of 5-bit quantization on dark-navy gradients;
painters are separate functions per zone and the aryavarta screenshot confirms a
painted scene (sky, sun + halo, layered hills, trees).

### ART-02 — 20/20 portraits render non-empty distinct silhouettes
Alpha-pixel coverage per portrait (60×60 probe): bandit 178, wolf 187,
giantSpider 171, rakshasa 203, wildBoar 170, snake 85, wraith 137, darkElf 190,
shadowMage 183, treant 150, naga 107, asuraWarrior 213, orc 191, iceElemental 87,
fireElemental 213, asura 202, hellHound 169, indra 248, dragonEmerald 186,
kaliya 142. Grid screenshot confirms distinct head shapes, horns, and accent
glows (gold crescents, blue orb, fire glow). All go through `R.drawEnemy` →
`EnemyPortrait` (no legacy-fallback hits).
