---
phase: 19-lifecycle-safety-deprecated-cleanup
plan: "01"
subsystem: engine lifecycle
tags: [lifecycle, leak-detection, scene-guards, canvas2d]

# Dependency graph
requires: []
provides:
  - "Global Lifecycle guard (wrapEnter/wrapLeave, timer/listener/cache tracking, assertClean, failureRecovery)"
  - "Scene.create auto-wrapping with unchanged scene API"
  - "Lifecycle contract tests (9/9 pass)"
affects: [19-02, 19-03, diagnostics-phase-20]

# Tech tracking
tech-stack:
  added: []
  patterns: [per-scene _lifecycle context in scene.data, fail-to-ashram recovery]

key-files:
  created: [src/engine/lifecycle.js, tests/lifecycle.test.js]
  modified: [src/engine/scene.js, index.html, sw.js]
---

# 19-01 Summary — Lifecycle guard contract + Scene integration

## What was built
- `src/engine/lifecycle.js`: classic-global `Lifecycle` namespace, dependency-free.
  `wrapEnter` (catch → cleanup → `failureRecovery`), `wrapLeave` (catch, always
  cleanup, never throws), `trackTimer/schedule/clearTimer`, `trackListener`,
  `trackCache`, `assertClean` (buttons, staticDraws, scrollY, modal/effect refs,
  stale selections, timers, listeners, caches), `failureRecovery` (transitional
  `G._lastLifecycleError` only → `Notify` → `gScene('ashram', true, {error:true})`).
- `src/engine/scene.js`: `Scene.create` auto-wraps `enter`/`leave` with the
  guards and calls `assertClean` on leave. No signature changes.
- `index.html` / `sw.js`: `lifecycle.js` loads before `scene.js`; precache
  entries added (fixes `save_coherence` sw-asset invariant).

## Verification
- `node tests/lifecycle.test.js` → 9/9 pass (wrap, leak×10 cycles, assertClean,
  recovery, no `G.state` mutation, Scene integration).
- `node --check` clean on lifecycle.js, scene.js, test file.

## Deviations
- None; `trackTimer(fn, delay)` bare form supported as a plain setTimeout
  passthrough alongside the primary `trackTimer(scene, id)` form.
