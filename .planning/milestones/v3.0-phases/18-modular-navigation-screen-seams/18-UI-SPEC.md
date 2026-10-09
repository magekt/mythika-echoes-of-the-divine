---
phase: 18
slug: modular-navigation-screen-seams
status: draft
shadcn_initialized: false
preset: none
created: 2026-10-08
---

# Phase 18 — UI Design Contract

> Visual and interaction contract for Phase 18: Modular Navigation & Screen Seams.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (vanilla Canvas) |
| Preset | not applicable |
| Component library | custom immediate-mode Canvas (Scene, UI, Navigation namespaces) |
| Icon library | Unicode emoji + custom pixel glyphs |
| Font | Geist (sans), PP Editorial New (display serif) |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Transition overlay gaps |
| sm | 8px | Loading indicator padding |
| md | 16px | Transition panel margins |
| lg | 24px | — |
| xl | 32px | — |
| 2xl | 48px | — |
| 3xl | 64px | — |

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 12px (R.fonts.md) | 400 | 1.4 |
| Label | 10px (R.fonts.sm) | 500 | 1.3 |
| Heading | 16px (R.fonts.lg) | 600 | 1.3 |
| Display | 18px (R.fonts.displaySm) | 400 | 1.3 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #1a1a30 (R.colors.surface) | Transition overlay |
| Secondary (30%) | #222240 (R.colors.surfaceElevated) | Loading panel |
| Accent (10%) | #e8a030 (R.colors.gold) | Progress indicator |
| Overlay | rgba(0,0,0,0.6) (R.colors.overlayDark) | Transition fade |

---

## Navigation Contract

### Route IDs (Canonical)
| Route ID | Params | Legacy Alias |
|----------|--------|--------------|
| `ashram` | `{ restoreScroll?: boolean }` | `ashramScene` |
| `travelMap` | `{ regionId?: string, selectedEvent?: string }` | `travelMapScene` |
| `zoneExploration` | `{ zoneId: string, journeyId?: string }` | `zoneExplorationScene` |
| `combat` | `{ encounterId: string, encounterType?: string }` | `combatScene` |
| `party` | `{ selectedHeroId?: string }` | `partyScene` |
| `equipment` | `{ selectedHeroId?: string, tab?: string }` | `equipmentScene` |
| `cultivation` | — | `cultivationScene` |
| `settings` | `{ section?: string }` | `settingsScene` |

### Transition Flow
```
Fade Out (150ms) → Cleanup From (leave()) → Init To (enter()) → Fade In (150ms)
```
- Reduced motion: 0ms fade, instant cleanup/init
- Total transition budget: ≤ 500ms (including init)
- Failure → Fade Out → Ashram fallback → Notify error

### Context Schema (Per Screen)
Each migrated screen declares:
```js
contextSchema: {
  // Derived presentation data only
  partySummary: 'PartySummary[]',
  zoneStatus: 'ZoneStatus',
  heroSurfaceModel: 'HeroSurfaceModel',
  // ...
}
commandSchema: {
  // Canonical system calls only
  equip: 'EquipmentSystem.equip',
  startCombat: 'Combat.start',
  meditate: 'CultivationSystem.addCultivationBase',
  // ...
}
```

---

## Loading/Error States

| State | Visual | Behavior |
|-------|--------|----------|
| Transition | Fade overlay + gold progress ring | Non-blocking, cancellable |
| Init failure | Ashram + Notify "Destination unavailable" | Auto-recover |
| Missing params | Derive from G.state + Notify "Restoring context" | Silent recovery |
| System unavailable | Disabled actions + Phase 16 blocker tooltip | Graceful degradation |

---

## Responsive Behavior

| Viewport | Transition | Loading Indicator |
|----------|------------|-------------------|
| 400×720 portrait | Full-screen fade | Centered 48px ring |
| 540×900 large portrait | Full-screen fade | Centered 48px ring |
| 720×400 landscape | Full-screen fade | Centered 48px ring |
| 1024×768 narrow desktop | Full-screen fade | Centered 48px ring |
| 1440×900 wide desktop | Full-screen fade | Centered 48px ring |

---

## Accessibility & Motion

- `R.reducedMotion()` → 0ms fade, instant cleanup/init
- Loading ring respects reduced motion (static segments)
- Keyboard: Esc cancels transition (returns to previous screen)
- Screen reader: Transition announced via Notify

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| custom Navigation | Navigation.go, Scene.transition, compatibility layer | source review |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending