# Phase 24 Verification: Combat Bonds

## Plan verifies
- 24-01: `node --check src/systems/bond.js` + `node --test tests/combat_bonds.test.js` — 18 pass (passive table, role stats, one-tag synergy + gating + copy isolation, adjacency, combatBonusFor shapes, linger lifecycle, normalizeLinger healing, hostile keys).
- 24-02: `node --check` (combat.js, combatScene.js, party.js, heroSurface.js) + `node --test tests/combat_readability.test.js tests/combat_bonds.test.js tests/hero_affinity_display.test.js tests/hero_surface.test.js tests/character_party_integration.test.js tests/combat_browser_matrix.test.js` — 28 pass.
- 24-03: `node --check src/systems/save.js` + `node --test tests/save_coherence.test.js tests/affinity_persistence.test.js tests/bond_matrix.test.js` — 23 pass; matrix extended to 31 cases; `node --test tests/*.test.js` + `tools/check_ui_invariants.sh` + `git diff --check` — green.

## Final results (2026-10-09)
- `node --test tests/*.test.js`: 272 pass, 0 fail.
- `tools/check_ui_invariants.sh`: 93 files syntax-checked, 20 system scripts, all checks passed.
- `git diff --check`: clean.

## Contract truths confirmed
- Tier passive is DAO-style non-cumulative (+1 Trusted, +2 Sworn, +4 Legend) applied to the hero's single role stat (arjuna str, bhima def, karna str, draupadi mag, hanuman agi) on battle clones only, active party or lingering.
- Each hero grants exactly one synergy tag at Sworn+ and only when adjacent to the player in party order (arjuna crit+5, bhima intercept 15%, karna burst +8%, draupadi ward +10% heal, hanuman swiftness +2 agi); non-adjacent keeps the passive with no tag.
- Benching via the party surface sets the linger flag (Wary benches set none); bonuses persist for the next completed battle (win or loss consumes), then drop; returning clears the flag.
- Applied bonuses surface as combat log lines + one entry Toast; linger expiry fires a dim fade Toast; HeroSurface shows an additive bond line only when eligible with passive.
- Linger flags round-trip through save/load; legacy saves heal to off-by-default; malformed linger values heal while quest flags stay verbatim.
- Phase 14 combat authority contracts pass unchanged (layout bands, reaction/result branches, 44px targets, reduced-motion guard, all authoritative calls, origin-aware continuation, no console.log).
