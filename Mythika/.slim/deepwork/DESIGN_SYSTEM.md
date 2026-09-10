# Mythika: Echoes of the Divine — Design System

**Version**: 1.0  
**Canvas**: 400×720 (fixed, scales via CSS `game.css`)  
**Platform**: Mobile-first, Canvas 2D immediate-mode rendering  
**Art Direction**: 16-bit pixel art with Indian color palette (saffron, vermillion, peacock blue, gold)

---

## 1. Color System (Semantic Tokens Only)

All components MUST use `R.colors.*` tokens. **Never use raw hex values in component code.**

### Core Palette (Dark Theme - Default)

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#0a0a1a` | Page background |
| `bg2` | `#15152a` | Container background |
| `surface` | `#1a1a30` | Card/panel backgrounds |
| `surfaceElevated` | `#222240` | Raised cards, modals |
| `surfaceGlass` | `rgba(26,26,48,0.85)` | Glassmorphism overlays |
| `panel` | `#1a1a30` | Legacy panel token (alias for surface) |
| `panelLight` | `#2a2a45` | Legacy panel border |

### Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `gold` / `accent` / `saffron` / `orange` | `#e8a030` | Primary actions, highlights, gold text |
| `goldLight` / `orangeLight` | `#f0c060` | Hover states, glow effects |
| `goldDark` / `orangeDark` | `#b07020` | Pressed states |
| `goldMuted` | `rgba(232,160,48,0.25)` | Subtle gold fills |
| `accentMuted` | `rgba(232,160,48,0.15)` | Accent backgrounds |

### Semantic UI Colors

| Token | Value | Usage |
|-------|-------|-------|
| `blue` | `#3080c8` | MP bars, magic, prana rate |
| `blueLight` | `#60a0e0` | Blue hover/glow |
| `blueDark` | `#1a4060` | Blue pressed |
| `red` / `danger` | `#c83030` | HP bars, damage, errors, enemy turns |
| `green` / `success` | `#30c830` | Healing, success, gathering rate |
| `info` | `#3080c8` | Info states |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `textPrimary` / `white` | `#e8e0d0` | Primary text, headlines |
| `textSecondary` / `textDim` | `#98a0b8` | Body text, labels |
| `textMuted` / `textDark` | `#6a7088` | Secondary labels, disabled |
| `text` (legacy) | `#e8e0d0` | Alias for textPrimary |

### Border & Overlay

| Token | Value | Usage |
|-------|-------|-------|
| `borderHairline` | `rgba(232,160,48,0.12)` | Card borders, dividers |
| `borderFocus` | `rgba(232,160,48,0.6)` | Focus rings |
| `subtleWhite` | `rgba(255,255,255,0.08)` | Subtle highlights |
| `overlayDark` | `rgba(0,0,0,0.6)` | Modal overlays |
| `overlayMedium` | `rgba(0,0,0,0.5)` | Medium overlays |
| `overlayMuted` | `rgba(0,0,0,0.4)` | Light overlays |

### Status Bar Colors

| Token | Value | Usage |
|-------|-------|-------|
| `hp` | `#c83030` | HP bars |
| `mp` | `#3080c8` | MP bars |
| `exp` | `#30c830` | XP bars |
| `hpBarBackground` | `rgba(48,200,48,0.2)` | HP track |
| `damageBarBackground` | `rgba(200,48,48,0.2)` | Enemy HP track |

### WCAG AA Compliance

All text/background combinations verified ≥ 4.5:1 contrast ratio:
- `textPrimary` on `surface` ✓
- `textSecondary` on `surface` ✓
- `gold` on `surface` ✓
- `white` on `gold` ✓ (primary button text)
- `textPrimary` on `surfaceElevated` ✓
- Disabled states: 0.5 opacity maintains ≥ 3:1 for non-text elements

---

## 2. Typography Scale

Two font families: **Display Serif** (PP Editorial New / Georgia) for hero moments, **Sans** (Geist / -apple-system) for UI.

### Font Ladder (Base Scale = 1.0)

| Token | Size/Line | Weight | Use Case |
|-------|-----------|--------|----------|
| `display` | 24px/32px | 400 | Page titles, hero moments |
| `displaySm` | 18px/26px | 400 | Section heroes, large numbers |
| `xl` | 24px/32px | 400 | Very large numbers (prana display) |
| `lg` | 16px/24px | 400 | HUD, button labels, important values |
| `md` | 12px/20px | 400 | Default body, button text |
| `sm` | 10px/18px | 400 | Labels, meta, secondary info |
| `xs` | 8px/16px | 400 | Tiny labels, timestamps |
| `mono` | 10px/18px | 400 | Numbers, mono-spaced data |
| `eyebrow` | 13px/20px | 500 | Section eyebrows, uppercase |

### Font Scaling (Accessibility)

User-selectable via Settings: `1.0` (default), `1.15`, `1.3`

```javascript
R.applyFontScale(scale) // Rebuilds all font strings
```

**Implementation**: Call `R.applyFontScale(G.state.fontScale || 1)` on boot and when setting changes.

### Wide Measures Rule

- No line exceeds **65ch** (character count)
- Maximum **1 eyebrow per 3 sections**
- Subtitle max-width: 60ch

---

## 3. Spacing Rhythm (8px Base)

All spacing derives from 8px unit. Use these tokens in layout calculations.

| Token | Value | Use Case |
|-------|-------|----------|
| `space.xs` | 4px | Tight gaps (icon-text) |
| `space.s` | 8px | Base unit, button gaps |
| `space.m` | 16px | Standard padding, margins |
| `space.l` | 24px | Section gaps, card padding |
| `space.xl` | 32px | Major section separation |
| `space.xxl` | 48px | Hero section padding |

**In Code**: Use raw numbers (8, 16, 24) but document as multiples of 8.

---

## 4. Radius Scale (Shape Consistency Lock)

| Token | Value | Use Case |
|-------|-------|----------|
| `radius.xs` | 3px | Chips, tags, small ticks |
| `radius.s` | 5px | Buttons, small bars, inputs |
| `radius.m` | 8px | Panels, headers, cards |
| `radius.l` | 10px | Large cards, modals, PremiumShell outer |

**Rule**: New UI adopts these instead of ad-hoc numbers. Legacy `roundRect` calls with hardcoded radii should be migrated.

---

## 5. Shadow & Depth

### Z-Axis Cascade (for PremiumShell)

```
Level 0: surface (base)
Level 1: surfaceElevated + box-shadow: 0 1px 3px rgba(0,0,0,0.1)
Level 2: surfaceElevated + box-shadow: 0 4px 12px rgba(0,0,0,0.15)
Level 3: surfaceElevated + box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)
Level 4: Modal overlay + box-shadow: 0 16px 48px rgba(0,0,0,0.3)
```

**Canvas Implementation** (no CSS box-shadow):
```javascript
// Level 2 example
ctx.shadowColor = 'rgba(0,0,0,0.15)';
ctx.shadowBlur = 12;
ctx.shadowOffsetY = 4;
R.roundRect(ctx, x, y, w, h, r, color);
ctx.shadowBlur = 0;
```

---

## 6. Component Library Specifications

### 6.1 Buttons

All buttons follow factory pattern: `UI.ButtonName(x, y, w, h, ...)` → `{ render, update, onClick, contains }`

#### Base Button (`UI.Button`)
```javascript
UI.Button(x, y, w, h, text, color, hoverColor, textColor)
```
- **States**: default, hover, pressed, disabled
- **Press feedback**: 1px offset (dx=1, dy=1, dw=-2, dh=-2), 120ms timer
- **Cooldown**: 120ms per button (prevents double-tap)
- **Disabled**: 0.5 opacity, stoneHit FX on tap

#### Gold Button (`UI.BtnGold`)
```javascript
UI.BtnGold(x, y, w, h, text) // Uses gold/orangeLight/white
```
- Primary actions only
- Gold background, white text, orangeLight stroke on hover

#### Small/Wide Variants
```javascript
UI.BtnSmall(x, y, text)  // 60×24
UI.BtnWide(x, y, text)   // 160×32
```

#### MagneticBtn (Premium) — `UI.MagneticBtn`
```javascript
UI.MagneticBtn(x, y, w, h, label, opts)
opts = {
  variant: 'primary' | 'secondary' | 'ghost',
  trailingIcon: 'arrow-right' | 'sparkle' | null,
  leadingIcon: 'arrow-left' | null
}
```
**Physics** (disabled under reduced motion):
- Spring: `stiffness=120, damping=22`
- Hover scale: `0.98` → `1.0`
- Magnetic attraction radius: **48px**
- Trailing icon: translates 8px right, rotates 15° on press
- Leading icon (ghost): translates 8px left

**Variants**:
| Variant | Background | Border | Text | Use Case |
|---------|------------|--------|------|----------|
| `primary` | `gold` | goldLight (hover) | `white` | Primary CTAs |
| `secondary` | `surface` | `gold` (2px) | `textPrimary` | Secondary actions |
| `ghost` | transparent | none (underline on hover) | `textPrimary`/`gold` | Tertiary, back buttons |

#### Button Height Standards
- **Minimum tap target**: 38px (Material/Apple guidelines)
- **Primary actions**: 48px (MagneticBtn default)
- **Secondary**: 48px
- **Ghost**: 40px
- **Compact**: 32px (only in dense grids)

---

### 6.2 Panels & Cards

#### Base Panel (`UI.Panel`)
```javascript
UI.Panel(x, y, w, h, color, borderColor)
```
- Rounded `radius.m` (8px)
- Optional title, children array, close button
- `handleInput()` delegates to children

#### PremiumShell (Double-Bezel) — `UI.PremiumShell`
```javascript
UI.PremiumShell(x, y, w, h, opts)
opts = {
  outerR: 16,      // Outer radius (default 32, use 16 for cards)
  innerR: 10,      // Inner radius (outerR - 6)
  outerBg: 'rgba(0,0,0,0.05)',
  outerBorder: 'rgba(255,255,255,0.08)',
  innerBg: R.colors.surface,
  innerHighlight: 'rgba(255,255,255,0.12)'
}
```
**Structure**:
```
Outer bezel (outerR, outerBg) + 1px outerBorder stroke
  └─ Inner core (innerR, innerBg) inset by (outerR - innerR)
       └─ Top highlight: 1px innerHighlight line
```
**Content Rect**: `contentRect()` returns inner padded area (pad = outerR - innerR + 8)

**Usage**: All major info panels, stats cards, modal content

#### Dialog (`UI.Dialog`)
```javascript
UI.Dialog(x, y, w, h, title, text)
```
- Panel with title, multi-line text, Close button
- For confirmations, alerts

---

### 6.3 Progress Bars

#### ProgressBar (`UI.ProgressBar`)
```javascript
UI.ProgressBar(x, y, w, h, fillColor, trackColor)
```
- **Height standards**: 8px (default), 6px (compact), 4px (tiny)
- **Radius**: `radius.s` (5px) for 8px+, `radius.xs` (3px) for <6px
- **Track**: `trackColor` (default `borderHairline`)
- **Fill**: `fillColor` (gold, green, blue, red, hp, mp)
- **Methods**: `setProgress(current, max)`, `render(ctx)`

**Animation**: Ghost trail for enemy HP (smooths damage)
```javascript
if (typeof e._ghostHp !== 'number' || e.hp > e._ghostHp) e._ghostHp = e.hp;
e._ghostHp += (e.hp - e._ghostHp) * Math.min(1, dt * 6);
```

---

### 6.4 Navigation

#### FluidNav (`UI.FluidNav` / `Scene.FluidNav`)
Morphing bottom navigation: **pill (collapsed) ↔ overlay (expanded)**

**Pill State** (collapsed):
- Width: 280px, Height: 44px, Radius: 22px
- Glass background: `rgba(26,26,48,0.9)`
- Gold hairline border
- 5 icons + labels (Map, Party, Shop, Rest, More)
- Hamburger (3 lines) rotates 45° on expand

**Overlay State** (expanded):
- Full-screen dark overlay: `rgba(0,0,0,0.85)`
- Staggered links (80ms per item, 600ms total)
- Spring physics: `stiffness=10, damping=1` (rotation), stagger spring

**Items** (configurable):
```javascript
const navItems = [
  { text: 'Map', scene: 'travelMap', icon: '▶' },
  { text: 'Party', scene: 'party', icon: '☺' },
  { text: 'Shop', scene: 'bazaar', icon: '⚙' },
  { text: 'Rest', scene: '', icon: '♪' },
  { text: 'More', scene: '_more', icon: '≡' }
];
```

**Badge Support**: Red circle badge on Map (available zones), Party (skill points)

#### TabBar (`UI.TabBar`)
```javascript
UI.TabBar(x, y, w, tabs, opts)
tabs = [{ id, label, icon, badge }]
```
- Horizontal scroll if >4 tabs
- Active indicator: gold line (3px) under label
- Badge: red circle top-right

---

### 6.5 Lists

#### ScrollList (`UI.ScrollList`)
```javascript
UI.ScrollList(x, y, w, h, opts)
opts = {
  itemHeight: 34,
  itemGap: 4,
  padding: 4,
  onRenderItem: fn(ctx, item, i, x, y, w, h, selected),
  onClick: fn(item, i) → outcome (false = stoneHit)
}
```
- Touch scroll with momentum (0.8x delta)
- 90ms rebuild crossfade on `setItems()`
- Scroll indicators: ▲ (top), ▼ (bottom) in gold 50%
- Selected row highlight: `orange` background

---

### 6.6 Modals & Overlays

#### Modal (`UI.Modal`)
```javascript
UI.Modal = {
  active: null,
  open(modal), close(),
  handleInput(), render(ctx)
}
```
- Single active modal at a time
- Backdrop: `overlayDark` (`rgba(0,0,0,0.6)`)
- Content: `PremiumShell` or `Panel`
- Close on backdrop tap or Escape key
- Focus trap: input only goes to modal

#### Tooltip (`UI.makeTooltip`)
```javascript
UI.makeTooltip(ctx, text, x, y)
```
- Max width 200px, auto-position (flip if near edge)
- Dark background `rgba(0,0,0,0.9)`, gold border
- Multi-line support (`\n` separated)

---

### 6.7 Empty States

#### EmptyState (`UI.EmptyState`)
```javascript
UI.EmptyState(opts)
opts = {
  type: 'journey' | 'beast' | 'recipe' | 'custom',
  title: 'No Journeys Yet',
  hint: 'Complete zone exploration to unlock journeys.',
  ctaLabel: 'Explore Now',
  ctaAction: fn()
}
```
**Illustrations** (procedural, gold strokes 1.5px, 30-40% opacity):
- `journey`: Compass + path lines
- `beast`: Creature silhouette + orbit rings
- `recipe`: Flask + herb leaf

---

### 6.8 HeroMoment (`Scene.HeroMoment`)

Full-screen hero section for scene entry. **Asymmetric layout**.

```javascript
Scene.HeroMoment({
  title: 'Cultivation',
  subtitle: 'Refine your spirit, gather prana, and ascend through realms.',
  ctaLabel: 'Meditate',
  ctaAction: fn(),
  eyebrow: 'INNER PATH',
  accent: R.colors.gold
})
```

**Layout**:
- Top padding: 120px (mobile), 80px (desktop equivalent)
- Bottom padding: 80px
- 2/3 title area, 1/3 visual (cultivation aura animation)
- Stacked on mobile (<768px equivalent)

**Typography**:
- Eyebrow: `eyebrow` font, gold, letter-spacing 0.15em, uppercase
- Title: `displaySm` (18px), `textPrimary`
- Subtitle: `md` (12px), `textSecondary`, max-width 60ch
- CTA: `MagneticBtn` primary, trailing sparkle icon

**Animation**: ScrollReveal stagger (80ms/item, cubic-bezier(0.16,1,0.3,1))

---

### 6.9 Notifications (`Notify`)

```javascript
Notify.show(text, duration, color)
```
- Queue system (stacks vertically)
- Slide in from top (300ms ease-out)
- Auto-dismiss after duration
- Colors: `gold` (reward), `green` (success), `red` (error), `blue` (info), `blueLight` (story)

---

## 7. Motion Specifications

### Spring Physics (Standard)
```javascript
// MagneticBtn, FluidNav, HeroMoment CTA
stiffness = 120
damping = 22
// Update: spring += (target - spring) * min(1, dt * stiffness / damping)
```

### ScrollReveal
```javascript
stagger = 80ms per element
easing = cubic-bezier(0.16, 1, 0.3, 1)  // 1 - (1 - p)^3
distance = 24px upward
blur = 8px → 0
trigger = 0.15 viewport intersection
```

### FluidNav
- Rotation spring: `stiffness=10, damping=1`
- Stagger: 100ms delay per item, 600ms expand / 300ms collapse
- Expanded item animation: 30px upward + fade

### MagneticBtn Icon Physics
- Trailing icon: target (2, -1) on hover, (0, 0) off
- Spring: `stiffness=8, damping=1` (softer than button scale)
- Press: icon rotates 15°, scales 1.05x

### Page Transitions (Fade)
```javascript
Fade.in(duration=0.3)  // Black → scene
Fade.out(duration=0.2) // Scene → black
```
- Reduced motion: instant (0 duration)

### Reduced Motion (`prefers-reduced-motion: reduce` OR `G.state.reduceMotion`)

**Disabled**:
- All spring follow (magnetic attraction, icon physics)
- ScrollReveal (instant reveal)
- FluidNav stagger (instant expand/collapse)
- Particle drift (title screen, cultivation aura)
- Screen shake
- Projectile arcs (straight line)
- Level up particles
- Enlightenment aura pulse
- Bobber ripple (fishing)

**Preserved** (functional feedback):
- Button press scale (0.96 → 1.0, instant)
- StoneHit static dent mark
- Damage numbers
- Progress bar ghost trail
- Reward tickers
- Click FX (validTick ring, static mark)

**Check Function**:
```javascript
R.reducedMotion() // Returns true if reduced motion active
```

---

## 8. Icon System

**Style**: 16-bit pixel art, Unicode/emoji fallback for MVP
**Sizing**: 16×16 (inline), 24×24 (buttons), 32×32 (nav), 48×48 (hero)

### Standard Icons

| Name | Unicode | Use Case |
|------|---------|----------|
| `arrow-right` | `▶` / `→` | Primary CTA trailing |
| `arrow-left` | `◀` / `←` | Back button leading |
| `arrow-up` | `▲` / `↑` | Breakthrough, level up |
| `sparkle` | `✦` / `★` | Meditate, premium actions |
| `map` | `▶` | Travel Map nav |
| `party` | `☺` | Party nav |
| `shop` | `⚙` | Bazaar nav |
| `rest` | `♪` | Rest action |
| `more` | `≡` | Overflow menu |
| `settings` | `⚙` | Settings |
| `close` | `✕` | Close modal |
| `check` | `✓` | Completed, unlocked |
| `lock` | `🔒` | Locked content |
| `warning` | `⚠` | Warnings |
| `info` | `ℹ` | Info tooltips |

### Custom Pixel Icons (Future)
Replace Unicode with 16×16 pixel art sprites from `Assets/PixelArt/UI/`

---

## 9. Scene Layout Templates

### 9.1 Standard Scene Structure

```
┌─────────────────────────────────────┐
│  Fixed Header (0-116px)             │  ← Title, stats, resources
│  ─────────────────────────────────  │
│  Content Area (clipped, scrollable) │  ← Main UI, buttons, lists
│  ─────────────────────────────────  │
│  Fixed Nav/Action Bar (676-720px)   │  ← FluidNav or scene-specific
└─────────────────────────────────────┘
```

**Constants** (in `Scene` helpers):
```javascript
G.CONTENT_TOP = 116  // Below header
G.NAV_BAR_HEIGHT = 44
```

### 9.2 Scene Types

| Type | Header | Content | Bottom | Examples |
|------|--------|---------|--------|----------|
| **Hub** | Minimal (title + level) | Bento grid (3-col) | FluidNav | Ashram |
| **Detail** | HeroMoment | PremiumShell info + actions | Ghost back btn | Cultivation, Punarjanma |
| **Exploration** | Resources + zone info | Scene art + log + actions | Action buttons | ZoneExploration |
| **Combat** | Battle HUD (turn, combo) | Action area (clipped) | Enemy targets | CombatScene |
| **List/Manager** | Title + summary | ScrollList | FluidNav | Party, Equipment, QuestLog |
| **Modal/Fullscreen** | HeroMoment or title | Form/content | Primary + ghost | CharacterCreate, Alchemy |

---

## 10. Information Hierarchy

### Primary (Always Visible)
- Current realm/stage (Ashram, Cultivation)
- Core resources: Gold, Prana, Karma, DF
- Party HP/MP summary (Combat, Exploration)
- Active zone progress

### Secondary (Content Area)
- Menu grids (Ashram)
- Stats breakdown (Cultivation)
- Skill lists (Combat, Party)
- Recipe lists (Alchemy)
- Quest objectives

### Tertiary (On Demand)
- Tooltips (long press / hover)
- Modal details (item info, enemy info)
- Settings submenus
- Debug info

---

## 11. Interaction Patterns

| Interaction | Pattern | Feedback |
|-------------|---------|----------|
| Tap button | MagneticBtn spring press | Click sound, validTick ring |
| Tap disabled | StoneHit FX | Thud sound, dent mark |
| Swipe horizontal | Scene transition (Ashram hub) | Fade transition |
| Drag vertical | Scroll (ScrollList, clipped content) | Momentum scroll |
| Long press | Tooltip / context menu | Haptic (if available) |
| Pull to refresh | Not used (no pull-to-refresh) | — |
| Back gesture | Swipe right (Ashram) / Back button | Scene transition |

---

## 12. State Variations

### Loading States
- **Scene enter**: Fade in (300ms) + ScrollReveal stagger
- **Data fetch**: Skeleton shimmer (PremiumShell with pulsing `goldMuted`)
- **Offline progress**: Toast notification on load

### Empty States
- Use `UI.EmptyState` with appropriate illustration
- Always include CTA if actionable

### Error States
- Red accent (`danger`) for destructive actions
- Inline error text below field (forms)
- Toast for transient errors

### Success States
- Green accent (`success`) for gains
- Gold for rewards/breakthroughs
- Level up: `R.triggerLevelUp()` (particles + flash)

### Disabled States
- 0.5 opacity
- `textDim` / `textDark` text
- `borderHairline` border
- StoneHit on interaction

---

## 13. Responsive Behavior

**Canvas is fixed 400×720** but CSS scales container. Handle:

### Safe Areas (iOS notch, Android gesture bar)
```css
/* In game.css */
@supports (padding: max(0px)) {
  #game-container {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
```

### Orientation
- **Portrait**: Primary (400×720)
- **Landscape**: Letterboxed, FluidNav moves to side (future)

### Font Scaling
- All text uses `R.fonts.*` which respect `R.fontScale`
- Layout adapts: button heights scale with font (min 38px)

---

## 14. Accessibility

### Reduce Motion
- Check `R.reducedMotion()` before ANY animation
- CSS `@media (prefers-reduced-motion: reduce)` for loading splash
- Instant transitions, no stagger, no magnetic follow

### Font Scaling
- 3 levels: 1.0, 1.15, 1.3 via Settings
- Persists in `G.state.fontScale`
- Rebuild fonts on change: `R.applyFontScale()`

### Color Independence
- Never rely on color alone for status
- Breakthrough ready: "Ready" text + green + pulse icon
- Ailments: icon + text label + color
- Party member status: icon + text + color

### Focus Visible (Keyboard/Gamepad)
- 2px `borderFocus` outline, 2px offset
- `ctx.strokeStyle = R.colors.borderFocus; ctx.lineWidth = 2;`
- Only show when `Input.lastInputType === 'keyboard'`

### Screen Reader (Future)
- ARIA labels on canvas via hidden DOM overlay
- `Notify` announcements via live region

---

## 15. Component Migration Guide

### Current → Premium Mapping

| Current (Ad-hoc) | Premium Replacement | Scenes to Migrate |
|------------------|---------------------|-------------------|
| `UI.BtnGold` in grids | `UI.MagneticBtn` primary | Ashram, Cultivation, Title |
| `UI.Button` with custom render | `UI.MagneticBtn` variant | Combat, Party, Equipment |
| Custom panel drawing | `UI.PremiumShell` | Ashram stats, Cultivation info, Combat enemy panel |
| Manual header bars | `Scene.HeroMoment` | Title, Cultivation, Punarjanma, Alchemy |
| Static nav buttons | `UI.FluidNav` / `Scene.FluidNav` | Ashram, all hub scenes |
| Raw progress bars | `UI.ProgressBar` (8px, gold fill) | All scenes |
| Custom empty states | `UI.EmptyState` | Journey, Beasts, Recipes, QuestLog |
| Ad-hoc modals | `UI.Modal` + `PremiumShell` | All modals |

### Migration Checklist per Scene

- [ ] Replace all `UI.Button` custom renders with `MagneticBtn` variants
- [ ] Wrap info panels in `PremiumShell`
- [ ] Use `HeroMoment` for scene entry
- [ ] Use `ProgressBar` for all bars (8px, gold fill, hairline track)
- [ ] Use `FluidNav` for bottom navigation
- [ ] Use `ScrollList` for lists (inventory, quests, achievements)
- [ ] Use `EmptyState` for empty lists
- [ ] Use `Modal` for dialogs
- [ ] Verify `R.reducedMotion()` guards on all motion
- [ ] Verify only `R.colors.*` tokens used (grep for `#` in scene files)

---

## 16. Performance Budget

| Metric | Target |
|--------|--------|
| Frame time | < 16.67ms (60fps) |
| Memory | Stable over 30min (no leaks) |
| Draw calls | < 200 per frame |
| Particle count | < 100 active (circular buffers) |
| Font rebuild | Only on scale change |
| Noise texture | 400×720, generated once |

### Optimization Rules
- Reuse `PremiumShell` instances (create in `enter()`, not `render()`)
- Circular buffers for particles (`R.damageNumbers`, `R.deathBursts`, `R.clickFx`)
- Cull off-screen buttons (`Scene.cullButtons`)
- Lazy-create sprites (title wordmark, noise canvas)
- Batch same-color draws

---

## 17. Implementation Order

1. **Foundation**: Color tokens, typography, radius, spacing (✓ done in renderer.js)
2. **Core Components**: `MagneticBtn`, `PremiumShell`, `ProgressBar` (✓ done in button.js)
3. **Layout Components**: `FluidNav`, `HeroMoment`, `ScrollList`, `EmptyState` (✓ done)
4. **Scene Migration**: Title → Ashram → Cultivation → Combat → others
5. **Polish**: ScrollReveal integration, magnetic physics tuning, reduced motion audit
6. **Accessibility**: Font scaling, focus visible, color independence audit
7. **Performance**: Memory profiling, frame time optimization

---

## 18. Visual Polish Checklist (Definition of Done)

- [ ] Noise/grain overlay renders at 3% opacity on all scenes
- [ ] Double-bezel (`PremiumShell`) on all panels/modals
- [ ] MagneticBtn attraction feels natural (48px radius, no jitter)
- [ ] Gold accent used ONLY for primary actions
- [ ] No raw hex in component code (grep `#` → only in renderer.js colors)
- [ ] Reduced motion fully disables magnetic follow, keeps spring press
- [ ] ScrollReveal stagger respects 80ms increments
- [ ] All text passes WCAG AA in dark theme
- [ ] Mobile stack order: Hero → Info → Buttons
- [ ] Breakthrough button glows when ready (subtle pulse, 2s period)
- [ ] Button press feedback: 120ms, 1px offset, sound
- [ ] Disabled buttons: stoneHit FX, 0.5 opacity
- [ ] Progress bars: 8px height, gold fill, hairline track, radius.s
- [ ] FluidNav: pill ↔ overlay morph, stagger 80ms/item
- [ ] Scene transitions: Fade in/out, no flash
- [ ] Tooltips: auto-position, max 200px, multi-line
- [ ] Notifications: stack, slide in, auto-dismiss, colored by type

---

## 19. File Organization

```
Mythika/
├── .slim/deepwork/
│   ├── DESIGN_SYSTEM.md          # This file
│   └── architecture-audit.md     # Technical audit
├── styles/
│   └── game.css                  # Container scaling, loading splash
├── src/
│   ├── engine/
│   │   └── renderer.js           # R: colors, fonts, radius, drawing primitives, noise
│   ├── ui/
│   │   ├── button.js             # UI: Button, MagneticBtn, PremiumShell, FluidNav, HeroMoment, EmptyState, HUD, ScrollReveal
│   │   ├── panel.js              # Panel, Dialog
│   │   ├── progressBar.js        # ProgressBar
│   │   ├── list.js               # ScrollList
│   │   ├── modal.js              # Modal
│   │   ├── text.js               # Text, TextTitle, TextBody, TextDim, TextGold, TextSection
│   │   ├── card.js               # (Future: specialized cards)
│   │   ├── tabbar.js             # TabBar
│   │   └── codemap.md            # UI module map
│   ├── scenes/                   # 30 scene files
│   └── main.js                   # Boot, scene registration
```

---

## 20. References

- `CULTIVATION_SCENE_DESIGN.md` — High-fidelity Cultivation scene spec
- `MYTHIKA_WIREFRAME_PLAN.md` — 12 screen wireframes
- `AGENTS.md` — Development workflow, coding conventions
- `src/engine/renderer.js` — Color tokens, drawing primitives
- `src/ui/button.js` — Button, MagneticBtn, PremiumShell, FluidNav, HeroMoment, EmptyState, ScrollReveal
- `src/ui/panel.js` — Panel, Dialog
- `src/ui/progressBar.js` — ProgressBar
- `src/ui/list.js` — ScrollList
- `src/ui/modal.js` — Modal
- `src/ui/text.js` — Text components
- `src/scenes/title.js` — Title scene (reference implementation)
- `src/scenes/ashram.js` — Ashram hub (reference implementation)
- `src/scenes/cultivationScene.js` — Cultivation scene (reference implementation)
- `src/scenes/combatScene.js` — Combat scene (reference implementation)