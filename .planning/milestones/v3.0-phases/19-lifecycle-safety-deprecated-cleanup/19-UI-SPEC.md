---
phase: 19
slug: lifecycle-safety-deprecated-cleanup
status: draft
shadcn_initialized: false
preset: none
created: 2026-10-08
---

# Phase 19 — UI Design Contract

> Visual and interaction contract for Phase 19: Lifecycle Safety & Deprecated-Code Cleanup.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (vanilla Canvas) |
| Preset | not applicable |
| Component library | custom immediate-mode Canvas (Scene, UI namespaces) |
| Icon library | Unicode emoji + custom pixel glyphs |
| Font | Geist (sans), PP Editorial New (display serif) |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Error toast gaps |
| sm | 8px | Recovery button padding |
| md | 16px | Error panel margins |
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
| Dominant (60%) | #1a1a30 (R.colors.surface) | Error recovery panel |
| Secondary (30%) | #222240 (R.colors.surfaceElevated) | Fallback screen |
| Accent (10%) | #e8a030 (R.colors.gold) | Recovery action |
| Destructive | #c83030 (R.colors.danger) | Error indicator |
| Warning | #e8a030 (R.colors.warning) | Deprecation notice |

---

## Lifecycle Failure Recovery Contract

### Error States
| Trigger | Visual | Recovery Action |
|---------|--------|-----------------|
| Scene enter throws | Red banner (top, 48px) + Ashram fallback button | "Return to Ashram" (gold, 48px) |
| Transition fails | Fade to Ashram + Notify "Navigation error" | Auto-recover |
| System unavailable | Disabled actions + Phase 16 blocker tooltip | Graceful degradation |
| Save corruption | Modal "Save data repaired" + Ashram | Auto-repair + continue |

### Visual Specs
- **Error banner**: Full width, 48px height, `danger` background, white text, `R.fonts.md`, dismissible
- **Fallback screen**: Ashram with `Notify` explaining recovery
- **Modal**: `UI.PremiumShell` centered, 320×200px, gold border, "Continue" action

---

## Deprecated Code Removal (No Visual Changes)

This phase removes code only; no new UI components. Visual contracts from Phases 13-18 remain unchanged.

### Removal Documentation
Each removal documented in `19-REMOVALS.md`:
```
- File: src/xyz.js
- Function: deprecatedHelper()
- Replacement: NewHelper.method()
- Evidence: grep -r "deprecatedHelper" → 0 runtime refs
- Contract: tests/xyz.test.js covers replacement
```

---

## Save Migration Safety (No Visual Changes)

| Save Type | Behavior | Visual |
|-----------|----------|--------|
| Fresh v3 | Canonical schema | None |
| v2/legacy | Hydrate + normalize | Silent (Notify only if migration) |
| Direct boot (no SW) | Works | None |
| Cached boot (SW) | Works, cache coherent | None |
| Untouched scenes | Accessible | None |

---

## Responsive Behavior

| Viewport | Error Banner | Fallback Screen | Modal |
|----------|--------------|-----------------|-------|
| 400×720 portrait | Full width, top | Ashram | Centered 320×200 |
| 540×900 large portrait | Full width, top | Ashram | Centered 320×200 |
| 720×400 landscape | Full width, top | Ashram | Centered 320×200 |
| 1024×768 narrow desktop | Full width, top | Ashram | Centered 320×200 |
| 1440×900 wide desktop | Full width, top | Ashram | Centered 320×200 |

---

## Accessibility & Motion

- `R.reducedMotion()` → error banner instant (no slide), modal instant (no scale)
- Error banner: 48px touch target, keyboard dismissible (Esc)
- Color contrast: WCAG AA on error/warning/recovery elements
- Screen reader: Error announced via Notify live region

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| custom UI | UI.Modal, UI.PremiumShell, Notify | source review |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending