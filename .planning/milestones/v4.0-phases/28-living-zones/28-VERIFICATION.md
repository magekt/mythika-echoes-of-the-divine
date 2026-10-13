# Phase 28 Verification: Living Zones

## Plan verifies
- 28-01: `node --check src/data/zone_variants.js src/data/encounters.js` + `node --test tests/living_zones_variants.test.js` — 9 pass (12-variant table with 1/1/2/2/3/3 counts, same-zone base resolution, Trusted/Sworn/heart-2 boundaries, pool listing, absent-system + hostile-key degradation, exactly-once via seen ledger).
- 28-02: `node --check src/systems/living_zones.js src/scenes/zoneExploration.js` + `node --test tests/living_zones.test.js` — 12 pass (highest-threshold-first resolution, seen-skip, null-below-threshold with standards eligible, tease null/string/non-blocking wording/nearest-first, oath-preference companion, note/witness copy, absent-globals + absent-G degradation) with variants still 9/9; invariants green (21 system scripts, exactly-once loading).
- 28-03: `node --check src/systems/landmarks.js src/systems/narrative_echoes.js src/scenes/travelMap.js` + `node --test tests/living_zones_oath.test.js` — 3 pass (oath/non-oath/absent bondNote, echo witness + source immutability + byte-identical desc, no-LivingZones degradation, isEchoed intact); sw.js precache extended for the two new scripts (cache pinned v11); full suite + invariants + diff clean (below).

## Final results (2026-10-09)
- `node --test tests/living_zones_variants.test.js`: 9 pass, 0 fail.
- `node --test tests/living_zones.test.js`: 12 pass, 0 fail.
- `node --test tests/living_zones_oath.test.js`: 3 pass, 0 fail.
- `node --test tests/*.test.js`: 359 pass, 0 fail.
- `tools/check_ui_invariants.sh`: all checks passed (94 files syntax, 21 system scripts).
- `git diff --check`: clean.

## Contract truths confirmed
- 12 companion-gated variants live within current geography (aryavarta 1, tapobhumi 1, meru 2, svarga 2, dandaka 3, patala 3 — encounter IDs only, zero new zone IDs), each gated by affinity 25/50 or beast heart 2 and pointing at a same-zone standard base; below-threshold players keep the standard encounter plus a one-toast teased hint naming the nearest-locked bond — tease never blocks, errors, or double-fires.
- Variant rewards route through `EncounterSystem.choose` with exactly-once seen-ledger semantics (no parallel completion store, no new save fields); gating is additive-only inside `encounterAvailable` with proto-pollution rejection and absent-system degradation to ineligible.
- Landmark views (`Landmarks.getAll` + travel-map detail) and narrative echo markers (`getForRegion`/`getActive` + zone card) reference the highest-bond companion per zone — oath-bound named as oath-bound — derived at read time with null-safe fallbacks and byte-identical rendering when unbonded.

## Browser evidence
Deferred debt (same precedent as Phases 22-27): automated contracts green (359/359 + UI invariants); live-browser matrix (console silence, probe FPS, variant-encounter readability, tease toast timing, landmark/echo oath-note legibility, reduced motion) pending in the v4.0 browser-evidence backlog.

## Requirements
- ZON-01 (companion-gated encounter variants requiring affinity/bond minimums, no new zone IDs): met at contract level — 12 size-scaled variants, threshold gating, ungated standard default + tease.
- ZON-02 (landmarks and narrative echoes reference the highest-bond companion per zone): met at contract level — read-time bondNote + echo witness with oath naming, no persistence change.
