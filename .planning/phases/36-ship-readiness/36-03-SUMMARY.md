---
phase: 36-ship-readiness
plan: "03"
subsystem: infra
tags: [debug-gate, SHP-03, SHP-04]

# Dependency graph
requires:
  - phase: 36-ship-readiness context
    provides: [?debug predicate, debugScene registration site]
provides:
  - [debug scene gated behind ?debug, Ashram Debug button hidden in prod, console clean on first load]
affects: [shipped build console cleanliness]

# Tech tracking
tech-stack:
  added: []
  patterns: [URL-param-gated scene registration, prod-hidden UI entry points]

key-files:
  created: []
  modified: [src/main.js, src/scenes/ashram.js]

key-decisions:
  - "src/main.js:61 debug scene registration: only registers when /debug/ matches location.search (regex same pattern as diagnostics.js)"
  - "src/scenes/ashram.js UTILITY nav items built via IIFE that conditionally pushes Debug button only when ?debug in URL; no dead-route Navigation.go warning in prod"
  - "sw.js precache of src/scenes/debug.js unchanged — gate is at registration time, not script load time"

patterns-established:
  - "Developer-facing surfaces gated behind URL params; prod sessions see clean console with no developer entries"

requirements-completed: [SHP-03, SHP-04]

# Metrics
duration: 5min
completed: 2026-10-10
---

# Phase 36 Plan 03 Summary

**Debug scene in `src/main.js:61` only registers when `/debug/` is in the URL. Ashram nav's Debug button (line 148-152) only appears under the same gate. Prod console is clean on first load.**

All SHP-03/SHP-04 truths satisfied:
- Debug scene not registered without ?debug ✓
- Ashram Debug button hidden in prod ✓
- `node --test tests/*.test.js`: 449/449 pass; `check_ui_invariants.sh` passes ✓

Commit: 636804a
