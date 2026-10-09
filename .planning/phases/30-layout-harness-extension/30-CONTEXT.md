# Phase 30: Layout Harness Extension - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

A proof harness for all v5.0 layout fixes: per-frame text-box recording with intersection/containment assertions, plus a headless 200-fight combat simulator. Nothing player-facing; purely enabling. Must fail on the current build (known-bad fixture) and pass on clean code.

</domain>

<decisions>
## Implementation Decisions

### Hook Point
- Wrap `CanvasRenderingContext2D.prototype.fillText`, not `R.text`. Verified 2026-10-09 on local master (post-v4.0): 34 raw `ctx.fillText` calls exist (26 in travelMap.js alone, plus diagnostics/renderer/feedback), so R-wrapper coverage would miss the travel-map cards under test. Reporter's `origin/master` clone showed 8 (pre-v2 travelMap rewrite) — planning must re-run the grep against current master and record the number, since the fixture's expected violations rest on what the wrapper sees. Install via Playwright `add_init_script`: sees every draw call, needs no game-code edits, sidesteps the lexical-`const` problem. Wrapper reads `ctx.font`, calls `measureText`, and applies `ctx.getTransform()` so boxes land in game coordinates (23 `ctx.translate` sites, including combat scroll panel, shift drawn text).

### Frame Sampling
- Record per frame; assert on one settled frame. Reduce Motion on (or wait entrance tweens out): 150–250ms scene fades and toast slide-ins produce false positives mid-animation.

### Exclusion Mechanism
- Z-layer flag set by `Notify.render` and `Modal.render` (two engine lines, zero scene changes). Rejected call-stack tagging as brittle. Covers toast lane, modal-over-dimmed-scene, and text-on-own-button.
- Leakage guard: clear the flag in a `finally` block (a throw mid-render must not exempt later draws); harness self-checks the flag is false at frame end.
- Install timing: `add_init_script` runs before page scripts, so the wrap is safe. Wrapper and vm sim are separate deliverables with separate acceptance checks.

### Containment Scope (v5.0)
- Intersection between text boxes + containment within canvas and active scroll clip only. Panel-level containment deferred: the wrapper cannot see panel bounds and instrumenting every panel would bloat the critical-path enabler. All 11 reported defects are intersection/overflow class. Revisit if Phase 32/33 finds a miss.

### Fail-First Fixture
- Frozen committed fixture: scene name, seeded save, expected violating pairs from the current build (combat header names/bars, Bazaar name-over-description, zone name-over-subtitle). Harness must report those pairs on unpatched code. Violation count dropping to zero without a code change means the harness is the bug.

### Scene Entry
- `gScene(name, false)` with seeded save for the 20-scene sweep. Combat and zone-with-encounter entered for real: seed `G.state`, call the combat start path directly with fixed RNG seed for deterministic 1v1 and 5v3 layouts.

### Combat Simulator
- No canvas. Concatenate source files into one Node `vm` context in `index.html` script order (handles lexical-`const` globals across ~94 script tags without refactoring). Seed RNG; report mean HP loss/fight, death rate over first five fights, fights-to-clear zone 1.

### Output Format
- JSON per run: scene, profile, violating pairs with box coordinates, screenshot path. Nonzero exit on any violation outside a documented allowlist. Rides the existing `verify_matrix.py` CI workflow.

### OpenCode's Discretion
- Exact JSON schema, allowlist file shape, seeded-save contents, sim stub boundaries.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tools/verify_matrix.py` — headless Chrome boot harness (extend, don't fork); boot beacon + screenshot pattern.
- `R.text`/`R.textCenter` wrappers + `ctx.measureText` usage in renderer/feedback (box math precedent).
- `Scene` registry + `gScene(name, fade, opts)` for scripted scene entry; `G.state` seeding via default state + save fixtures.
- `src/systems/combat.js` pure-ish fight resolution (sim target); `save_coherence.test.js` vm-context loading precedent.

### Established Patterns
- Ordered classic scripts with lexical globals; dependency-free Node contract tests; `?probe` diagnostics.
- Notify/Modal render as the two overlay owners (exclusion flag sites).

### Integration Points
- `tools/verify_matrix.py` (extended in place); `tools/shots/` retained evidence; LAY-00 fail-first fixture committed alongside.

</code>

<specifics>
## Specific Ideas

User-supplied analysis (2026-10-09) drove all eight decisions above; counts re-verified against source (corrected: 34 raw fillText, 23 translates, 6 clips, ~94 script tags, combatScene 1303 lines).

</specifics>

<deferred>
## Deferred Ideas

- Panel-level text containment (follow-up if Phase 32/33 finds a harness miss).
- Title wordmark art decisions (Phase 34 split candidate, pre-decided at roadmap).

</deferred>

<canonical_refs>
- `.planning/REQUIREMENTS.md` — LAY-00 acceptance, shared LAY pass criterion, checked set definition.
- `.planning/research/V5_FIXES.md` — defect classes, harness-first sequencing.
- `tools/verify_matrix.py` — harness to extend.
- `src/engine/renderer.js` — R.text measurement precedent.
- `src/scenes/combatScene.js` — band contracts the harness must not break.
</canonical_refs>
