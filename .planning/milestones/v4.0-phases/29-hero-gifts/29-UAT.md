---
status: testing
phase: 29-hero-gifts
source: [".planning/milestones/v4.0-phases/29-hero-gifts/29-01-SUMMARY.md", ".planning/milestones/v4.0-phases/29-hero-gifts/29-02-SUMMARY.md", ".planning/milestones/v4.0-phases/29-hero-gifts/29-03-SUMMARY.md"]
started: 2026-10-09T00:00:00Z
updated: 2026-10-09T00:00:00Z
---

## Current Test

number: 1
name: Give Gift action and picker
expected: |
  Open the game, go to Party → hero detail. A "Give Gift" action appears after Use Item. Tapping it opens a picker listing gift items from inventory; liked gifts show ♥, tier-locked ones show 🔒 plus the tier name.
awaiting: user response

## Tests

### 1. Give Gift action and picker
expected: Open the game, go to Party → hero detail. A "Give Gift" action appears after Use Item. Tapping it opens a picker listing gift items from inventory; liked gifts show ♥, tier-locked ones show 🔒 plus the tier name.
result: blocked
blocked_by: prior-phase
reason: "Needs a recruited (purchased) hero plus gift items in inventory — user playing toward it, feedback coming"

### 2. First gift grants +13 and refreshes meter
expected: Give a liked gift to a recruited hero in the active party. A "+13 bond" toast appears and the hero's affinity meter visibly increases.
result: pending

### 3. Repeat gifts diminish
expected: Give the same gift again. Second grant is +8, third is +5, later ones are +3 each.
result: pending

### 4. Tier-locked gift denied with reason, nothing consumed
expected: Give a Sworn-locked gift to a below-Sworn hero. A blocker toast names the required tier. The gift stays in inventory and affinity is unchanged.
result: pending

### 5. Weekly cap denies with reason, nothing consumed
expected: After many gifts in one week-equivalent, further gifting is denied with a cap reason. Gifts stay in inventory and affinity is unchanged.
result: pending

### 6. Tier-up celebration
expected: Gift a hero across a tier threshold (e.g. into Trusted). A tier-up celebration appears alongside the bond toast.
result: pending

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0

## Gaps

[none yet]
