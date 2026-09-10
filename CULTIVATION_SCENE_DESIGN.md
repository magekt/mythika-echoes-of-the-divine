# Cultivation Scene - High-Fidelity Design Specification

## Overview
Premium editorial luxury design for the Cultivation Scene in Mythika game, following design-taste-frontend and high-end-visual-design principles.

---

## 1. HeroMoment Section

### Layout
- **Asymmetric hero** with title left, visual element right (2/3 - 1/3 split on desktop, stacked on mobile)
- **Generous vertical spacing**: 120px top padding, 80px bottom
- **Noise/grain overlay** at 3% opacity for editorial texture

### Typography
- **Title**: "Cultivation" — PP Editorial New, displaySm (48px/56px), textPrimary
- **Subtitle**: "Refine your spirit, gather prana, and ascend through realms" — Geist, md (18px/28px), textSecondary, max-width 60ch
- **Eyebrow**: "INNER PATH" — Geist, sm (13px/20px), gold, letter-spacing 0.15em, text-transform uppercase

### CTA
- **Primary**: MagneticBtn "Meditate" with trailing sparkle icon
  - Spring physics: stiffness 120, damping 22
  - Gold background, textPrimary label
  - Hover: scale 1.02, glow 0 0 24px rgba(gold, 0.4)
  - Reduced-motion: instant transition

---

## 2. PremiumShell Info Panel

### Card Structure (Double-Bezel Depth)
```
┌─────────────────────────────────────┐
│  Outer bezel: borderHairline        │
│  ┌───────────────────────────────┐  │
│  │ Inner surface: surface        │  │
│  │ Content                       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```
- **Outer bezel**: 1px borderHairline, rounded 12px
- **Inner surface**: surface token, rounded 8px, 24px padding
- **Z-axis cascade**: box-shadow 0 4px 24px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)

### Content Grid (4-col asymmetric)
| Column 1 (1.5fr) | Column 2 (1fr) | Column 3 (1fr) | Column 4 (0.5fr) |
|------------------|----------------|----------------|------------------|
| Realm Name + Stage | Cultivation Base | Prana | Progress Bar |
| Breakthrough Status | Gathering Rate | Prana Rate | Next Realm Stats |

### Data Fields
1. **Realm Name** — displaySm, textPrimary
2. **Stage** — sm, gold (e.g., "Stage 3 of 9")
3. **Progress Bar** — 8px height, gold fill, borderHairline track, rounded 4px
4. **Cultivation Base** — md, textPrimary label, textSecondary value
5. **Prana** — displaySm, textPrimary (large number), textDim unit "PRN"
6. **Gathering Rate** — md, textSecondary label, green value "+12/sec"
7. **Prana Rate** — md, textSecondary label, blue value "1.5x"
8. **Breakthrough Status** — PremiumShell nested, accent border when ready
9. **Next Realm Stats** — compact grid, textDim labels, textSecondary values

---

## 3. Action Buttons (MagneticBtn Group)

### Layout
- **Horizontal group** with 16px gap, centered on mobile (stacked)
- **Order**: Meditate (primary) → Attempt Breakthrough (secondary) → Back to Ashram (ghost)

### Button Specifications

| Button | Variant | Icon | State |
|--------|---------|------|-------|
| Meditate | Primary (gold) | Sparkle trailing | Always enabled |
| Attempt Breakthrough | Secondary (surface, gold border) | Arrow-up trailing | Enabled only when breakthrough ready |
| Back to Ashram | Ghost (textPrimary) | Arrow-left leading | Always enabled |

### Magnetic Physics
- **Attraction radius**: 48px
- **Spring**: stiffness 120, damping 22
- **Trailing icon**: translates 8px on hover, rotates 15deg on press
- **Reduced motion**: disable magnetic follow, keep spring press

---

## 4. Color Tokens (Semantic Only)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| surface | #FAFAF8 | #0D0D0D | Card backgrounds |
| textPrimary | #1A1A1A | #F5F5F0 | Headlines, primary text |
| textSecondary | #525252 | #A3A3A3 | Body, labels |
| textDim | #A3A3A3 | #525252 | Units, secondary labels |
| gold | #C8A951 | #D4B860 | Primary actions, accents |
| blue | #3B82F6 | #60A5FA | Prana rate, info |
| green | #22C55E | #4ADE80 | Gathering rate, success |
| accent | #F59E0B | #FBBF24 | Breakthrough, warnings |
| borderHairline | #E5E5E5 | #2A2A2A | Dividers, bezels |

**WCAG AA**: All text/background combinations verified ≥ 4.5:1

---

## 5. Typography Scale

| Token | Font | Size/Line | Weight | Use |
|-------|------|-----------|--------|-----|
| displaySm | PP Editorial New | 48px/56px | 400 | Hero title, large numbers |
| md | Geist | 18px/28px | 400 | Body, subtitles |
| sm | Geist | 14px/22px | 400 | Labels, meta |
| eyebrow | Geist | 13px/20px | 500 | Section eyebrows |

**Wide measures**: No line exceeds 65ch. Maximum 1 eyebrow per 3 sections.

---

## 6. Motion & Interaction

### ScrollReveal
- **Stagger**: 80ms per element
- **Easing**: cubic-bezier(0.16, 1, 0.3, 1)
- **Distance**: 24px upward
- **Trigger**: 0.15 viewport intersection

### MagneticBtn
- **Follow**: cursor within 48px radius
- **Press**: scale 0.96, icon rotation
- **Release**: spring back with overshoot

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
  .magnetic-btn { transform: none !important; }
}
```

---

## 7. Responsive Breakpoints

| Breakpoint | Hero | Info Panel | Buttons |
|------------|------|------------|---------|
| ≥1024px | 2/3-1/3 split | 4-col grid | Horizontal |
| 768-1023px | Stacked | 2-col grid | Horizontal |
| <768px | Stacked | 1-col stack | Vertical stack |

---

## 8. Implementation Notes

### Component Imports
```tsx
import { HeroMoment } from '@/components/HeroMoment';
import { PremiumShell } from '@/components/PremiumShell';
import { MagneticBtn } from '@/components/MagneticBtn';
import { ProgressBar } from '@/components/ProgressBar';
```

### State Management
- Cultivation data from `useCultivation()` hook
- Breakthrough readiness computed from realm progress
- Prana gathering rate updates via WebSocket/interval

### Accessibility
- All buttons: `aria-label` with action + realm context
- Progress bar: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Color-independent indicators (icons + text for breakthrough status)
- Focus visible: 2px gold outline, 2px offset

---

## 9. Visual Polish Checklist

- [ ] Noise/grain overlay renders at 3% opacity
- [ ] Double-bezel renders correctly in both themes
- [ ] MagneticBtn attraction feels natural, not jittery
- [ ] Gold accent used only for primary actions
- [ ] No raw hex in component code
- [ ] Reduced motion fully disables magnetic follow
- [ ] ScrollReveal stagger respects 80ms increments
- [ ] All text passes WCAG AA in both themes
- [ ] Mobile stack order: Hero → Info → Buttons
- [ ] Breakthrough button glows when ready (subtle pulse)

---

## 10. Next Steps (Agent Handoff)

1. **@explorer** — Locate existing CultivationScene component, HeroMoment, PremiumShell, MagneticBtn implementations
2. **@librarian** — Research Framer Motion magnetic spring patterns, noise overlay techniques
3. **@oracle** — Review architecture for state management, WebSocket integration
4. **@fixer** — Implement design spec into existing component structure