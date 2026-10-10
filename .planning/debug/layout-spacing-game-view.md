---
status: investigating
trigger: "The Screens work as intended but the UI is not clean. Add better Console logs. Game view gives issues. Layout or spacing."
created: 2026-09-20
updated: 2026-09-20
---

# Debug Session: layout-spacing-game-view

## Symptoms

- Expected: Screens work as intended, with a clean UI.
- Actual: Game view has layout or spacing issues; exact visual symptom not yet specified.
- Errors: No known error messages; user requested better console logs.
- Timeline: Always present.
- Reproduction: Open the game view.

## Current Focus

- hypothesis: Layout or spacing inconsistency in the game view causes the UI to feel unclean.
- test: Inspect game-view scene layout, shared UI geometry, scaling, and clipping paths; identify reproducible layout symptoms and missing diagnostic logging.
- expecting: One or more concrete layout/spacing causes supported by source evidence or browser reproduction.
- next_action: validate the overlap hypothesis in the reaction window and apply the smallest safe layout fix

## Evidence

- timestamp: 2026-09-20T00:00:00Z
  source: src/scenes/combatScene.js:881-1122
  finding: Combat view uses a fixed action area top of 248px, clips at that boundary, and positions the fixed combat log immediately above it. Enemy intent occupies y=184..238, leaving only a 10px gap before the action clip begins.
  interpretation: Source contains layout constants that could produce crowding on the combat/game view, but no concrete visual symptom or viewport dimensions are available to establish that this is the reported defect.

- timestamp: 2026-09-20T00:00:01Z
  source: src/scenes/combatScene.js:1023-1120
  finding: Action content is translated by top - 6 - scrollY and rendered inside a clip beginning at top - 4; scrollbar calculations use a different content-height formula than the rendered action content.
  interpretation: This is a candidate spacing/scroll discrepancy, but it cannot be safely changed without reproducing the actual overlap, clipping, or excess-gap symptom.

- timestamp: 2026-09-20T00:00:02Z
  source: src/scenes/combatScene.js:1064-1067
  finding: The current source explicitly defines the visible action-button list after documenting a previously undefined `vis` render failure.
  interpretation: No current evidence supports adding console logging or changing this area solely from the report.

- timestamp: 2026-09-20T00:00:03Z
  source: user clarification + src/scenes/combatScene.js:996-1021
  finding: User identified overlap. During `reactionWindow`, the incoming-attack panel occupies y=184..238, while the fixed combat log begins at y=170 and renders up to four 24px rows at 18px spacing, directly overlapping that panel.
  interpretation: Concrete source-supported root cause for the reported overlap.

## Eliminated

## Resolution

- root_cause: The fixed combat log renders in the same y=170..248 band as the reaction-window incoming-attack panel at y=184..238, causing visual overlap.
- fix: Suppress the fixed combat log while the reaction-window panel is visible; the reaction panel remains readable and the log remains available in other combat states.
- cycles: 1 investigation + 1 fix
- next_action: Open a reaction-window combat state and verify the incoming panel has no log text drawn over it; verify normal combat still shows the fixed log.
