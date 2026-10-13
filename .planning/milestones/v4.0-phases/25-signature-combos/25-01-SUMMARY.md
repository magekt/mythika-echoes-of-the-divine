# 25-01 Summary: Signature-Combo Contract + Combat Authority

## Objective
Create the BondSystem signature-combo contract and Combat execution authority (AFF-06 rules half): five Legend-gated duo definitions, build-scaled potency, both-turns consumption, exactly-once unlock flags.

## Changes
- `src/systems/bond.js` (extended, no existing function touched): `COMBOS` (one entry per hero: arjuna strike 1.8x2 hits, bhima slam 1.6+shield 15, karna volley 1.2 AoE, draupadi aegis heal 0.25+shield 12, hanuman leap 2.2+splash 0.5), `comboFor` (copy semantics, hostile-safe null), `comboAvailable` (Legend + active/lingering hero + distinct active partner, reasons ok/unknown/not_legend/hero_inactive/no_partner), `comboPotencyFor` (mult = base + statScale*stat, bonus = 0.15*weaponLvl or 0 unarmed), `comboSeen`/`markComboSeen` (exactly-once combo_* flags), `normalizeCombo` (keeps true known-hero combo flags, others verbatim, proto-safe). All never-throw, no R/UI dependency.
- `src/systems/combat.js` (extended, existing formulas untouched): `SIGNATURE_FALLBACK` + `SIGNATURE_ROLE_STAT` tables, `startBattle` resets `consumedTurns`/`comboResults`, `performSignatureCombo` executes all five kinds via existing performAttack/applyBuff primitives only (returns ok/kind/name/total/lines 1-2), flags partner turn consumed, best-effort markComboSeen, guarded BondSystem-absent fallback; `nextTurn` skips consumed partner turns exactly once (bounded loop, no infinite-loop risk).
- `tests/signature_combos.test.js` (new): 17-case vm-sandbox suite for COMBOS shape, copy semantics, availability gating, potency math/degradation, exactly-once flags, per-kind execution, one-shot consumption, dead/foreign-participant safety, BondSystem-absent fallback.

## Verification
- `node --check src/systems/bond.js && node --check src/systems/combat.js` — pass
- `node --test tests/signature_combos.test.js` — 17/17 pass
- `node tests/combat_readability.test.js` — all contracts passed
- `git diff --check` — clean

## Notes
- Detached-method calls lose `this` in vm tests; suite calls potency/flag helpers as BondSystem methods.
- Scenes, save, and index.html are untouched — Plan 02 consumes this contract.
