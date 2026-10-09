# Requirements: v4.0 Deep Companions & Living Zones

## Hero Affinity

- [x] **AFF-01**: Player can see each recruited hero's affinity meter (0–100) and tier (Wary→Trusted→Sworn→Legend) on the hero surface.
- [x] **AFF-02**: Encounter choices change affinity (gains only, no decay) when the hero is in the party.
- [x] **AFF-03**: Tier thresholds unlock bond dialogue events (recruit → crisis → oath) reusing encounter UI.
- [x] **AFF-04**: Tier grants a passive combat bonus that applies only when the hero is in the active party.
- [x] **AFF-05**: A bonded hero grants a small pair synergy buff alongside the player.
- [x] **AFF-06**: Tier 3 unlocks one signature duo skill per hero.

## Beast Bonding

- [x] **BST-01**: Beast bond hearts (0–3) grow via battle-together XP plus feed/train actions.
- [x] **BST-02**: Each heart raises beast skill potency; heart 2 unlocks one passive.
- [x] **BST-03**: Heart 3 counts toward beast evolution requirements (evolution assist).
- [x] **BST-04**: Feed consumes farm/alchemy items and training spends gold/prana, both capped with cooldowns.

## Zone Deepening

- [x] **ZON-01**: Existing zones surface companion-gated encounter variants requiring affinity/bond minimums (no new zone IDs).
- [x] **ZON-02**: Landmarks and narrative echoes reference the highest-bond companion per zone.

## Gifts

- [x] **GFT-01**: Hero-liked items grant capped affinity with diminishing returns (no gift-vending).

## Save Compatibility

- [x] **SAV-01**: Affinity, bond, and bond flags persist under save versioning with normalize healing (clamp, drop unknown keys, proto-pollution guard).

## Browser Evidence

- [ ] **EVD-01**: Combined v2.0 + v3.0 browser matrix executed early (console silence, probe FPS, dense states, reduced motion, worker/cache activation).

## Future Requirements

- Additional signature combos beyond one pilot hero (pending readability proof).
- Companion content for post-v4.0 zones, if geography ever expands.

## Out of Scope

- New realm geography; backend sync/multiplayer; framework/renderer migration.
- Romance paths, companion departure/betrayal, morale decay, multi-axis vectors, full skill trees (see research anti-features).

## Traceability

| Requirement | Phase |
|-------------|-------|
| EVD-01 | Phase 21 |
| AFF-01 | Phase 22 |
| SAV-01 | Phase 22 |
| AFF-02 | Phase 23 |
| AFF-03 | Phase 23 |
| AFF-04 | Phase 24 |
| AFF-05 | Phase 24 |
| AFF-06 | Phase 25 |
| BST-01 | Phase 26 |
| BST-04 | Phase 26 |
| BST-02 | Phase 27 |
| BST-03 | Phase 27 |
| ZON-01 | Phase 28 |
| ZON-02 | Phase 28 |
| GFT-01 | Phase 29 |
