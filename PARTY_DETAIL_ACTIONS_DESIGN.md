# Party Detail Actions — UI Design Specification

## Target surface and users

The target is the mobile-first **Party → hero detail** view. It is used by players managing one hero at a time, usually with one hand, while reviewing stats and making a quick equipment or consumable choice.

## Layout and hierarchy

- Keep the existing scene header and clipped canvas content region.
- Present the hero summary as a double-bezel information panel.
- Reserve a separate double-bezel **Actions** panel below the summary so controls never compete with stats or equipment text.
- Stack actions vertically with a 48px control height and 10px rhythm:
  1. Use Item — primary gold action.
  2. Equip Weapon — elevated surface secondary action.
  3. Equip Armor — elevated surface secondary action.
  4. Equip Accessory — elevated surface secondary action.
  5. Back to Party — quiet surface navigation action.
- Use 20px side insets for controls, preserving a generous tap corridor on the 400px logical canvas.
- Allow the detail view to scroll naturally when skills/passives make the content taller than the viewport.

## Token and typography use

- Panels: `R.colors.surface`, `R.colors.surfaceElevated`, `R.colors.panel`.
- Primary accent: `R.colors.btnGold`, `R.colors.accent`, and `R.colors.orangeLight` for pressed feedback.
- Secondary text: `R.colors.textPrimary`, `R.colors.textSecondary`, and `R.colors.textDim`.
- Separation: `R.colors.borderHairline` and `R.colors.subtleWhite`.
- Controls use the existing Geist button scale; hero headings retain the existing gold/editorial treatment.
- No component-level raw color literals.

## States

- **Default:** primary action is gold; secondary actions are elevated surfaces with a hairline.
- **Pressed:** existing button press feedback remains active; secondary controls receive a stronger accent outline.
- **Unavailable:** preserve the existing `UI.Button` enabled/disabled behavior.
- **Scrolled:** action hitboxes and rendering remain in the scene's existing translated coordinate system.
- **Reduced motion:** no new animation is introduced; existing button feedback remains governed by the shared UI component rules.

## Interaction and accessibility

- Every action is at least 48px high, exceeding the 44px touch-target minimum.
- The full button width is tappable, not only the label.
- Existing action callbacks are unchanged: item use, weapon/armor/accessory selection, and return to party retain their current behavior.
- The detail info height is derived from the same row rhythm used by its renderer, preventing controls from overlapping variable skill/passive content.

## Motion notes

This surface is a high-frequency management flow, so motion stays restrained. Existing shared press feedback is retained, while layout and scroll transitions remain immediate and reduced-motion safe.
