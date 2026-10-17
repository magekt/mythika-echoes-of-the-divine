# Phase 056 — UI Review

**Audited:** 2026-10-17
**Baseline:** abstract 6-pillar standards (no UI-SPEC.md present in repo)
**Screenshots:** not captured (no dev server running on :3000/:5173/:8080 — code-only audit)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Combat log copy is specific (names, damage values, "CRIT!") with no generic labels, but log-message phrasing is inconsistent |
| 2. Visuals | 4/4 | Clear focal point at hit site; elementBurst + damageNumber + damageFlash + screenShake create impact hierarchy; buttons are text-labeled |
| 3. Color | 4/4 | Zero hardcoded hex/rgb in modified files; all colors use R.colors tokens; element map complete |
| 4. Typography | 4/4 | No typography regressions; damageNumber uses R.fonts.lg; no new font strings introduced by this phase |
| 5. Spacing | 4/4 | Deterministic 70px combatant grid offsets; no arbitrary [px]/[rem] values (Canvas game, no CSS spacing) |
| 6. Experience Design | 3/4 | Strong defensive guards (runId, typeof, reduceMotion) but FX can render on a slain combatant; no empty/error state copy for combat log |

**Overall: 22/24**

---

## Top 3 Priority Fixes

1. **Combat log message phrasing inconsistency** — log entries mix structures ("...for X damage" vs "...had no effect", some end with "!", others don't), degrading log readability — Standardize log-message format (consistent punctuation and outcome phrasing) in `src/scenes/combatScene.js` around lines 573-584 — **WARNING**

2. **FX can render on a slain combatant** — `elementBurst`/`damageNumber` fire at a target's position even when `target.hp <= 0` (deathBurst also plays), causing overlapping/conflicting hit feedback — Gate the FX callbacks on the target still being alive, or sequence them after `deathBurstAt`, in `doPlayerAttack` (line 666-671) and `resolveReactionAction` (line 595-600) — **WARNING**

3. **'holy' element token defined but never mapped** — `R.colors.elements.holy` exists (renderer.js:51) but no ailment maps to it, leaving a dead color token — Either map an ailment/hero to `holy` or document it as reserved — **WARNING**

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

Evidence: `src/scenes/combatScene.js` lines 573-584 (resolveReactionAction log pushes), 651-652 (doPlayerAttack log push).

- **No generic labels.** Grep for `Submit|Click Here|OK|Cancel|Save|No data|No results|Nothing|Empty|went wrong|try again|error occurred|Error` in the two modified files returns only `SaveSystem.save()` (line 937), which is an internal API call, not user-facing copy. PASSES.
- **Specific, not generic, combat copy.** Log messages include actor/target names, damage values, grade text, and the "CRIT!" crit tag (e.g. `hero.name + ' attacks ' + target.name + ' for ' + result.dmg + (result.isCrit ? ' CRIT!' : '')`).
- **WARNING — phrasing inconsistency.** Outcome branches use inconsistent structure: evade ends with `!`, parry uses em-dash, mitigation uses "for X damage", and the fallback uses "had no effect". Punctuation and template shape vary across branches.
- No empty-state or error-state copy exists for the combat log — not applicable to an active combat system (always has participants), so not scored against.
- Test copy in `tests/damage_fx.test.js` is descriptive and specific (no generic test names).

### Pillar 2: Visuals (4/4)

Evidence: `src/scenes/combatScene.js` lines 589-603, 660-671; `MYTHIKA_WIREFRAME_PLAN.md` Screen 6 (Combat Screen).

- **Clear focal point.** Player-attack hit FX spawn at `enemyX, enemyY - 20` (enemy position, slightly above) and reaction hit FX at `targetIdx * 70 + 30, 30` (hero position) — both land exactly on the struck combatant, per the plan's "hit site" requirement.
- **Impact hierarchy.** `damageFlash = 0.2`, `R.screenShake(3, 0.15)`, crit damage numbers in `R.colors.gold` with an emphasis ring (renderer.js:614), and elementBurst particles radiating from the hit site layer multiple readability cues on impact.
- **Buttons are text-labeled, not icon-only.** Combat action buttons (SWING, HEAVY, BOW, MAG, BLOCK, DUCK, RUN, HEAL) use `UI.Button` with `text` per the wireframe and `src/ui/button.js:60` — no icon-only buttons needing aria-labels (Canvas is not DOM; hit-testing uses `contains()`).
- No visual regressions introduced; the added FX are purely additive and integrate with existing `damageNumber`/`deathBurst` flow.

### Pillar 3: Color (4/4)

Evidence: `src/scenes/combatScene.js` lines 594, 597-598, 665-669; `src/engine/renderer.js` lines 1-54, 460-533, 666-720.

- **Zero hardcoded colors.** Grep for `#[0-9a-fA-F]` and `rgb(/rgba(` in both modified files returns nothing. All colors use `R.colors` tokens (`R.colors.red`, `R.colors.gold`, `R.colors.goldLight`, and `R.colors.elements.*`).
- **Element map complete.** `R.colors.elements` defines fire/ice/lightning/dark/holy/default, each with `primary` + `secondary` (renderer.js:46-53). The combat mapping (agni→fire, shila→ice, vayu→lightning, vajra→lightning, else→dark) at combatScene.js:594 and :665 mirrors the test's mapping at damage_fx.test.js:132-145 and 11/11 tests pass.
- **Accent not overused in this phase.** Gold/accent (#e8a030) is used heavily elsewhere in the codebase (pre-existing), but within this phase's changes accent/gold appears only on declared elements (crit damage numbers, burst secondaries) — no decorative misuse.
- `damageNumber` defaults to `el.primary` when color is null (renderer.js:520), and `elementBurst` falls back to `R.colors.elements.default` for unknown elements (renderer.js:668) — both safe.

### Pillar 4: Typography (4/4)

Evidence: `src/engine/renderer.js` lines 505-533, 622-628; `src/engine/renderer.js:59` (fonts).

- **No new typography introduced by this phase.** `elementBurst` renders colored squares (no text). `damageNumber` uses `R.fonts.lg` for normal hits and a pre-existing hardcoded crit font string `'20px "Geist", -apple-system, BlinkMacSystemFont, sans-serif'` at renderer.js:622 — that hardcoded string predates this phase (DMG-04) and is out of scope, not a regression.
- Text rendered through `R.text()` defaults to `R.colors.text` and `R.fonts.md` per STYLE_GUIDE.md:189; damageNumber follows the pattern.
- No font-size/proliferation issue: this phase adds zero `text-*`/`font-*` equivalents.

### Pillar 5: Spacing (4/4)

Evidence: `src/scenes/combatScene.js` lines 655-659, 590-592, 658-660.

- **Canvas logical coordinates (400×720 game space), not CSS.** No `p-/px-/py-/m-/gap-/space-` classes exist (no Tailwind/CSS in this codebase); `grep` for arbitrary `[..px]`/`[..rem]` values returns nothing in modified files.
- **Deterministic grid.** Combatants sit on a 70px grid (`heroIdx * 70 + 30`, `enemyX = 370 - enemyIdx * 70`, `targetIdx * 70 + 30`) consistent with `combat_layout_bands.test.js`/`combat_layout_proof.test.js` and the wireframe. Damage numbers offset `enemyY - 20` float above the target. No ad-hoc or inconsistent spacing.

### Pillar 6: Experience Design (3/4)

Evidence: `src/scenes/combatScene.js` lines 559-609, 623-672; `src/engine/renderer.js` lines 666-671, 536-543.

- **Defensive guards present (strength).** `elementBurst` is called behind `typeof R.elementBurst === 'function'` (combatScene.js:598, 669). Both FX `setTimeout` callbacks re-verify `G.currentScene === combatScene && combatScene.data.runId === <runId>` before rendering, preventing FX after scene transition. `result.dmg > 0` gates damage FX.
- **Reduced motion respected.** `R.elementBurst` returns early when `G.state.reduceMotion` (renderer.js:667); `damageNumber` stores `_reduced` and skips spring bounce (renderer.js:532, 556-563); `R.screenShake` returns early under reduceMotion (renderer.js:538). Matches STYLE_GUIDE.md:197-204.
- **WARNING — FX on slain combatant.** `deathBurstAt(target)` is called (combatScene.js:654, 672) but the 200ms-delayed `elementBurst`/`damageNumber` still spawn at the dead target's position, producing overlapping hit/death feedback.
- Loading/error/empty states: not applicable (local, turn-based combat with no network and always-populated participant lists). Disabled states: handled pre-existing via `UI.Button` `enabled`/`visible`. Destructive-action confirmation: not applicable to core combat actions.

---

## Registry Safety Audit

Skipped: `components.json` does not exist (`NO_SHADCN`) and no `UI-SPEC.md` lists third-party registries. No Registry Safety section added.

---

## Files Audited

- `src/scenes/combatScene.js` — doPlayerAttack hit site (line 666-671), resolveReactionAction hit site (line 595-600), log copy (lines 573-584, 651-652)
- `tests/damage_fx.test.js` — 11 tests across 3 suites (elementBurst spawn counts, reduced-motion suppression, element colors, unknown-element fallback, update/render, damageNumber floater shape + null-color default, ailment→element mapping, R.colors.elements coverage)
- `src/engine/renderer.js` — R.colors.elements tokens (lines 46-53), R.damageNumber (lines 505-534), R.elementBurst/update/render (lines 666-720), reduced-motion guards (lines 536-543, 667)
- `src/ui/feedback.js` — Toast/feedback namespace (confirmed unchanged by this phase)
- `MYTHIKA_WIREFRAME_PLAN.md` — Screen 6 Combat Screen wireframe (lines 438-473) as design reference
- `STYLE_GUIDE.md` — color/typography/motion/spatial conventions used as audit rubric

Verification ground truth: `node --test tests/damage_fx.test.js` → 11/11 pass; `node --test tests/*.test.js` → 605/606 pass (per SUMMARY.md); `tools/check_ui_invariants.sh` → all checks passed (per SUMMARY.md).
