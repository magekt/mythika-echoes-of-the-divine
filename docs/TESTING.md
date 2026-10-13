<!-- generated-by: gsd-doc-writer -->
# Testing

Mythika is a zero-build vanilla-JS Canvas 2D RPG: the repository root is the
deployable static site, and the test pyramid is Node unit/contract tests first,
a shell invariant gate second, and a real headless-Chrome boot matrix last.
There is no `package.json`, no `npm test`, and no coverage gate.

Related docs: `docs/GETTING-STARTED.md` (first run), `docs/DEVELOPMENT.md`
(local setup and build commands), `docs/CONFIGURATION.md` (Firebase, PWA, and
URL-flag config), `ARCHITECTURE.md` (engine/scenes/systems layout).

## Test framework and setup

The entire Node suite runs on the Node.js built-in test runner with zero
dependencies.

- **Runner:** `node:test` — most test files start with
  `const test = require('node:test')`; a minority use destructured require
  (e.g. `const { test, describe, ... } = require('node:test')`) or ESM import
  (e.g. `import { test } from 'node:test'`). Verified on Node v24; Node's ESM syntax
  auto-detection means both CommonJS `require`-style and ESM `import`-style
  test files work.
- **Assertions:** `node:assert/strict` is the dominant form
  (`const assert = require('node:assert/strict')`); a minority of files use
  `require('node:assert')`, `require('assert')`, or ESM `import` instead.
  Common assertions are `assert.equal`, `assert.ok`, `assert.deepEqual`, and
  `assert.strictEqual` (no `assert.throws` usage in the suite).
- **Config:** none. There is no `package.json`, `jest.config.*`,
  `vitest.config.*`, `.mocharc.*`, or `karma.conf.*` anywhere in the repo.
- **Setup:** no install step. If you can run `node --version`, you can run the
  suite. Serve the game separately with `python3 -m http.server 3000` for any
  browser-based verification.

Supporting stdlib-only modules used inside test files: `node:fs` (read real
source files from disk), `node:path` (resolve `ROOT` as
`path.resolve(__dirname, '..')`), and `node:vm` (sandbox browser globals —
see "Writing new tests").

Current scale (October 2026): 62 test files in `tests/`, ~475 tests
(474 passing, 1 skipped, 7 suites).

## Running tests

Run from the repository root. Never use the bare directory form
`node --test tests/` — this Node setup treats it as a module path and fails
with `Cannot find module`. Always pass an explicit file or a quoted glob.

```bash
node --test tests/world_state.test.js    # one test file
node --test tests/travel_map_*.test.js   # related files via explicit glob
node --test tests/*.test.js              # full Node suite (~2 s)
```

Focused validation for changed files (run before every commit):

```bash
node --check src/engine/game.js   # per-file syntax check, one per changed file
git diff --check                  # trailing whitespace / conflict markers
```

Full pre-deploy validation — the Node suite plus the two non-`node --test`
layers, in this order:

```bash
node --test tests/*.test.js
tools/check_ui_invariants.sh
python3 tools/verify_matrix.py --budget 6000
```

What each layer does:

| Layer | Command | What it proves |
| --- | --- | --- |
| Unit / contract | `node --test tests/*.test.js` | Systems, data, scene, and save/load behavior (see "Writing new tests") |
| UI invariant gate | `tools/check_ui_invariants.sh` | `node --check` passes on every `src/**/*.js`; no raw half-size spring back-translate patterns (`translate(-bw/2`, `translate(-bh/2`, `translate(-this.w/2`, `translate(-this.h/2` — see `tools/check_ui_invariants.sh` §2); every `src/systems/*.js` file is loaded exactly once in `index.html`. Fails loudly — a zero-file scan is an error. |
| Browser boot matrix | `python3 tools/verify_matrix.py --budget 6000` | Boots the real game headlessly in Chrome across desktop (`1280x1400`), phone (`390x844@3x`), and phone-landscape (`844x390@3x`) profiles, greps for the `[Mythika] booted dpr=` beacon emitted by `gInit()`, and saves one screenshot per profile to `tools/shots/`. Requires Chrome, Chromium, or Edge; `MYTHIKA_CHROME` pins a specific binary. Extra flags: `--fps N` adds a 12 s real-time `?probe=1` FPS probe requiring `>= N` fps; `--layout` runs the layout sweep instead of the boot matrix; `--outdir` overrides the shots directory. |

Browser diagnostics are opt-in URL flags on the served game:

- `http://localhost:3000?probe` — FPS beacons (`[Mythika] fps=…` every 5 s),
  script-group timings, resource report, and the Firebase-init warning.
- `http://localhost:3000?probe&selftest` — input-chain self-test: a synthetic
  tap through the Forge button plus the equipment-tab blocked-tap check. It
  navigates scenes, so never use it for normal play.
- `http://localhost:3000?probe&map` — boots straight into the `travelMap`
  scene for map-specific FPS measurement.

Always clear or unregister the service worker before validating changed
scripts — the worker is cache-first for everything except `index.html`
(network-first), so a stale precache will otherwise mask your edits. Do not
clear `localStorage` unless you have exported your save (`mythika_save` key).

Responsive sizes to exercise for UI changes: `400x720`, `540x900`,
`720x400`, `1024x768`, `1440x900`, plus `390x844` (portrait) and `844x390`
(landscape). Scene changes additionally need the journey checkpoints from
`AGENTS.md`: boot, navigation, map/exploration, combat, party/equipment,
save/reload, and settings.

## Writing new tests

Keep tests flat, deterministic, and self-contained: mostly top-level `test(name, fn)`
calls (`describe` blocks are used in 6 files — `backgrounds`,
`backgrounds_integration`, `backgrounds_browser_matrix`, `navigation`,
`responsive_landscape`, `tournament_viewport`), fixed clocks (`performance: { now: () => 0 }`),
and inline fixtures defined inside loader helpers. Each file must run in
isolation — copy the loader pattern rather than cross-importing between test
files.

**1. Name the file after the module under test:** `tests/<module>.test.js`
mirroring the source path — `world_state.test.js` ↔
`src/systems/world_state.js`, `travel_map_*` ↔ `src/scenes/travelMap.js`,
`viewport_dims.test.js` ↔ `src/engine/viewport.js`.

**2. Prefer the `vm`-sandbox pattern** (dominant — used by `world_state`,
`world_events`, `landmarks`, `save_coherence`, and all `travel_map_*` files).
Build a context with stubbed browser globals, read the real source with `fs`,
and execute it with `vm.runInContext`, exposing the symbol under test by
appending an export line:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const WORLD_STATE_PATH = path.join(ROOT, 'src/systems/world_state.js');

function loadContract(options = {}) {
  // ... build vm context with stubbed localStorage, document, window ...
  const worldStateSource = fs.readFileSync(WORLD_STATE_PATH, 'utf8');
  vm.runInContext(worldStateSource + '\n;globalThis.WorldState = WorldState;', context, { filename: WORLD_STATE_PATH });
  // ... return exposed symbols ...
}

test('new games expose the complete canonical world-state shape', () => {
  const { G, WorldState } = loadContract();
  // ...assertions against expected object literals...
});
```

Copy the proven mock structure from `tests/world_state.test.js` (systems) or
`tests/travel_map_perf.test.js` (scenes). Standard stubs: `localStorage` as a
`Map`-backed in-memory stub, `document` with `getElementById: () => null`,
`window` as `{ innerWidth: 400, innerHeight: 720, devicePixelRatio: 1 }`,
`performance` as a fixed clock, and for scenes `Scene: { create: definition
=> definition }` plus minimal `G.state` fixtures. Two helpers recur across
files: `assertPlainObject(value, msg)` (checks `[object Object]` tag and null
prototype) and `toHost(value)` (`JSON.parse(JSON.stringify(value))` to compare
vm-realm objects with host literals). Never stub `Math`, `Object`, `Array`,
`Date`, or other builtins — pass them through into the vm context.

**3. Use direct `require()` only for pure-logic modules** that carry the
CommonJS export guard (`typeof module !== 'undefined' && module.exports`) and
reference no DOM globals. That pattern shims globals, reloads fresh per test,
and cleans up afterward:

```js
function loadInfluence() {
  delete require.cache[INFLUENCE_PATH];
  global.G = { state: { world: null } };
  // ... attach WorldState, ZONES, Notify stubs ...
  return { Influence: require(INFLUENCE_PATH).Influence, notices };
}

test.afterEach(() => {
  delete global.G;
  delete global.WorldState;
  // ... delete every shimmed global ...
});
```

**4. Follow the RED discipline for pure functions:** when a feature validation
file (`.planning/**/VALIDATION.md`) defines Wave 0 stub tests, write those
failing tests first (e.g. `tests/viewport_dims.test.js` stubs for
`computeViewportDims` plus the input-mapping pin) and implement only after the
stubs fail as expected. Pure, DOM-free helpers (like the viewport math in
`src/engine/viewport.js`) must stay Node-testable with no DOM at load time.

**5. Match the test type to the behavior:**

- Unit: canonical state shape, malformed-input normalization, idempotent
  mutations, read-only queries (`world_state`, `world_events`, `landmarks`,
  `influence`).
- Contract/integration: save-load round trips across every world domain, and
  the `save_coherence` static-parsing pattern — read `index.html` and `sw.js`
  as text, extract `<script src>` paths and the `ASSETS` array via regex, and
  assert the precache covers every local script plus load order (e.g.
  "WorldState is registered after zone data and before SaveSystem").
- Perf: the `travel_map_perf` call-recording pattern — stub renderer methods
  push into `calls = { roundRects: [], strokes: [], arcs: [], drawImages: []
  }` and assert draw-call counts stay within budget per frame.
- Browser-matrix (Node side): `*_browser_matrix.test.js` files assert the
  harness contracts (profiles, budgets, allowlists) without launching a
  browser; the real browser proof stays in `tools/verify_matrix.py`.

**6. Run the gates:** targeted `node --test tests/<area>*.test.js` after each
change (<5 s), the full suite plus `tools/check_ui_invariants.sh` before
declaring the work done, and the browser matrix for scene, viewport, layout,
or service-worker changes.

## Coverage requirements

No coverage threshold is configured. There is no coverage config file, no
`--experimental-test-coverage` flag in the documented workflow, and no
threshold (lines, branches, functions, or statements) enforced anywhere.

| Type | Threshold |
| --- | --- |
| Lines | No coverage threshold configured. |
| Branches | No coverage threshold configured. |
| Functions | No coverage threshold configured. |
| Statements | No coverage threshold configured. |

To inspect coverage ad hoc (not part of the documented workflow):

```bash
node --test --experimental-test-coverage tests/*.test.js
```

Per-file source-review gaps are tracked manually in feature validation files
(`.planning/**/VALIDATION.md`, per-task verification maps) rather than via
tooling.

## CI integration

Workflow file: `.github/workflows/pages.yml`, jobs `verify` then `deploy`.
Mythika is a zero-build static site — the repo root is the deployable
artifact, and only a clean boot publishes.

- **Trigger:** `push` to `master`, plus manual `workflow_dispatch`.
  Concurrency group `pages` with `cancel-in-progress: true`.
- **`verify` job** (`runs-on: ubuntu-latest`):
  1. `actions/checkout@v4`
  2. Generate Firebase config — `python3 tools/write_firebase_config.py`
     with the seven `FIREBASE_*` repository secrets (see
     `docs/CONFIGURATION.md`).
  3. Install Chrome — `browser-actions/setup-chrome@v1` (`chrome-version:
     stable`).
  4. Boot matrix — `python3 tools/verify_matrix.py --budget 6000` with
     `MYTHIKA_CHROME` set from the setup-chrome output and `CI: 'true'`
     (both imply the `--no-sandbox --disable-dev-shm-usage` runner flags).
  5. Upload boot screenshots — `actions/upload-artifact@v4` (`if: always()`,
     artifact `boot-shots`, path `tools/shots/`).
- **`deploy` job** (`needs: verify`, GitHub Pages environment): checks out,
  regenerates the Firebase config from the same secrets, runs
  `actions/configure-pages@v5`, uploads the repo root (`path: '.'`) via
  `actions/upload-pages-artifact@v3`, and deploys with
  `actions/deploy-pages@v4`.

There is no separate lint or unit-test job in CI: the boot matrix is the
merge gate, and `node --test` plus `tools/check_ui_invariants.sh` are
developer-run gates. Keep them green locally so `verify` never fails on
`master`.
