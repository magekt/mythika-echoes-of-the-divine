---
created: 2026-10-09T00:00:00Z
title: Rebalance early-game pacing
area: general
files:
  - src/systems/combat.js
  - src/systems/progression.js
  - src/scenes/zoneExploration.js
---

## Problem

From 2026-10-09 play report: early combat is trivial (Lv1 Arjuna two-tapped a Cobra, never dropped below full HP across 27 fights); zone progress rises ~16% per battle so a zone clears in ~7 fights. Four scenes (Party, Alchemy, Spirit Beasts, Quest Log) leave the bottom half of the screen empty at game start.

## Solution

Tune early enemy damage/HP and zone-progress-per-battle for a real (but fair) ramp; backfill the empty lower halves with useful content (next actions, hints, progression previews) rather than stretching existing rows. Playtest the first 15 minutes after changes.
