# Punarjanma — Rebirth Decision Surface

## Target and user

This is the mobile-first rebirth decision screen for players deciding whether to spend Punya Karma and reset party progression. The player should understand the trade-off before tapping the commit action.

## Hierarchy

1. **Rebirth Preview** — current cycle, party level, entry cost, and readiness.
2. **What you gain** — permanent stat bonuses, return rewards, and Siddhi progression.
3. **What resets** — level/XP reset, Karma cost, and irreversible warning.
4. **Requirements** — explicit Level 30 and 10 Karma checks.
5. **Seek Moksha** — one full-width, 48px primary action after the summary.

The content remains inside the existing clipped scroll region. PremiumShell panels separate the decision groups without changing any rebirth calculations.

## Tokens and states

- Panels use `surfaceElevated`, `panel`, `borderHairline`, and `subtleWhite`.
- Benefits use `green`; consequences and irreversible copy use `danger`.
- Disabled eligibility remains handled by the shared button component.
- Confirmation uses separated Cancel and Confirm controls, each 48px tall.

## Confirmation and motion

The confirmation dialog repeats the three key consequences in short lines. Its callback and result values remain unchanged. Existing modal enter/exit motion and reduced-motion handling remain in force; no new scene animation is introduced.
