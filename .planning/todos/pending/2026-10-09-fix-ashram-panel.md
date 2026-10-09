---
created: 2026-10-09T00:00:00Z
title: Fix Ashram stats panel
area: ui
files:
  - src/scenes/ashram.js
---

## Problem

From 2026-10-09 play report: the Ashram stats panel has a doubled border, and the gold icon renders as a lightning bolt.

## Solution

Remove the duplicate border draw (panel vs card both stroking) and use a coin/gold glyph for gold, reserving the bolt for energy semantics.
