---
phase: 16
slug: guidance-progression-feedback
status: draft
shadcn_initialized: false
preset: none
created: 2026-10-08
---

# Phase 16 — UI Design Contract

> Visual and interaction contract for Phase 16: Guidance & Progression Feedback. Generated for the Mythika: Echoes of the Divine vanilla Canvas game.

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
| xs | 4px | Icon gaps, inline padding, badge margins |
| sm | 8px | Compact element spacing, toast gaps |
| md | 16px | Default element spacing, panel internal padding |
| lg | 24px | Section padding, hint margins |
| xl | 32px | Layout gaps |
| 2xl | 48px | Major section breaks, modal margins |
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
| Secondary (30%) | #222240 (R.colors.surfaceElevated) | Elevated cards, hint panels |
| Accent (10%) | #e8a030 (R.colors.gold/accent) | Primary actions, progression highlights, next-step indicators |
| Info | #3080c8 (R.colors.info) | Blockers, requirements, guidance hints |
| Success | #30c830 (R.colors.success) | Confirmations, completed actions |
| Warning | #e8a030 (R.colors.warning) | Attention states, soft blockers |
| Destructive | #c83030 (R.colors.danger) | Irreversible action confirmations |

Accent reserved for: next-action buttons, XP/progression confirmations, "ready" indicators

Semantic tokens used:
- `textPrimary` (#e8e0d0) — primary feedback text
- `textSecondary` (#98a0b8) — labels, secondary info
- `textMuted` (#6a7088) — dismissed/disabled hints
- `info` (#3080c8) — blocker reasons, requirements
- `success` (#30c830) — action confirmations
- `warning` (#e8a030) — attention hints
- `borderHairline` (rgba(232,160,48,0.12)) — panel borders
- `borderFocus` (rgba(232,160,48,0.6)) — focus rings on interactive hints

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Blocker tooltip (zone locked) | "Requires: {requirement}. {next step}" |
| Blocker tooltip (equip failed) | "Cannot equip: {reason}. {alternative}" |
| Blocker tooltip (cultivation gate) | "Breakthrough requires: {reason}. Keep meditating." |
| Action confirmation (combat) | "Victory! +{gold}g · +{xp} XP" |
| Action confirmation (cultivation) | "Meditated: +{amount} cultivation base" |
| Action confirmation (breakthrough) | "Breakthrough! Realm advanced to {realm}" |
| Action confirmation (equip) | "Equipped {item}" |
| Next-step hint (party) | "Next: Equip weapon → Cultivate → Explore" |
| Next-step hint (map) | "Available: {zone} · {action}" |
| Dismissible hint | "Got it" (button) + "Don't show again" (checkbox) |
| Error state | "Action unavailable: {reason}. {recovery step}" |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| custom UI namespace | Toast, InlineHint, ContextualBadge, BlockerTooltip | source review |

---

## Feedback Component Variants

### Toast (Transient Confirmation)
- Position: Top-center, below header (y=62), stacked with 8px gap
- Duration: 2.5s base, 4s for rewards, 1.5s for minor
- Max visible: 3 (older fade out)
- Animation: Slide down + fade in (reduced motion: instant appear)
- Content: Icon + text, gold for rewards, green for success, blue for info
- Dismissible: Swipe/tap to dismiss early

### Inline Hint (Contextual Next-Step)
- Position: Inline in panel, below relevant section, above action buttons
- Height: Auto (min 28px, max 60px)
- Background: `surfaceGlass` with `borderHairline` left accent bar (4px gold)
- Content: Label + actionable next step, dismissible with ✕
- Persistence: Session dismiss + "Don't show again" → `G.state.guidanceDismissed`
- Reduced motion: No slide animation

### Contextual Badge (State Indicator)
- Position: Top-right of relevant panel/card, or inline next to label
- Size: 20×20px minimum, 24×24px comfortable
- Variants: 
  - `ready` — gold star/pulse (reduced motion: static gold)
  - `blocked` — blue lock/info
  - `progress` — green check/progress ring
  - `new` — orange dot/pulse
- Tooltip on hover/long-press: Full blocker reason or progress detail

### Blocker Tooltip (On-Demand Explanation)
- Trigger: Tap/click on disabled action button or lock icon
- Position: Anchored to trigger, flipped to stay on-screen
- Max width: 280px, max height: 120px
- Background: `surfaceElevated`, border `borderFocus`
- Content: Title (reason), body (requirement detail), primary action (if any)
- Dismiss: Tap outside, Esc, or "Got it" button
- Reduced motion: No fade/scale animation

---

## Responsive Behavior

| Viewport | Toast | Inline Hint | Badge | Blocker Tooltip |
|----------|-------|-------------|-------|-----------------|
| 400×720 portrait | Top stack, full width - 28px | Full panel width | Top-right of card | Anchored, flipped |
| 540×900 large portrait | Top stack, full width - 28px | Full panel width | Top-right of card | Anchored, flipped |
| 720×400 landscape | Top stack, centered 320px | Side panel width | Top-right of card | Anchored, flipped |
| 1024×768 narrow desktop | Top-right stack, 300px | Side panel width | Top-right of card | Anchored, flipped |
| 1440×900 wide desktop | Top-right stack, 300px | Side panel width | Top-right of card | Anchored, flipped |

Safe areas: Respect CSS `env(safe-area-inset-*)` via container scaling
Hit testing: Logical 400×720 coordinates

---

## Accessibility & Motion

- `R.reducedMotion()` checked before all decorative animations (toast slide, badge pulse, tooltip scale)
- 44-48px minimum touch targets on all interactive elements (dismiss buttons, "Got it", "Don't show again")
- Color contrast: WCAG AA minimum on all text/background combinations
- Keyboard: Tab to focus hints, Enter/Space to dismiss, Esc to close tooltips
- Screen reader: Critical confirmations mirrored in ARIA live region via `Notify`

---

## Integration Points

| Screen | Feedback Types |
|--------|----------------|
| Party | Inline hint (next equip/cultivate), badge on heroes (ready/blocked), toast on equip/use |
| Equipment | Inline hint (comparison), badge on slots (empty/equipped), blocker tooltip on incompatible, toast on equip/unequip |
| Cultivation | Inline hint (next breakthrough), badge on realm (progress/ready), toast on meditate/breakthrough |
| Combat | Toast on action/result, inline hint (reaction window), Phase 14 bands preserved |
| Travel Map | Badge on zones (event/landmark), inline hint (next zone), toast on discover/resolve |
| Zone Exploration | Toast on encounter/complete, badge on journey, inline hint (next action) |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending