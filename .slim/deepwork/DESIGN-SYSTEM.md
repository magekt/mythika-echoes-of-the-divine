# DESIGN SYSTEM — Mythika

**Reading this as:** mobile-first idle RPG for casual gamers, with an Indian mythology aesthetic, dark canvas theme, leaning toward editorial luxury with gold accents.

---

## Dials

| Dial | Value | Meaning |
|------|-------|---------|
| **DESIGN_VARIANCE** | 6 | Asymmetric bento grids but predictable. Not chaotic, but lively enough to feel dynamic across 30+ scenes. |
| **MOTION_INTENSITY** | 4 | CSS-level transitions, spring physics on buttons, no scroll-hijack. MagneticBtn spring (stiffness=120, damping=22). Reduce-motion aware. |
| **VISUAL_DENSITY** | 6 | Info-dense RPG hub (bento grids, resource rows, nav pills), but not cockpit. Breathable spacing. |

---

## Color System

All colors referenced via `R.colors.*` tokens. Never use raw hex in components.

| Token | Hex | Usage |
|-------|-----|-------|
| **Gold** (primary accent) | `#e8a030` | BtnGold, MagneticBtn primary, progress fill, section labels, CTA buttons |
| **Orange** | `#e8a030` | Secondary accent, section labels (PROGRESSION), warm highlights |
| **Blue** | `#3080c8` | MP color, Services section label, zone progress |
| **Green** | `#30c830` | HP color, success states, cultivate/natural themes |
| **Red** | `#c83030` | Danger/warning, badge dots, upgrade cost warnings |
| **Surface** | `#1a1a30` | Panel background, card base |
| **Panel** | `#1a1a30` | Panel component bg |
| **PanelLight** | `#2a2a45` | Subtle panel elevation |
| **Text** | `#e8e0d0` | Primary body text |
| **TextDim** | `#98a0b8` | Secondary text, labels, disabled states |
| **TextDark** | `#6a7088` | Muted text, placeholders |
| **HP** | `#c83030` | Health bar fill |
| **MP** | `#3080c8` | Mana bar fill |
| **XP** | `#30c830` | XP bar fill (same as green) |
| **BorderHairline** | `rgba(232,160,48,0.12)` | Track/grid divider |
| **BorderFocus** | `rgba(232,160,48,0.6)` | Focus ring |
| **Accent** | `#e8a030` | Primary accent (alias for Gold) |
| **AccentMuted** | `rgba(232,160,48,0.15)` | Subtle accent overlay |
| **Success** | `#30c830` | Positive feedback |
| **Warning** | `#e8a030` | Caution state |
| **Danger** | `#c83030` | Error/danger state |
| **Info** | `#3080c8` | Info state |

**Indian palette (semantic group):**
- saffron: `#e8a030` (Gold — primary)
- crimson: `#c83030` (Danger/Warning)
- gold: `#e8a030` (Primary accent)
- peacock: `#2080a0` (Cyan-teal accent)
- lotus: `#e8a0a0` (Pink accent)
- sandal: `#d0b080` (Warm neutral)

---

## Typography Scale

All fonts referenced via `R.fonts.*` tokens. Font family: `'Courier New', monospace` (terminal/editorial feel). Primary: Geist sans-serif for UI. Display: PP Editorial New / Georgia serif for lore moments.

| Token | Size | Context |
|-------|------|---------|
| **display** | `24px "PP Editorial New", Georgia, serif` | Hero moments, lore titles, scene headers |
| **displaySm** | `18px "PP Editorial New", Georgia, serif` | Section labels, medium headers |
| **lg** | `16px "Geist", -apple-system, BlinkMacSystemFont, sans-serif` | Body text, resource rows, panel content |
| **md** | `12px "Geist", -apple-system, BlinkMacSystemFont, sans-serif` | Button labels, small captions |
| **sm** | `10px "Geist", -apple-system, BlinkMacSystemFont, sans-serif` | Tooltips, dim labels |
| **xs** | `8px "Geist", -apple-system, BlinkMacSystemFont, sans-serif` | Ultra-tiny, not typically used directly — use fontScale instead |
| **mono** | `10px "Geist Mono", monospace` | Code/debug display |

**fontScale** (accessibility): Rebuilds the font ladder at user-chosen ratio (1 / 1.15 / 1.3). All `px` bases multiplied by scale; display font size also scaled.

---

## Shape System

Corner-radius scale (Shape Consistency Lock). Use these values instead of ad-hoc numbers. One radius scale per screen, enforced everywhere.

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 3 | Tiny chips/track corners |
| **s** | 5 | Buttons, small bars, compact elements |
| **m** | 8 | Panels, headers, card containers |
| **l** | 10 | Large cards, modal shells |

**Rule:** One radius scale per screen. Do not mix `s` and `l` radii on the same element.

---

## Component Patterns

### PremiumShell (Double-Bezel Card Shell)

```js
UI.PremiumShell(x, y, w, h, { outerR, innerR, outerBg, outerBorder, innerBg, innerHighlight })
```

- **Outer shell**: rounded rect with 32px outer radius, subtle black-on-transparent bevel
- **Inner core**: inset with `(outerR - innerR)` padding, `(outerR - 6)` inner radius by default
- **Inner highlight**: 1px fill along top edge of inner core (`rgba(255,255,255,0.12)`)
- **Usage**: Stat panels, hero info boxes, any premium card needing double-bezel feel
- **Spacing**: `contentRect()` pads by `outerR - innerR + 8` — use this for inner content
- **When to use**: Any panel that needs "premium" feel — hero stats, upgrade panels, service boxes

### MagneticBtn (Spring Physics Button)

```js
UI.MagneticBtn(x, y, w, h, label, { variant, trailingIcon, leadingIcon })
```

- **Variants**: `primary` (gold bg, white text), `secondary` (surface bg, gold border), `ghost` (no bg, text + gold underline on hover)
- **Spring physics**: `stiffness=120, damping=22` — scale feedback on press/hover
- **Trailing icon**: physics-animated icon that drifts slightly when hovered
- **Minimum height**: 30px; prefer 38px for primary actions
- **When to use**: Primary CTA actions, any button where spring feedback improves feel
- **Anti-pattern**: Never use `ctx` in build* functions — only in render functions

### BtnGold (Gold Gradient CTA)

```js
UI.BtnGold(x, y, w, h, text)
```

- **Always**: `color=R.colors.btnGold`, `hoverColor=R.colors.orangeLight`, `textColor=R.colors.white`
- **Primary actions only** — never use for secondary or destructive actions
- **Render**: Rounded rect (radius=s=5), gold fill, 1px orangeLight stroke when hovered/pressed
- **Disabled**: globalAlpha=0.6 over gold rect, white text dimmed to textDark

### ProgressBar (8px Height Stat Display)

```js
UI.ProgressBar(x, y, w, h, color, bgColor)
```

- **Height**: 8px default (4px radius)
- **Track**: `borderHairline` (`rgba(232,160,48,0.12)`) with 1px stroke
- **Fill**: Solid gold/color cell (no gradient per design spec)
- **Text**: Optional — `showText=true` centers `value/maxValue` in `R.fonts.sm` / `textColor`
- **HPBar**: `UI.HPBar(x, y, w)` → 10px height, `R.colors.hp` fill
- **MPBar**: `UI.MPBar(x, y, w)` → 10px height, `R.colors.mp` fill
- **XPBar**: `UI.XPBar(x, y, w)` → 10px height, `R.colors.exp` fill
- **When to use**: Any resource display (HP, MP, XP, prana, gold, divine fragments)

### Card (3-Column Navigation Grid)

- **Height**: 86px (was 70px — upgraded for tap target)
- **Width**: Calculated per grid: `(G.W - mx*2 - gridGap*(gridCols-1)) / gridCols` with `mx=14`, `gridGap=8`, `gridCols=3`
- **Background**: `R.colors.surface` with 8px radius, subtle gold hairline border (`rgba(232,160,48,0.08)`)
- **Content**: Icon (xl font, accent color) + label (textDim, sm font)
- **Badge**: Small red round rect (radius=7) with white text in top-right corner when applicable
- **When to use**: Navigation grids, section action cards, scene quick-starts

---

## Layout Rules

| Rule | Specification |
|------|--------------|
| **Content clip** | Fixed header above `G.CONTENT_TOP` (116px). All scrollable content clipped at this line. Never draw outside expecting visibility. |
| **Nav bar** | 44px at bottom (`G.H - navBarHeight`). FluidNav pill when collapsed (280px wide, 44px tall). |
| **Cards** | 3-column grid: 14px margin each side, 8px gap between columns. Card height 86px, content height within. |
| **Section headers** | 26px height, panel background (`R.colors.panel`), accent color label in `R.fonts.sm`. |
| **Header bar** | Fixed at y=0. Contains: `Lv.X Ashram` (displaySm gold), `Sanctuary • Cultivate • Forge` (textSecondary, sm). Height 92px total. |
| **Scroll area** | `ctx.save(); ctx.beginPath(); ctx.rect(0, top, G.W, contentH); ctx.clip(); ctx.translate(0, -scrollY);` — all button rendering happens inside this clipped translate. |
| **Fixed below CONTENT_TOP** | Never stack fixed elements below the clip rect expecting them to be above the scroll area. The header (y<116) is above; everything below must be part of the scroll clip. |

---

## Anti-Patterns (what NOT to do)

| Anti-Pattern | Why |
|---|---|
| **Never use raw hex in components** | Always use `R.colors.*` tokens. Centralizes theming, enables accessibility overrides (fontScale), and maintains the visual language. |
| **Never draw outside the clip rect expecting it to be visible** | The scroll clip at `CONTENT_TOP` (116px) explicitly clips everything. Drawing below it yields no visible result. |
| **Never use `ctx` in build* functions** | Build functions prepare data; only render functions should call `ctx.*` methods. Mixing them breaks the immediate-mode canvas cycle. |
| **Never stack fixed elements below CONTENT_TOP expecting them to be above the scroll area** | The header zone (y < 116) is fixed above the scroll. Elements added below y=116 are part of the scrollable content and will be clipped if outside the scroll area. |
| **Never disable MagneticBtn spring for non-reduced-motion contexts** | The spring physics are a core part of the feel. Only disable via `R.reducedMotion()` check, not arbitrarily. |
| **Never use font sizes smaller than `R.fonts.xs` (8px) without fontScale** | Text below 8px becomes unreadable on mobile. Use `fontScale` for accessibility adjustments. |

---

## Touch Target Rules

| Element | Minimum | Preferred |
|---|---|---|
| **All interactive elements** | 44×44px | — (Apple HIG) |
| **Cards** | 86px height | — ensures comfortable tap |
| **Buttons** | 30px height minimum | 38px for primary actions (BtnGold, MagneticBtn primary) |
| **Nav pills/buttons** | 44px tall | — bottom nav bar, FluidNav pill |
| **Section header tap targets** | Full 26px height bar | — entire header bar is interactive |

**Rationale:** All touch targets meet or exceed Apple Human Interface Guidelines 44×44px minimum. The 86px card height naturally provides this. Button heights in the codebase: BtnGold/MagneticBtn use whatever `h` is passed, but the pattern prefers ≥38px for primary actions.

---

## Quick Reference Summary

```
R.colors: gold=#e8a030, orange=#e8a030, blue=#3080c8, green=#30c830, red=#c83030,
  surface=#1a1a30, panel=#1a1a30, text=#e8e0d0, textDim=#98a0b8, textDark=#6a7088,
  borderHairline=rgba(232,160,48,0.12), accent=#e8a030

R.radius: xs=3, s=5, m=8, l=10

R.fonts: display=24px PP Editorial New/Georgia, displaySm=18px PP Editorial New/Georgia,
  lg=16px Geist, md=12px Geist, sm=10px Geist, xs=8px Geist, mono=10px Geist Mono

DESIGN_VARIANCE: 6
MOTION_INTENSITY: 4
VISUAL_DENSITY: 6

Clip at G.CONTENT_TOP (116px). Nav bar 44px bottom. 3-column grid: 14px margin, 8px gap, 86px cards.
Section headers: 26px, panel bg, accent label.

Never raw hex. Never ctx in build functions. Never draw outside clip. Always R.colors.* tokens.
Minimum 44×44px touch targets. Buttons ≥30px, prefer 38px primary.
```