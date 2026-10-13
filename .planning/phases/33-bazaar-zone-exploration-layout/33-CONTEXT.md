# Phase 33: Bazaar & Zone Exploration Layout - Context

**Gathered:** 2026-10-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Two player-facing layout fixes, both verified by Phase 30's harness at 390x844 and 844x390:

**Bazaar (LAY-03):** List rows use variable height with text wrapping. Long names or descriptions wrap to a second line instead of truncating, keeping all four fields (name, description, stat, price) visible within bounds at 1-3 lines. Resource HUD (gold/ashram readout) must not overlap row text on either Buy or Sell tab with 8+ rows.

**Zone exploration (LAY-04):** The zone HUD (name, subtitle, progress bar, labels) has fixed non-overlapping bands matching Phase 32's combat band discipline. The three action buttons (Attack / Skill / Flee) are always visible but dimmed (grayed, not hidden) when no encounter is active; they light up when an encounter lands. Adjacent buttons maintain ≥8px gaps.

Nothing player-facing outside these two screens. No new capabilities.

</domain>

<decisions>
## Implementation Decisions

### Encounter gating (zone exploration)
- **D-01 (LOCKED):** When no encounter is active, keep the three action buttons visible but grayed/dimmed (`globalAlpha ≈ 0.35–0.45` or equivalent muted style). They light up when `currentEnemy` is set. This provides affordance visibility — players see what they can do and understand the state.

### Bazaar row strategy
- **D-02 (LOCKED):** Bazaar list rows use variable height with text wrapping. Long names or descriptions wrap to a second line instead of truncation. All information stays visible. Row height is computed per-item based on wrapped content (min 1 line, max 3 lines). `UI.ScrollList` currently hard-codes a fixed `itemHeight: 36` with `itemGap: 4` — the planner must extend `UI.ScrollList` to support variable-height items (or pre-compute per-item heights and pass them in).

### Layout constants
- **D-03 (LOCKED — downstream discretion):** All other layout constants (spacing, padding, font sizes, row gap, HUD band positions, dim alpha value, stat column x-offset) follow Phase 32's posture. The planner derives them from the Phase 30 harness proof and existing codebase patterns. Do not re-ask the user; decide from `R.fonts`, `R.colors`, `R.radius`, and the combat-band precedent in Phase 32.

</decisions>

<evidence>
## Existing Code Evidence

### Bazaar (`src/scenes/bazaar.js`)
- `buildBuySellLists()` at line 61: `UI.ScrollList(14, listY, G.W - 28, listH, { itemHeight: 36, itemGap: 4 })`.
- Row rendering (lines 77-94): all four fields drawn at fixed y-offsets inside a 36px row:
  - `typeLabel` at `y + 14` (xs)
  - `item.name` at `y + 26` (sm)
  - `cost + 'g'` at `y + 14`, x = `x + w - 50` (sm)
  - `item.desc` at `y + h - 6` (xs) — can clip when description is long
  - `ATK/DEF/MAG` stat at `y + 26`, x = `x + w - 90` (xs)
- No text-wrapping in bazaar.js currently; `travelMap.js` has a `wrapText` helper at line 655 that can be reused or generalized.
- Row height is fixed at 36px; `UI.ScrollList.setItems` computes `contentHeight = items.length * (itemHeight + itemGap) + ...` — a fixed formula that breaks if rows become variable-height.

### Zone exploration (`src/scenes/zoneExploration.js`)
- `buildButtons()` at line 81: zone info header (26px, y=134), encounter card (86px, y=174), action buttons (44px, y=274).
- `encCard.render` (lines 106-129): when `currentEnemy` is null, draws "No encounter" text at `by + 22` (line 127) — the card is visible but empty.
- Action buttons (lines 144-160): `UI.BtnGold` and `UI.Button` at fixed y=274. No dimming logic when no encounter is active — buttons are fully lit even when disabled.
- `triggerEncounter()` is called by the Attack button; Skill and Flee follow the same pattern.

### UI primitives
- `UI.ScrollList` (`src/ui/list.js`): fixed `itemHeight`, fixed `itemGap`, `contentHeight` formula assumes uniform rows.
- `UI.BtnGold` (`src/ui/button.js:118`): returns a fully-opaque gold button; no built-in disabled/dimmed variant.
- `UI.Input` (`src/ui/button.js:135`): has `enabled: config.enabled !== false` — the only built-in enabled/disabled pattern in the codebase.

### Phase 32 precedent
- Combat band discipline: hero name/HP-MP bars, enemy name/HP, target button in separate non-overlapping bands.
- Toast-lane constant in `scene-helpers.js`; `Notify` draws only inside it.
- Backgrounds-paint evidence requirement (LAY-07) applies to all revamped scenes.

### Phase 30 harness
- `verify_matrix.py --layout --budget 30000` exits nonzero on unpatched builds; reports at `tools/shots/layout-*.json`.
- Known-bad fixture includes bazaar rows (one of 4 frozen pairs).
- `tests/layout_harness.test.js` — 15/15 passed as of Phase 30.
- Harness wraps `CanvasRenderingContext2D.prototype.fillText`; captures `ctx.font`, `measureText`, and `getTransform()`.

</evidence>

<success-criteria>
## Success Criteria (what must be TRUE)

1. **Bazaar (LAY-03):**
   - All four fields (name, description, stat, price) visible within row bounds at 1-3 lines, verified by harness proof at 390x844 and 844x390.
   - No text clipping in any row on either Buy or Sell tab with 8+ rows.
   - Resource HUD (gold/ashram) does not overlap row text or titles.
   - Rows wrap rather than truncate; all information remains visible.

2. **Zone exploration (LAY-04):**
   - Zone name, subtitle, progress bar, and labels occupy separate non-overlapping bands (matching Phase 32 combat band discipline).
   - Attack / Skill / Flee buttons are dimmed (not hidden) when no encounter is active; they light up when `currentEnemy` is set.
   - Adjacent buttons maintain ≥8px gaps.
   - No overlaps between HUD elements at either viewport.
   - Backgrounds paint in the zone exploration scene (split-R fixed); harness samples ≥4 points with minimum channel delta vs clear color.

</success-criteria>

<files>
## Files to Update

| File | Change |
|------|--------|
| `src/scenes/bazaar.js` | Variable-height rows; text wrapping for name/desc; per-item height computation; resource HUD clearance |
| `src/ui/list.js` (`UI.ScrollList`) | Extend to support variable-height items (per-item height array or callback); update `contentHeight` formula; adjust hit-testing for variable rows |
| `src/scenes/zoneExploration.js` | Dim action buttons when `currentEnemy` is null; band-aligned HUD layout; ≥8px button gaps |
| `src/ui/button.js` | Add dimmed/disabled render path to `UI.BtnGold` or introduce a minimal `UI.BtnGoldDimmed` variant |
| `src/scenes/travelMap.js` | Optional: extract `wrapText` helper to `src/engine/scene-helpers.js` or `src/ui/` if bazaar will reuse it |
| `tests/` | Text-bounds proof tests for bazaar rows and zone exploration HUD |

</files>

<plan-scope>
## Plan Scope Guidance (for 2-3 executable plans)

**Plan 33-01 — Bazaar variable-height rows (LAY-03):**
- Extend `UI.ScrollList` for variable-height items.
- Add text-wrapping to bazaar row rendering (reuse or generalize `wrapText` from `travelMap.js`).
- Compute per-item row height (min 36px for 1-line, scale up to 3 lines).
- Verify resource HUD clearance at 8+ rows on both tabs.
- Harness proof: bazaar rows pass text-bounds criterion at both viewports.

**Plan 33-02 — Zone exploration HUD + encounter gating (LAY-04):**
- Band-align zone HUD (name, subtitle, progress bar, labels) per Phase 32 combat discipline.
- Dim Attack/Skill/Flee buttons when `currentEnemy` is null (visible, grayed, non-interactive).
- Ensure ≥8px gaps between adjacent buttons.
- Harness proof: zone exploration HUD passes text-bounds criterion with and without encounter at both viewports.

**Plan 33-03 (optional, if needed) — Harness proof + fixture update + 20-scene sweep:**
- Update frozen-pair fixtures to include bazaar and zone exploration.
- Run `verify_matrix.py --layout --budget 30000` clean on patched build.
- Run full `node --test tests/*.test.js` + `tools/check_ui_invariants.sh`.
- Backgrounds-paint evidence for zone exploration (sample ≥4 points).

</plan-scope>

<constraints>
## Constraints

- No new dependencies. No `defer`, `async`, modules, or script reordering (`index.html` contract).
- `UI.ScrollList` is shared; changes must not break other consumers (check all call sites before modifying).
- `R.colors`, `R.fonts`, `R.radius` are the only color/font/spacing sources — no raw hex values in new code.
- `R.reducedMotion()` must be respected for any new animation (dim transition, if animated).
- Phase 30 harness wrapper intercepts `ctx.fillText` — the text-bounds proof works by reading recorded boxes; no new harness code needed, only the frozen-pair fixture update.
- Firebase / cloud saves are not in scope. No save-schema changes.

</constraints>
