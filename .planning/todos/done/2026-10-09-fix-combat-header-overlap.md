---
created: 2026-10-09T00:00:00Z
title: Fix combat header overlap
area: ui
files:
  - src/scenes/combatScene.js
---

## Problem

From 2026-10-09 headless-Chromium play report (430x800 phone viewport, master build): in combat, the hero name, HP bar, and MP bar stack on top of each other; the enemy name is clipped by its own panel; the "Cobra" target button renders as an orange block in the top-right corner, outside the enemy panel. Harms the first five minutes of play.

## Solution

Rework combat header layout into non-overlapping bands (name row, HP/MP bars, enemy panel with its target button inside). Reuse Phase 14 band contracts. Note for test tooling: combat button hit boxes sit at stored y=38 but render ~286px lower (scroll-panel offset) — click handling works, external tools must account for the offset.
