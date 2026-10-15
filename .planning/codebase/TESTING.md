# Testing Patterns

**Analysis Date:** 2026-10-15

## Test Framework

- Runner: Node built-in test runner (`node:test`).
- Assertion: `node:assert` / `node:assert/strict`.

## Where tests live

- `tests/*.test.js` — all test files use the `.test.js` suffix.

## How to run tests

- All unit tests:
```bash
node --test tests/*.test.js
```
- Example single test:
```bash
node --test tests/world_state.test.js
```
- Example glob for related tests:
```bash
node --test tests/travel_map_*.test.js
```

## UI Invariants Gate (pre-deploy)

- Script: `tools/check_ui_invariants.sh`
- Purpose (from script):
  - `node --check` syntax on every `src/**/*.js` file.
  - Pattern bans around incorrect canvas transform usage (center scaling must go through `R.withCenteredScale`).
  - Additional invariants likely continue below the truncated read.

## Browser verification

- Script: `tools/verify_matrix.py`
- Typical invocation:
```bash
python3 tools/verify_matrix.py --budget 6000
```
- Script supports selecting a Chrome binary via `MYTHIKA_CHROME`.

## Test patterns observed

### 1) VM-based contract tests for engine state/systems
- `tests/world_state.test.js`:
  - Uses `vm.createContext()` and loads engine source via `fs.readFileSync()` + `vm.runInContext()`.
  - Injects stubs for `window`, `document`, `localStorage`, and timing.
  - Exposes globals into VM using `globalThis.*` assignments.

### 2) Canvas/UI rendering tests with mocked ctx
- `tests/button.test.js`:
  - Creates a mock `CanvasRenderingContext2D` recording calls.
  - Loads UI files in a VM context with mocked `UI`/`Input`/`Audio`.
  - Verifies component behavior via captured drawing calls and component state.

### 3) Component factory foundational tests
- `tests/component_factory.test.js`:
  - Requires `src/engine/renderer.js` and sets `global.R`.
  - Sets `global.G` / `global.Input` / `global.Audio` / `global.UI`.
  - Requires `src/ui/component.js`, `src/ui/button.js`, `src/ui/panel.js`, `src/ui/modal.js`.
  - Uses `createMockCtx()` to render without real canvas.

## What’s covered vs not covered (observed)

- Covered:
  - Core UI component factories and immediate-mode UI behavior (at least buttons/panels/modals).
  - Engine/world state contracts and save/load normalization.
  - Scene-level behaviors likely covered by additional tests (not read here).
- Not detected in read scope:
  - Full E2E gameplay correctness in a real browser (handled by `verify_matrix.py`, not Node tests).
  - Integration with Firebase (presence of `src/engine/firebase-config.template.js` suggests optional setup; not validated in tests read).

---

*Testing analysis: 2026-10-15*
