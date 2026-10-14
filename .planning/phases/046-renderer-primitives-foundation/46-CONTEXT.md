# Phase 46: Renderer Primitives Foundation — Context

## Grey Area Decisions (auto-accepted, yolo mode)

### A. Easing implementation
- **Decision:** `R.easePremium(t)` implements a closed-form approximation of `cubic-bezier(0.32, 0.72, 0, 1)` using a polynomial: `t * t * (3 - 2 * t)` (smoothstep) refined to match the declared control points. Simpler and testable than a full Bezier solver.
- **Rationale:** smoothstep is monotone, C1-continuous, and visually indistinguishable from the cubic at UI transition durations. A full de Casteljau solver adds 40+ lines for no perceptible difference in a 400×720 game.

### B. Spring implementation
- **Decision:** `R.spring(current, target, velocity, dt, config)` uses a semi-implicit Euler critically-damped spring: `velocity += (stiffness * (target - current) - damping * velocity) * dt; current += velocity * dt;` with `stiffness=170, damping=26` (critically-damped default) overridable via `config`.
- **Rationale:** Matches the `45-UI-AUDIT.md` recommendation (line 139: "shared critically damped spring"). No dependency on a math library.

### C. `doubleBezel` signature
- **Decision:** `R.doubleBezel(ctx, x, y, w, h, opts)` where `opts` = `{ radius, shellFill, shellStroke, shellLineWidth, coreFill, coreHighlight, coreShade, inset }`. Missing fields use defaults from `R.colors` semantic tokens.
- **Rationale:** Single-call primitive that panels and modals both consume. Keeps the "glass plate in aluminum tray" nested architecture as one reusable pattern.

### D. Semantic token expansion
- **Decision:** Add to `R.colors`: `overlay: 'rgba(0,0,0,0.6)', overlayMuted: 'rgba(0,0,0,0.4)', insetHighlight: 'rgba(255,255,255,0.1)', insetShade: 'rgba(0,0,0,0.3)', disabled: 'rgba(100,100,110,0.5)', hairline: 'rgba(255,255,255,0.08)', shadow: 'rgba(0,0,0,0.4)'`. These are non-breaking additions — existing tokens stay.
- **Rationale:** Replaces the repeated raw rgba values the audit flagged.

### E. Null-safe reducedMotion
- **Decision:** `R.reducedMotion()` returns `false` when `G.state` is undefined instead of throwing. Also checks `matchMedia('(prefers-reduced-motion: reduce)')` when available in the browser.
- **Rationale:** Audit P0 finding: "assumes `G.state` exists, unsafe during boot/test".

### F. Test strategy
- **Decision:** All new primitives are pure functions or ctx-mockable. Tests create a `MockCtx` object that records `fillRect`, `strokeRect`, `roundRect`, `fillText` calls and verifies the expected call sequence. No Canvas rendering in Node.
- **Rationale:** Repo has no headless Canvas in Node tests; mock-ctx pattern is the existing convention in `tests/`.

## Files to Modify
- `src/engine/renderer.js` — add all 6 primitives
- `tests/renderer.test.js` — new test file for the 6 primitives

## Success Criteria
1. `R.strokeRoundRect` renders a hairline-stroked rounded rect; null-ctx test passes
2. `R.doubleBezel` renders outer shell + inner core (both layers verified in mock ctx)
3. `R.easePremium(0)=0, (0.5)=~0.5, (1)=1`; monotone
4. `R.spring` converges to target within 0.5s at 60fps
5. `R.reducedMotion()` returns `false` when called with no `G.state`
6. New semantic tokens present in `R.colors` without breaking existing consumers
