---
created: 2026-10-09T00:00:00Z
title: Fix Bazaar row overlap
area: ui
files:
  - src/scenes/bazaar.js
---

## Problem

From 2026-10-09 play report: Bazaar item names print over their descriptions and stat labels, so most rows cannot be read. A resource HUD (gold, level, prana) overlaps the "Bazaar" and "Endless Trials" titles. Harms early-game readability.

## Solution

Give Bazaar rows a fixed row template (name line, desc line, stat line with reserved gutters) and move the resource HUD clear of the titles. Verify at 400x720 portrait.
