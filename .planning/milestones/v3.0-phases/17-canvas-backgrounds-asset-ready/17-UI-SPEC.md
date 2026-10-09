---
phase: 17
slug: canvas-backgrounds-asset-ready
status: draft
shadcn_initialized: false
preset: none
created: 2026-10-08
---

# Phase 17 — UI Design Contract

> Visual and interaction contract for Phase 17: Canvas Backgrounds & Asset-Ready Presentation.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (vanilla Canvas) |
| Preset | not applicable |
| Component library | custom immediate-mode Canvas (R, UI namespaces) |
| Icon library | Unicode emoji + custom pixel glyphs |
| Font | Geist (sans), PP Editorial New (display serif) |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Slot gaps, fallback padding |
| sm | 8px | Character moment margins |
| md | 16px | Background safe zone padding |
| lg | 24px | Crossfade overlap zone |
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
| Dominant (60%) | #1a1a30 (R.colors.surface) | Fallback backgrounds |
| Secondary (30%) | #222240 (R.colors.surfaceElevated) | Character moment panels |
| Accent (10%) | #e8a030 (R.colors.gold) | Loaded asset indicators |
| Overlay | rgba(26,26,48,0.85) (R.colors.surfaceGlass) | Contrast preservation over backgrounds |

Backgrounds rendered with `globalCompositeOperation: 'destination-over'` or darken blend; text always renders on top with `textPrimary`/`textSecondary`.

---

## Background Slot Contract

| Slot Key | Fallback | Safe Zone | Character Moment |
|----------|----------|-----------|------------------|
| `realm:{id}` | Realm gradient (primary→secondary color) | Top 30% | Realm guardian silhouette |
| `zone:{id}` | Zone biome gradient | Top 25%, side gutters | Zone landmark silhouette |
| `combat:{enemyType}` | Enemy type gradient (red/orange/blue) | Top 20%, bottom 15% | Enemy silhouette (large) |
| `cultivation:{realm}` | Realm gradient + particle field | Top 30% | Hero meditation pose |
| `ashram` | Warm gold gradient | Top 20% | Ashram architecture |
| `map:{region}` | Region biome gradient | Full (behind markers) | Region overview art |

---

## Asset Loading Behavior

| State | Visual | Duration |
|-------|--------|----------|
| Cache hit | Authored image | Instant |
| Cache miss | Procedural fallback | Instant |
| Loading | Fallback + subtle shimmer (reduced motion: none) | Until load or 2s timeout |
| Load success | Crossfade fallback → authored | 300ms (reduced motion: 0ms) |
| Load fail/timeout | Fallback persists | Permanent until retry |

---

## Character Moment Contract

| Context | Position | Size | Reduced Motion |
|---------|----------|------|----------------|
| Combat result (hero) | Right gutter, vertical center | 80×120px | Static |
| Cultivation (hero) | Left gutter, below realm | 60×100px | Static |
| Party detail (hero) | Background, low opacity | 120×180px | Static |
| Combat (enemy) | Center-top, behind intent band | 100×100px | Static |

---

## Responsive Behavior

| Viewport | Background Scale | Character Moment | Safe Zones |
|----------|------------------|------------------|------------|
| 400×720 portrait | CSS container scale | Proportional | Header 62px, footer 44px |
| 540×900 large portrait | CSS container scale | Proportional | Header 62px, footer 44px |
| 720×400 landscape | CSS container scale | Side gutters | Header 62px, footer 44px |
| 1024×768 narrow desktop | CSS container scale | Side panels | Header 62px, footer 44px |
| 1440×900 wide desktop | CSS container scale | Side panels | Header 62px, footer 44px |

---

## Accessibility & Motion

- `R.reducedMotion()` checked before: crossfade, shimmer, parallax, particle drift
- Reduced motion: instant swap, static fallback, no particle animation
- Contrast: `surfaceGlass` overlay ensures WCAG AA on all backgrounds
- No background motion that could trigger vestibular issues

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| custom R/UI | R.backgroundCache, procedural fallbacks | source review |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending