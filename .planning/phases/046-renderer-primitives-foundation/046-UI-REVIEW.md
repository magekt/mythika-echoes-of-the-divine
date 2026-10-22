# Phase 046 — UI Review

**Audited:** Wed Oct 21 2026
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md exists)
**Screenshots:** captured (desktop 1440x900, mobile 375x812, tablet 768x1024) — `.planning/ui-reviews/046-20261021-182351/`

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | No generic labels, empty states, or error messages in renderer foundation |
| 2. Visuals | 4/4 | R.strokeRoundRect and R.doubleBezel implement doppelrand pattern correctly; null-safe rendering |
| 3. Color | 3/4 | Phase 46 uses semantic tokens correctly, but token duplication (overlay=overlayDark, hairline=subtleWhite) and widespread hardcoded colors exist |
| 4. Typography | 2/4 | 7 distinct font sizes in R.fonts exceeds recommended max of 4; Phase 46 added no typography |
| 5. Spacing | 4/4 | Consistent coordinate-based spacing (0.5px offset, inset=6, 1px strips); no CSS spacing violations |
| 6. Experience Design | 4/4 | Null-safe primitives, reducedMotion support, disabled token — all Phase 46 requirements met |

**Overall: 21/24**

---

## Top 3 Priority Fixes

1. **Typography: 7 font sizes exceeds recommended max of 4** — user impact: inconsistent typographic scale across UI; R.fonts defines display(24px), displaySm(18px), lg(16px), md(12px), sm(10px), xs(8px), mono(10px) — fix: consolidate to ≤4 sizes (e.g., drop sm/mono or merge xs/sm) in `src/engine/renderer.js:59-68`
2. **Color: Duplicate semantic tokens** — user impact: token confusion and maintenance burden; `overlay` (line 34) duplicates `overlayDark` (line 25) exactly at `rgba(0,0,0,0.6)`, `hairline` (line 38) duplicates `subtleWhite` (line 22) exactly at `rgba(255,255,255,0.08)` — fix: remove exact duplicates or assign distinct values in `src/engine/renderer.js:34-39`
3. **Color: Widespread hardcoded hex/rgba values bypass R.colors semantic tokens** — user impact: inconsistent theming, hard to rebrand; zone backgrounds (lines 1064-1138), enemy colors (lines 362-369), hero colors (lines 406-408) use raw literals instead of named tokens — fix: migrate recurring colors to R.colors entries in `src/engine/renderer.js`

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

**Status: PASS — no findings.**

- No generic labels (Submit, Click Here, OK, Cancel, Save) found in `src/engine/renderer.js`
- No empty state messages (No data, No results, Nothing, Empty)
- No error state messages (went wrong, try again, error occurred)
- `R.text`, `R.textCenter`, `R.textRight`, `R.pixelText` are rendering utilities, not copy — actual text content (enemy names, damage numbers, timer labels) originates from scene callers, not the renderer foundation
- This pillar is not applicable to a Canvas renderer library; nothing to break

### Pillar 2: Visuals (4/4)

**Status: PASS — no findings.**

- `R.strokeRoundRect` (line 162-181): hairline-stroked rounded rect with 0.5px pixel-snapped offset (`Math.round(x) + 0.5`) for crisp 1px rendering; avoids anti-aliased 2px blur
- `R.doubleBezel` (line 184-207): nested enclosure — outer shell (`R.roundRect` fill + `R.strokeRoundRect` 1px hairline stroke) + inner core (`R.roundRect` fill + 1px top inset highlight strip via `R.roundRect` with `stripH = Math.min(1, coreH)`)
- Clear visual hierarchy through doppelrand layering: shell → core → highlight strip creates raised impression without drop shadows
- Core guard: returns early if `coreW <= 0 || coreH <= 0` (line 198) — prevents degenerate geometry
- All Phase 46 drawing primitives are null-safe (`if (!ctx) return;` at lines 163, 185)
- No icon-only buttons (Canvas renderer, not DOM) — N/A for this layer

### Pillar 3: Color (3/4)

**Status: WARNING — token duplication and hardcoded colors.**

**Semantic token usage in Phase 46 code (correct):**
- `R.doubleBezel` uses `R.colors.surfaceElevated` (shell fill), `R.colors.hairline` (shell stroke), `R.colors.surface` (core fill), `R.colors.insetHighlight` (core highlight strip) — lines 194-206
- 6 new additive Phase 46 tokens: `overlay`, `insetHighlight`, `insetShade`, `disabled`, `hairline`, `shadow` — lines 34-39

**Issue 1 — Exact token duplication (WARNING):**
- `overlay` (line 34, `rgba(0,0,0,0.6)`) is identical to pre-existing `overlayDark` (line 25, `rgba(0,0,0,0.6)`)
- `hairline` (line 38, `rgba(255,255,255,0.08)`) is identical to pre-existing `subtleWhite` (line 22, `rgba(255,255,255,0.08)`)
- These are additive-only so they don't break consumers, but they create token confusion

**Issue 2 — Widespread hardcoded colors (WARNING):**
- Enemy body/eye colors hardcoded as hex literals (lines 362-369): `#c83030`, `#e8c880`, `#8a8070`, `#30c830`, `#5a3a28`, `#5a3060`, `#306080`, `#c86030`
- Hero colors hardcoded (lines 406-408): `#c8a050`, `#c83030`, `#e8a030`, `#e8c880`, `#c8a0a0`
- Zone background colors hardcoded throughout `R.drawZoneBackground` (lines 1064-1138): `#1a0a00`, `#0a1a20`, `#0a2a30`, `#0a0a1a`, `#1a0a10`, `#2a1020`, `#0a0510`, `#0a0a2a`, `#101040`, etc.
- Raw rgba literals in aura/flash effects (lines 899-906, 1016, 1043): `rgba(200,160,80,0.3)`, `rgba(200,180,80,...)` etc.
- Well over 10 unique elements use hardcoded colors, bypassing the `R.colors` token system

### Pillar 4: Typography (2/4)

**Status: WARNING — excessive font size scale.**

- `R.fonts` defines 7 distinct sizes (lines 59-68):
  - `display`: 24px, `displaySm`: 18px, `lg`: 16px, `md`: 12px, `sm`: 10px, `xs`: 8px, `mono`: 10px
- Exceeds the recommended maximum of 4 font sizes (>4 → flagged per audit standards)
- Note: `sm` (10px) and `mono` (10px) are identical sizes — redundancy
- `applyFontScale` (lines 73-83) rebuilds the ladder at user-chosen scales but adds `xl` (24px) dynamically — further expanding the size set
- No font-weight values used (Canvas renderer, no CSS) — weight pillar N/A
- Phase 46 added no new typography — neutral on this pillar, but existing state exceeds standards

### Pillar 5: Spacing (4/4)

**Status: PASS — no findings.**

- No CSS spacing classes (`p-`, `m-`, `gap-`, `space-`, `px-`, `py-`) — not applicable to immediate-mode Canvas renderer
- No arbitrary `[..px]` or `[..rem]` values anywhere in the file
- Phase 46 spacing is consistent and intentional:
  - 0.5px pixel-snapped offset for hairline strokes (line 166)
  - `inset` default of 6px for doubleBezel (line 188)
  - 1px highlight strip (`stripH = Math.min(1, coreH)`, line 205)
  - Core inset strip width `coreW - 2` (line 206)
- All spacing values derive from `R.radius` scale (xs=3, s=5, m=8, l=10) or explicit small integers — consistent pattern

### Pillar 6: Experience Design (4/4)

**Status: PASS — no findings.**

- **Null-safe rendering:** All Phase 46 drawing primitives return early on null ctx — `R.strokeRoundRect` (line 163), `R.doubleBezel` (line 185). Prevents DoS during boot/test (threat T-046-02)
- **Reduced motion:** `R.reducedMotion()` is null-safe — returns `false` when `G.state` undefined, wraps `matchMedia` in try/catch, falls back to `globalThis` when `window` unavailable (lines 108-121). Never throws in Node (threat T-046-01)
- **Disabled state:** `R.colors.disabled` token (`rgba(120,120,140,0.5)`, line 37) available for disabled UI consumers
- **Spring physics:** `R.spring` is critically-damped (damping=26 = 2*sqrt(170)), semi-implicit Euler, energy-stable, no explosion (lines 232-243)
- **Named spring configs:** `R.springConfigs` registry (lines 260-268) centralizes buttonPress, iconPress, panelEnter, modalOverlay, modalButton, revealStagger, sceneEnter
- `R.easePremium` is NaN-safe and clamps to [0,1] (lines 210-214)
- No loading/error/empty states in a renderer library — N/A at this layer; these belong to scene implementations (phases 047-049)

---

## Registry Safety Audit

`components.json` does not exist and no UI-SPEC.md lists third-party registries. Shadcn not initialized — registry audit skipped entirely. No Registry Safety section required.

---

## Files Audited

- `src/engine/renderer.js` — primary file (1171 lines): all Phase 46 primitives + semantic color tokens + pre-existing renderer contract
- `tests/renderer.test.js` — test file (171 lines): 9 Node tests, VM context + mock-ctx recording pattern
- `.planning/phases/046-renderer-primitives-foundation/46-CONTEXT.md` — locked decisions A-F
- `.planning/phases/046-renderer-primitives-foundation/046-01-SUMMARY.md` — execution summary
- `.planning/phases/046-renderer-primitives-foundation/046-01-PLAN.md` — execution plan
