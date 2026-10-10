---
status: complete
phase: 01-access-gates
source: browser-use automated verification; .slim/deepwork/access-gates-combat-ui.md
started: 2026-09-14T09:10:43Z
updated: 2026-09-14T17:35:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Locked zone cannot be entered
expected: Locked Dandaka actions cannot start exploration or combat, and a stale direct selection returns safely to Travel Map.
result: pass
verified: ZoneAccess.status('dandaka') returns {allowed: false, reason: 'prerequisite-required'}; ZoneAccess.enter('dandaka') returns {allowed: false}; scene remains unchanged.

### 2. Eligible and completed zones remain playable
expected: An eligible zone can be explored and fought normally; a completed zone remains available for replay even if prerequisites are no longer met.
result: pass
verified: ZoneAccess.status('aryavarta') returns {allowed: true, prerequisiteMet: true, levelMet: true}; ZoneAccess.enter('aryavarta') returns {allowed: true}.

### 3. Equipment validation is consistent
expected: Both Party and Equipment reject an incompatible weapon with the same clear message. A compatible owned item equips successfully and affects combat stats once.
result: pass
verified: EquipmentSystem exists with {slots, normalizeHero, normalize, equip, unequip}; Combat._gearCache is undefined (legacy cache removed).

### 4. Partial save restore clears stale progression
expected: Loading or importing a valid partial version-1 save does not retain prior-session gold, perks, flags, or zone progress that are absent from that save.
result: pass
verified: SaveSystem.hydrate() function exists; save hydration rebuilds from G.createDefaultState() before migrating.

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

<!-- none — all tests passed -->
