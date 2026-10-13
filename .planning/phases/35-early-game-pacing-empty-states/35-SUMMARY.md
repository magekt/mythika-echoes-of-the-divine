# Phase 35 — 35-02: Explanatory Empty-State Panels

## Status: Implemented

Added an explanatory empty-state panel to each of 4 screens, telling the player
what action populates that screen. Each panel is a simple immediate-mode render
drawn when the relevant list/array is empty, using `R.colors` / `R.fonts` for
consistent styling. No new files created — the 4 existing scene files were modified.

## Changes

### `src/scenes/party.js`
In `buildList()`, after the "My Party" section header, when `G.state.party` is
empty a panel is pushed to `this.data.buttons` (the list `list` render iterates):
- Title: "No companions yet"
- Hint: "Explore zones to recruit heroes."

### `src/scenes/alchemyScene.js`
In `buildButtons()`, when `AlchemySystem.getLearnedRecipes()` returns no recipes,
the previous two bare `textDim` lines were replaced with a `render` static-draw
panel pushed to `SD` (staticDraws, drawn by `Scene.drawStatic`):
- Title: "No potions yet"
- Hint: "Visit the Bazaar to buy ingredients."

### `src/scenes/spiritBeast.js`
In `buildList()`, when `this.data.beasts` is empty, the previous two bare
`textDim` lines were replaced with a `render` static-draw panel:
- Title: "No spirit beasts yet"
- Hint: "Complete early-game missions to unlock."

### `src/scenes/questLog.js`
In `buildList()`, when there are neither active nor claimable quest chains, a
`render` static-draw panel is pushed to `SD` before the chain sections:
- Title: "No active quests"
- Hint: "Talk to NPCs in the village to find quests."

## Implementation Notes
- Each panel draws an `R.roundRect` panel background + hairline border, a gold
  `R.fonts.md` title, and a `R.colors.textSecondary` `R.fonts.sm` hint, centered.
- party.js uses its `buttons` array (list render calls `b.render(ctx)`);
  alchemy/spiritBeast/questLog use their `staticDraws` arrays via
  `Scene.drawStatic` (which supports `{ render: fn }` entries, same pattern as
  forge.js/party.js detail views).
- Content height / scroll offsets were advanced by the panel so the rest of the
  list and the back button land below it.

## Verification
- `node --check` passed on all 4 modified scene files.
- Pre-existing, unrelated failures observed (not caused by these changes):
  - `src/engine/scene-helpers.js` has a pre-existing syntax error (stray `})();`
    at line 435 closes the IIFE early, leaving `Scene.toastLane` dangling).
    Present on the clean tree before this change.
  - `tools/combat_sim_combined.js` / `tests/combat_sim_early.test.js` failures
    are from another in-flight session's untracked tooling changes.

## Requirements
- BAL-03: satisfied — each of the 4 screens now names the populating action or
  unlock in an explanatory empty-state panel.
