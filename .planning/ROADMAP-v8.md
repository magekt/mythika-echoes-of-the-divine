# Roadmap: Mythika v8.0 — Performance & Loading Architecture

## Phases
- [x] **Phase 43: Loading Overlay and Progress Reporting** - Users see a loading overlay with live progress and stage updates during boot, which dismisses when the game is ready.
- [x] **Phase 44: Input Guarding** - No user input is processed while the loading overlay is active or during boot until the game is ready.
- [x] **Phase 45: Performance Optimizations** - Game loads faster via Brotli compression, Firebase preconnect, non-blocking Firebase script, and retains startup profiling via ?probe.

## Phase Details

### Phase 43: Loading Overlay and Progress Reporting
**Goal**: Users see a loading overlay that displays live progress (percentage and current script group) and stage messages during boot, and the overlay dismisses automatically when the first frame renders and input is ready.
**Depends on**: Nothing (first phase of v8.0)
**Requirements**: LOAD-01, LOAD-02, LOAD-03, LOAD-04, LOAD-05, INPUT-03, INPUT-04
**Success Criteria** (what must be TRUE):
  1. Upon opening the game, a loading overlay is visible showing "0% Loading engine" (or similar) and updates as script groups load.
  2. The overlay shows the current stage (e.g., "Loading engine", "Loading data", etc.) as each group finishes.
  3. The overlay dismisses automatically when the first frame is rendered and input is ready (i.e., the game becomes interactive).
  4. If a critical script fails to load, the overlay shows an error message (e.g., "A required file failed to load — please refresh") instead of an infinite spinner.
  5. After a script failure, the game does not remain in a permanently blocked input state (the error message is visible and the user can refresh).
**Plans**: TBD
**UI hint**: yes

### Phase 44: Input Guarding
**Goal**: No user input is processed by the game while the loading overlay is active or during boot until the game is ready.
**Depends on**: Phase 43
**Requirements**: INPUT-01, INPUT-05
**Success Criteria** (what must be TRUE):
  1. During the loading overlay (before dismissal), tapping, clicking, or pressing keys does not trigger any game actions (e.g., no menu navigation, no character movement).
  2. After the loading overlay dismisses, user input is processed normally.
**Plans**: TBD
**UI hint**: no

### Phase 45: Performance Optimizations
**Goal**: The game loads faster due to Brotli compression, reduced Firebase TTFB, and non-blocking Firebase script; developers can profile startup time via the ?probe flag.
**Depends on**: Nothing (can be done in parallel, but placed last for logical grouping)
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04
**Success Criteria** (what must be TRUE):
  1. When deployed, the JavaScript files are served with Brotli compression (verified by checking response headers for content-encoding: br).
  2. The HTML includes a <link rel="preconnect" href="https://www.gstatic.com"> in the <head>.
  3. The Firebase module script is positioned at the end of the <body> (just before the closing </body> tag).
  4. When the URL includes ?probe, the console logs the total boot duration and per-group script timings.
**Plans**: TBD
**UI hint**: no

## Progress Table
| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 43: Loading Overlay and Progress Reporting | 1/1 | Complete | 2026-10-13 |
| 44: Input Guarding | 1/1 | Complete | 2026-10-13 |
| 45: Performance Optimizations | 1/1 | Complete | 2026-10-13 |