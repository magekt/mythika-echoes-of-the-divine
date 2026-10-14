---
phase: 52-renderer-primitive-hardening
reviewed: 2026-10-14T00:00:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - src/engine/renderer.js
  - tests/renderer_extended.test.js
findings:
  critical: 1
  warning: 3
  info: 4
  total: 8
status: issues_found
---

# Phase 52: Code Review Report

**Reviewed:** 2026-10-14T00:00:00Z
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Reviewed the Phase 52 Renderer Primitive Hardening changes in `src/engine/renderer.js` and the corresponding test file `tests/renderer_extended.test.js`. All 22 new tests pass, and the full test suite (579 tests) passes with no regressions.

However, the review uncovered **1 Critical issue** (duplicate color token definitions causing silent overwrites), **3 Warnings** (documentation/implementation mismatch, missing initial callback fire, negative dimension handling), and **4 Info items** (test coverage gaps, minor code style issues).

---

## Critical Issues

### CR-01: Duplicate Semantic Color Tokens Overwrite Earlier Definitions

**File:** `src/engine/renderer.js:32-35, 44-47`

**Issue:** The `R.colors` object defines `success`, `warning`, and `danger` **twice** — first at lines 32-35 as hex strings, then again at lines 45-47 as rgba strings. In JavaScript object literals, later keys silently overwrite earlier ones. The Phase 46 tokens (hex) are completely lost; only the Phase 52 tokens (rgba) remain.

```javascript
// Lines 32-35 (Phase 46)
success: '#30c830',
warning: '#e8a030',
danger: '#c83030',
info: '#3080c8',

// Lines 44-47 (Phase 52) — THESE WIN
focus: 'rgba(232,160,48,0.6)',
success: 'rgba(76,200,48,0.9)',    // overwrites '#30c830'
warning: 'rgba(232,160,48,0.9)',   // overwrites '#e8a030'
danger: 'rgba(200,48,48,0.9)',     // overwrites '#c83030'
```

Any code referencing `R.colors.success`, `R.colors.warning`, or `R.colors.danger` expecting the original hex values (e.g., for direct canvas `fillStyle` without alpha) will now receive rgba strings. This may cause subtle rendering differences (alpha blending where none was intended) or break string-matching logic.

**Fix:** Remove the duplicate keys from the Phase 52 block, or rename the new tokens to avoid collision (e.g., `successSolid`, `warningSolid`, `dangerSolid` for the hex versions, or `successAlpha`, etc. for the rgba versions). Since the Phase 52 comment says "additive, do not remove existing keys," the intent was additive — but the implementation violates that.

```javascript
// Fix: Use distinct names for the rgba variants
// Phase 52 semantic tokens — additive, do not remove existing keys
focus: 'rgba(232,160,48,0.6)',
successAlpha: 'rgba(76,200,48,0.9)',
warningAlpha: 'rgba(232,160,48,0.9)',
dangerAlpha: 'rgba(200,48,48,0.9)',
```

Then update any new Phase 52 callers to use the `Alpha` suffix. Existing callers using `success`/`warning`/`danger` continue to work with hex values.

---

## Warnings

### WR-01: R.spring.step Documentation Claims "Pure Function" but Mutates Input

**File:** `src/engine/renderer.js:239-250`

**Issue:** The JSDoc-style comment at line 239 states:
> "Step alias for cleaner caller code: springState = R.spring.step(springState, dt) ... **Mutates and returns the same state object for chaining.**"

But the earlier comment at line 225 says:
> "// Critically-damped spring factory — **pure, no state**."

And the Phase 52 summary describes `R.spring.step` as a "pure function, defensive copy." The implementation at lines 246-249 **mutates** the passed `springState` object:

```javascript
var r = fn(springState.value, springState.velocity, dt);
springState.value = r.value;      // MUTATION
springState.velocity = r.velocity; // MUTATION
return springState;                // Returns same object
```

This is a **documentation/implementation mismatch**. Callers expecting a pure function (new object returned, input unchanged) will encounter shared-state bugs if they reuse the input object elsewhere.

**Fix:** Either update the documentation to accurately describe the mutating behavior, or change the implementation to be truly pure (create and return a new object). Given the "for chaining" comment, mutation appears intentional — so fix the docs:

```javascript
// Step alias for cleaner caller code: springState = R.spring.step(springState, dt)
// Expects springState to have { value, velocity, _springFn } where _springFn is from R.spring(config).
// **MUTATES** and returns the same state object for chaining.
// For a pure version, use: const next = { ...springState }; R.spring.step(next, dt);
R.spring.step = function(springState, dt) {
```

### WR-02: R.reducedMotion.watch Does Not Fire Callback with Initial State

**File:** `src/engine/renderer.js:118-128`

**Issue:** The `watch` function attaches a `change` event listener to `matchMedia` but **never calls the callback with the current `matches` value** on registration. Subscribers only receive updates on *change*, missing the initial reduced-motion state. This is a common pattern bug — callers expecting immediate synchronization must manually call `R.reducedMotion()` themselves.

**Fix:** Invoke the callback once with the current match state during registration:

```javascript
R.reducedMotion.watch = function(cb) {
  if (typeof cb !== 'function') return function() {};
  var w = (typeof window !== 'undefined') ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
  var handler = function(e) { cb(e.matches); };
  if (w && w.matchMedia) {
    var mq = w.matchMedia('(prefers-reduced-motion: reduce)');
    // Fire immediately with current state
    cb(mq.matches);
    mq.addEventListener('change', handler);
    return function() { mq.removeEventListener('change', handler); };
  }
  // No matchMedia: fire once with false (no preference)
  cb(false);
  return function() {};
};
```

### WR-03: R.strokeRoundRect Accepts Negative Width/Height Without Normalization

**File:** `src/engine/renderer.js:156-175`

**Issue:** The function uses `Math.abs(w)` and `Math.abs(h)` only for radius clamping (line 159), but the path construction uses the raw `w` and `h` values (lines 162-170). If a caller passes negative dimensions, the rectangle renders inverted/flipped with incorrect corner radii. While this may be intentional for flexibility, it's a footgun — most callers expect positive dimensions.

The sister function `R.roundRect` (line 136) explicitly guards: `if (w <= 0 || h <= 0) return;`.

**Fix:** Add the same guard or normalize dimensions:

```javascript
R.strokeRoundRect = function(ctx, x, y, w, h, r, color, lineWidth) {
  if (!ctx) return;
  if (w <= 0 || h <= 0) return;  // Guard like R.roundRect
  lineWidth = Math.max(0.5, lineWidth || 1);
  r = Math.min(r, w / 2, h / 2);  // w/h now guaranteed positive
  // ... rest unchanged
};
```

---

## Info

### IN-01: R.easePremiumInv Binary Search Precision Exceeds Documented Claim

**File:** `src/engine/renderer.js:212-223`

**Issue:** The comment claims "~0.001 accuracy (20 iterations)" but 20 iterations of binary search on [0,1] yields precision of 1/2^20 ≈ **9.5e-7** (0.00000095), which is **~1000x more precise** than claimed. The test at line 189 verifies `< 0.002` round-trip error, which passes easily.

**Suggestion:** Update the comment to reflect actual precision, or reduce iterations if 0.001 is the true target (10 iterations gives ~0.001). Current 20 iterations is fine for performance (microseconds) but the comment is misleading.

### IN-02: R.doubleBezel Highlight Strip Radius Logic Uses stripH as Radius

**File:** `src/engine/renderer.js:199-200`

**Issue:** The highlight strip uses `stripH = Math.min(1, coreH)` as both height *and* corner radius (line 200: `stripH` passed as 6th argument to `R.roundRect`). Since `stripH ≤ 1`, the radius is ≤1px, making the strip effectively a straight line with tiny rounded ends. This is likely intentional for a "hairline" highlight, but the dual use of `stripH` for height and radius is confusing.

**Suggestion:** Use a named constant or separate variable for clarity:

```javascript
var stripH = Math.min(1, coreH);
var stripR = stripH; // radius equals height for pill shape
R.roundRect(ctx, coreX + 1, coreY, Math.max(0, coreW - 2), stripH, stripR, highlightColor);
```

### IN-03: Test Coverage Gaps for Edge Cases

**File:** `tests/renderer_extended.test.js`

**Issue:** The new tests are comprehensive for happy paths but miss several edge cases:

1. **R.strokeRoundRect**: No test for negative `w`/`h` (current behavior: renders flipped)
2. **R.doubleBezel**: No test for `inset` larger than half width/height (coreW/coreH negative — guarded but not tested)
3. **R.easePremiumInv**: No test for `p` values producing `t` near 0.5 where derivative is steepest (max inversion error)
4. **R.spring.step**: No test for `dt <= 0` (zero or negative timestep)
5. **R.reducedMotion.watch**: No test verifying callback receives initial `matches` value (see WR-02)
6. **Semantic tokens**: No test verifying Phase 46 hex tokens (`success`/`warning`/`danger` as hex) are preserved — they're not (see CR-01)

**Suggestion:** Add tests for these edge cases to prevent regressions.

### IN-04: Inconsistent Null/Undefined Handling for opts.inset in R.doubleBezel

**File:** `src/engine/renderer.js:182`

**Issue:** Line 182 checks `opts.inset === undefined || opts.inset === null` but does not guard against `NaN`, `''`, `false`, or other falsy values. If a caller passes `inset: 0`, it works (0 is not undefined/null). But `inset: NaN` would produce `coreW = w - NaN = NaN`, causing the core guard at line 192 (`coreW <= 0`) to behave unexpectedly (`NaN <= 0` is false, so core rendering proceeds with NaN dimensions).

**Suggestion:** Use a robust default pattern:

```javascript
var inset = (opts.inset == null || Number.isNaN(opts.inset)) ? 6 : Math.max(0, Number(opts.inset));
```

Or simpler, since `inset` should be a positive number:

```javascript
var inset = Number(opts.inset);
if (Number.isNaN(inset) || inset < 0) inset = 6;
```

---

## Test Results Summary

| Test Suite | Tests | Pass | Fail | Skip |
|------------|-------|------|------|------|
| renderer_extended.test.js (Phase 52) | 22 | 22 | 0 | 0 |
| Full suite (all *.test.js) | 580 | 579 | 0 | 1 |

No breaking changes detected in existing functionality.

---

## Recommendations Priority

1. **Fix CR-01 immediately** — Silent token overwrite is a latent bug affecting any consumer of `R.colors.success/warning/danger`.
2. **Fix WR-01** — Document the mutating behavior of `R.spring.step` to prevent misuse.
3. **Fix WR-02** — Fire initial callback in `R.reducedMotion.watch` for correct reactive semantics.
4. **Fix WR-03** — Add dimension guard to `R.strokeRoundRect` for consistency with `R.roundRect`.
5. **Address IN-01..IN-04** — Improve comments, clarity, and test coverage in follow-up.

---

_Reviewed: 2026-10-14T00:00:00Z_
_Reviewer: OpenCode (gsd-code-reviewer)_
_Depth: standard_