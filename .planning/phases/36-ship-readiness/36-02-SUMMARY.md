---
phase: 36-ship-readiness
plan: "02"
subsystem: infra
tags: [Firebase, SHP-02, ?probe]

# Dependency graph
requires:
  - phase: 36-ship-readiness context
    provides: [?probe predicate, firebaseReady flag]
provides:
  - [silent Firebase 404 in prod, warning visible with ?probe]
affects: [console cleanliness on GitHub Pages deploy]

# Tech tracking
tech-stack:
  added: []
  patterns: [probe-gated console warning, silent fallback flag]

key-files:
  created: []
  modified: [index.html]

key-decisions:
  - "Firebase init catch now only console.warn when /\\[?&\\]probe(?:&|$)/ matches location.search; firebaseReady=false set silently in prod"
  - "Firebase success log left as-is (only fires when config actually loads, which requires repo secrets)"

patterns-established:
  - "Probe-gated diagnostics: console warnings/errors that only appear with ?probe in URL, not in normal play"

requirements-completed: [SHP-02]

# Metrics
duration: 3min
completed: 2026-10-10
---

# Phase 36 Plan 02 Summary

**Firebase init catch in `index.html:92-97` now suppresses `console.warn` unless `?probe` is in the URL. `window.firebaseReady` is set to `false` silently in prod.**

All SHP-02 truths satisfied:
- Zero Firebase warnings on normal load ✓
- Warning visible with ?probe ✓
- firebaseReady=false set silently ✓

Commit: 636804a
