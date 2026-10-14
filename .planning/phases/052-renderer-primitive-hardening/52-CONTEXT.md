# Phase 52: Renderer Primitive Hardening — Context

## Grey Area Decisions (auto-accepted, yolo mode)

### A. R.strokeRoundRect validation
- **Decision:** Add `lineWidth` validation — clamp to ≥0.5 (hairline minimum). If `ctx` is null/falsy, return silently (consistent with `R.doubleBezel` pattern).
- **Rationale:** Prevents invalid line widths that cause rendering artifacts. Null-safety matches `R.doubleBezel` pattern.
- **Source:** REQUIREMENTS.md REND-07

### B. R.doubleBezel — insetHighlight support
- **Decision:** Add optional `opts.insetHighlight` parameter for custom inner highlight color. Default falls back to `R.colors.insetHighlight`. Add null-check: if `coreW <= 0 || coreH <= 0`, skip inner core rendering (prevents negative dimensions).
- **Rationale:** Enables customization for special states (error, focus, etc.) without breaking layout. Null-check prevents NaN dimensions on tiny containers.
- **Source:** REQUIREMENTS.md REND-08

### C. R.easePremiumInv(t) — inverse easing
- **What:** Inverse function of `R.easePremium(t)`. Given progress `p ∈ [0,1]`, returns `t` such that `easePremium(t) = p`. Uses binary search or analytical inverse of smoothstep.
- **Rationale:** Needed for progress-to-time mapping (e.g., "at what time is the animation 50% complete?"). Pure function, no state.
- **Source:** REQUIREMENTS.md REND-09

### D. R.spring.step(springState, dt) alias
- **What:** `R.spring.step(springState, dt)` where `springState = { current, velocity, config }`. Returns `{ value, velocity }`. Pure alias for `springStep(current, velocity, dt)`.
- **Rationale:** Cleaner caller API: `const { value, velocity } = R.spring.step(state, dt)` vs `springStep(current, velocity, dt)`. Encapsulates state in object.
- **Source:** REQUIREMENTS.md REND-10

### E. R.reducedMotion.watch(cb) — reactive listeners
- **What:** `R.reducedMotion.watch(callback)` registers a callback fired when reduced-motion preference changes (via `matchMedia` change event). Returns unsubscribe function. Opt-in, no overhead if unused.
- **Rationale:** Enables reactive UI updates when user toggles reduced-motion at OS level. Opt-in so zero overhead for non-users.
- **Source:** REQUIREMENTS.md REND-11

### F. Semantic token expansion
- **Decision:** Add 4 new semantic tokens to `R.colors`:
  - `focus`: `rgba(232,160,48,0.6)` — gold focus ring
  - `success`: `rgba(76,200,48,0.9)` — green success
  - `warning`: `rgba(232,160,48,0.9)` — gold/orange warning
  - `danger`: `rgba(200,48,48,0.9)` — red danger/error
- **Rationale:** Completes semantic token set for consistent state colors across UI. Replaces ad-hoc raw colors.
- **Source:** REQUIREMENTS.md REND-12

---

## Files to Modify

### `src/engine/renderer.js`
1. `R.strokeRoundRect` — add `lineWidth` validation (clamp ≥0.5), null-ctx guard
2. `R.doubleBezel` — add `opts.insetHighlight` support; null-check `coreW/coreH ≤ 0`
3. `R.easePremiumInv(t)` — inverse of smoothstep (binary search or analytical)
4. `R.spring.step(springState, dt)` — alias for cleaner caller code
5. `R.reducedMotion.watch(cb)` — reactive listener registration
6. `R.colors` — add `focus`, `success`, `warning`, `danger` tokens

### `tests/renderer_extended.test.js` (new)
Node test file (CommonJS, `node:test` + `node:assert/strict`). Covers:
- `R.strokeRoundRect`: validation, null-ctx guard, stroke called once
- `R.doubleBezel`: `insetHighlight` override, zero-dimension guard
- `R.easePremiumInv`: inverse accuracy (e.g., `easePremiumInv(easePremium(0.5)) ≈ 0.5`)
- `R.spring.step`: advances spring state correctly
- `R.reducedMotion.watch`: registers/unregisters callback
- New semantic tokens present in `R.colors`

---

## Files to Modify

### `src/engine/renderer.js`
- Lines 139-157: `R.strokeRoundRect` — add validation
- Lines 160-180: `R.doubleBezel` — add `insetHighlight`, null-check
- After line 187: add `R.easePremiumInv`
- After line 201: add `R.spring.step`
- Lines 97-110: `R.reducedMotion` — add `.watch(cb)`
- Lines 37-41: add `focus`, `success`, `warning`, `danger` to `R.colors`

### `tests/renderer_extended.test.js` (new)
CommonJS, `node:test` + `node:assert/strict`. MockCtx pattern matching `tests/renderer.test.js`.

---

## Success Criteria (from REQUIREMENTS.md)

1. `R.strokeRoundRect` — `lineWidth` validation (clamp ≥0.5), null-ctx guard
2. `R.doubleBezel` — `opts.insetHighlight` support; null-check `coreW/coreH ≤ 0`
3. `R.easePremiumInv(t)` — inverse function, accurate to 0.001
5. `R.spring.step(springState, dt)` — alias for cleaner caller code
6. `R.reducedMotion.watch(cb)` — reactive listeners, unsubscribe returns
7. New semantic tokens present in `R.colors` (focus, success, warning, danger)
7. All new functions covered by `tests/renderer_extended.test.js`

---

## Verification Commands

- `node --check src/engine/renderer.js` — syntax OK
- `node --check tests/renderer_extended.test.js` — syntax OK
- `node --test tests/renderer_extended.test.js` — all pass
- `node --test tests/*.test.js` — full suite green
- `tools/check_ui_invariants.sh` — all pass
- `python3 tools/verify_matrix.py --budget 6000` — 3/3 profiles clean

---

## Source Attribution

- Decisions from: REQUIREMENTS.md (REND-07..12), ROADMAP-v10.md Phase 52
- Phase goal: "Harden renderer primitives added in Phase 46 — add validation, inverse easing, spring step alias, reactive reduced-motion, 4 new semantic tokens"
- Dependencies: Phase 46 (primitives exist), Phase 50 (UI.Component uses R.spring/easePremium)
- UI hint: no

---

## Output
Write CONTEXT.md to `.planning/phases/052-renderer-primitive-hardening/52-CONTEXT.md`