# 24-01 Summary: BondSystem Combat-Bonus Contract

## Objective
Create the BondSystem tier-passive, role-stat, synergy-tag, adjacency, and linger-one-battle contract (AFF-04/AFF-05 rules half).

## Changes
- `src/systems/bond.js` (extended, no existing function touched): `ROLE_STAT` (arjuna str, bhima def, karna str, draupadi mag, hanuman agi, unknown -> str), `PASSIVE_BY_TIER` (Wary 0 / Trusted 1 / Sworn 2 / Legend 4, non-cumulative), `SYNERGY` (one tag per hero: arjuna crit+5, bhima intercept 15%, karna burst +8%, draupadi ward +10% heal, hanuman swiftness +2 agi; all minTier Sworn), `passiveFor`, `roleStatFor`, `synergyFor` (Sworn+ only, returns a copy), `adjacentToPlayer` (pure index-distance-1), `_lingerKey`/`isLingering`/`isCombatEligible` (active OR lingering), `setActive` (canonical bench/return writer: bench with passive>0 sets linger, Wary bench sets none, return clears), `combatBonusFor` (single read: synergy only when eligible + adjacent + Sworn+), `consumeLingerAfterBattle` (clears all true linger flags, returns count), `normalizeLinger` (keeps only true known-hero linger flags, other keys verbatim, proto-safe). All never-throw, no R/UI dependency.
- `tests/combat_bonds.test.js` (new): 18-case vm-sandbox suite for passive table/boundaries, role stats, one-tag-per-hero + gating + copy isolation, adjacency, combatBonusFor shapes, full linger lifecycle, normalizeLinger healing, hostile keys.

## Verification
- `node --check src/systems/bond.js` — pass
- `node --test tests/combat_bonds.test.js` — 18/18 pass
- `git diff --check` — clean

## Notes
- vm cross-realm `deepStrictEqual` needs JSON host copies (same convention as bond_affinity tests); suite uses a `host()` helper.
- Combat, scenes, save, and HeroSurface are untouched — Plans 02-03 consume this contract.
