---
created: 2026-10-09T00:00:00Z
title: Fix travel map cards
area: ui
files:
  - src/scenes/travelMap.js
  - src/scenes/map_helpers.js
---

## Problem

From 2026-10-09 play report: locked zones show a lightning bolt where a lock icon is expected; threat reads "Intense (100%)" on a fresh Lv1 character; zone cards have large empty interiors.

## Solution

Use a lock glyph for locked zones (reserve lightning for gold/prana semantics); scale displayed threat to party level so fresh characters don't read max threat; fill or tighten card interiors (compact stats, landmark/event indicators).
