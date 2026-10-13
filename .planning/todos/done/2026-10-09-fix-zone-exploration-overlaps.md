---
created: 2026-10-09T00:00:00Z
title: Fix zone exploration overlaps
area: ui
files:
  - src/scenes/zoneExploration.js
---

## Problem

From 2026-10-09 play report: the zone name overlaps its subtitle; the progress bar overlaps the "Exploration: 0%" text. Attack, Skill, and Flee buttons appear while the screen reads "No encounter", and Attack and Skill touch with no gap.

## Solution

Separate title/subtitle/progress rows with reserved vertical slots; gate Attack/Skill/Flee visibility on encounter presence; enforce a minimum gap between adjacent buttons. Verify at 400x720.
