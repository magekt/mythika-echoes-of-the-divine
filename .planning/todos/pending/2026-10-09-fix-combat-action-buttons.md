---
created: 2026-10-09T00:00:00Z
title: Fix combat action button widths
area: ui
files:
  - src/scenes/combatScene.js
---

## Problem

From 2026-10-09 play report: combat action button widths are inconsistent — Melee is half-width, Guard is offset right, the rest are full-width. Tutorial toasts cover Gandiva Shot and Rain of Arrows.

## Solution

Normalize the action bar to uniform full-width (or a consistent grid) buttons and reserve a toast-safe zone so tutorial toasts never cover actions. Keep Phase 14 action-band contracts passing.
