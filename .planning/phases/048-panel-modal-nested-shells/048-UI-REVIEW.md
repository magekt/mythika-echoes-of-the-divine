# 048-UI-REVIEW — Panels & Modals Nested Shells

**Phase:** 048-panel-modal-nested-shells · **Plan:** 01 · **Wave:** 1  
**Scope:** `src/ui/panel.js`, `src/ui/modal.js`, `tests/panels.test.js`  
**Render target:** immediate-mode Canvas 2D (no DOM/CSS). Graded against the six visual-design pillars on a 1–4 scale.

---

## Method

Evidence drawn from the committed implementation (files created/modified in phase 048) plus the renderer primitives it depends on (`src/engine/renderer.js` Phase 46: `R.doubleBezel`, `R.easePremium`, `R.reducedMotion`; `src/ui/button.js` Phase 47 press spring). Audited live source, not mocks — `tests/panels.test.js` stubs `R.*` and is treated as behavior verification only.

Status key: ✓ pass ✗ fail ◆ partial ○ not-applicable ⚡ verification note ⚠ risk

---

## Pillar scores

| # | Pillar | Score | Verdict |
|---|--------|-------|---------|
| 1 | Typography | 3 / 4 | centralized font tokens, small positional drift between Panel/Modal |
| 2 | Color | 3 / 4 | all color via `R.colors` tokens; one default/fallback mismatch in Panel |
| 3 | Spacing | 2 / 4 | magic-number offsets, no spatial scale |
| 4 | Consistency | 3 / 4 | shared primitives reused; `_paint`/`_renderHook` duplication in Modal |
| 5 | Feedback states | 2 / 4 | strong entrance choreography; no hover/focus/disabled visual states |
| 6 | Accessibility | 2 / 4 | media-aware reduced motion ✓; canvas = no focus/keyboard/screen-reader path |

**Overall:** 15 / 24 (◆ partial pass) — the nested-shell aesthetic and animation choreography ship as specified, but spacing systematization and feedback/accessibility states remain gaps.

---

## Pillar 1 — Typography: 3 / 4 ✓

Good:
- All text uses shared `R.fonts` tokens (`lg`, `md`, `sm`) — no raw `px` values scattered in panel/modal code.
  - `panel.js:72` title: `R.fonts.lg`; `modal.js:138` title: `R.fonts.md`, `modal.js:140` body: `R.fonts.sm`, `modal.js:145` lines: `R.fonts.sm` dim.
- Font family stack is centralized in `R.fonts` (renderer.js) so a one-token change reflows every panel/modal.
- Color pairing is intentional: titles in `R.colors.orange` (`#e8a030`) against elevated surfaces; body in `R.colors.text`/`R.colors.textDim` for hierarchy.

Problematic:
- Panel title baseline at `y + 16` (`panel.js:72`) vs Modal title at `y + 28` (`modal.js:138`) — arbitrary offsets with no modular scale relationship. A future subtitle tier would need another magic number.
- `UI.Dialog` body text hardcodes line advance `ty += 18` (`panel.js:107`) with no tie to `R.fonts.sm` line height.

What would make it a 10:
- A typographic scale in `R.fonts` (xs/sm/md/lg/xl/display) with named line-height companions, used by Panel/Modal/Dialog via offsets derived from font size instead of magic numbers.

---

## Pillar 2 — Color: 3 / 4 ✓

Good:
- Zero hardcoded color literals in `panel.js`/`modal.js` drawing paths; everything resolves through `R.colors` tokens (`panel`, `panelLight`, `hairline`, `overlay`, `text`, `textDim`, `orange`, `btn`, `btnGold`, `surfaceElevated`, `surface`, `insetHighlight`). Changing the theme palette in `R.colors` re-themes every panel/modal.
- `R.doubleBezel` produces the Doppelrand nested enclosure: outer shell fill + 1px hairline stroke + inset core + 1px top highlight strip (`renderer.js:184-207`). Depth comes from value contrast (`surfaceElevated` shell over `surface` core, `insetHighlight` strip), not gradients or shadows.
- Alpha interpolation: Panel `R.easePremium(p.enterProgress)` wraps shell+title only; children render at `ctx.globalAlpha = 1` (`panel.js:64-74`). Modal overlay `m._alpha * R.easePremium(_overlayProgress)` ramps 0→1 over 250ms (`modal.js:125`). Ghost dissolve `R.easePremium(1 - t)` over 100ms (`modal.js:202`).

Problematic:
- Panel config default color is `R.colors.panel` (`#1a1a30`, `panel.js:19`) but the render fallback is `p.color || R.colors.surfaceElevated` (`#222240`, `panel.js:67`) — a Panel created without an explicit `color` renders a shell slightly different from its declared default.
- `R.colors.hairline` is `rgba(255,255,255,0.08)` and `insetHighlight` `rgba(255,255,255,0.10)` — near-identical values with no documented distinction; risk of drift if one is retuned and the other isn't.

What would make it a 10:
- Align Panel's render fallback with its config default (`R.colors.panel`), and document the hairline vs. insetHighlight roles (stroke vs. core-top strip) so they evolve intentionally.

---

## Pillar 3 — Spacing: 2 / 4 ◆

Problematic:
- Spatial layout is built from magic numbers with no evident 8px (or other) rhythm:
  - `panel.js`: title `y + 16`, Dialog body start `y + 36`, line advance `18`, close button `x + w / 2 - 40`, `y + h - 32`, `80 x 24`.
  - `modal.js`: title `y + 28`, body `y + 56`, line advance `18`, button row `h - buttonHeight - 12`, button height `32`, default size `320 x 200`.
  - `renderer.js:188`: `doubleBezel` default `inset: 6`, highlight strip `Math.min(1, coreH)`.
- Temporal values are deliberate and consistent (250ms overlay ramp, 400ms button window, 40ms stagger, 120ms scale enter, 100ms ghost dissolve) — but nothing ties spatial padding to those durations or to a scale.
- `doubleBezel` inner core guard `coreW <= 0 || coreH <= 0 return` (`renderer.js:198`) protects against zero/negative core dimensions, but small panels could still collapse the inset core silently.

What would make it a 10:
- Introduce a spacing scale (e.g. `R.space.s/m/l`) and derive Panel/Modal insets, title offsets, and button padding from it; assert minimum core dimensions in `R.doubleBezel` so shells never vanish at small sizes.

---

## Pillar 4 — Consistency: 3 / 4 ✓

Good:
- Panel and Modal both render through `R.doubleBezel` (`panel.js:66`, `modal.js:133`/`modal.js:245`) — the Doppelrand shell is the single shared enclosure primitive, exactly as Phase 48 intended.
- Both use `R.easePremium` for alpha interpolation and `R.reducedMotion()` for motion gating (media-aware: `G.state.reduceMotion` AND `prefers-reduced-motion` matchMedia, `renderer.js:108-121`).
- Modal buttons are `UI.Button` instances (`modal.js:56`), so Phase 47 press-spring state (`_visualScale`/`_scaleVel`) applies to every modal button automatically.
- `UI.Component` + mixin pattern reused (`UI.mixinContains(panel, 'm')`, `panel.js:83`).

Problematic:
- Modal paints the overlay+panel+buttons twice: once in `_renderHook` (`modal.js:107-157`, active modal) and once in `_paint` (`modal.js:232-268`, ghost). The bodies are near-duplicate (~40 lines). Any future change to button cascade or title layout must be mirrored in both, a regression risk.
- Panel render alpha-wraps shell+title; Modal `_renderHook` additionally multiplies by an entrance `e` scale factor (`modal.js:114-119`) that Panel doesn't have — slight behavioral divergence between the two shells' enter feel.

What would make it a 10:
- Extract the shared paint body (overlay, shell, text lines, button cascade) into one function called by both `_renderHook` and `_paint`, parameterized by extra alpha/scale so ghost and active stay in lockstep.

---

## Pillar 5 — Feedback states: 2 / 4 ◆

Good:
- Entrance/exit feedback is strong and choreographed: Panel `enterProgress` ramp, Modal overlay alpha ramp, 40ms-staggered button cascade (`_btnProgress[i]`, starts `250ms + 40ms*i`, 400ms window), ghost dissolve `R.easePremium(1 - t)`.
- Press feedback inherited from Phase 47: modal buttons carry `UI.Button` press-spring state, so pointer-down produces `_visualScale` deformation (`src/ui/button.js` interface).

Problematic:
- No hover state, no focus ring, no disabled dimming visible anywhere in `panel.js`/`modal.js`. Hit-testing exists (`UI.handleButtons`, `contains`) but there is no visual reflection of focus/hover/disabled — on a canvas UI that matters because there is no browser focus ring to fall back on.
- Buttons in the cascade fade in via alpha but there is no visual "ready" distinction between an entered-but-unpressed button and a pressed one beyond the press spring.

What would make it a 10:
- Add hover/focus/disabled alpha/tint variants on `UI.Button` rendered by Modal, plus a focus ring drawn around the currently focused child in Panel/Modal `handleInput`.

---

## Pillar 6 — Accessibility: 2 / 4 ◆

Good:
- Reduced motion is media-aware and null-safe: `R.reducedMotion()` checks `G.state.reduceMotion` AND `window.matchMedia('(prefers-reduced-motion: reduce)')` inside try/catch (`renderer.js:108-121`). Panel instant-sets `enterProgress = 1` (`panel.js:52`); Modal instant-sets overlay and all `_btnProgress` to 1 (`modal.js:87-88`). Tests confirm both instant paths (`tests/panels.test.js:120-126`, `158-169`).
- Hit-testing uses original coordinates via `contains()`, not alpha-scaled visual state (threat T-048-05 mitigated per plan).
- Button touch targets: default `buttonHeight: 32`, width clamped `Math.min(140, ...)` (`modal.js:50`) — reasonable default target size.

Problematic:
- Canvas-rendered UI: no DOM elements → no native keyboard focus, no screen-reader announcement, no ARIA roles, no high-contrast forced-colors adaptation. The plan acknowledges UI-only presentation layer (T-048-06 accepted), but there is no announced state for modal open/dismiss or button activation.
- Contrast cannot be fully verified from source alone: `surfaceElevated` (`#222240`) shell over game bg, `hairline` at 8% opacity, `overlay` at 60% — depends on the runtime background which isn't fixed in these files.

What would make it a 10:
- Add an announce hook (`Notify.show` or equivalent) on modal open/dismiss and button activation; document the minimum contrast ratios the `R.colors` shell/text pairs target over the darkest gameplay background.

---

## Must-have verification (PAN-01 … PAN-04)

| Truth | Evidence | Status |
|-------|----------|--------|
| PAN-01 — Panel renders through `R.doubleBezel` nested bezel shell, replacing flat `roundRect` + `strokeRect` | `panel.js:63` comment; `panel.js:66` `R.doubleBezel(ctx, p.x, p.y, p.w, p.h, { shellFill, shellStroke, radius: R.radius.m })` | ✓ pass |
| PAN-02 — Modal overlay alpha interpolates via `R.easePremium(_overlayProgress)` over 250ms ramp | `modal.js:90` `_overlayProgress = Math.min(1, (now - _created) / 250)`; `modal.js:125` `ctx.globalAlpha = alpha * R.easePremium(overlayAlpha)`; instant under reduced motion `modal.js:87` | ✓ pass |
| PAN-03 — Button cascade: `button[i]` starts `250ms + 40ms*i`, ramps over 400ms window | `modal.js:95-96` `startDelayMs = 250 + i * 40`; `_btnProgress[i] = ... / 400`; per-button `ctx.globalAlpha = R.easePremium(bp)` at `modal.js:151` | ✓ pass |
| PAN-04 — Reduced motion media-aware via `R.reducedMotion()` (G.state + matchMedia), no manual `G.state.reduceMotion` | `renderer.js:108-121` `R.reducedMotion()`; `panel.js:52`; `modal.js:81,110,197,218` all route through it | ✓ pass |

All four must_have truths verified against committed source. `tests/panels.test.js` has 5 tests and passes (`node --test tests/panels.test.js`); `node --check` passes on all three files.

---

## Defects / risks found during audit

1. ⚠ `_renderHook` vs `_paint` duplication in `src/ui/modal.js` — paint logic maintained in two places; divergence risk on future edits.
2. ⚠ Panel default color (`R.colors.panel`) ≠ render fallback (`R.colors.surfaceElevated`) — subtle shell-color inconsistency for `UI.Panel(x,y,w,h)` calls without a `color` arg.
3. ○ No hover/focus/disabled visual states — canvas UI has no fallback browser focus ring; keyboard users get no focus indicator.
4. ○ No screen-reader/live-region announcement for modal open/dismiss or button result.
5. ⚡ `tests/panels.test.js` stubs `R.reducedMotion` as `global.__RM === true` (test line 64) — covers the state-reduced branch but not the `matchMedia` branch; implementation covers both, tests cover one.

---

## Recommendations

P1 (before next phase builds on Panel/Modal):
- Dedup `_renderHook`/`_paint` into a single shared paint function in `src/ui/modal.js`.

P2:
- Align Panel render fallback color with its config default (`R.colors.panel`).
- Add hover/focus/disabled visual states on modal buttons + focus ring in Panel/Modal hit handling.
- Introduce a spacing scale and replace magic-number offsets in Panel/Modal/Dialog.

P3:
- Add `Notify.show` announcement on modal open/dismiss/button result for screen-reader parity.
- Extend `tests/panels.test.js` with a `matchMedia`-based reduced-motion case.

---

**Reviewer sign-off:** phased gates PAN-01..PAN-04 all ✓; overall pillar score ◆ partial (15/24). Component ships to spec; polish gaps are additive and do not block subsequent phases.

---
*Phase: 048-panel-modal-nested-shells · Reviewed: 2026-10-22*
