# src/ui/

## Responsibility
7 reusable UI component modules — buttons, panels, lists, modals, progress bars, tab bars, text rendering. All components are immediate-mode (render every frame) with internal state for animation/interaction.

## Design Patterns
- **Factory Functions**: `UI.ComponentName(x, y, w, h, ...)` returns object with `render(ctx)`, `update(dt)`, `onClick`, `contains(px, py)`
- **Immediate-Mode with Retained State**: Components hold animation state (`_hovered`, `_pressed`, `_pressTimer`, spring physics) but no DOM
- **Composition over Inheritance**: `UI.MagneticBtn` wraps `UI.BtnGold` which wraps `UI.Button`
- **Variant Pattern**: Components accept `variant` or option objects for styling (primary/secondary/ghost)
- **Global Dependencies**: All components read `R` (colors, fonts, radius), `G` (canvas size), `Input` (pointer state)

## Component Catalog

### `button.js` (576 lines) — Core Button System
**Exports**: `UI.Button`, `UI.BtnGold`, `UI.BtnSmall`, `UI.BtnWide`, `UI.makeTooltip`, `UI.HUD`, `UI.PremiumShell`, `UI.MagneticBtn`, `UI.ScrollReveal`, `UI.FluidNav`, `UI.EmptyState`

**Component Hierarchy**:
```
UI.Button (base)
  ├── UI.BtnGold (gold variant)
  ├── UI.BtnSmall (60x24)
  └── UI.BtnWide (160x32)

UI.MagneticBtn (extends BtnGold via composition)
  ├── variant: 'primary' | 'secondary' | 'ghost'
  ├── Spring physics: stiffness=120, damping=22
  ├── Magnetic icon: trailingIcon/leadingIcon with spring follow
  └── Reduced motion: disables magnetic follow, keeps press spring

UI.PremiumShell (double-bezel card)
  ├── Outer: outerR=32, outerBg='rgba(0,0,0,0.05)', outerBorder='rgba(255,255,255,0.08)'
  ├── Inner: innerR=outerR-6, innerBg=R.colors.surface, innerHighlight='rgba(255,255,255,0.12)'
  └── contentRect() → padded inner bounds

UI.ScrollReveal (staggered entry animations)
  ├── Register elements with delay/y/blur/duration
  ├── Cubic-bezier ease: 1 - (1-p)^3
  └── Reduced motion: instant reveal

UI.FluidNav (morphing bottom nav)
  ├── Collapsed: floating pill with 5 icons
  ├── Expanded: full-screen overlay with staggered links
  ├── Hamburger → X morph (45° rotation spring)
  └── Stagger: 100ms per item, 600ms expand / 300ms collapse

UI.EmptyState (illustrated empty states)
  ├── Types: 'journey', 'beast', 'recipe'
  ├── Procedural canvas drawings (arcs, lines, shapes)
  └── Optional CTA button (MagneticBtn)
```

**Button Interaction Model**:
```
Input.peekTap() → UI.handleButtons(buttons, scrollY)
    → button.contains(tap.x, tap.y - scrollY)
    → button._pressed = true, _pressTimer = 0.12s
    → Flood guard: 70ms min interval, max 4 queued
    → Cooldown: 120ms per-button re-fire prevention
    → Audio.click() → button.onClick() → R.validTick() or R.stoneHit()
```

**Reduced Motion Support**:
- `R.reducedMotion()` checks `G.state.reduceMotion` OR `prefers-reduced-motion`
- MagneticBtn: disables magnetic follow, keeps press scale spring
- ScrollReveal: instant reveal
- FluidNav: instant expand/collapse
- ClickFx: static dent mark only
- Screen shake, death bursts, levelUp particles: skipped

### `panel.js` — Panel/Container Components
**Exports**: `UI.Panel`, `UI.PanelWithHeader`, `UI.CollapsiblePanel`

**Patterns**:
- `UI.Panel(x, y, w, h, opts)` — rounded rect with optional border
- `UI.PanelWithHeader` — header bar + content area
- `UI.CollapsiblePanel` — animated expand/collapse with chevron

### `list.js` — Virtualized Lists
**Exports**: `UI.List`, `UI.VirtualList`

**Patterns**:
- `UI.List(items, renderItem, opts)` — simple array renderer
- `UI.VirtualList` — viewport culling for large datasets (inventory, logs)
- `itemHeight` fixed or dynamic via `measureItem`

### `modal.js` — Modal Dialogs
**Exports**: `UI.Modal`, `UI.ConfirmModal`, `UI.PromptModal`, `UI.SelectModal`

**Patterns**:
- `UI.Modal.active` — singleton active modal (stack not supported)
- `UI.Modal.show(modal)` / `UI.Modal.clearAll()`
- `UI.Modal.handleInput()` — called from scene.update() guard
- `UI.Modal.render(ctx)` — called from scene.render() after content
- Backdrop: `rgba(0,0,0,0.85)`, click outside = cancel (configurable)
- Focus trap: Tab cycles modal buttons only

### `progressBar.js` — Progress Indicators
**Exports**: `UI.ProgressBar`, `UI.HPBar`, `UI.MPBar`, `UI.XPBar`

**Patterns**:
- `UI.ProgressBar(x, y, w, h, color, bgColor)` — rounded rect fill
- Gradient fill (orange → orangeLight) with 1px border
- `setProgress(val, max)` — clamps 0-1
- `showText` / `text` / `textColor` for labels
- Specialized: HPBar (red), MPBar (blue), XPBar (green)

### `tabbar.js` — Tab Navigation
**Exports**: `UI.TabBar`

**Patterns**:
- `UI.TabBar(tabs, opts)` — tabs = [{label, icon, panel}]
- Horizontal scroll if overflow
- Active tab indicator: animated underline (spring)
- Panel switching: instant, no animation

### `text.js` — Text Utilities
**Exports**: `UI.WordWrap`, `UI.TextScroller`, `UI.RichText`

**Patterns**:
- `UI.WordWrap(ctx, text, maxWidth, font)` → array of lines
- `UI.TextScroller` — marquee for long single-line text
- `UI.RichText` — inline formatting (color, bold, icons) via markup

### `card.js` — Card Components
**Exports**: `UI.Card`, `UI.StatCard`, `UI.ItemCard`, `UI.HeroCard`

**Patterns**:
- Built on `UI.PremiumShell` for double-bezel depth
- `UI.StatCard` — label + value + icon, used in ashram stats panel
- `UI.ItemCard` — item icon + name + rarity border + stats
- `UI.HeroCard` — portrait + name + level + class + key stats

## Data & Control Flow

### Button Press Flow
```
pointerdown → Input._pressPos = {x,y}
pointerup → dx/dy < 10px → Input._pushTap({x,y,t:'click'})
Scene.update() → UI.handleButtons(buttons, -scrollY)
    → button.contains(tap.x, tap.y) → button._pressed = true
    → button.onClick() → R.validTick() (gold ring) or R.stoneHit() (stone)
    → button._pressTimer = 0.12s → update() decrements → _pressed = false
```

### MagneticBtn Spring Physics
```
update(dt):
    spring.scale += (targetScale - scale) * min(1, dt * stiffness/damping)
    if hovered: targetScale = 0.98, iconSpring → (2, -1)
    else: targetScale = 1, iconSpring → (0, 0)

render():
    ctx.translate(center) → ctx.scale(scale) → ctx.translate(-center)
    → originalRender() → ctx.restore()
    → draw trailingIcon at (w-28 + iconSpringX, h/2-12 + iconSpringY)
```

### ScrollReveal Stagger
```
register(el, {delay, y=24, blur=8, duration=800})
    → el._revealState = {opacity:0, y, blur, progress:0}
update(dt):
    if inView && !started: setTimeout(reveal, delay)
    if revealed: progress += dt*1000/duration
    ease = 1 - (1-p)^3
    opacity = ease, y = y*(1-ease), blur = blur*(1-ease)
apply(ctx, el):
    ctx.globalAlpha = opacity
    ctx.translate(0, y)
    ctx.filter = blur(blur px)
```

## Integration Points

| Component | Used By | Dependencies |
|-----------|---------|--------------|
| `UI.Button` | All scenes (30+) | R.colors, R.fonts, R.radius, Input |
| `UI.MagneticBtn` | ashram, cultivation, combat, party, forge, alchemy, journey, etc. | UI.Button, R, Input |
| `UI.PremiumShell` | ashram, cultivation, journey, party, forge, alchemy, bazaar | R.colors, R.radius |
| `UI.ProgressBar` | cultivation, combat, zoneExploration, forge, travelMap | R.colors, R.radius |
| `UI.Modal` | party (equip), forge (upgrade), alchemy (craft), settings | R, Input, UI.Button |
| `UI.TabBar` | party (inventory/gear/skills), equipment | R, Input |
| `UI.List` / `UI.VirtualList` | party (inventory), questLog, achievements | R, Input |
| `UI.FluidNav` | ashram (bottom nav) | R, Input, Scene |
| `UI.ScrollReveal` | (available, not yet widely used) | R |
| `UI.EmptyState` | journeyScene, spiritBeast, alchemyScene | R, UI.MagneticBtn |

## Critical Invariants
1. **Button flood guard** — 70ms min interval, max 4 queued taps
2. **Per-button cooldown** — 120ms re-fire prevention (`_lastFire`)
3. **Press timer** — 120ms visual press state
4. **MagneticBtn spring** — stiffness 120, damping 22 (critically damped)
5. **Reduced motion** — checked via `R.reducedMotion()` in all animated components
6. **Modal singleton** — only one modal active, `UI.Modal.active` reference
7. **Scroll offset** — buttons store `scrollY` for correct hit-testing in clipped content

## Memory Leak Risks
| Component | Risk |
|-----------|------|
| `UI.MagneticBtn` | Spring objects created per button, never disposed |
| `UI.ScrollReveal` | `elements` array accumulates registered elements, never cleared |
| `UI.FluidNav` | `spring.stagger` array persists, never reset |
| `UI.Modal` | `_buttonList` reference to buttons, not nulled on clear |
| `UI.List` | `items` array reference retained, not cleared on scene leave |

## Refactoring Opportunities
1. **Component Base Class** — shared `destroy()`/`cleanup()` lifecycle
2. **Object Pooling** — reuse MagneticBtn spring objects
3. **ScrollReveal Registry** — auto-unregister on scene leave
4. **Modal Stack** — support nested modals (confirm on top of prompt)
5. **VirtualList Recycling** — DOM-style element reuse for 100+ items
6. **TypeScript Interfaces** — formalize component props/state
7. **Accessibility** — ARIA labels, focus management, keyboard nav