# Phase 20: Settings Diagnostics & Full-Loop Acceptance — Context

**Gathered:** 2026-10-08  
**Status:** Ready for execution planning  
**Requirement:** REQ-033, REQ-034

<domain>
## Phase Boundary

Add a disabled-by-default debug toggle in Settings that enables bounded local diagnostics (frame, transition, input/layout, persistence, invariants). Verify the complete player journey on fresh and existing-worker clients across representative phone and desktop profiles. Diagnostics must not mutate gameplay, retain scene references, or produce noisy output when off.

The phase includes automated source/contract coverage and the final browser/device acceptance matrix. It does not include new gameplay features, background/asset pipeline (Phase 17), or navigation architecture (Phase 18).
</domain>

<decisions>
## Locked Decisions

### D-01 — Debug toggle in Settings
- New setting: `G.state.debugMode = false` (default), persisted in save.
- Settings scene adds "Debug Diagnostics" toggle (disabled by default).
- When enabled: activates all diagnostic collectors; when disabled: clears all collectors, no output.

### D-02 — Bounded diagnostic collectors
Each collector is opt-in, bounded, and clears on disable:
- **Frame**: `?probe` equivalent — FPS, frame time, script group timings. Buffer: 300 frames max.
- **Transition**: Scene enter/leave timestamps, fade durations, init/cleanup times. Buffer: 50 transitions max.
- **Input/Layout**: Touch/mouse/keyboard event coords, hit-test results, viewport/safe-area metrics. Buffer: 200 events max.
- **Persistence**: Save/load timestamps, migrated fields, schema version, storage size. Buffer: 20 saves max.
- **Invariants**: Canvas alignment, color token usage, font scale, radius scale, touch target minimums. Run on demand.

All collectors write to `G.state.diagnostics = { frame: [], transition: [], input: [], persistence: [], invariants: {} }` — cleared on disable.

### D-03 — No gameplay mutation or retention
- Collectors are read-only; no `G.state` mutations except `diagnostics` buffer.
- No scene references retained in buffers (store serializable data only).
- When `debugMode = false`: `diagnostics` object deleted, all timers/intervals cleared, no console output.

### D-04 — Full-loop acceptance matrix
Verify on fresh client (no SW, no cache) and existing-worker client (active SW, primed cache):
- Phone: 400×720, 540×900
- Desktop: 1024×768, 1440×900
- Landscape: 720×400

Each client completes:
1. Start/load → 2. Navigate (ashram → map → zone → combat) → 3. Inspect (party, equipment, cultivation, map) → 4. Act (equip, meditate, attack, resolve event) → 5. Outcome (reward, breakthrough, influence) → 6. Save → 7. Reload → 8. Return to same context

Acceptance criteria per client/profile:
- No unexpected console errors (warn allowed for known deprecations)
- Stable `?probe` performance (FPS ≥ 30, frame time ≤ 33ms p95)
- Readable dense states (max party, max equipment, max events, max landmarks)
- Correct reduced-motion behavior (all decorative motion removed, essential state preserved)

### D-05 — Evidence recording
- Automated: Node test contracts for diagnostics API, save/load round-trip, transition timing.
- Human: Browser matrix checklist in `20-VERIFICATION.md` with console/probe captures.
- Final sign-off: All REQ-021 through REQ-034 validated.

## OpenCode's Discretion

- Choose Settings UI integration point (new section or existing Advanced).
- Choose diagnostic output format (console.table, downloadable JSON, in-game overlay).
- Choose `?probe` integration (extend existing or separate `?debug`).
- Choose evidence packaging for final acceptance.

</decisions>

<canonical_refs>
- `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`
- `.planning/research/ARCHITECTURE.md`, `.planning/research/FEATURES.md`, `.planning/research/PITFALLS.md`, `.planning/research/STACK.md`
- `codemap.md`, `STYLE_GUIDE.md`, `src/engine/codemap.md`, `src/scenes/codemap.md`, `src/ui/codemap.md`
- `src/scenes/settings.js`, `src/engine/game.js`, `src/engine/renderer.js`
- `.planning/phases/13-responsive-screen-grammar-navigation/13-CONTEXT.md`, `13-VERIFICATION.md`
- `.planning/phases/14-combat-gameplay-readability/14-CONTEXT.md`, `14-VERIFICATION.md`
- `.planning/phases/15-character-party-surfaces/15-CONTEXT.md`, `15-VERIFICATION.md`
- `.planning/phases/16-guidance-progression-feedback/16-CONTEXT.md`, `16-CONTEXT.md`
- `.planning/phases/17-canvas-backgrounds-asset-ready/17-CONTEXT.md`
- `.planning/phases/18-modular-navigation-screen-seams/18-CONTEXT.md`
- `.planning/phases/19-lifecycle-safety-deprecated-cleanup/19-CONTEXT.md`
</canonical_refs>

<deferred>
- New gameplay features, background/asset pipeline (Phase 17), navigation architecture (Phase 18).
</deferred>