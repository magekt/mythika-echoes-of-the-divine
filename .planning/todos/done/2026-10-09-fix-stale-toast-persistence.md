---
created: 2026-10-09T00:00:00Z
title: Fix stale toast persistence
area: ui
files:
  - src/ui/feedback.js
  - src/engine/game.js
---

## Problem

From 2026-10-09 play report: a "Locked zones list their requirements" toast persisted across Party and Cultivation scenes. Reporter jumped scenes programmatically, so a normal navigation path may not reproduce — likely the global toast queue (drained in game.js) is never cleared on scene transitions.

## Solution

Clear or expire the Feedback toast queue on scene change (leave/enter), or scope toast lifetime so cross-scene toasts die with their scene. Repro first via programmatic scene jumps, then fix.
