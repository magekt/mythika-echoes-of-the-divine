# Domain Pitfalls

**Domain:** Canvas-based mobile-first RPG screen and gameplay revamp (Milestone v3.0)
**Researched:** 2026-09-20
**Confidence:** MEDIUM-HIGH (repository evidence is strong; browser evidence is incomplete)

## Critical Pitfalls

### 1. Fixed logical-canvas geometry becomes a responsive regression
**What goes wrong:** A layout that fits the 400×720 logical surface crowds or clips at narrow widths, changed DPR, browser zoom, font scale, landscape orientation, or long localized/content strings. Fixed bands and one-off offsets can also make the desktop composition look spacious while mobile controls overlap.
**Evidence:** Phase 12 review flags fixed detail-panel geometry, many hard-coded offsets, 8px functional labels, and no demonstrated 375px/1.15–1.3 font-scale behavior. The combat review found reaction content and the fixed combat log sharing the same vertical band.
**Prevention:** Treat logical coordinates, viewport transform, content bounds, safe-area margins, and text measurement as explicit layout contracts. Centralize anchors and minimum touch targets; measure/wrap text rather than character-slicing it. Test portrait 320/375/414 widths, desktop wide/narrow widths, landscape, DPR changes, and increased font scale before accepting each screen.
**Detection:** Screenshot or browser matrix shows clipped labels, inaccessible bottom controls, hit boxes offset from visuals, overlap, unexpected empty bands, or scroll ranges that do not match rendered content.

### 2. Desktop and mobile silently diverge
**What goes wrong:** Mouse-oriented hit testing, wheel scrolling, keyboard shortcuts, or desktop-sized spacing works in a desktop probe while touch drag-vs-tap, thumb reach, orientation changes, and mobile browser viewport behavior fail. A direct desktop boot is mistaken for end-to-end mobile validation.
**Evidence:** The final Phase 12 verification could establish direct map boot and selection, but not mobile emulation, pan, dense state, sustained FPS, or console silence. The documented 15px drag threshold and explicit hit-order are valuable but need real-device confirmation.
**Prevention:** Define one interaction contract with pointer/touch parity, explicit drag cancellation, hit priority, minimum targets, and no reliance on hover. Run the same journey on a representative phone and desktop: boot, navigate, pan/scroll, inspect, act, return, reload, and resize/orient.
**Detection:** Tap activates while dragging, controls require precision, back/re-entry loses selection, or desktop-only checks pass while mobile screenshots/FPS fail.

### 3. Asset/cache version skew creates mixed-runtime gameplay
**What goes wrong:** `index.html` updates while a cache-first worker serves stale JavaScript or omits a new dependency. The game boots into a partially compatible runtime: saves hydrate incompletely, scenes crash only after navigation, or new screens appear without their systems.
**Evidence:** The Phase 6 investigation reproduced a mixed-version worker runtime where legacy hydration succeeded but canonical world state was absent. Browser cache activation and legacy boot remain accepted debt; service-worker tests are primarily static checks rather than executable lifecycle tests.
**Prevention:** Treat every revamp as an atomic asset release: bump cache version, audit the complete script manifest, precache every required dependency, activate/delete old caches, and test install/activate/fetch with mocked Cache Storage plus a real existing-worker browser test. Add a runtime compatibility guard and safe recovery path for stale clients.
**Detection:** A clean profile passes but an existing installed client fails; `typeof` checks differ between scripts; console errors mention missing globals; cache contents do not match the current manifest.

### 4. Scene listeners, timers, components, and state outlive the screen
**What goes wrong:** Re-entering a scene accumulates buttons, closures, resize/orientation listeners, timers, effects, cached canvases, or stale selected IDs. The first visit works; repeated transitions duplicate input, increase frame cost, or apply actions to an old screen.
**Evidence:** Codemap lists unremoved resize/orientation listeners, interval timers, retained scene objects, and inconsistent `leave()` cleanup. Phase 12 notes that buttons are nulled but not destroyed, grid cache is not cleared on reset, and shared components lack a general destroy contract.
**Prevention:** Make `enter → update → render → leave` ownership explicit. Register every listener/timer/effect under a scene cleanup bucket, destroy component closures before dropping arrays, invalidate caches on resize/reset, and assert resource counts over 50–100 enter/leave cycles. Never let render-time code mutate gameplay state.
**Detection:** Button arrays or listeners grow, duplicate callbacks fire, old selection survives re-entry, heap/frame time trends upward, or an action affects the wrong scene after rapid navigation.

### 5. Deprecated-code cleanup removes hidden contracts
**What goes wrong:** Broad deletion of “legacy” helpers, globals, aliases, fallback fields, or script tags breaks indirect callers, old saves, service-worker manifests, debug probes, or script-order initialization. Global namespace code has dependencies that static search may miss.
**Prevention:** Remove code only after an inventory of direct and indirect references, script order, save migrations, worker assets, probes, and browser entry paths. Prefer deprecation shims and staged removal. Run syntax/full tests, legacy-save hydration, clean boot, cached boot, and all major gameplay flows before deleting compatibility code.
**Detection:** Clean fresh-save tests pass but old saves, direct `index.html` boot, `?probe`, PWA reload, or a late scene fails with undefined globals or missing fallback behavior.

### 6. Debug instrumentation leaks into production and the hot loop
**What goes wrong:** Console logging, probes, screenshots, verbose state dumps, or per-frame diagnostics remain enabled, flood logs, retain objects, expose player state, and reduce FPS—especially on mobile. Logging can also alter timing enough to hide race conditions.
**Prevention:** Gate diagnostics behind explicit URL flags and a disabled-by-default logger; aggregate counters rather than logging each frame. Guard expensive serialization and draw-call tracing, cap ring buffers, scrub sensitive save data, and verify a production-like run has zero unexpected console output.
**Detection:** Console message counts grow during idle play, frame time changes substantially with DevTools open, save payloads appear in logs, or memory/FPS worsens after enabling a screen.

### 7. Gameplay flow breaks while screens look correct
**What goes wrong:** A visual revamp bypasses authoritative systems, changes action IDs, loses return context, double-applies rewards, permits locked entry, or fails to persist state. Attractive screens can therefore corrupt progression or make the player’s next path unclear.
**Prevention:** Keep `ZoneAccess`, combat, progression, economy, quests, save hydration, and world-state APIs as mutation owners. Use stable IDs and explicit action results; re-check gates at action time; make reward/outcome operations idempotent. Test complete flows, not isolated renders: title/load → map → inspect → enter → gameplay action → reward/state → save → reload → return.
**Detection:** State changes only after refresh, duplicate rewards appear, locked content opens from stale selection, back navigation loses the intended destination, or reload differs from in-memory behavior.

## Moderate Pitfalls

### 8. Automated tests prove source shape, not user behavior
**What goes wrong:** VM tests and regex checks pass while real Canvas transforms, touch dispatch, cache activation, visual density, and performance fail. Same-runtime reload tests can accidentally reuse module state.
**Prevention:** Pair unit/contract tests with fresh-runtime tests, browser journey checkpoints, screenshots at target viewports, console capture, and performance probes. Mark unavailable browser evidence as `human_needed`, never as passed.

### 9. Dense indicators and copy become unreadable
**What goes wrong:** Landmarks, events, echoes, status labels, and timers compete in a fixed card band; generic fallbacks and character truncation hide actionable information.
**Prevention:** Define density budgets, measured wrapping/ellipsis, priority ordering, and progressive disclosure. Test long names and maximum simultaneous indicators at 375px and increased font scale.

### 10. Unbounded effects and save data regress over time
**What goes wrong:** Full redraw plus particles, gradients, noise, deep-clone saves, history arrays, and per-frame object allocation cause GC spikes or slow long sessions.
**Prevention:** Bound every per-occurrence collection, cull offscreen effects, cache static geometry, avoid deep cloning on every save, and run 30-minute/100-transition soak checks with frame and payload-size thresholds.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Layout foundation | Fixed offsets and mismatched scroll/content bounds | Build viewport/layout matrix and measured text helpers first. |
| Screen migration | Mobile and desktop behavior fork | Preserve one pointer contract; verify real touch and mouse journeys. |
| Asset/PWA delivery | Stale worker serves mixed scripts | Version and execute worker lifecycle tests before rollout. |
| Gameplay integration | UI becomes a second mutation owner | Route every action through canonical systems and assert idempotency. |
| Cleanup/deprecation | Hidden global/script-order dependency deleted | Inventory references, retain shims, test legacy/cache boot. |
| Polish/performance | Debug logs and effects mask regressions | Disable diagnostics by default; use bounded probes and soak tests. |
| Final acceptance | Automated green mistaken for browser complete | Require screenshots, console, mobile FPS, reduced-motion, and reload evidence. |

## Recommended Verification Gate

Do not call v3.0 complete until a fresh and existing-worker client both pass: portrait/landscape desktop-mobile layout matrix; repeated scene cycling; reduced motion; no unexpected console errors; stable `?probe` FPS; maximum-density screen state; legacy save load; and the full gameplay loop through save/reload. Preserve evidence artifacts with exact viewport/device, cache version, seed/save fixture, and test counts.

## Sources

- `codemap.md` — architecture, global state, lifecycle, performance debt, and verification plan (HIGH confidence, repository source).
- `.planning/PROJECT.md` and `.planning/STATE.md` — constraints, core value, and accepted v2 browser evidence debt (HIGH confidence, project source).
- `.planning/debug/layout-spacing-game-view.md` — confirmed combat-log/reaction-window overlap and layout investigation pattern (HIGH confidence, project source).
- `.planning/debug/phase-6-legacy-save.md` — reproduced service-worker mixed-version failure (HIGH confidence, project source).
- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-UI-REVIEW.md` — responsive, density, lifecycle, and browser-verification findings (HIGH confidence, repository review; browser limitations explicitly noted).
- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-VERIFICATION.md` and `12-VALIDATION.md` — required performance/lifecycle/reduced-motion gates and unresolved human checks (HIGH confidence).
- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-PATTERNS.md` — cleanup, timer, allocation, and test-pattern risks (HIGH confidence).
- `.planning/milestones/v2.0-phases/06-world-state-continuity/06-REVIEW.md` and `06-VERIFICATION.md` — static worker-test limitations and legacy/cache verification debt (HIGH confidence).
- `.planning/milestones/v2.0-phases/11-dynamic-world-events/11-04-VERIFICATION.md` and `11-05-REVIEW.md` — browser-needed event flow and fresh-runtime reload-test gap (HIGH confidence).
