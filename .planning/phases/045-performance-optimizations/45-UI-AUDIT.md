# UI/UX Premium Audit — Canvas Game Context

**Target surface and users.** This audit covers the shared immediate-mode UI layer used across Mythika's portrait and landscape scenes: buttons, panels, lists, modal decisions, feedback overlays, scene layout helpers, renderer primitives, and boot/error CSS. The primary users are touch-first mobile players making frequent, high-speed cultivation decisions; mouse/keyboard users and players with reduced-motion or enlarged-type settings are secondary but must receive the same state clarity.

**Audit basis.** Awwwards-tier premium patterns are translated to a 400×720 logical Canvas surface, not DOM assumptions: interpolated state, nested bezels, depth hierarchy, deliberate whitespace, 30–50ms cascades, 0.97 press scale, trailing-icon CTAs, and `R.reducedMotion()`/`prefers-reduced-motion` parity.

## Gap Summary (table)

| File / surface | Current maturity | Highest gap | Priority |
|---|---:|---|---|
| `src/ui/button.js` | Partial premium layer | Base button has no interpolated hover/press scale; `MagneticBtn` icon is hover-only and not a nested CTA affordance | P0 |
| `src/ui/panel.js` | Functional baseline | Single flat fill/stroke; no reusable double-bezel, depth, or entrance lifecycle | P0 |
| `src/ui/list.js` | Functional baseline | Rows appear in a uniform grid and only rebuild-fade as one block; no row press state or stagger | P1 |
| `src/ui/modal.js` | Partial premium layer | Enter/exit scale exists, but overlay/panel are raw, buttons do not cascade, and reduced-motion is state-only | P0 |
| `src/ui/feedback.js` | Partial premium layer | Toast entrance exists, but stacks are rigid, raw colors are repeated, and dismiss/press feedback is incomplete | P1 |
| `src/engine/scene-helpers.js` | Partial premium layer | Helpers duplicate UI implementations; `ScrollReveal.apply()` restores before a child can render and several helpers use raw colors | P0 |
| `src/engine/renderer.js` | Strong primitive base, inconsistent tokens | No stroked round-rect/double-bezel/easing primitive; many direct hex/rgba values bypass semantic tokens | P0 |
| `styles/game.css` | Functional boot states | Courier/raw hex, linear boot fade, and no semantic CSS variables for loading/error states | P1 |

## Per-Component Analysis

### `src/ui/button.js`

**What exists now.** `UI.Button` defines shared hit testing, enabled/visible state, a 120ms press timer, and a 1px positional shrink at lines 65–113. `UI.MagneticBtn` adds a scale target, trailing/leading icon fields, and reduced-motion branching at lines 376–525; `Scene.primaryAction` can therefore opt into a premium-looking button.

**Gap vs. premium standard.** The base button does not interpolate hover or press scale: lines 88–92 only offset and resize the rectangle, so the interaction is a snap, not a 0.97 spring. `MagneticBtn` uses a first-order lerp at lines 400–401 rather than the declared stiffness/damping spring, and line 516 targets `0.98`, not the required press response. The trailing icon is drawn only while hovered at lines 470–487, has no own circle/container, and is absent for touch users without hover. The component also uses direct `rgba`/raw semantic aliases at lines 346–349 and 430–465 instead of a complete token API. The `UI.Button.prototype` patch at lines 741–752 is ineffective because buttons are plain returned objects, not prototype-backed renderers.

**Concrete fix.** Add a shared `R.easePremium(t)` and per-button `visualScale`/`visualY` state; drive it from `_pressed` and pointer-down state with a real semi-implicit spring or a documented critically damped approximation, targeting `0.97` on press and returning to `1`. Render all primary CTAs through one routine: button body, inset top hairline, label, and a 24px trailing-icon circle at the right with an arrow always visible on touch. Move disabled styling into the returned object's `render`, delete the ineffective prototype patch, and replace component-local alpha literals with `R.colors.*` tokens.

**Priority: P0.** This is the highest-frequency interaction and affects every screen.

### `src/ui/panel.js`

**What exists now.** `UI.Panel` provides a reusable rectangle with children, optional centered title, close button, containment, and child rendering at lines 1–66. `UI.Dialog` composes it for simple text plus a close action at lines 69–83.

**Gap vs. premium standard.** Lines 33–52 draw one flat fill and one border with a hard-coded radius of `6`; there is no double-bezel, inset highlight, bottom seat, shadow substitute, or z-axis distinction between panel and content. Child layout is caller-owned, so titles can collide with content and panels have no macro padding contract. `handleInput` also calls `UI.handleButtons(all)` without a panel scroll coordinate or explicit topmost-child ordering, weakening modal-like interaction semantics.

**Concrete fix.** Make `UI.Panel` render an outer shell and inner core using a new `R.doubleBezel(ctx, rect, tokens)` primitive: outer surface + hairline stroke, inset surface, 1px top highlight, and a restrained bottom shade. Expose `contentRect()` and a title baseline based on an 8px spacing grid. Add `enterProgress`/`exitProgress` and `update(dt)` so panels fade-up and blur-in on creation, while honoring `R.reducedMotion()`. Render close buttons after children and route input in reverse z-order.

**Priority: P0.** Panels frame most screens and currently flatten every hierarchy level.

### `src/ui/list.js`

**What exists now.** `UI.ScrollList` supports fixed or variable row heights, clipped rendering, scroll-wheel/touch delta consumption, selection, and a 90ms rebuild crossfade at lines 19–112. Custom row painting is delegated through `onRenderItem`.

**Gap vs. premium standard.** The default rows at lines 96–98 are a uniform grid with `itemGap` only 4px and no nested boundary, press state, or per-row depth. The single `fade` at lines 81–94 fades all visible rows together; it is not a 30–50ms cascade. `handleInput` immediately selects and fires at lines 45–55, with no 0.97 press feedback or interpolated selected transition. Scroll motion clamps immediately at lines 64–68, and the scroll indicators are direct raw colors at lines 104–108.

**Concrete fix.** Store per-item `{pressed, pressProgress, revealProgress}` state keyed by stable item identity. Give each row an 8px rhythm, a double-bezel shell, selected accent inset, and a 0.97 press scale that is rendered around the row center. Start visible rows with 40ms stagger using `R.easePremium`; interpolate `scrollY` toward a target with bounded velocity, and use a tokenized scrollbar/edge fade. Preserve culling and callback APIs.

**Priority: P1.** High visibility in inventory, party, and shop flows; less global than button/panel primitives.

### `src/ui/modal.js`

**What exists now.** The modal system queues dialogs, blocks scene input, paints a full-screen overlay, and already has a 120ms fade/0.96→1 entrance plus a 100ms ghost exit at lines 132–160. Button construction and result callbacks are centralized at lines 38–53 and 63–81.

**Gap vs. premium standard.** The visual shell at lines 94–116 is one panel fill with a 2px orange border, not a nested premium boundary; the overlay at line 94 is a raw black alpha. Buttons are rendered together at lines 126–128 with no stagger and use the base `UI.Button`, so press scale and trailing CTA affordances are missing. Reduced motion checks only `G.state.reduceMotion` at lines 152–155, unlike the global media-aware contract in `R.reducedMotion()`. There is no explicit outside-tap/Escape dismissal policy for non-confirmation modals, and body text is still single-line at line 119 despite the newline normalization comment.

**Concrete fix.** Route `_paint` through `UI.PremiumShell`/`R.doubleBezel`, tokenizing overlay and borders. Add a modal-local `update(dt)` that animates overlay alpha and panel z-scale using `R.easePremium`, with buttons delayed 40ms per index. Use `R.reducedMotion()` for both enter and exit. Implement measured word wrapping against `m.w - 32`, preserve accessible button order, and define explicit `dismissOnBackdrop`/Escape behavior so confirmation dialogs cannot be accidentally dismissed.

**Priority: P0.** Decisions are high-stakes; a flat or ambiguous modal increases error risk across every screen.

### `src/ui/feedback.js`

**What exists now.** Toasts queue up to three items, age out, wrap to two lines, play click feedback, and use a 150ms upward entrance with reduced-motion handling at lines 78–127. Inline hints, contextual badges, and blocker tooltips provide additional feedback primitives with basic hover/long-press behavior.

**Gap vs. premium standard.** Toasts stack from a fixed `ty = 470` at lines 89–101 and are laid out synchronously; existing toasts do not cascade or spatially settle when another toast enters/exits. The shell is a raw black rectangle at line 104 and the toast has no inset highlight or dedicated icon/CTA zone. Inline hint dismissal checks hover at lines 207–213 but does not render a press-scale state despite `_pressed` existing at lines 164–166. Badge pulse is a continuous sine pulse at lines 277–280 rather than a semantic state transition, and tooltip shells at lines 343–349 and 463–468 repeat raw colors.

**Concrete fix.** Give every toast a stable lane slot and spring its `y`/alpha/scale to the slot, with 40ms insertion stagger and cubic easing. Use a tokenized double-bezel toast with a left status rail, icon circle, and optional action affordance. Wire inline-hint press state to a 0.97 scale and animate dismissal rather than removing immediately. Replace repeated raw colors with overlay/surface/border tokens and gate pulse/tooltip motion through `R.reducedMotion()`.

**Priority: P1.** Feedback is frequent and should feel intentional, but it does not define the primary navigation path.

### `src/engine/scene-helpers.js`

**What exists now.** The file centralizes static draws, scroll input, scrollbar drawing, headers, responsive layout, clipping, navigation, and premium-named `HeroMoment`, `ScrollReveal`, `FluidNav`, and `EmptyState` helpers. It also contains corrected hit-testing for the fluid nav at lines 341–371 and a toast lane contract at lines 438–454.

**Gap vs. premium standard.** `Scene.ScrollReveal.apply()` saves, sets alpha/translate/filter, and immediately restores at lines 212–219; it never renders the element, so callers must know an undocumented wrapper contract and can easily get no reveal. Its delayed reveal uses `setTimeout` at lines 197–200, which is not frame-deterministic and is awkward to cancel on scene leave. `drawHeader` and `FluidNav` repeat raw rgba colors at lines 76–82 and 294–297/329–330. `FluidNav` uses a lerp at lines 280–286, not spring physics, and the expanded links have no button press state. `HeroMoment` creates a fresh CTA inside `render` at lines 171–174, risking per-frame object allocation and losing persistent press state. `EmptyState` has the same per-frame button construction at lines 429–433.

**Concrete fix.** Change reveal to an explicit `render(ctx, el, draw)` wrapper or return a draw callback that remains inside the save/restore scope; replace timers with elapsed `delay` state updated by the scene loop and reset it on leave. Centralize `drawPremiumHeader`, `drawFluidNav`, and `drawEmptyState` around tokenized primitives. Instantiate Hero/EmptyState buttons once in the factory, add 40ms cascade metadata, and use a shared critically damped spring with `R.reducedMotion()` snapping.

**Priority: P0.** These helpers multiply flaws across many scenes and currently make the premium APIs unreliable.

### `src/engine/renderer.js`

**What exists now.** `R` defines a broad palette, radius scale, Geist/PP Editorial New font ladder, font scaling, noise, reduced-motion detection, rounded fills, text helpers, and bounded effect buffers at lines 1–93. `R.roundRect` and the effect renderers provide a useful immediate-mode foundation.

**Gap vs. premium standard.** The renderer has no stroked rounded-rectangle primitive; callers fall back to `strokeRect`, producing square corners (for example `scene-helpers.js:28`, `panel.js:38–51`, and `modal.js:104–116`). Semantic tokens exist, but large portions of renderer code use direct hex and rgba, including enemy/hero colors at lines 202–210/247–250, click FX at lines 523–555, zone backgrounds at lines 748–827, and aura colors at lines 590–599. `R.reducedMotion()` assumes `G.state` exists at line 91, which is unsafe during boot/test harness calls. There is no shared premium easing function, no shadow/depth abstraction, and `R.text` does not normalize `textBaseline`, allowing direct Canvas calls to drift vertically.

**Concrete fix.** Add `R.strokeRoundRect`, `R.doubleBezel`, `R.easePremium(t)`, and `R.spring(current, target, velocity, dt, config)` with documented reduced-motion behavior. Expand semantic tokens for overlay, insetHighlight, insetShade, disabled, and focus; migrate UI/shared helper literals first, then scene-specific palette values. Make `reducedMotion()` null-safe (`G?.state?.reduceMotion`) and normalize `textBaseline` in `R.text`/center helpers. Keep effects bounded and avoid Canvas filters on low-end devices by allowing a quality fallback for blur.

**Priority: P0.** Renderer primitives are the safest leverage point for consistent depth, easing, accessibility, and performance.

### `styles/game.css`

**What exists now.** CSS establishes a centered 400×720 game container, responsive fill mode, native input overlay, loading/error splash, safe-area handling, and reduced-motion overrides at lines 1–190. The boot state includes a rotating crossed-swords loader and a short opacity transition.

**Gap vs. premium standard.** Global surfaces and text use raw hex and `'Courier New'` at lines 3, 10, and 22–25, while Canvas tokens specify Geist and editorial serif. Loading/error transitions are explicitly `linear` at line 92 and use repeated raw colors throughout lines 86–146, creating a cheaper visual language than the Canvas UI. The spinner is a generic CSS diagonal-cross animation at lines 148–170 rather than an editorial, tokenized loading moment. CSS variables only exist for input text/focus and have raw fallback values at lines 54–55; there is no semantic CSS mirror for surfaces, accent, border, or type.

**Concrete fix.** Define `:root` semantic variables mirroring the approved `R.colors`/font tokens and use them for body, container, splash, progress, and error states. Replace the linear transitions with the premium cubic-bezier equivalent and add a subtle opacity/translate boot sequence that is disabled under reduced motion. Keep the Canvas coordinate contract unchanged, preserve `fill` mode, and ensure error copy remains high contrast (AA) against the error surface.

**Priority: P1.** Boot states are brief but are the first brand impression and appear before Canvas content exists.

## Recommended Fixes (ordered by priority)

### P0 — shared interaction and depth foundation

1. **Harden renderer primitives first** (`renderer.js:1–116`): add semantic depth tokens, `strokeRoundRect`, `doubleBezel`, premium cubic easing, and a null-safe reduced-motion gate.
2. **Repair shared button behavior** (`button.js:65–113`, `376–525`): persistent object state, true 0.97 press spring, touch-visible trailing arrow circle, and removal of the ineffective prototype patch (`741–752`).
3. **Make panels and modals use the same shell** (`panel.js:33–60`, `modal.js:91–129`): outer/inner boundaries, inset highlight, content padding, reverse z-order input, 40ms button cascade, and media-aware reduced motion.
4. **Fix reveal lifecycle** (`scene-helpers.js:179–219`): no `setTimeout`, no restore-before-render, explicit scene-leave cancellation, and a reusable 30–50ms stagger contract.

### P1 — high-visibility rhythm and feedback

5. **Upgrade list rows** (`list.js:71–110`): per-row reveal/press state, 8px rhythm, nested row shell, interpolated scroll, and tokenized edge indicators.
6. **Upgrade feedback lanes** (`feedback.js:89–127`, `183–225`): spring slot reflow, staggered toast insertion, double-bezel shell, and actual inline-hint press feedback.
7. **Align boot/error CSS** (`game.css:2–176`): semantic variables, Geist/editorial typography, cubic-bezier transitions, and accessible error contrast.

### P2 — refinement after instrumentation

8. Add a lightweight Canvas quality tier for `ctx.filter` blur and noise on low-end mobile GPUs; default to opacity/translate if frame time exceeds budget.
9. Add scene-level visual rhythm presets for hero, section gap, card inset, and toast lane so individual scenes stop inventing spacing.
10. Add a UI harness screenshot matrix for 400×720, 540×900, 720×400, 1024×768, and 1440×900, including reduced-motion and enlarged-font variants.

## Risks (things that would break the Canvas game if implemented poorly)

- **Hitbox/render divergence:** scaling a button visually without applying the same transform only to pixels is acceptable; scaling its hit rectangle is not. Keep logical hitboxes stable and transform around center.
- **Classic-script global order:** do not convert UI files to modules or reorder `R`, `UI`, `Input`, `G`, or `Scene` scripts; these are synchronous globals.
- **Per-frame allocations:** do not instantiate buttons, shells, or reveal timers in `render`; factories must own persistent interaction state.
- **Canvas state leakage:** every `save()` must pair with `restore()`, including `globalAlpha`, `filter`, `textAlign`, `textBaseline`, and `globalCompositeOperation`.
- **Scene transitions:** queued modals, toasts, and reveal timers must clear on scene leave or stale pixels/input can survive into the next scene.
- **Reduced motion parity:** `G.state.reduceMotion` and the media query must produce a static but still legible state; never hide functional feedback when motion is disabled.
- **Blur cost:** `ctx.filter` can be expensive or unsupported on mobile browsers; guard it with a quality fallback and do not blur the entire Canvas.
- **Scroll coordinate contracts:** preserve `scrollY` translation and native input overlay synchronization; visual row motion must not alter logical coordinates.
- **Contrast regressions:** gold on elevated surfaces and disabled states must be checked at the actual alpha-composited result, not token values in isolation.
- **Typography metrics:** PP Editorial New may not be available at boot; retain Georgia fallback and measure wrapped text before laying out buttons.

## AUDIT COMPLETE

- Add renderer-level `doubleBezel`, semantic depth tokens, premium easing, and null-safe reduced-motion handling.
- Replace button snap feedback with a persistent 0.97 press spring and touch-visible trailing arrow CTA.
- Route panels/modals/lists/toasts through shared nested shells and deterministic staggered reveals.
- Fix `ScrollReveal.apply()` lifecycle and eliminate per-frame CTA construction in scene helpers.
- Keep Canvas globals, logical hitboxes, clipping, save/restore, and mobile GPU limits intact.
