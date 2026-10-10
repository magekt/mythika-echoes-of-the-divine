---
milestone: v4.0
phases: 21-29
date: 2026-10-09
status: gaps_found
requirements: AFF-01..AFF-06, BST-01..BST-04, ZON-01..ZON-02, GFT-01, SAV-01, EVD-01
---

# v4.0 Milestone Audit — Deep Companions & Living Zones (Phases 21–29)

**Verdict: gaps_found** — all 14 functional requirements have automated contract coverage and pass Node/static gates (379/379 + `check_ui_invariants.sh` green, re-verified this audit); one gap class remains: (1) live browser evidence deferred across every phase (EVD-01 journey matrix pending; only the Phase 21 headless boot harness is green). Traceability debt: 11 requirement checkboxes in REQUIREMENTS.md remain unticked despite phase verifications claiming contract-level closure.

## Sources read

- `.planning/REQUIREMENTS.md` (15 reqs: AFF-01..06, BST-01..04, ZON-01..02, GFT-01, SAV-01, EVD-01 + traceability table)
- Phase verifications: `21-VERIFICATION.md`, `22-VERIFICATION.md`, `23-VERIFICATION.md`, `24-VERIFICATION.md`, `25-VERIFICATION.md`, `26-VERIFICATION.md`, `27-VERIFICATION.md`, `28-VERIFICATION.md`, `29-VERIFICATION.md`
- Phase summaries: `21-01-SUMMARY.md`, `22-01/22-02/22-03-SUMMARY.md`, `23-01/23-02/23-03-SUMMARY.md`, `24-01/24-02/24-03-SUMMARY.md`, `25-01/25-02/25-03-SUMMARY.md`, `26-01/26-02/26-03-SUMMARY.md`, `27-01/27-02/27-03-SUMMARY.md`, `28-01/28-02/28-03-SUMMARY.md`, `29-01/29-02/29-03-SUMMARY.md`
- Source spot-checks (this audit): `BondSystem|BeastBond|LivingZones` globals, combat hooks (`applyBondPassives`, `performSignatureCombo`, `addBattleXP`, `potencyFor`/`auraFor`), `bondReq` gating, `giveGift|normalizeGifts|HERO_GIFTS`, save `normalize*` chain, `index.html`/`sw.js` script order
- Fresh gates (this audit): `node --test tests/*.test.js` 379/379 pass; `tools/check_ui_invariants.sh` green (95 files, 21 system scripts); `git diff --check` clean; `git status` clean

## Per-requirement verdicts

| Req | Phase | Verdict | Evidence |
|-----|-------|---------|----------|
| AFF-01 affinity meter + tier | 22 | pass, contract only (checkbox stale) | `bond_affinity.test.js` tier boundaries; `hero_affinity_display.test.js` meter/tier draw; `BondSystem.get` recruited-gating; REQUIREMENTS box unticked |
| AFF-02 choice gains, no decay | 23 | pass, contract only (checkbox stale) | `choice_affinity.test.js` +2/+4, active-party gate, no-decay sweep; `bond_matrix.test.js` 12/12; REQUIREMENTS box unticked |
| AFF-03 bond dialogue arc | 23 | pass, contract only (checkbox stale) | 15-event `BOND_EVENTS` (recruit/crisis/oath × 5 heroes), tier-gated `bondAvailable`, exactly-once + 3× +1 replay cap, encounter-UI reuse, pool isolation; REQUIREMENTS box unticked |
| AFF-04 tier combat passive | 24 | pass, contract only | `combat_bonds.test.js` 31/31; non-cumulative +1/+2/+4 on role stat, battle-clone only; Phase 14 readability green; box ticked |
| AFF-05 pair synergy buff | 24 | pass, contract only | one tag/hero at Sworn+, adjacency-gated, linger-one-battle; box ticked |
| AFF-06 signature duo skill | 25 | pass, contract only (checkbox stale) | `signature_combos.test.js` 22/22; 5 Legend-gated combos, build-scaled potency, both-turns cost, exactly-once flags, COMMIT-ALL-FIVE readability verdict; REQUIREMENTS box unticked |
| BST-01 beast hearts via battle+care | 26 | pass, contract only (checkbox stale) | `beast_hearts.test.js` 18/18 + `beast_care.test.js` 7/7; thresholds [0,30,80,160], +8 battle bridge, feed +11 / prana +6 / gold +14; REQUIREMENTS box unticked |
| BST-02 heart potency + heart-2 passive | 27 | pass, contract only (checkbox stale) | `beast_power.test.js` 8/8; +10%/heart mult, flat +10HP/+1×4 + 10 auras at heart 2; REQUIREMENTS box unticked |
| BST-03 heart-3 evolution assist | 27 | pass, contract only (checkbox stale) | `beast_power_evo.test.js` 8/8; `requiredLevelFor` halves gates (10→5, 25→12), identical forms/stats; REQUIREMENTS box unticked |
| BST-04 feed/train costs + caps | 26 | pass, contract only (checkbox stale) | item+gold feed, dual-track training, 3/day feed + 5/day shared train caps, 5-min gold cooldown, explained denials, zero-mutation denials; REQUIREMENTS box unticked |
| ZON-01 companion-gated variants | 28 | pass, contract only | `living_zones_variants.test.js` 9/9; 12 variants, affinity 25/50 or heart-2 gates, same-zone base, zero new zone IDs; box ticked |
| ZON-02 landmark/echo bond refs | 28 | pass, contract only | `living_zones.test.js` 12/12 + `living_zones_oath.test.js` 3/3; read-time bondNote/witness, oath naming, no persistence change; box ticked |
| GFT-01 hero gifts, capped | 29 | pass, contract only (checkbox stale) | `hero_gifts_data.test.js` 8/8 + `hero_gifts.test.js` 12/12; 19-gift catalog, 13/8/5→3 diminishing, 26/week cap, Sworn locks, canonical Economy+BondSystem routing; REQUIREMENTS box unticked |
| SAV-01 persistence + normalize | 22+24-29 | pass, contract only (checkbox stale) | affinity + linger + combo + gift-flags + beastBond all healed in `SaveSystem.migrate` (affinity → linger → combo → gifts → beastBond chain confirmed in source), legacy/malformed/hostile-key suites green, version-1 envelope; REQUIREMENTS box unticked |
| EVD-01 browser matrix early | 21 | **gap: journey gate open** | harness green (3/3 profiles boot clean, real Chrome, defects fixed); F1–F5/W1–W5 journey rows all `pending` (console silence, probe FPS, dense states, reduced motion, worker/cache); every phase 22–29 explicitly defers live-browser matrix to v4.0 backlog |

## Cross-phase integration

- **BondSystem (single authority):** tier/value/get/add, bond arc (`bondAvailable`/`completeBond`), combat (`passiveFor`/`synergyFor`/`combatBonusFor`/linger), combos (`comboFor`/`comboAvailable`/`comboPotencyFor`/seen flags), gifts (`giveGift` 13/8/5→3 + weekly cap + tier locks/`normalizeGifts`) — all in `src/systems/bond.js`, never-throw, no R/UI dependency. Confirmed present.
- **BeastBond (same file, separate global):** hearts/XP/costs/caps/cooldowns + `potencyFor`/`statBoostFor`/`auraFor` + `normalize`. Battle bridge via `Combat.awardBeastXP → BeastBond.addBattleXP`; combat application via `combatScene.doBeastSkill` potency/aura read; evolution assist via `spirit_beasts.requiredLevelFor`. Confirmed present.
- **Combat hooks:** `applyBondPassives` in `startBattle` (post-elite, pre-sort), 5 synergy tag hooks (crit/burst/ward/swiftness/intercept), `performSignatureCombo` via existing primitives only, `nextTurn` consumed-partner skip, linger consumed in `combatScene.endBattle` (win AND loss). Phase 14 authority contracts green. Confirmed present.
- **Zone variants:** 12 `bondReq` entries in `zone_variants.js`, additive gating in `encounterAvailable`, `LivingZones` resolve/tease/companion/note/witness, tease toast in `zoneExploration.update`, bondNote in `landmarks.getAll` + travel-map detail, companion witness in `narrative_echoes` + zone card. Zero new zone IDs. Confirmed present.
- **Gifts:** `ITEMS.gifts` (19) + `HERO_GIFTS` (5×10) in `items.js`, loot-only sourcing (~12% additive, no shop), `Give Gift` action in `party.js` via `BondSystem.giveGift` only, Use/Equip untouched. Confirmed present.
- **Save normalize:** `migrate` heals affinity → linger → combo → gifts → beastBond in order, each guarded with absent-system fallback; unrelated state verbatim; no version bump; no new state branches. Confirmed in source.
- **Script loading:** `bond.js` before `save.js`; `bonds.js` after `encounters.js`; `living_zones.js` in systems block; `zone_variants.js` in data block; all mirrored in `sw.js` precache (cache pinned v11). Exactly-once loading asserted by coherence suite. Confirmed present.
- **No conflicts found:** combat authority preserved (clones only), encounter exactly-once ledger shared (no parallel store), economy ownership intact (scene performs no direct writes in care/gift blocks), out-of-scope respected (no new zones, no romance framing, no decay).

## Gaps

1. **Live browser evidence: journey matrix unexecuted (EVD-01).** Phase 21 harness is green but the F1–F5/W1–W5 journey tables (console silence, `?probe` FPS ≥ 30 p95, dense states, reduced motion, worker/cache activation, `&selftest`) are entirely `pending`, and phases 22–29 each defer their feature walkthroughs (affinity meter, bond scenes, combat log/Toast, duo button, feed/train taps, aura lines, variant tease, gift picker) to the same backlog.
2. **REQUIREMENTS.md traceability stale.** 11 of 15 boxes unticked (AFF-01/02/03/06, BST-01..04, GFT-01, SAV-01, EVD-01) while phase verifications record contract-level closure for 10 of those 11 (all but EVD-01). Checkbox state, not implementation, is the debt — tick boxes as each browser gate they depend on is accepted, or split "contract" vs "browser" columns.

## Deferred browser-evidence notes

- Recipe (per 21-VERIFICATION + phase debt notes): serve via `python3 -m http.server 3000`; walk title/load → Ashram → map → zone → combat → result → return plus party/spiritBeast/settings at 400×720, 540×900, 720×400, 1024×768, 1440×900; cover console silence, `?probe` FPS, bond-scene readability, duo-button tap flow, feed/train taps, aura log legibility, tease-toast timing, gift-picker readability, reduced motion, fresh vs primed worker/cache; record per-combination captures in the 21-VERIFICATION journey tables.
- Rollback signal: `git revert <phase-commit>` on regression.

## Recommendation

Keep milestone status at `gaps_found` (browser evidence + checkbox traceability only). To reach `passed`: execute the journey matrix with console/probe captures and mark rows pass/fail, then tick the 11 stale REQUIREMENTS boxes that the contract evidence already supports (all but EVD-01, which needs the matrix). No requirement is orphaned or duplicated (15/15 mapped exactly once in the traceability table).
