---
created: 2026-10-09T00:00:00Z
title: Fix Confirm Creation modal gap
area: ui
files:
  - src/scenes/characterCreate.js
---

## Problem

From 2026-10-09 play report: the Confirm Creation modal has a large empty gap between the body text and the buttons.

## Solution

Tighten the modal layout so buttons follow body text with standard spacing (check UI.Modal sizing vs content height calculation).
