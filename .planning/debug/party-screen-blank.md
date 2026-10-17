---
status: resolved
trigger: "Party Screen won't open — shows blank/blanked out when clicking Party button in HUD, after recent loading-overlay changes (Phase 043). No visible console errors."
created: 2026-10-17
updated: 2026-10-17
---

# Debug Session: party-screen-blank

## Symptoms

- Expected: Party Screen lists party + manages equipment.
- Actual: Screen won't open / blank.
- Errors: None visible in console or overlay.
- Timeline: After recent changes; likely started with Phase 043 loading-overlay work.
- Reproduction: Click Party button in HUD from main game screen.

## Current Focus

- hypothesis: Phase 043 loading-overlay work changed scene-transition behavior (possibly gScene structure or enter lifecycle) so Party scene no longer renders — enters without error but renders blank.
- test: Inspect Party button click handler in HUD, trace to scene registration/transition, verify Party scene's enter/render still produce output; compare against recent 043-related diffs for `gScene`, `Fade`, `Enter` changes.
- expecting: Identify which rendering/lifecycle change during the loading-overlay phase broke the Party screen and restore its visible transition.
- next_action: gather initial evidence (inspect Party button handler and scene registration)

## Evidence

- timestamp: 2026-10-17
  observation: user reports Party Screen blank with no console errors after clicking Party button
  source: user session report
- timestamp: 2026-10-17
  observation: Reproduced in headless Chrome: calling gScene('party') sets Fade.target=1, pendingScene={party}, but Fade.alpha oscillates ~0.917<->1.029 and never equals exactly 1.0 over 40 frames. alpha===target is false every frame. Scene never swaps (stays 'title'). Fade.render paints near-full black (globalAlpha~1.0) = blank screen. reducedMotion=false.
  source: CDP probe (Fade.alpha monitored over frames)
- timestamp: 2026-10-17
  observation: Root cause located in src/engine/game.js Fade.update (line 143): completion check `this.alpha === this.target` is strict float equality. Normal-motion path does `this.alpha += dir * this.speed * dt` which accumulates float error and overshoots target, so alpha never equals target exactly. pendingScene is never consumed, scene never transitions, screen stays black under the fade cover.
  source: git blame on src/engine/game.js:143 -> commit 5cd716c3 'feat(12-02): reduced-motion guards...' (2026-09-19)
- timestamp: 2026-10-17
  observation: Pre-regression check (commit 5cd716c3 diff) was `(dir > 0 && this.alpha >= this.target) || (dir < 0 && this.alpha <= this.target)` — reached-or-passed, works with float accumulation. The reduced-motion branch (alpha snapped to target exactly) still works; only the normal-motion equality check is broken. Phase 043 (commit 199917b) only changed the splash dismissal condition (gLoopFrame), not Fade.
  source: git show 5cd716c3, git show 199917b
- timestamp: 2026-10-17
  observation: Fix applied to src/engine/game.js Fade.update: restored reached-or-passed completion check `rm || (dir > 0 && this.alpha >= this.target) || (dir < 0 && this.alpha <= this.target)` (dir hoisted with let). Verified in headless Chrome: gScene('party') now completes the fade and transitions scene title→party with zero console errors. node --check, git diff --check, node --test tests/*.test.js (622 pass/0 fail), and tools/check_ui_invariants.sh all pass.
  source: fix verification via CDP probe + repo validation

## Resolution

- **root_cause:** `Fade.update()` in `src/engine/game.js` used a strict float-equality completion check (`this.alpha === this.target`) to detect when a scene-transition fade finished. The normal-motion path advances alpha via `this.alpha += dir * this.speed * dt`, which accumulates floating-point error and overshoots the target, so alpha oscillates around 1.0 (e.g. 0.917 ↔ 1.029) and never equals it exactly. As a result `pendingScene` was never consumed, `G.currentScene` was never swapped to `party`, and `Fade.render` kept painting a near-full black rectangle (`globalAlpha ≈ 1.0`) over the screen — the blank/blanked-out Party screen. Regression introduced in commit `5cd716c3` ("feat(12-02): reduced-motion guards", 2026-09-19), which replaced the working reached-or-passed check with strict equality. Affects all fade-based scene transitions, not only Party.
- **fix:** Restored the reached-or-passed completion test in `Fade.update()`: `rm || (dir > 0 && this.alpha >= this.target) || (dir < 0 && this.alpha <= this.target)`, with `dir` hoisted so it is available to the condition (it is never read when `rm` is true, since alpha is snapped to target exactly there). This matches the pre-regression behavior and lets the fade cover/reveal complete, consuming `pendingScene` and swapping the scene.
- **verification:** Reproduced in headless Chrome before fix (fade stuck, scene stayed 'title', blank screen). After fix, `gScene('party')` completes the fade and transitions title→party with zero console errors. `node --check src/engine/game.js`, `git diff --check`, `node --test tests/*.test.js` (622 pass / 0 fail / 1 skipped), and `tools/check_ui_invariants.sh` all pass.

