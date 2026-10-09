# Requirements: v5.0 Layout Fixes & Early-Game Pacing

## Harness

- [ ] **LAY-00**: Layout harness — extended verify_matrix fails on a known-bad fixture (current combat header + Bazaar rows) and passes on a clean one; headless 200-fight combat simulator reports HP-loss/death-rate/clear-rate numbers BAL-01/BAL-02 assert against.

## Shared LAY Pass Criterion

At 390x844 and 844x390, for every scene in the checked set, no two rendered text bounding boxes intersect, and no text box extends past its containing panel. Checked set: all 20 scenes via gScene with a seeded save, plus combat (1v1 and 5v3), zone exploration with/without encounter, Bazaar Buy and Sell, and the Confirm Creation modal.

Harness: extend `tools/verify_matrix.py` to wrap `R.text`/`R.textCenter`, recording measured boxes per frame; settle animations, then assert. Intentional overlays (toast lane, modal over dimmed scene) excluded by tagging.

## Combat Layout

- [ ] **LAY-01**: Combat header bands — hero name, HP/MP bars, enemy name/HP, and target button occupy separate non-overlapping bands; target button sits inside the enemy panel. Verified at 1, 3, and 5 heroes.
- [ ] **LAY-02**: Combat buttons + global toast lane — action buttons share one width/height/gap grid; engine defines one toast lane constant in scene-helpers.js, Notify draws only inside it, no scene places buttons/text in the lane; tutorial toasts never cover action buttons in any scene.

## Lists & Zones Layout

- [ ] **LAY-03**: Bazaar — name, description, stat, price in separate columns/lines with tall-enough rows; resource HUD clear of titles; passes on both tabs with 8+ rows.
- [ ] **LAY-04**: Zone exploration — name/subtitle/bar/label non-overlapping; Attack/Skill/Flee hidden or disabled with no encounter; ≥8px gaps between adjacent buttons.

## Toast Lifecycle

- [ ] **LAY-05**: Toast lifecycle — first reproduce stale toast via real tap navigation (locked-zone toast → Back → Ashram → Party); each toast carries a scene tag cleared on transition except achievement banners; harness regression test runs the same tap path; concurrent-toast cap documented. Acceptable outcome: not reproducible via real taps → regression test added + scene-tag clearing applied as hardening. Dependency of LAY-02 (shared Notify).

## Fit & Finish

- [ ] **LAY-06**: Fit-finish bundle — nav More slot labeled with consistent icon; title wordmark legible, footer centered, hero sprite not a bare square; map lock icons, card heights fit content; Ashram single border + currency gold icon; Confirm Creation modal height fits content.

## Backgrounds Paint

- [ ] **LAY-07**: Backgrounds paint — every revamped scene renders its background slot (no split-R silent failure); harness samples one fixed point per scene and asserts it is not the clear color.

## Balance & Pacing (own checks)

- [ ] **BAL-01**: Combat difficulty — headless sim of 200 first-zone fights: Lv1 hero loses ≥15% HP avg over first five fights; ≥5% of zone-1 runs see a hero death; Threat reads Normal on fresh Lv1 save.
- [ ] **BAL-02**: Zone-clear rate — Aryavarta takes 12–20 fights to 100% (confirm 16%/fight baseline from sim first); later zones scale from baseline.
- [ ] **BAL-03**: Empty screens — Party, Alchemy, Spirit Beasts, Quest Log show explanatory empty-state panels at new game naming the populating action/unlock; verified by screenshot review.

## Sequencing

Build the harness extension first (only proof for LAY-01–LAY-06). LAY-05 before LAY-02.

## Future Requirements

- None deferred; all 11 play-report defects are covered above.

## Out of Scope

- New systems, zones, progression content; online/multiplayer; framework/renderer migration; combat-rule rewrites (tuning constants only).

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAY-00 — Layout harness | Phase 30 | Pending |
| LAY-05 — Toast lifecycle | Phase 31 | Pending |
| LAY-01 — Combat header bands | Phase 32 | Pending |
| LAY-02 — Combat buttons + toast lane | Phase 32 | Pending |
| LAY-07 — Backgrounds paint | Phase 32 | Pending |
| LAY-03 — Bazaar | Phase 33 | Pending |
| LAY-04 — Zone exploration | Phase 33 | Pending |
| LAY-06 — Fit-finish bundle | Phase 34 | Pending |
| BAL-01 — Combat difficulty | Phase 35 | Pending |
| BAL-02 — Zone-clear rate | Phase 35 | Pending |
| BAL-03 — Empty screens | Phase 35 | Pending |
