# Travel Map — Mobile Zone Selection

## Target and hierarchy

The Travel Map is a mobile-first route selection surface. Realm headers establish grouping, zone cards communicate availability at a glance, and the selected-zone panel places exploration actions after the zone context.

## Zone card states

- **Available:** `surface` fill, accent border, progress, required level, and “Ready to explore”.
- **Current path:** available styling with a stronger border and current-path label.
- **Complete:** success border/state and “Path cleared”.
- **Locked:** elevated/dim surface, warning state, required level, and the exact prerequisite zone when one exists.

Cards use two columns on the 400px logical mobile canvas, with 112px height so names, progress, state, and lock requirements remain separate and readable. A single-zone realm uses the full width.

## Selected-zone actions

The selected zone uses a double-bezel info panel with state, description, progress, level requirement, and enemies. Explore, Fight Boss, and Back to Zones are separate vertical controls with 48px heights and clear spacing. Locked selections keep Explore and Fight Boss visible but disabled, with the requirement shown in the info panel. Existing callbacks and access calculations remain unchanged.

## Tokens and motion

Visual states use semantic `R.colors` tokens for surface, accent, success, warning, danger, text, and borders. No new animation is introduced; existing button press feedback and reduced-motion behavior remain in effect.
