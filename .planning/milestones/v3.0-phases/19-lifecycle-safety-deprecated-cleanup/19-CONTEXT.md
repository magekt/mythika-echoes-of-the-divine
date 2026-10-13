# Phase 19: Lifecycle Safety & Deprecated-Code Cleanup — Context

**Gathered:** 2026-10-08  
**Status:** Ready for execution planning  
**Requirement:** REQ-031, REQ-032

<domain>
## Phase Boundary

Ensure repeated screen cycling and migration paths remain stable while removing proven-obsolete code. The phase covers: lifecycle leak prevention (controls, callbacks, listeners, timers, modals, effects, caches, stale selections), deprecated helper/alias removal with contract coverage, save migration safety (fresh, v2/legacy, direct boot, cached boot, untouched scenes), and lifecycle failure recovery (recoverable state instead of broken screen).

The phase includes automated source/contract coverage and browser/device verification. It does not include new features, background/asset pipeline (Phase 17), navigation architecture (Phase 18), or diagnostics implementation (Phase 20).
</domain>

<decisions>
## Locked Decisions

### D-01 — Leak prevention contracts
- Every scene `leave()` must clear: `data.buttons`, `data.staticDraws`, `data.scrollY`, timers (`clearTimeout`), event listeners (`removeEventListener`), modal refs, effect refs, cache refs, stale selections.
- Contract test: enter → leave → enter → leave × 10; assert `buttons.length` stable, no timer leaks, no listener leaks, no cache growth.
- Global leak test: full journey cycle × 5; assert no global array growth (G.state, UI, R, Scene internals).

### D-02 — Evidence-led deprecated code removal
- Identify candidates: unused exports, dead code paths, superseded helpers, v1/v2 compatibility aliases.
- For each candidate: verify zero runtime references via grep + static analysis + `?probe` console monitoring.
- Removal only after: replacement seam has contract coverage, no verified references, migration path tested.
- Document each removal in `19-REMOVALS.md` with: file, function, replacement, evidence of zero references.

### D-03 — Save migration safety
- Fresh saves: canonical v3 schema, no legacy fields.
- v2/legacy saves: hydration adds missing fields, normalizes malformed data, preserves all unrelated progress.
- Direct boot (no SW): works with fresh + legacy saves.
- Cached boot (existing SW): works with fresh + legacy saves, cache coherency verified.
- Untouched scenes (debug, auth, welcome, etc.): remain accessible after cleanup.

### D-04 — Lifecycle failure recovery
- Scene `enter` wrapped in try/catch; on error: log, cleanup partial state, `gScene('ashram', true, { error: true })`.
- `gScene` validates target exists; invalid route → ashram fallback + Notify.
- Transition failure (Fade, init, cleanup) → ashram fallback + Notify.
- Player never left in broken/inaccessible screen.

### D-05 — Phase 13-18 contracts preserved
- All prior phase contracts (responsive, combat bands, hero surface, feedback, backgrounds, navigation) must pass after cleanup.
- No behavioral changes to canonical systems.

## OpenCode's Discretion

- Choose exact leak detection methodology (timer/listener wrappers, proxy arrays).
- Choose deprecated code identification process (AST analysis + runtime probe).
- Choose removal order (leaf dependencies first).
- Choose failure recovery UX (Notify message, auto-save trigger).

</decisions>

<canonical_refs>
- `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`
- `.planning/research/ARCHITECTURE.md`, `.planning/research/FEATURES.md`, `.planning/research/PITFALLS.md`, `.planning/research/STACK.md`
- `codemap.md`, `STYLE_GUIDE.md`, `src/engine/codemap.md`, `src/systems/codemap.md`, `src/scenes/codemap.md`, `src/ui/codemap.md`
- `src/engine/scene.js`, `src/engine/game.js`, `src/main.js`
- All scene files in `src/scenes/`
- All system files in `src/systems/`
- All UI files in `src/ui/`
- `.planning/phases/13-responsive-screen-grammar-navigation/13-CONTEXT.md`
- `.planning/phases/14-combat-gameplay-readability/14-CONTEXT.md`
- `.planning/phases/15-character-party-surfaces/15-CONTEXT.md`
- `.planning/phases/16-guidance-progression-feedback/16-CONTEXT.md`
- `.planning/phases/17-canvas-backgrounds-asset-ready/17-CONTEXT.md`
- `.planning/phases/18-modular-navigation-screen-seams/18-CONTEXT.md`
</canonical_refs>

<deferred>
- New features, background/asset pipeline (Phase 17), navigation architecture (Phase 18), diagnostics implementation (Phase 20).
</deferred>