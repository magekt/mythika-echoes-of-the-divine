# 22-02 Summary: Affinity Meter + Recruit Seeding

## Objective
Visible half of AFF-01: affinity meter + tier on HeroSurface (D-01, D-03).

## Changes
- `src/ui/heroSurface.js` — `getModel` now returns an `affinity` view-model (`{value, tier, visible, ratio}`) via a guarded `BondSystem.get(model.id)` lookup with a hidden safe default; read-only, shared by compact and detail. `_render` draws a 5px thin meter (inner width `w-24`, `R.radius.xs`, `R.colors.borderHairline` track) plus an `R.fonts.xs` tier line (`"<Tier> <value>/100"`) below existing HP/MP (compact) / XP (detail) lines when `visible`; hidden heroes emit no extra calls and take no extra height. Tier fills use semantic tokens only (Wary `textDim`, Trusted `info`, Sworn `success`, Legend `gold`); no animation, no raw hex.
- `src/scenes/party.js` — `recruitHero` calls guarded `BondSystem.ensureSeed(hid)` immediately after `G.state.party.push`, seeding 0/Wary per D-03 without crashing when BondSystem is absent.
- `tests/hero_affinity_display.test.js` (new) — vm-sandbox display suite: recruited model, hidden model, BondSystem-absent default, visible meter + tier draw calls with semantic-color check, hidden zero-extra-draw check, recruit seed call-site + contract seeding.

## Verification
- `node --check src/ui/heroSurface.js` — pass
- `node --test tests/hero_affinity_display.test.js tests/bond_affinity.test.js` — 12/12 pass

## Notes
- Meter geometry is compact-safe (compact bar at y+64, detail at y+80 below the XP line); existing text coordinates untouched.
