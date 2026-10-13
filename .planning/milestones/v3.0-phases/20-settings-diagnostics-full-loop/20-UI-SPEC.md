---
phase: 20
slug: settings-diagnostics-full-loop
status: draft
shadcn_initialized: false
preset: none
created: 2026-10-08
---

# Phase 20 — UI Design Contract

> Visual and interaction contract for Phase 20: Settings Diagnostics & Full-Loop Acceptance.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (vanilla Canvas) |
| Preset | not applicable |
| Component library | custom immediate-mode Canvas (UI, Settings namespaces) |
| Icon library | Unicode emoji + custom pixel glyphs |
| Font | Geist (sans), PP Editorial New (display serif) |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Diagnostic row gaps |
| sm | 8px | Section padding |
| md | 16px | Panel margins |
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
| Mono | 10px (R.fonts.mono) | 400 | 1.2 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #1a1a30 (R.colors.surface) | Diagnostics panel |
| Secondary (30%) | #222240 (R.colors.surfaceElevated) | Data tables |
| Accent (10%) | #e8a030 (R.colors.gold) | Enabled toggle, key metrics |
| Success | #30c830 (R.colors.success) | Pass indicators |
| Warning | #e8a030 (R.colors.warning) | Attention metrics |
| Danger | #c83030 (R.colors.danger) | Fail indicators |
| Info | #3080c8 (R.colors.info) | Debug labels |

---

## Settings Debug Toggle Contract

### Location
Settings scene → "Advanced" section → "Debug Diagnostics" toggle

### Visual
- **Label**: "Debug Diagnostics" + tooltip "Enable bounded local diagnostics (frame, transition, input, persistence, invariants)"
- **Control**: `UI.MagneticBtn` toggle (48px), gold when enabled, surface when disabled
- **State**: Persisted in `G.state.debugMode` (boolean, default false)
- **Immediate effect**: Enable → collectors start; Disable → collectors clear, no output

### Warning Text (below toggle)
> "Diagnostics collect local performance and layout data. No gameplay changes. Data cleared when disabled. May slightly reduce FPS when active."

---

## Diagnostic Collectors (Read-Only)

| Collector | Trigger | Buffer | Output Format |
|-----------|---------|--------|---------------|
| Frame | `?probe` or debugMode | 300 frames | `{ fps, frameMs, scriptGroups: {engine, data, systems, ui, scenes, boot} }` |
| Transition | Scene enter/leave | 50 transitions | `{ from, to, fadeMs, initMs, cleanupMs, timestamp }` |
| Input/Layout | Touch/mouse/keyboard | 200 events | `{ type, coords, hitTarget, viewport, safeArea, timestamp }` |
| Persistence | Save/load | 20 operations | `{ type, timestamp, schemaVersion, migratedFields, storageBytes }` |
| Invariants | On demand | Single run | `{ canvasAlign, colorTokens, fontScale, radiusScale, touchTargets }` |

---

## Diagnostics Panel (Debug Mode Only)

### Access
- Keyboard: `Ctrl+Shift+D` (desktop) / Long-press Settings gear (mobile)
- Or: `?debug` URL parameter

### Visual
- **Panel**: `UI.PremiumShell` full-screen overlay, scrollable
- **Tabs**: Frame | Transition | Input | Persistence | Invariants
- **Tables**: `R.fonts.mono`, sortable columns, color-coded (green/warn/red)
- **Actions**: "Export JSON", "Clear Buffers", "Run Invariants Now"

### Reduced Motion
- No animations in panel
- Instant tab switch
- Static tables

---

## Full-Loop Acceptance Matrix (Human Verification)

| Client | Profile | Journey | Acceptance |
|--------|---------|---------|------------|
| Fresh (no SW) | 400×720 | Start→Map→Zone→Combat→Inspect→Act→Outcome→Save→Reload→Return | Console clean, FPS≥30, dense readable, reduced motion correct |
| Fresh (no SW) | 540×900 | Same | Same |
| Fresh (no SW) | 720×400 | Same | Same |
| Fresh (no SW) | 1024×768 | Same | Same |
| Fresh (no SW) | 1440×900 | Same | Same |
| Existing-worker | 400×720 | Same | Same + cache activation verified |
| Existing-worker | 540×900 | Same | Same |
| Existing-worker | 720×400 | Same | Same |
| Existing-worker | 1024×768 | Same | Same |
| Existing-worker | 1440×900 | Same | Same |

---

## Responsive Behavior

| Viewport | Settings Toggle | Diagnostics Panel |
|----------|-----------------|-------------------|
| 400×720 portrait | Standard 48px toggle | Full-screen overlay |
| 540×900 large portrait | Standard 48px toggle | Full-screen overlay |
| 720×400 landscape | Standard 48px toggle | Full-screen overlay |
| 1024×768 narrow desktop | Standard 48px toggle | Full-screen overlay |
| 1440×900 wide desktop | Standard 48px toggle | Full-screen overlay |

---

## Accessibility & Motion

- `R.reducedMotion()` → panel instant, no animations
- Toggle: 48px touch target, keyboard accessible (Tab/Space)
- Contrast: WCAG AA on all diagnostic text/backgrounds
- Screen reader: Toggle state announced, panel tabs announced
- `?probe` and `?debug` work with reduced motion

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| custom UI | UI.MagneticBtn, UI.PremiumShell, UI.Tabbar | source review |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending