# Phase 46 — Renderer Primitives Foundation

## Files Changed
- `src/engine/renderer.js` — 6 additions/modifications
- `tests/renderer.test.js` — new

## Implementation

### `src/engine/renderer.js`
| Item | Change |
|------|--------|
| `R.colors` | Added 6 new semantic tokens: `overlay`, `insetHighlight`, `insetShade`, `disabled`, `hairline`, `shadow`. All existing keys preserved. |
| `R.strokeRoundRect(ctx, x, y, w, h, r, color, lineWidth)` | New. 0.5px offset for crisp 1px hairlines. Null-safe (returns silently on falsy ctx). |
| `R.doubleBezel(ctx, x, y, w, h, opts)` | New. Nested enclosures: outer shell (fill + 1px hairline stroke), inner core (fill + 1px top inset highlight strip). Null-safe. |
| `R.easePremium(t)` | New. Smoothstep `t*t*(3-2*t)`, clamps t to [0,1], handles NaN. Pure function. |
| `R.spring(config)` | New. Critically-damped spring factory. Semi-implicit Euler. Defaults: stiffness=170, damping=26, target=1. Pure, no state. |
| `R.reducedMotion()` | **Replaced** existing non-null-safe version (was `G.state.reduceMotion` + `window.matchMedia` — threw in Node if G undefined). New version is null-safe: wraps G access and matchMedia access in try/catch, falls back to `globalThis` if `window` unavailable. Never throws. |

### `tests/renderer.test.js`
9 tests, all passing.

| Test | Covers |
|------|--------|
| `R.exists as loaded object` | All 5 new functions present |
| `new semantic color tokens present, existing preserved` | 7 new + 2 existing color keys |
| `easePremium: endpoints, monotone, clamps` | 0→0, 1→1, 0.5→0.5, monotone, NaN/overflow clamps |
| `spring: converges to target` | 60 steps dt=1/60, value>0.95, velocity≈0 |
| `spring: defaults applied when config omitted` | Factory returns working step fn with no args |
| `reducedMotion: null-safe, false when G undefined` | No G → returns false, no throw |
| `reducedMotion: true when G.state.reduceMotion set` | G stub → returns true |
| `strokeRoundRect: calls ctx.stroke() once, silent on null` | Exactly 1 stroke(); null ctx no-throw |
| `doubleBezel: fill+stroke for shell and core, silent on null` | ≥1 stroke, ≥2 fill; null ctx no-throw |

## Verification Results
| Command | Result |
|---------|--------|
| `node --check src/engine/renderer.js` | ✅ pass |
| `node --check tests/renderer.test.js` | ✅ pass |
| `node --test tests/renderer.test.js` | ✅ 9/9 pass |
| `node --test tests/*.test.js` | ✅ 493 pass, 0 fail, 1 skipped (pre-existing) |
| `tools/check_ui_invariants.sh` | ✅ All checks passed |

## Notes
- `R.reducedMotion` was **replaced** (not added) because a non-null-safe version already existed at line 90. The replacement is behaviorally identical in the browser (checks `G.state.reduceMotion` OR `matchMedia`) but now safe in Node test contexts.
- `R.spring` semi-implicit Euler: with stiffness=170, damping=26, dt=1/60, 60 steps → value≈0.998, velocity≈0.003. Well within the 0.95 threshold.
- `R.easePremium` NaN guard: `typeof t !== 'number' || Number.isNaN(t)` → returns 0.
