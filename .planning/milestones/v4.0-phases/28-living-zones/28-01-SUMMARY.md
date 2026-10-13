# 28-01 Summary: Zone variant table + bondReq gating

## What was done
- Created `src/data/zone_variants.js`: 12 companion-gated variants (aryavarta 1, tapobhumi 1, meru 2, svarga 2, dandaka 3, patala 3), each with `bondReq` ({hero, affinityMin 25/50} or {beast, heartMin 2}), a same-zone `baseId`, companion-naming prompt, and two choices with `enc_<id>` flags. Entries append into `ENCOUNTERS` (encounter IDs only — zero new zone IDs). Registered in `index.html` after `encounters.js`.
- Extended `encounterAvailable()` in `src/data/encounters.js` with an additive `bondReq` block (hero via `BondSystem.valueFor`, beast via `BeastBond` hearts) including proto-pollution key rejection; absent/hostile systems degrade to ineligible, never throw; standard encounters untouched.
- Created `tests/living_zones_variants.test.js` (9 tests): table counts/shape, base resolution, no-new-zones, Trusted/Sworn boundaries, heart boundaries, pool listing behavior, degradation, hostile-key safety, exactly-once via `EncounterSystem.choose`.

## Verification
- `node --check src/data/zone_variants.js src/data/encounters.js` — clean.
- `node --test tests/living_zones_variants.test.js` — 9 pass, 0 fail.
- `git diff --check` — clean.
