# 25-02 Summary: Duo Surfacing + Save Healing

## Objective
Surface signature combos in the combat scene through existing feedback bands only, and persist combo_* unlock flags under save versioning (AFF-06 usable half).

## Changes
- `src/scenes/combatScene.js` (extended, bands/contracts untouched): Legend-gated `Duo: <name> (<partner>)` gold button in buildActionButtons() playerTurn branch (after beast block, appended only when both participants able — no disabled placeholder); `doSignatureCombo()` handler re-validates availability, resolves partner + target, calls Combat.performSignatureCombo, pushes max 2 result lines to the existing log band, fires one gold Toast, guarded Audio.skill(), advances the turn (partner turn consumed by Combat authority); failure pushes one plain line and advances without consuming. No getCombatLayout/render-branch changes; no new animation.
- `src/systems/save.js` (one guarded block in migrate()): normalizeCombo hook directly after normalizeLinger; absent-BondSystem safe.

## Verification
- `node --check src/scenes/combatScene.js && node --check src/systems/save.js` — pass
- `node tests/combat_readability.test.js` — all contracts passed
- `node --test tests/signature_combos.test.js` — 17/17 pass
- `git diff --check` — clean

## Notes
- index.html needed no change (bond.js/combat.js already loaded; scene accesses both via guarded globals).
- Full-suite + UI-invariants run deferred to Plan 03 matrix task.
