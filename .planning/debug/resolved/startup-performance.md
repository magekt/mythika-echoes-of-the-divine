---
status: resolved
trigger: reported Mythika startup timings
---

# Startup performance investigation

## Finding

The reported group values are not independent startup costs. Each marker in
`index.html` surrounds synchronous classic `<script>` tags, so a group includes
script fetch/cache waits and JavaScript evaluation. The groups are sequential
wall-clock slices; adding them double-counts neither work nor the asynchronous
Firebase module, but they should not be read as per-subsystem CPU timings.

`boot=71.7ms` is the most useful blocking measure: it covers `main.js`, scene
registration, the initial title `enter()`, canvas/DPR setup, input/audio setup,
and starting the first animation frame. Firebase initialization is a module and
does not block the classic script chain in the same way.

## Evidence

- Script order is dependency-correct: engine → data → systems → UI → scenes →
  `main.js`; moving tags or adding `defer` would break the intentional global
  namespace contract.
- `main.js` starts boot immediately at the end of `body`; the `load` listener is
  only an idempotent safety net. Waiting for `load` would make startup worse.
- Service worker v11 uses a network-first shell and cache-first local scripts.
  A cold install/runtime cache can therefore inflate group timings, while a warm
  cache reports mostly evaluation. The worker does not execute JavaScript or
  make boot asynchronous after resources arrive.
- Phase 15 changes add shared hero/UI behavior and scene code, but no evidence
  shows a new blocking loop or synchronous data fetch. Existing browser-matrix
  console failures are unrelated pre-existing `Scene.responsive` test/runtime
  failures and must not be treated as a startup regression.

## Instrumentation change

`?probe` now emits `script-resources` with per-script Resource Timing duration
and transfer size, plus `boot-phase scene-enter` and `boot-phase gInit`. This
separates resource/cache delay from boot work without changing gameplay or the
no-build global Canvas architecture.

## Baseline / improved measurement

Baseline supplied by the report: engine 4.651ms, data 5.279ms, systems
6.811ms, UI 3.091ms, scenes 12.091ms, boot 71.7ms (assuming the omitted
decimals are milliseconds). No runtime optimization was claimed or applied;
the improvement is measurement attribution. Re-run `/index.html?probe` once
cold and once warm, recording `script-resources`, `boot-phase`, and first-frame
logs. Compare warm `networkMs` against boot-phase values before changing code.

## Verification

- `node --check src/main.js` and `src/engine/game.js`: passed.
- `git diff --check`: passed.
- `node --test tests/*.test.js`: existing suite has 62 passing and 18 failures,
  all reported around missing `Scene.responsive` in travel-map tests.
- `python3 tools/verify_matrix.py --budget 6000`: existing browser profiles
  reported uncaught console errors; no startup timing conclusion was drawn.
