# 28-02 Summary: LivingZones system + exploration tease hook

## What was done
- Created `src/systems/living_zones.js` (`LivingZones`): `variantsFor`, `eligibleIn` (unseen + bond-met, highest-threshold-first), `resolveFor`, `teaseFor` (null when nothing locked; otherwise "Deeper bonds with {Name} may open more in {Zone}…"), `companionFor` (oath-flagged hero wins, then highest affinity, then highest-heart beast, null when unbonded), `landmarkBondNote`, `echoWitness`. Zero `G.state` mutations; every API never throws with safe-key + typeof guards. Registered in `index.html` after `encounter.js` (systems invariant: 21 scripts, exactly-once).
- Hooked the tease into `src/scenes/zoneExploration.js` `update()`: standard (non-`lz_`) narrative rolls show one guarded `Notify.show` toast (fallback `UI.Feedback.Toast(msg, opts)` per codebase pattern); variant rolls and the `gScene` transition untouched.
- Created `tests/living_zones.test.js` (12 tests): resolution ordering, seen-skip, null-below-threshold with standards eligible, tease null/string/wording/ordering, oath-preference companion logic, note/witness copy shapes, absent-globals and absent-G degradation. Fixed cross-realm strict-deepEqual via JSON-round-trip `plain()` helper (same convention as `host()` in beast_hearts).
- Incidental fix: `UI.Feedback.toast` → `UI.Feedback.Toast(msg, opts)` to match the real public API.

## Verification
- `node --check src/systems/living_zones.js src/scenes/zoneExploration.js` — clean (via invariants run).
- `node --test tests/living_zones.test.js` — 12 pass, 0 fail.
- `node --test tests/living_zones_variants.test.js` — 9 pass, 0 fail.
- `tools/check_ui_invariants.sh` — all checks passed (21 system scripts).
- `git diff --check` — clean.
