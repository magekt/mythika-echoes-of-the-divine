# Phase 32: Combat Layout - Research

**Researched:** 2026-10-10
**Method:** Codebase evidence (no web — providers unavailable; CONTEXT.md directs codebase-evidence decisions)

## Defect inventory (current tree, grep/render verified)

### LAY-01: header-band collisions (3 confirmed overlaps)

1. **Target buttons overlap header + each other** (`combatScene.js:340-355`):
   `UI.Button(G.W - 62, ey, 56, 38, ...)` with `ey` starting at **6**, stepping **32** while height is **38**.
   - y=6 sits inside the header band (`getCombatLayout` header y 4–56, title at y=20, turn strip at y=34–50).
   - Step 32 < height 38 → consecutive target buttons overlap each other by 6px.
   - Fix direction: move target buttons inside the enemy panel (SC2) and derive their geometry from the panel rect, not from header coordinates.

2. **Top-right enemy icon row collides with header** (`combatScene.js:1152-1170`):
   `ey = 32` icon row draws sprites + names + HP bars at y 32–76, x stepping left from `G.W - 22`.
   Overlaps the player-turn strip (y 34–50) and the header band bottom (56). The selected-enemy panel
   (y 112–180) already shows name + HP — this row duplicates it. Researcher recommendation: delete the
   icon row, keep the panel as the single enemy readout; target buttons move into the panel.

3. **Enemy panel overlaps 5-hero roster** (`combatScene.js:1096-1150`):
   Panel x = `G.W - 170` (x=230 at W=400). Five heroes at `hx = 12 + i*68` reach x=352 → last two hero
   columns render under the panel. `heroStep` 68 at 4–5 heroes vs panel width 170 cannot coexist at W=400.
   Fix direction (planner discretion per D-02): compact 5-hero rows (smaller step + abbreviated readouts)
   and/or shift the panel below the roster band. Roster band is y 58–180 (`getCombatLayout`); panel
   y 112–180 sits inside it — stacking order must be roster rows first, panel in its own sub-band.

4. **Log band overlaps roster + intent** (`getCombatLayout`, lines 193–203):
   log y = actionTop−78 = 170, h=72 → 170–242. Roster ends 180, intent is 184–238, actions start 244.
   Log overlaps roster bottom (170–180) and the full intent band (184–238). Currently masked because the
   log is suppressed during `reactionWindow` — but any log write during intent display collides.
   Fix: log band must be disjoint from intent (e.g. log 170–182 single line, or suppress + reserve).

### LAY-02: action grid + toast lane

- **Action buttons already near-uniform** (`buildActionButtons`): standard buttons are
  `UI.Button(20, y, G.W - 40, 44, ...)` with 46px pitch (44 + 2). Exceptions: enlightenment branch
  uses 56px pitch (`:1246-1252`), result branch 50px (`:1277-1281`), Flee is a half-width sidecar
  (`:336-338`, `(G.W-40)/2-3` wide at `G.W/2+3`). Uniform-grid work = one constant set
  (width/height/gap), Flee folded into the same column grid (D-03: placement at planner discretion,
  recommend full-width last row — the sidecar halves the tap target and breaks the column).
- **Lane constant is mandatory and viewport-aware** (D-04 locked facts): `Notify.render`
  (`game.js:67`) and `Toast.render` (`feedback.js:91`) both hardcode `ty = 470`.
  Portrait H=720: lane at 470 sits inside the action area (actionTop=248) → toasts cover buttons.
  Landscape H=390: 470 is **off-screen** → toasts invisible. Both systems cap at 3, toast height
  26/40 + 6 gap → worst-case stack ≈ 3×40+12 = 132px. Lane constant belongs in `scene-helpers.js`
  (per SC2/roadmap); both renderers consume it. Recommended shape:
  `Scene.toastLane()` → `{ y, h }` computed from `G.H` (e.g. y = G.H − 160 portrait, y = G.H − 140
  landscape, h = 132), plus `Scene.toastLaneHeight()` if renderers need it. Action area bottom must
  stop above the lane (`getActionAreaHeight` clamp) OR the lane must sit below the action clip —
  planner decides, but one of the two must hold or the grid/lane guarantee is vacuous.
- **"Tutorial toasts"** (SC3): no `Tutorial.*` system exists (CONTEXT.md grep-verified). Guidance
  `Notify` call sites in combat are `:865` (victory/influence), `:896` (boss), `:989-990` (rest),
  `Hints.show` at `:82, :917`. Clearance assertion = fire each call site with a full action list and
  assert no toast box intersects an action-button box. Enumerate in the test; do not assert a
  `Tutorial` symbol that does not exist.
- **Encounter-story line + Notify coexist** (`:1232-1237` vs Notify lane): story line renders inside
  the action panel top (y≈10–30 of panel); Notify lane will be viewport-relative. Keep both unless
  the harness shows an intersection — the story line scrolls with content, the lane is fixed.

### LAY-07: backgrounds

- `R.Backgrounds.registerSlot('combat:' + enemyType)` (`:104`) + `renderBackground(ctx, key, alpha)`
  (`backgrounds.js:252`) run before everything in `render`. LAY-07 sampling (≥4 points, corners +
  center, channel-delta vs clear color, per-scene expected colors) is harness work in plan 32-03;
  combat only needs to guarantee it always calls `registerSlot` + `renderBackground` (the empty-enemy
  early return at `:89-98` skips both — fine, it leaves the scene in 600ms; harness should enter with
  seeded enemies so this path is out of scope).

## Harness state (Phase 30/31 outputs this phase builds on)

- `tools/verify_matrix.py --layout` exists with `tools/layout_harness/{inject,driver,assert}.js`,
  `expected_pairs.json`, `allowlist.json`, `seeded_save.json`. Phase 31 summary: 26 scenes × 2
  viewports, 730 residual violations, 4/4 frozen pairs still HIT (combat intersect ×2, bazaar
  `Recipe: `/`Tease`, zoneExploration encounter). Phase 32 re-derives pairs on the current tree
  (SC1: screenshots advisory only), retires fixed pairs to must-stay-clean same-commit (SC7).
- Entry: `gScene(name, false)` with seeded save; combat 1v1 and 5v3 via `G.state` seeding + combat
  start path with fixed RNG seed (30-CONTEXT scene-entry decision). Simulator (`vm` concat in
  `index.html` script order) is reusable for deterministic entry.
- Overlay exclusion flags: `window.__layoutHarness.overlay` set in `Notify.render` (`game.js:64`);
  Modal equivalent per 30-CONTEXT. Lane toasts stay excluded by flag; the *assertion* that matters
  for LAY-02 is button/box non-intersection, which the flag must NOT mask — plan 32-02 must assert
  clearance in a mode where action buttons are not flag-exempt (buttons never set the flag today;
  keep it that way).

## Approach recommendations (planner owns final sizing)

1. **Order within the phase:** bands (32-01) → lane+grid (32-02) → proof/sweep (32-03). 32-02 needs
   final band geometry (action-area bottom depends on it); 32-03 needs both. Sequential waves.
2. **Result screens (D-01 locked):** result branch (`:1267-1282`) currently reuses the scroll clip
   with ad-hoc `ly` offsets — title, rewards, buttons collide with the log band above. Give result
   its own three fixed bands (title / rewards / buttons) inside `layout.result`, positioned below
   `layout.actions.y`, never reusing live-combat button geometry.
3. **Landscape:** `getActionAreaTop()=248` leaves H−248 = 142px at H=390 — one toast stack (132px)
   consumes it. Planner must include a landscape variant (tighter bands; lane above the action clip
   or actions scroll under a fixed lane). Do not ship portrait-only geometry.
4. **Do not regress:** Phase 31 scene-tag clearing (both swap sites), 3/system cap, achievement
   exemption; Phase 24 bond-bonus log lines; combo/intent visuals; `R.text`/`R.fonts`/`R.colors`
   tokens; classic-script globals.

## Risks

- 5-hero + enemy-panel coexistence at W=400 is the tightest constraint; if compact rows cannot clear
  the panel, the fallback is moving the enemy panel below the roster (roster grows, actionTop moves
  down, landscape suffers). Measure first, choose with numbers.
- Sweep fallout (SC5): toast lane is engine-wide — default log-and-defer as `surfaced-not-fixed`
  to owning phases 33/34 (Phase 31 precedent), fix only combat-owned intersections in this phase.
