# Testing Patterns

**Analysis Date:** 2026-09-19

## Test Framework

**Runner:**
- Node.js built-in test runner — `node:test` (no package.json; runtime verified as Node v24.7.0)
- Config: **none** — there is no `package.json`, `jest.config.*`, `vitest.config.*`, or `karma.conf.*` anywhere in the repo. Node's ESM syntax auto-detection (default in v24) means both CommonJS `require`-style and ESM `import`-style test files work under `node --test`.

**Assertion Library:**
- `node:assert/strict` — imported in every test file as `const assert = require('node:assert/strict')`

**Run Commands:**
```bash
node --test tests/*.test.js        # Run all tests (60 tests, all passing on 2026-09-19)
node --test tests/world_state.test.js   # Run a single test file
node --test tests/travel_map_*.test.js  # Glob of related files
```

- IMPORTANT: `node --test tests/` (directory form) fails on this Node version ("Cannot find module .../tests") — always pass the glob or explicit file list.
- There is no `npm test`; there is no package.json to define scripts.
- Syntax gate complements unit tests: `node --check path/to/changed-file.js` (`CONTRIBUTING.md:45-47`).

**Non-unit verification layers (do not run from `node --test`):**
- Headless browser boot matrix: `python3 tools/verify_matrix.py --budget 6000` — boots the real game in Chrome across desktop/phone/landscape, greps for the `[Mythika] booted dpr=` beacon emitted by `gInit()`, saves screenshots to `tools/shots/`. Requires Chrome/Chromium/Edge; override binary with `MYTHIKA_CHROME`. This is the CI gate in `.github/workflows/pages.yml` (only a clean boot publishes).
- Pre-deploy UI invariant gate: `tools/check_ui_invariants.sh` — runs `node --check` on every `src/**/*.js`, scans for forbidden centered-scale back-translate patterns, and verifies every system script is loaded exactly once in `index.html`.
- In-game input self-test: open with `?probe&selftest` (`README.md:119`).

## Test File Organization

**Location:**
- All tests live in `tests/` at the repo root — no co-located tests, no subdirectories.
- 9 files, ~2265 lines total: `influence.test.js`, `landmarks.test.js`, `save_coherence.test.js`, `travel_map_events.test.js`, `travel_map_landmarks.test.js`, `travel_map_lifecycle.test.js`, `travel_map_perf.test.js`, `world_events.test.js`, `world_state.test.js`

**Naming:**
- `tests/<module_under_test>.test.js` mirroring the source file name: `world_state.test.js` ↔ `src/systems/world_state.js`; `travel_map_*` ↔ `src/scenes/travelMap.js`

**Structure:**
```
tests/
├── influence.test.js               # direct-require pattern (pure logic)
├── landmarks.test.js               # vm sandbox, data + system loaders
├── save_coherence.test.js          # static contract: index.html ↔ sw.js parsing
├── travel_map_events.test.js       # vm sandbox scene fixture
├── travel_map_landmarks.test.js    # vm sandbox scene fixture
├── travel_map_lifecycle.test.js    # ESM variant of the vm sandbox scene fixture
├── travel_map_perf.test.js         # perf/call-budget assertions
├── world_events.test.js            # vm sandbox contract with data + systems
└── world_state.test.js             # vm sandbox contract (canonical shape)
```

## Test Structure

**Suite Organization:**
- **Flat** `test(name, fn)` calls at top level — no `describe` blocks, no subtests. The runner reports `suites 0` while running 60 tests.
- Each file opens with the standard requires, path constants, and loader helpers, then a sequence of top-level `test()` calls:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const WORLD_STATE_PATH = path.join(ROOT, 'src/systems/world_state.js');

function loadContract(options = {}) { ... }   // loader helper

test('new games expose the complete canonical world-state shape', () => {
  const { G, WorldState } = loadContract();
  // ...assertions
});
```

(`tests/world_state.test.js:1-12` and `tests/world_state.test.js:71-84`)

**Patterns:**
- Loader helpers take an options object and return an object of exposed symbols: `loadContract(options)`, `loadData()`, `loadSystem()`, `loadScene(overrides = {})`, `loadInfluence()`, `makeCtx()`
- Cleanup via `test.afterEach` when tests mutate the Node global namespace (direct-require pattern only — see `tests/influence.test.js:28-34`)
- Assertions use `assert.ok`, `assert.equal`, `assert.deepEqual`, `assert.throws`; structured equality against expected object literals is the norm
- Plain-object shape checks: `assertPlainObject(value, msg)` verifies `[object Object]` tag **and null prototype** (`tests/world_state.test.js:62-65`)
- Realm escape hatch: `toHost(value)` = `JSON.parse(JSON.stringify(value))` to compare vm-realm objects with host expected literals (`tests/world_state.test.js:67-69`)

## Mocking

**Framework:** None — hand-rolled stubs. Three distinct patterns:

**1. vm sandbox with contract loaders** (dominant — used by `world_state`, `world_events`, `landmarks`, `save_coherence`, and all `travel_map_*`):
- `vm.createContext({...})` mocks browser/external globals; source files are read with `fs` and executed via `vm.runInContext`
- Globals exposed by **appending an export line** to the source string:

```js
vm.runInContext(gameSource + '\n;globalThis.G = G;', context, { filename: GAME_PATH });
vm.runInContext(worldStateSource + '\n;globalThis.WorldState = WorldState;', context, { filename: WORLD_STATE_PATH });
```

(`tests/world_state.test.js:37-45`)

**2. Direct `require()` with global shims** (pure-logic modules only — `tests/influence.test.js`):
- Requires the CommonJS export guard on the source module (`typeof module !== 'undefined' && module.exports` — present in `src/systems/world_state.js:229`, `influence.js:140`, `landmarks.js:94`, `world_events.js:278`, and several `src/data/*` files)
- Sets `global.X = require(path).X` before use and deletes them in `test.afterEach`; `delete require.cache[path]` first so each test reloads fresh:

```js
function loadInfluence() {
  delete require.cache[WORLD_STATE_PATH];
  delete require.cache[RULES_PATH];
  delete require.cache[INFLUENCE_PATH];
  global.G = { state: { world: null } };
  global.WorldState = require(WORLD_STATE_PATH).WorldState;
  global.ZONES = require('../src/data/zones.js').ZONES;
  global.Notify = { show: message => notices.push(message) };
  return { Influence: require(INFLUENCE_PATH).Influence, notices };
}

test.afterEach(() => {
  delete global.G;
  delete global.WorldState;
  delete global.ZONES;
  delete global.INFLUENCE_RULES;
  delete global.Notify;
});
```

(`tests/influence.test.js:9-34`)

**3. Static file parsing** (contract tests — `tests/save_coherence.test.js`):
- Reads `index.html` and `sw.js` as text; extracts `<script src>` paths and the `ASSETS` array via regex; asserts the service-worker precache covers every local script (`tests/save_coherence.test.js:17-52`)

**What to Mock:**
- `localStorage` — always an in-memory `Map`-backed stub with `getItem`/`setItem`/`removeItem` (`tests/world_state.test.js:14-19`), so tests can assert persisted round-trips without touching real storage
- `document` — `getElementById: () => null`, `addEventListener: () => {}` for engine tests; `createElement(tag)` returning a fake canvas with no-op `getContext()` methods for scene tests (`tests/travel_map_perf.test.js:39-56`)
- `window` — `innerWidth: 400, innerHeight: 720, devicePixelRatio: 1, addEventListener: () => {}` mirroring the game's phone-first logical space
- `performance` — fixed clock `{ now: () => 0 }` (or `() => 1000`) to make time deterministic
- Rendering globals for scenes — `Scene: { create: definition => definition }` (factory passthrough), `Hints: { show() {} }`, `gScene: { push() {}, pop() {} }`, and a minimal `G` object shaped like `G.state` (`currentZone`, `zoneProgress`, `flags`, `reduceMotion`) plus inline `ZONES` fixtures (`tests/travel_map_events.test.js:34-71`)
- Call-recording objects — `calls = { roundRects: [], strokes: [], arcs: [], drawImages: [] }` populated by stub renderer methods so tests assert **what and how often** the scene draws (`tests/travel_map_perf.test.js:10-16`)

**What NOT to Mock:**
- The code under test itself — real source files are read from disk and executed; never re-implemented in the test
- `Math`, `Object`, `Array`, `Number`, `Boolean`, `String`, `Date`, `RegExp`, `isFinite`, `parseInt`, `parseFloat`, `isNaN`, `encodeURIComponent` — passed through into the vm context (`tests/travel_map_perf.test.js:21-37`) rather than stubbed

## Fixtures and Factories

**Test Data:**
- Inline fixtures defined inside loader helpers — e.g., `activeEvents` records with `remainingTime`, `status`, `resolveLabel` in `tests/travel_map_events.test.js:20-32`; `landmarkRecords` with `discovered: true/false` variants in `tests/travel_map_landmarks.test.js:18-39`
- Minimal zone stubs injected as `ZONES`: `{ aryavarta: { name: 'Aryavarta', desc: 'First region', minLvl: 1, maxLvl: 5 }, ... }` (`tests/travel_map_events.test.js:68-70`)
- Malformed-input fixtures built inline per test to exercise normalization: `{ regions: { aryavarta: { explored: true }, broken: null }, landmarks: { discovered: {...}, notified: 'invalid' }, ... }` (`tests/world_state.test.js:87-104`)

**Location:**
- No shared fixture files; fixtures are co-located in the loader helpers of each test file. Copy the loader rather than cross-importing between test files (each file is self-contained and runnable in isolation).

## Coverage

**Requirements:** None enforced. There is no coverage config, no `--experimental-test-coverage` flag in documented commands, and no coverage threshold anywhere.

**View Coverage:**
```bash
node --test --experimental-test-coverage tests/*.test.js   # not part of the documented workflow
```

Per-file source review gaps are tracked manually in planning phases (`.planning/phases/*`), not via tooling.

## Test Types

**Unit Tests:**
- Systems and data modules under `src/systems/` and `src/data/` — canonical state shape, normalization of malformed input, idempotency of mutations, read-only queries (`tests/world_state.test.js`), event lifecycle (`tests/world_events.test.js`), landmark discovery rules (`tests/landmarks.test.js`), influence rule coverage (`tests/influence.test.js`)

**Contract/Integration Tests:**
- Save-load round trips: "every world domain and replay guard survives a save-load round trip" (`tests/world_state.test.js`) and `tests/save_coherence.test.js` (sw.js precache must cover every `index.html` script + load-order assertion "WorldState is registered after zone data and before SaveSystem")
- Scene rendering behavior against fixture `G.state`: `travel_map_events`, `travel_map_landmarks`, `travel_map_lifecycle`

**Perf Tests:**
- `tests/travel_map_perf.test.js` — render-call recording plus budget assertions (draw-call counts bounded per frame); deterministic via fixed `performance.now` and stub canvas

**E2E Tests:**
- Not part of `node --test`. E2E is the headless Chrome boot matrix `tools/verify_matrix.py` (desktop/phone/landscape), which asserts the rAF loop started by grepping the boot beacon and captures screenshots. Runs locally and in CI (`.github/workflows/pages.yml`); `tools/check_ui_invariants.sh` is the pre-deploy UI gate.

## Common Patterns

**Async Testing:**
- Tests are overwhelmingly synchronous; time-based logic is made deterministic with a fixed `performance.now` and the vm-context `setTimeout`/`clearTimeout` passthrough. Offline-elapsed behavior is tested by feeding elapsed values directly: "tick handles offline elapsed correctly — events expired during away time" (`tests/world_events.test.js`)

**Error Testing:**
- Normalization tests feed malformed branch data and assert a repaired canonical result rather than an exception — e.g., `null` regions, `'invalid'` notification state, `Number.POSITIVE_INFINITY` influence values, `__proto__` keys all produce sanitized output (`tests/world_state.test.js:86-104`)
- Negative-path mutation tests use `assert.throws`/`assert.ok(!...)` to verify invalid identifiers are rejected ("repeatable mutations validate identifiers and normalize influence/control", `tests/world_state.test.js`)
- Behavior parity with the require pattern: `delete require.cache[...]` guarantees fresh module state between test files that share modules

**Writing a new test (prescriptive):**
1. Name it `tests/<module>.test.js` mirroring the source file
2. Prefer the vm-sandbox pattern with a `loadContract()`/`loadScene()` helper — copy the proven mock structure from `tests/world_state.test.js` or `tests/travel_map_perf.test.js` (the lifecycle test even documents "Proven vm sandbox mock structure (mirrors travel_map_perf.test.js)" at `tests/travel_map_lifecycle.test.js:12`)
3. Use only direct-require for pure-logic modules that carry the `module.exports` guard and reference no DOM globals
4. Keep tests flat (`test('...')`), deterministic (fixed clocks), and self-contained (inline fixtures)
5. Run `node --test tests/*.test.js` and confirm no regressions across all 60 tests

---

*Testing analysis: 2026-09-19*
