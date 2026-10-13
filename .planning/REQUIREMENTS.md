# Requirements: Mythika — v9.0 Premium UI/UX Foundations

**Defined:** 2026-10-13
**Milestone:** v9.0 — Premium UI/UX Foundations
**Source:** P0 findings from `.planning/phases/045-performance-optimizations/45-UI-AUDIT.md`
**Core Value:** Every play session should feel like a meaningful cultivation journey: the player understands their next path, makes consequential choices, sees those choices reshape the world, and trusts that the resulting state persists.

## v9.0 Requirements

### Renderer Primitives (Foundation Layer)

- [ ] **REND-01**: `R.strokeRoundRect(ctx, x, y, w, h, r, color, lineWidth)` exists and renders a hairline-stroked rounded rect (0.5px offset for crispness) with a test proving it does not crash on null ctx guards
- [ ] **REND-02**: `R.doubleBezel(ctx, x, y, w, h, opts)` renders nested enclosures: outer shell (fill + hairline stroke, outer radius) + inner core (distinct fill, inset top highlight, concentric smaller radius) — used by panels and modals
- [ ] **REND-03**: `R.easePremium(t)` implements the `cubic-bezier(0.32, 0.72, 0, 1)`-equivalent easing curve as a pure function on `t ∈ [0,1]`
- [ ] **REND-04**: `R.spring(t, opts)` implements a critically-damped spring interpolation (amplitude/period overridable) as a pure function
- [ ] **REND-05**: `R.reducedMotion()` is null-safe when called without `G.state` (returns `false` instead of throwing) so engine primitives can be tested in isolation
- [ ] **REND-06**: Semantic token expansion in `R.colors` (overlay, inset, disabled, hairline, shadow tokens) documented and non-breaking for existing consumers

### Button Press Physics & CTA

- [ ] **BTN-01**: Buttons scale to 0.97 on press and spring back on release via `R.spring`/press-timer — not an instant snap (60fps, transform-only)
- [ ] **BTN-02**: `MagneticBtn`'s trailing arrow icon sits inside its own nested circle that translates diagonally + scales on press (Button-in-Button), not naked text
- [ ] **BTN-03**: Press feedback respects `R.reducedMotion()` — scale feedback disabled under reduced motion while state-color feedback remains
- [ ] **BTN-04**: No per-frame object allocation in the button press/release path (reuses state fields on the button instance)

### Panels & Modals (Nested Shells)

- [ ] **PAN-01**: `UI.Panel` renders through `R.doubleBezel` (outer shell + inset-highlight inner core) with the existing R.radius scale, replacing flat fill/stroke
- [ ] **PAN-02**: `UI.Modal` panel uses the double-bezel shell; overlay backdrop alpha interpolates (not instant)
- [ ] **PAN-03**: Modal buttons enter with a 40ms stagger cascade during the modal enter animation
- [ ] **PAN-04**: Modal/panel reduced-motion support is media-aware: `prefers-reduced-motion: reduce` OR `G.state.reduceMotion` both disable motion, not just the state flag

### Reveal Lifecycle (Scene Entrances)

- [ ] **REV-01**: `ScrollReveal.apply()` renders revealed children correctly (fix save/restore order bug — restore must happen AFTER rendering, not before)
- [ ] **REV-02**: Scene entrance reveals use `R.easePremium` over ≥0.35s (replacing 0.12s near-instant), fading up with blur-to-sharp where reduced motion allows
- [ ] **REV-03**: Stagger delays between reveal items use elapsed-time state (30–50ms cadence), not `setTimeout`
- [ ] **REV-04**: `HeroMoment`/`EmptyState` CTAs are constructed once (scene enter or first use) and updated per frame, not allocated per frame

### Out of Scope for v9.0

| Item | Reason |
|------|--------|
| List row stagger/press states (P1) | Deferred to v9.x follow-up; rows rebuild-fade as one block today, acceptable |
| Feedback toast lane rework (P1) | Deferred; toasts functional, entrance exists |
| Boot/error CSS polish (P1) | Deferred; CSS error state now wired (CR-01/CR-02 fixed) |
| Full gameplay/design overhaul | Out of scope — this milestone is shared-UI foundations only |
| Tailwind/DOM migration | Never — immediate-mode Canvas is the runtime contract |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REND-01..06 | Phase 46 | Pending |
| BTN-01..04 | Phase 47 | Pending |
| PAN-01..04 | Phase 48 | Pending |
| REV-01..04 | Phase 49 | Pending |

**Coverage:**
- v9.0 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0
