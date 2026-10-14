# Roadmap: Mythika v9.0 — Premium UI/UX Foundations

**Source:** P0 findings from `.planning/phases/045-performance-optimizations/45-UI-AUDIT.md`
**Requirements:** `.planning/REQUIREMENTS.md` (18 total: REND-01..06, BTN-01..04, PAN-01..04, REV-01..04)

## Phases

- [x] **Phase 46: Renderer Primitives Foundation** - New `R` primitives (strokeRoundRect, doubleBezel, easePremium, spring, null-safe reducedMotion, semantic tokens) exist and are unit-tested without touching scene code.
- [x] **Phase 47: Button Press Physics & CTA** - Buttons and MagneticBtn feel physical: 0.97 press scale with spring back, nested CTA icon affordance, reduced-motion respect, zero per-frame allocation.
- [x] **Phase 48: Panels & Modals Nested Shells** - `UI.Panel`/`UI.Modal` render nested double-bezel shells; modal overlay alpha and button cascade animate with media-aware reduced motion.
- [ ] **Phase 49: Reveal Lifecycle & Scene Entrances** - `ScrollReveal` restore-order bug fixed; scene entrances use `easePremium` over ≥0.35s; stagger delays use elapsed-time state; CTA components construct once, update per frame.

## Phase Details

### Phase 46: Renderer Primitives Foundation
**Goal**: The `R` namespace ships pure, testable renderer primitives (stroked rounded rect, double-bezel enclosure, premium easing, critically-damped spring, null-safe reducedMotion, semantic color tokens) that Phases 47–49 build on.
**Depends on**: Nothing (first phase of v9.0; builds on Phase 45)
**Requirements**: REND-01, REND-02, REND-03, REND-04, REND-05, REND-06
**Success Criteria** (what must be TRUE):
  1. `R.strokeRoundRect(ctx, x, y, w, h, r, color, lineWidth)` renders a hairline-stroked rounded rect with 0.5px offset; a unit test proves null-ctx guards do not crash.
  2. `R.doubleBezel(ctx, x, y, w, h, opts)` renders outer shell (fill + hairline stroke, outer radius) plus inset inner core (distinct fill, top highlight, smaller concentric radius); test verifies both layers with mocked ctx.
  3. `R.easePremium(t)` is a pure function on `t ∈ [0,1]` matching the `cubic-bezier(0.32, 0.72, 0, 1)` curve within tolerance; `R.spring(t, opts)` is a pure critically-damped spring with overridable amplitude/period; both covered by `node --test` unit tests.
  4. `R.reducedMotion()` called without `G.state` returns `false` instead of throwing — proven by a test that deletes/bypasses `G.state`.
  5. `R.colors` gains semantic tokens (overlay, inset, disabled, hairline, shadow) documented in `src/engine/codemap.md`; existing consumers still render identically (UI-invariant script passes).
**Key files**: `src/engine/renderer.js`, `src/engine/codemap.md`, `tests/renderer_primitives.test.js` (new)
**Plans**: TBD
**UI hint**: yes

### Phase 47: Button Press Physics & CTA
**Goal**: Buttons and MagneticBtn have tactile press physics and premium CTA affordance so every tap feels deliberate at 60fps with no per-frame allocation.
**Depends on**: Phase 46 (`R.spring`, `R.easePremium`, `R.reducedMotion`)
**Requirements**: BTN-01, BTN-02, BTN-03, BTN-04
**Success Criteria** (what must be TRUE):
  1. Pressing any UI button scales it to 0.97 and releases via `R.spring` back to 1.0 — continuous transform interpolation, not an instant snap; verified visually at 60fps and via `?probe` timing.
  2. `MagneticBtn`'s trailing icon sits inside its own nested circle (Button-in-Button) that translates diagonally + scales on press; the icon is no longer naked text.
  3. Under reduced motion (`prefers-reduced-motion` or `G.state.reduceMotion`), scale feedback is disabled but state-color feedback still occurs; a reduced-motion self-test path confirms it.
  4. The press/release path performs zero per-frame object allocation — state reuses fields on the button instance; confirmed by code inspection + `?probe` GC/timing sanity check.
**Key files**: `src/ui/button.js`, `src/ui/codemap.md`, `tests/button_press_physics.test.js` (new)
**Plans**: TBD
**UI hint**: yes

### Phase 48: Panels & Modals Nested Shells
**Goal**: Panels and modals render nested double-bezel shells with animated overlay/cascade behavior and full media-aware reduced-motion support.
**Depends on**: Phase 46 (`R.doubleBezel`, `R.easePremium`, `R.colors` tokens)
**Requirements**: PAN-01, PAN-02, PAN-03, PAN-04
**Success Criteria** (what must be TRUE):
  1. `UI.Panel` renders through `R.doubleBezel` (outer shell + inset-highlight inner core) using the existing `R.radius` scale; flat fill/stroke rendering is gone.
  2. `UI.Modal` panel uses the double-bezel shell and its overlay backdrop alpha interpolates over the enter/exit animation rather than snapping instantly.
  3. Modal buttons enter with a 40ms stagger cascade during the modal enter animation (verified in portrait and landscape).
  4. Reduced-motion support is media-aware: both `prefers-reduced-motion: reduce` and `G.state.reduceMotion` disable motion; a `&selftest`-style check confirms state-only no longer suffices.
**Key files**: `src/ui/panel.js`, `src/ui/modal.js`, `src/ui/codemap.md`, `tests/panel_modal_shells.test.js` (new)
**Plans**: TBD
**UI hint**: yes

### Phase 49: Reveal Lifecycle & Scene Entrances
**Goal**: Scene entrances and reveals animate on a premium duration/easing schedule with time-based stagger and zero per-frame CTA allocation, so scene transitions read as composed moments.
**Depends on**: Phase 46 (`R.easePremium`, `R.reducedMotion`)
**Requirements**: REV-01, REV-02, REV-03, REV-04
**Success Criteria** (what must be TRUE):
  1. `ScrollReveal.apply()` renders revealed children correctly — save/restore order fixed so `restore` happens AFTER rendering (verified via `?probe` and a focused test).
  2. Scene entrance reveals run ≥0.35s through `R.easePremium`, fading up with blur-to-sharp when motion is allowed; the old 0.12s near-instant entrance is gone.
  3. Stagger delays between reveal items use elapsed-time state on a 30–50ms cadence — no `setTimeout` in the reveal path.
  4. `Scene.HeroMoment` / `Scene.EmptyState` CTAs are constructed once (scene enter / first use) and updated per frame, not allocated per frame; confirmed by allocation-free code path inspection.
**Key files**: `src/engine/scene-helpers.js`, `src/ui/button.js`, `src/scenes/` (entrance wiring), `tests/reveal_lifecycle.test.js` (new)
**Plans**: TBD
**UI hint**: yes

## Coverage

- 18/18 requirements mapped (REND-01..06 → P46, BTN-01..04 → P47, PAN-01..04 → P48, REV-01..04 → P49). No orphans.
- Phase order: 46 → {47, 48, 49} (47/48/49 are siblings; 48 may prefer 47's reduced-motion wiring but has no hard dependency on 47).
