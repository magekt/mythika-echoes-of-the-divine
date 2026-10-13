# Phase 25 Verification: Signature Combos

## Plan verifies
- 25-01: `node --check src/systems/bond.js src/systems/combat.js` + `node --test tests/signature_combos.test.js` — 17 pass (COMBOS shape, copy semantics, availability gating, potency math/degradation, exactly-once flags, per-kind execution, one-shot consumption, dead/foreign safety, BondSystem-absent fallback) + `node tests/combat_readability.test.js` — all contracts passed.
- 25-02: `node --check src/scenes/combatScene.js src/systems/save.js` + readability suite + combo suite — green; duo button + handler use existing log band + Toast only; combo_* healing in migrate().
- 25-03: matrix extension — 22 pass total (per-hero e2e, build scaling, full-round consumption, save round-trip, band-separation static guard); `node --test tests/*.test.js` + `tools/check_ui_invariants.sh` + `git diff --check` — green.

## Final results (2026-10-09)
- `node --test tests/signature_combos.test.js`: 22 pass, 0 fail.
- `node --test tests/*.test.js`: 294 pass, 0 fail.
- `node tests/combat_readability.test.js`: all contracts passed.
- `tools/check_ui_invariants.sh`: all checks passed (20 system scripts).
- `git diff --check`: clean.

## Contract truths confirmed
- Each hero exposes exactly one Legend-gated duo combo (90+ affinity): arjuna Gandiva Twin Strike (strike), bhima Mountain-Guard Slam (slam + party shield), karna Sunburst Volley (volley AoE), draupadi Panchali Warding Aegis (aegis heal + shield), hanuman Mountain-Leap Sunder (leap + splash).
- Availability requires Legend tier plus hero active/lingering plus a distinct active partner (player preferred, first-other-active fallback); reasons ok/unknown/not_legend/hero_inactive/no_partner.
- Potency scales with the hero role stat (incl. tier passive on the clone) and weapon level (15%/level); unarmed heroes get the base effect only; garbage inputs degrade to base, never NaN.
- Execution runs on battle clones via existing performAttack/applyBuff primitives only; using a combo consumes the partner's upcoming turn exactly once (flag deleted on skip); the hero's turn is consumed by the caller advancing.
- combo_* unlock flags are exactly-once (first/replay), round-trip through save/load, heal crafted/unknown values while unrelated flags stay verbatim.
- Scene surfacing adds no visual layer: one gold Duo button only when able, 1-2 log-band lines + one Toast; failure is one plain line with no consumption.

## Readability verdict: COMMIT ALL FIVE
| Combo | Bands used | Flair | Verdict |
|-------|-----------|-------|---------|
| Gandiva Twin Strike (arjuna) | log + Toast | none beyond lines | COMMIT |
| Mountain-Guard Slam (bhima) | log + Toast | none beyond lines | COMMIT |
| Sunburst Volley (karna) | log + Toast | none beyond lines | COMMIT |
| Panchali Warding Aegis (draupadi) | log + Toast | none beyond lines | COMMIT |
| Mountain-Leap Sunder (hanuman) | log + Toast | none beyond lines | COMMIT |

Gate evidence: getCombatLayout band keys remain exactly {header, roster, intent, log, actions, result}; no new `layout.*` access; Phase 14 readability contracts pass unmodified; no combo path touches reaction/result bands or adds animation. No cuts required.

## Browser evidence
Deferred debt (same precedent as Phases 22-24): automated contracts green (294/294 + UI invariants); live-browser matrix (console silence, probe FPS, duo-button tap flow) pending in the v4.0 browser-evidence backlog.

## Requirements
- AFF-06 (Tier 3 unlocks one signature duo skill per hero): met at contract level — five Legend-gated, build-scaled, both-turns-costed combos with readability verdict recorded.
