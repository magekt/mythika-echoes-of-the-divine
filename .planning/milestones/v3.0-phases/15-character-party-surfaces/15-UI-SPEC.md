---
phase: 15
slug: character-party-surfaces
status: draft
shadcn_initialized: false
preset: none
created: 2026-10-08
---

# Phase 15 — UI Design Contract

> Visual and interaction contract for Phase 15: Character & Party Surfaces. Generated for the Mythika: Echoes of the Divine vanilla Canvas game.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (vanilla Canvas) |
| Preset | not applicable |
| Component library | custom immediate-mode Canvas (UI namespace) |
| Icon library | Unicode emoji + custom pixel glyphs |
| Font | Geist (sans), PP Editorial New (display serif) |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding, status chips |
| sm | 8px | Compact element spacing, equipment slot gaps |
| md | 16px | Default element spacing, panel internal padding |
| lg | 24px | Section padding, card margins |
| xl | 32px | Layout gaps between major regions |
| 2xl | 48px | Major section breaks, screen transitions |
| 3xl | 64px | Page-level spacing (unused in 400×720 canvas) |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 12px (R.fonts.md) | 400 | 1.4 |
| Label | 10px (R.fonts.sm) | 500 | 1.3 |
| Heading | 16px (R.fonts.lg) | 600 | 1.3 |
| Display | 18px (R.fonts.displaySm) | 400 | 1.3 |

All sizes scale with `R.fontScale` (1 / 1.15 / 1.3) for accessibility.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #1a1a30 (R.colors.surface) | Background panels, surfaces |
| Secondary (30%) | #222240 (R.colors.surfaceElevated) | Elevated cards, detail panels |
| Accent (10%) | #e8a030 (R.colors.gold/accent) | Primary actions, progression highlights, role badges |
| Destructive | #c83030 (R.colors.danger) | Remove/unequip actions, ailment indicators |

Accent reserved for: next-action buttons, XP/progression bars, role indicators, equipped item highlights

Semantic tokens used:
- `textPrimary` (#e8e0d0) — hero name, primary stats
- `textSecondary` (#98a0b8) — labels, secondary info
- `textMuted` (#6a7088) — disabled, placeholder text
- `hp` (#c83030) — health values
- `mp` (#3080c8) — mana values
- `exp` (#30c830) — XP/progression
- `success` (#30c830) — positive status
- `warning` (#e8a030) — attention states
- `info` (#3080c8) — cultivation/mana
- `borderHairline` (rgba(232,160,48,0.12)) — panel borders
- `borderFocus` (rgba(232,160,48,0.6)) — focus/selection rings

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (Party) | "Inspect" → "Equip" → "Cultivate" |
| Primary CTA (Equipment) | "Equip" / "Unequip" / "Compare" |
| Primary CTA (Cultivation) | "Meditate" / "Break Through" |
| Primary CTA (Combat) | "Attack" / "Skill" / "Defend" / "Item" |
| Primary CTA (Result) | "Continue" / "Return to Ashram" |
| Empty state heading (Party) | "No heroes in party" |
| Empty state body (Party) | "Recruit heroes at the Ashram to begin your journey" |
| Empty state heading (Equipment) | "No equipment" |
| Empty state body (Equipment) | "Defeat enemies or visit the Forge to acquire gear" |
| Error state | "Action unavailable: {reason}. {next step}" |
| Destructive confirmation | "Unequip {item}? This cannot be undone." |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| custom UI namespace | Button, ProgressBar, PremiumShell, Text, Card, Modal | source review |

---

## Hero Surface Variants

### Compact (Roster/Combat)
- Height: 48px minimum touch target
- Shows: Role badge (8px), Name, HP/MP bars (compact), Level
- Touch: Tap to select/inspect
- Reduced motion: Static bars, no spring

### Standard (Party Detail / Equipment / Cultivation)
- Height: ~120-160px panel
- Shows: Role badge, Name, Level/XP bar, HP/MP bars, 3 equipment slots (weapon/armor/accessory), Status summary, Next action button (48px)
- Layout: Identity left, stats center, equipment right, action bottom
- Touch: Scrollable list, tap equipment to inspect
- Reduced motion: No panel entry animation

### Result/Readout (Combat Result Band)
- Height: ~60px integrated into Phase 14 result band
- Shows: Name, Role, Level change, HP/MP current, Key reward
- Placement: Below reward text, above continuation button
- No overlap with action/intent/log/result bands
- Touch: Tap for full detail (navigates to party)

---

## Responsive Behavior

| Viewport | Compact | Standard | Result |
|----------|---------|----------|--------|
| 400×720 (portrait) | 1-col, 48px rows | Full panel, stacked equipment | Inline in result band |
| 540×900 (large portrait) | 1-col, 52px rows | Full panel, side-by-side equipment | Inline in result band |
| 720×400 (landscape) | 2-col grid | Side-by-side panels | Inline in result band |
| 1024×768 (narrow desktop) | 3-col grid | Side-by-side with detail | Inline in result band |
| 1440×900 (wide desktop) | 4-col grid | Multi-panel layout | Inline in result band |

Safe areas: Respect CSS `env(safe-area-inset-*)` via container scaling
Hit testing: Logical 400×720 coordinates, CSS transforms handled by container

---

## Accessibility & Motion

- `R.reducedMotion()` checked before all decorative animations
- 44-48px minimum touch targets on all interactive elements
- Color contrast: WCAG AA minimum on all text/status combinations
- Keyboard: Tab/Enter/Space parity with touch for all actions
- Screen reader: Canvas is primary; critical state mirrored in ARIA live region via Notify

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending