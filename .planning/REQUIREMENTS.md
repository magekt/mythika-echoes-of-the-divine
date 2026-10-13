# Requirements: Mythika: Echoes of the Divine

**Defined:** 2026-10-13
**Milestone:** v8.0 — Performance & Loading Architecture
**Core Value:** Every play session should feel like a meaningful cultivation journey: the player understands their next path, makes consequential choices, sees those choices reshape the world, and trusts that the resulting state persists.

## v8.0 Requirements

### Loading & Script Execution

- [ ] **LOAD-01**: A visible loading overlay displays live progress during the initial 100-script boot, with percentage complete and the name of the script group currently loading
- [ ] **LOAD-02**: The overlay reports the current stage (e.g., "Loading engine", "Loading data", "Loading systems", "Loading UI", "Loading scenes", "Booting game") as each dependency group finishes
- [ ] **LOAD-03**: The overlay dismisses automatically when the first frame renders AND all critical scripts are confirmed evaluated (`G.frameCount >= 1` AND `Input._ready === true`)
- [ ] **LOAD-04**: If a critical script fails to load, the overlay surfaces a visible error message ("A required file failed to load — please refresh") instead of silently showing an infinite spinner
- [ ] **LOAD-05**: Failed-script handling sets `Input._ready = true` so the game is not stuck in a permanently blocked input state; `failBoot` continues to surface the error in `#status-bar`

### Input Guarding

- [ ] **INPUT-01**: No user input (tap, click, keypress, swipe) is processed by the game while `Input._ready` is `false`
- [ ] **INPUT-02**: Input is naturally blocked during the 100-script synchronous parse phase (no event listeners exist yet) — this is the baseline, no new code required
- [ ] **INPUT-03**: `Input._ready` is set to `true` in `src/main.js` after scene registration completes successfully
- [ ] **INPUT-04**: `Input._ready` is also set to `true` in the `failBoot` path so a failed boot does not leave input permanently blocked
- [ ] **INPUT-05**: `Input._ready` is checked at `UI.consume()` and `UI.getPress()` consumer side — the global `document`/`window` event-listener architecture is unchanged

### Performance & Optimization

- [ ] **PERF-01**: All `src/**/*.js` files are served with Brotli compression on the deployment target, reducing first-visit payload from ~1 MB to ~300 KB
- [ ] **PERF-02**: A `<link rel="preconnect">` hint to `https://www.gstatic.com` is added to `<head>` to reduce Firebase CDN TTFB on first visit
- [ ] **PERF-03**: The Firebase module `<script type="module">` block is moved from `<head>` to the end of `<body>` so its asynchronous parse does not delay the critical classic-script path; `auth.js` still consumes its globals at call time via the `firebase-ready` event
- [ ] **PERF-04**: Startup time profile is available via the existing `?probe` flag: the total boot duration and per-group script timings are logged to the console when `?probe` is appended to the URL

### Out of Scope for v8.0

| Item | Reason |
|------|--------|
| Source code minification | Requires a build step; not justified by the zero-build contract |
| Code-splitting / lazy-loading scenes | High-risk architectural change; defer until P4 |
| Inlining the 21 `data/` files | Defer to v9.0 or later; needs hosting-layer evaluation first |
| Firebase lazy-loading (only load when cloud saves enabled) | Defer; P3.2 depends on P2.1 infra |
| HTTP/2 push / service worker updates | Hosting-layer concern, not application code |

---
*Requirements v8.0 — 14 total across 3 categories*

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LOAD-01 | Phase 43 | Pending |
| LOAD-02 | Phase 43 | Pending |
| LOAD-03 | Phase 43 | Pending |
| LOAD-04 | Phase 43 | Pending |
| LOAD-05 | Phase 43 | Pending |
| INPUT-01 | Phase 44 | Pending |
| INPUT-02 | Phase 44 | Pending (baseline — no new code) |
| INPUT-03 | Phase 43 | Pending |
| INPUT-04 | Phase 43 | Pending |
| INPUT-05 | Phase 44 | Pending |
| PERF-01 | Phase 45 | Pending |
| PERF-02 | Phase 45 | Pending |
| PERF-03 | Phase 45 | Pending |
| PERF-04 | Phase 45 | Pending |
