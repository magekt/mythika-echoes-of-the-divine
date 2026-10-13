---
created: 2026-10-09T00:00:00Z
title: Fix backgrounds never painting
area: general
files:
  - src/engine/backgrounds.js
  - src/engine/renderer.js
---

## Problem

Found 2026-10-09 during Phase 30 harness work (see tools/layout_harness/driver.js bridge comment): `src/engine/backgrounds.js` attaches its API to `window.R.Backgrounds`, but all game code reads the lexical `const R` from `src/engine/renderer.js`, which has no `Backgrounds` member. Result: the entire Phase 17 background system never paints in production (calls throw; enter-path errors are swallowed by safeEnter, so boot stays clean while backgrounds silently stay off).

## Solution

Attach the API to the lexical `R` (e.g. `R.Backgrounds = R.Backgrounds || Backgrounds;` in backgrounds.js, which loads after renderer.js) instead of `window.R`. Verify: Ashram/combat/map scenes show backgrounds in the layout sweep; full suite + boot matrix stay green. Beware the split-R reader in `src/ui/heroSurface.js` (`global.R`) — keep it working.
