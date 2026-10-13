# 23-02 Summary: Bond Arc, Completion, and Rendering

Wave 2 (AFF-03) complete. Full 3-event bond arc per hero with tier-gated availability, exactly-once first gains plus capped +1 replays, encounter-UI reuse, recruit hook, and script registration.

## Changes
- `src/data/bonds.js` (new): `BOND_EVENTS` with 15 entries (recruit/crisis/oath x arjuna, bhima, karna, draupadi, hanuman); encounter-shaped choices with affinity maps (recruit first +2, crisis/oath first +4, second choices +2/+1); `tierReq` null/Trusted/Sworn; `bondEvent:true`; oath scenes frame loyalty/comradeship, never romance.
- `src/systems/bond.js`: `REPLAY_CAP=3`, `bondAvailable(heroId)` (recruit -> crisis -> oath order, tier-gated, never throws), `completeBond(eventId, choiceIdx)` (tier re-validated; first completion full gain once + flag; replays +1 to cap then `{capped:true, applied:0}`; benched heroes mark flags with 0 gain).
- `src/scenes/encounterScene.js`: `enter({bondEventId})` resolves from `BOND_EVENTS` through shared `buildUI`/`buildResult` (no visual fork, `Bond Scene` label); bond choice clicks route through `completeBond` with capped notice and unlock toast; non-bond tier-up gains toast unlocks via `bondAvailable`; `leave` clears bond id.
- `src/scenes/party.js`: `recruitHero` deletes stale `bond_<hid>_recruit` flag and toasts that a bond scene awaits.
- `src/data/encounters.js`: `encounterAvailable` returns false for `bondEvent` entries (pool isolation).
- `index.html` / `sw.js`: synchronous `src/data/bonds.js` registration after `encounters.js` in both script order and precache ASSETS; no reordering, no cache bump.

## Verification
- `node --check` on bonds.js, bond.js, encounterScene.js, party.js: pass.
- `node --test tests/bond_affinity.test.js tests/choice_affinity.test.js`: 14 pass.
- `node --test tests/save_coherence.test.js`: 4 pass (precache + coherence).
- `git diff --check`: clean.
