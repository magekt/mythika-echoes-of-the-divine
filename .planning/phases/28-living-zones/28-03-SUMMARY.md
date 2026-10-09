# 28-03 Summary: Oath naming in landmarks/echoes + phase close

## What was done
- `src/systems/landmarks.js` `getAll`: each entry gains `bondNote` (string|null) from a guarded `LivingZones.landmarkBondNote(zoneId)` call — derived at read time, null when unbonded or LivingZones absent; no persistence shape change.
- `src/systems/narrative_echoes.js`: `getForRegion`/`getActive` return shallow copies with a `companion` witness key (null when no oath companion); `NARRATIVE_ECHOES` source never mutated; `isEchoed` untouched.
- `src/scenes/travelMap.js` surfacing: landmark detail appends `bondNote` to relevance (cache key includes the note so bond changes refresh; line cap unchanged when no note); zone card echo line appends `echo.companion` before truncation (byte-identical when null).
- `sw.js`: added `src/data/zone_variants.js` + `src/systems/living_zones.js` to precache ASSETS (fixes `sw.js ASSETS includes every local script` suite failure; cache stays pinned at v11 per contract test).
- Created `tests/living_zones_oath.test.js` (3 tests): oath/non-oath/absent bondNote shapes, echo witness + source-immutability + byte-identical desc when null, no-LivingZones degradation, `isEchoed` regression.
- Wrote `28-VERIFICATION.md`; checked `ZON-01`/`ZON-02` in REQUIREMENTS.md; marked Phase 28 complete in ROADMAP.md.

## Verification
- `node --test tests/living_zones_oath.test.js` — 3 pass, 0 fail.
- `node --test tests/*.test.js` — 359 pass, 0 fail.
- `tools/check_ui_invariants.sh` — all checks passed (21 system scripts).
- `git diff --check` — clean.
