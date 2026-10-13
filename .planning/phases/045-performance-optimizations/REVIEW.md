# Phase 45 (Phases 43–45 scope): Code Review Report

**Reviewed:** 2026-10-13
**Depth:** standard (per-file analysis with cross-referenced CSS/JS/tests)
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Phases 43–45 added a loading overlay with live progress, input `_ready` gating, a Firebase module move to end-of-body, and 10 new input tests. The `_ready` gating and splash-dismissal logic are sound and well-specified. Three real defects found: a class-name mismatch that kills the designed script-load error UI (`load-error` vs CSS `.error`), `#status-bar` being permanently `display: none` so `failBoot`'s error message is invisible, and a one-group-off progress calculation that shows "Booting game" while scene scripts are still loading. Firebase move and tests are clean.

## Critical Issues

### CR-01: `failBoot` error message is permanently invisible — `#status-bar` is `display: none`

**File:** `styles/game.css:75` + `src/main.js:12-16`
**Issue:** `failBoot` writes `Mythika could not start. Please reload this page.` into `#status-bar` and sets `role="alert"`, but CSS line 75 is `#status-bar { display: none; }` with no override. The user sees the splash vanish (`.loading` is removed) into a blank canvas and no error text at all. This is exactly the failure mode the phase was designed to surface, and it's silenced.
**Fix:**
```css
/* styles/game.css:75 */
#status-bar:empty { display: none; }
#status-bar:not(:empty) {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 8px 12px;
  background: #15152a;
  color: #e8a030;
  font: 11px 'Courier New', monospace;
  text-align: center;
}
```
Or, minimal: `#status-bar { display: none; } #status-bar[role="alert"] { display: block; ... }` — the failBoot path already sets the role attribute.

### CR-02: `.load-error` class has no matching CSS rule — designed error state is dead code

**File:** `index.html:61` + `styles/game.css:132-147`
**Issue:** `markError()` adds class `load-error` to `#game-container`, but the CSS defines the error overlay under `#game-container.loading.error` (game.css:132, 139, 142, 145). The class names don't match, so even if `markError()` were called the error styling would never apply. Additionally, `markError()` is **never called** anywhere in the codebase (the pre-fix version used per-script `error` listeners; the marker-based rewrite removed them). Net effect: if any of the 103 classic scripts 404s, the user sees the spinner with "Summoning the realms..." forever — no error message, no red state.
**Fix:**
1. Rename to match CSS: `container.classList.add('error');` in `index.html:61`
2. Add a capture-phase resource error handler near the tracker script:
```js
window.addEventListener('error', function(e) {
  if (e.target && e.target.tagName === 'SCRIPT') __mythikaLoadTracker.markError();
}, true);
```
3. Also fix the dead `if (el && G.frameCount > 0)` belt-and-braces in main.js: if rendering never started (frameCount stays 0), the 3s timeout never removes `.loading`, leaving the spinner up. Remove the `G.frameCount > 0` guard so the 3s fallback always clears the splash.

## Warnings

### WR-01: Progress calculation is off by one group — shows "Booting game" while scenes are still loading

**File:** `index.html:43-55` (`updateOverlay`) + markers at lines 128/149/177/188/216/218
**Issue:** `step(k)` sets `currentGroup = k`. At `step(1)` (after engine group, 16/104 scripts done), it displays `GROUPS[1].cumDone = 37 → 36%` and label `GROUPS[2].name = "systems"`. But at that moment only 15% of scripts are loaded and the *data* group is starting. The pattern repeats every step:

| Marker | Bar shows | Label shows | Actually loaded |
|--------|-----------|-------------|-----------------|
| step(1) after engine | 36% | Loading systems | 15%, data starting |
| step(4) after ui | **99%** | **Booting game** | 73%, scenes (27 scripts) still loading |
| step(5) after scenes | 100% | Booting game | 99%, boot starting |

At `step(4)` the bar claims 99% complete while the slowest group (27 scene scripts) hasn't started. "Booting game" label appears one full group early.
**Fix:** Two one-line options — either call `step(k-1)` at each marker, or inside `updateOverlay` use the previous group's cumDone and current group's name:
```js
function updateOverlay() {
  ensureDom();
  if (!barEl) return;
  var group = GROUPS[currentGroup];
  if (!group) return;
  var doneGroup = GROUPS[currentGroup - 1];
  var pct = Math.round(((doneGroup ? doneGroup.cumDone : 0) / TOTAL) * 100);
  barEl.style.width = pct + '%';
  if (labelEl) {
    var stage = currentGroup < GROUPS.length - 1
      ? 'Loading ' + group.name
      : 'Booting game';
    labelEl.textContent = pct + '%  ' + stage;
  }
}
```

### WR-02: `Input.clear()` leaves `_lastTapAt` at a recent timestamp — first tap after a scene transition can be silently dropped

**File:** `src/engine/input.js:184-194`
**Issue:** `Input.clear()` (called by `gScene` at game.js:559 and probe self-test at game.js:151) resets `clicks`, `touches`, swipe, long-press, and scroll state but not `_lastTapAt`. If a tap was recorded at time T, and the user taps ~50ms into the new scene, `_pushTap`'s flood guard (`now - _lastTapAt < 70ms`) drops it. A `gScene` fade transition takes ~300ms, so this window is narrow, but the deliberate tap-to-continue in `welcome.js` and `travelMap.js` right after a transition is exactly the affected pattern.
**Fix:**
```js
Input.clear = function() {
  Input.clicks = [];
  Input.touches = [];
  Input._touchStart = null;
  /* ... existing ... */
  Input._lastTapAt = -Infinity; // reset flood guard alongside queue
};
```
Note: game.js:347/379 already reset `_lastTapAt` explicitly in the probe self-test path — the fix in `clear()` makes those redundant.

### WR-03: `failBoot` sets `Input._ready = true` for a game that will never run

**File:** `src/main.js:11`
**Issue:** In `failBoot`, `Input._ready = true` is set but `initInput()` never ran (it lives in `gInit`, only called from `bootGame`), so no event listeners exist and no queues can fill. The flag is semantically meaningless here. Harmless today, but it signals a design assumption ("ready = game interactive") that this path violates. If `failBoot` is ever re-entered or the flag is checked elsewhere, the wrong state persists.
**Fix:** Remove line 11 — the whole point of `_ready` is gating input *until* the loop is live, and `failBoot` ends the process. If there's a reason to set it (e.g., a test asserting the gate opened), add a comment explaining it.

## Info

### IN-01: `markError` API surface is dead even after fixing CR-02

**File:** `index.html:58-61, 70`
**Issue:** Even with the class-name fix, `markError` has zero call sites. The API return value `markError` is an unused public method on `__mythikaLoadTracker`. Add the `window.addEventListener('error', ..., true)` handler (see CR-02) or drop the method entirely.

### IN-02: `Input.keys` is not gated by `_ready` — keyboard state accumulates during load

**File:** `src/engine/input.js:125-126`
**Issue:** The `keydown`/`keyup` document listeners write directly to `Input.keys` with no `_ready` check. Keys held during the ~2s load overlay will be live in `Input.keys` the moment the first frame runs. No current scene reads `Input.keys` (grep found zero consumers outside the listener itself), so this is latent, not active — but it's inconsistent with the "gate all input" requirement stated in the phase scope, and any future keyboard handler will silently see pre-game key state.
**Fix:** Guard the listener: `document.addEventListener('keydown', e => { if (Input._ready) Input.keys[e.key] = true; });`

### IN-03: No test for `failBoot` setting `Input._ready = true`

**File:** `tests/input.test.js`
**Issue:** 10 tests cover the 4 accessor methods in both states. Missing: (a) a test that `Input._ready = true` in `failBoot` doesn't crash when `Input` is undefined (the `typeof Input !== 'undefined'` guard on main.js:11), and (b) a test that `Input.clear()` leaves `_lastTapAt` in the correct state (ties to WR-02).
**Fix:** Add two tests: one asserting `_lastTapAt` is reset after `clear()`, one asserting the `failBoot` guard is a no-op when `Input` is undefined.

---

_Reviewed: 2026-10-13_
_Reviewer: gsd-code-reviewer_
_Depth: standard_

## Findings Count

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| WARNING | 3 |
| INFO | 3 |
| **Total** | **8** |
