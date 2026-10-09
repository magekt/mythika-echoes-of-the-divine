---
created: 2026-10-09T00:00:00Z
title: Fix title screen layout
area: ui
files:
  - src/scenes/title.js
---

## Problem

From 2026-10-09 play report: the "MYTHIKA" wordmark glyphs do not read as letters; footer text is off-center; the hero sprite renders as a green square labeled "Mount Meru".

## Solution

Fix wordmark letter rendering/spacing, center the footer, and repair the hero sprite draw (missing asset or wrong draw call producing the green square). Verify at phone + desktop viewports.
