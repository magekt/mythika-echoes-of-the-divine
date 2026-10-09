# 24-02 Summary: Combat Integration + Surfacing + Bench Action

## Objective
Wire combat bonds into battle (AFF-04/AFF-05 player-visible) while Combat keeps full authority and Phase 14 contracts stay green.

## Changes
- `src/systems/combat.js`: `Combat.bondBonuses` (reset per battle) + `Combat.applyBondPassives(heroes)` called in `startBattle` after elite passives, before turn order (swiftness agi sorts correctly); operates on battle clones only, guarded missing-BondSystem -> zero bonuses. Tag hooks: crit -> `bondCritBonus` in critChance, burst -> `bondDmgPct` after gyana block, ward -> `bondHealPct` on heal branch, swiftness -> pre-sort agi bump, intercept -> `bondInterceptPct` via new `Combat._bondInterceptPctFor` (alive protector adjacent to player, hero defenders only) applied in `performAttack` and `performEnemyAbility`. No signature, return-shape, or authority-call changes.
- `src/scenes/combatScene.js`: `enter` pushes one `Bond: <name> +<n> <STAT> (<tier>) [· lingering] [· Synergy: <tag>]` log line per bonus + one gold Toast; `endBattle` top calls `BondSystem.consumeLingerAfterBattle()` (win AND loss) with a dim fade Toast. All guarded try/catch, no console.log, no band/layout edits.
- `src/scenes/party.js`: detail `actionCount` 5 -> 6 + Bench/Return toggle via `BondSystem.setActive` with linger-aware Toasts (`bond lingers one battle` / `bonuses off` / `returns`), detail rebuilt after toggle. List/recruit flows untouched.
- `src/ui/heroSurface.js`: additive `bond` model field (passive/roleStat/synergyTag/lingering/eligible, safe defaults) + one gold bond line in non-compact renders only when eligible with passive>0. Compact cards unchanged.

## Verification
- `node --check` on all four files — pass
- `node --test tests/combat_readability.test.js tests/combat_bonds.test.js tests/hero_affinity_display.test.js tests/hero_surface.test.js tests/character_party_integration.test.js tests/combat_browser_matrix.test.js` — 28/28 pass

## Notes
- Heal-branch ward hook sits inside the existing `attacker.type === 'hero'` branch; behavior identical when no bond fields present (all hooks `|| 0`-guarded).
- Intercept is protector-based (stored on the bhima clone) so benching/death mid-battle degrades naturally via the alive + adjacency re-check per hit.
