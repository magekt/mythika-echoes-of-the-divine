---
created: 2026-10-09T00:00:00Z
title: Label nav bar More slot
area: ui
files:
  - src/engine/scene-helpers.js
---

## Problem

From 2026-10-09 play report: the nav bar "More" slot shows a bare hamburger icon with no label, unlike the four labeled slots beside it.

## Solution

Give the More slot the same label treatment as the other nav slots (icon + text label per the FluidNav/nav helper conventions).
