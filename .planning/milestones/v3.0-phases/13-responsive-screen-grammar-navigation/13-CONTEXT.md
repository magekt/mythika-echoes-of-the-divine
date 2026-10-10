# Phase 13: Responsive Screen Grammar & Navigation — Context

**Gathered:** 2026-09-20
**Status:** Ready for planning
**Source:** Confirmed v3.0 milestone scope, PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, repository codemaps, and existing engine/UI patterns.

<domain>
## Phase Boundary

Establish one reusable Canvas screen grammar and a coherent, labeled route/back flow for the core journey: title/load → Ashram → Travel Map → zone exploration → combat → return. The implementation must support narrow portrait, large portrait, landscape, and desktop viewport profiles without duplicating gameplay logic or replacing the vanilla immediate-mode architecture.

This phase owns presentation contracts, responsive layout behavior, navigation affordances, transition/error recovery, and browser evidence. Combat presentation details, hero identity surfaces, asset slots, modular architecture seams, diagnostics, and lifecycle/deprecated-code cleanup remain in their assigned later phases unless a compatibility hook is required here.

</domain>

<decisions>
## Implementation Decisions

### D-01 — Preserve the runtime architecture
- Keep vanilla ES6, synchronous script-tag order, global namespaces, immediate-mode Canvas 2D, localStorage, and existing scene lifecycle. Do not introduce a framework, bundler, ESM migration, DOM screen rewrite, or parallel gameplay state.

### D-02 — Use one logical coordinate system with responsive presentation
- Keep the authoritative logical canvas at `G.W = 400` and `G.H = 720`; responsive behavior changes container scaling, safe-area presentation, layout bands, and screen composition—not gameplay coordinates or system math.

### D-03 — Centralize reusable screen grammar
- Define shared helpers/contracts for title/context, dominant primary action, labeled back/navigation controls, safe content bounds, responsive layout bands, and recoverable empty/locked/loading/error states. Core scenes consume these helpers instead of reimplementing divergent geometry or labels.

### D-04 — Make the core journey explicitly navigable
- The required route is title/load → Ashram → Travel Map → zone exploration → combat → return. Each destination must expose a readable context and a labeled recovery/back path; transitions use the existing `gScene`/`Fade` behavior and preserve origin context where the current runtime already supports it.

### D-05 — Preserve input parity
- Touch tap/drag, mouse pointer/wheel, and keyboard activation must reach the same player actions. No critical action may depend only on hover, icon recognition, or a device-specific gesture. Canvas hit-testing remains in logical coordinates after CSS scaling.

### D-06 — Treat narrow landscape as recoverable
- Landscape is a supported layout profile. When the logical canvas cannot present the full vertical composition, use a readable compact/reflowed layout or an explicit labeled rotate/recovery state; never silently clip the primary action or make the scene inaccessible.

### D-07 — Verification is both automated and browser-based
- Add focused Node-based regression tests for layout math, route/back contracts, and state affordance coverage. Browser verification must exercise representative 400×720 portrait, large portrait, landscape, narrow desktop, and wide desktop profiles with touch/mouse/keyboard parity, reduced motion, console silence, and the complete core journey.

### OpenCode's Discretion
- Choose the exact helper names and data shape, provided they remain global/script-order compatible and are documented in the plan.
- Choose breakpoints and layout-band constants from measured logical canvas bounds, provided the four required viewport classes remain readable and hit-test aligned.
- Reuse existing `Scene.drawHeader`, `Scene.backButton`, `Scene.FluidNav`, `Scene.EmptyState`, `UI.Button`, and `Fade` where they satisfy D-03–D-05; extend them rather than creating parallel component systems.
- Use deterministic fallback content for missing/locked/error states and keep all gameplay mutations in existing authoritative systems.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/PROJECT.md` — v3.0 boundaries, constraints, and architectural decisions.
- `.planning/REQUIREMENTS.md` — REQ-021, REQ-022, REQ-023 acceptance scope.
- `.planning/ROADMAP.md` — Phase 13 goal and success criteria.
- `.planning/STATE.md` — carried decisions and browser evidence debt.
- `codemap.md` — repository architecture and entry points.
- `src/engine/codemap.md` — logical canvas, transitions, input, and engine invariants.
- `src/scenes/codemap.md` — scene lifecycle, core scene catalog, and interaction conventions.
- `src/ui/codemap.md` — reusable component contracts and input/reduced-motion invariants.
- `src/engine/game.js` — `G`, `fitGame`, `gScene`, `Fade`, logical coordinate setup, and boot safeguards.
- `src/engine/scene-helpers.js` — current header, back button, FluidNav, and EmptyState helpers.
- `src/engine/input.js` — touch/mouse/wheel/keyboard input normalization and queue behavior.
- `styles/game.css` — current game-container scaling and viewport CSS.
- `.slim/deepwork/architecture-audit.md` — known responsive/lifecycle risks and evidence expectations.

The v3 research set was read from `.planning/research/ARCHITECTURE.md`, `.planning/research/FEATURES.md`, `.planning/research/PITFALLS.md`, and `.planning/research/STACK.md`. Existing UI/debug evidence was also read from `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-UI-REVIEW.md` and `.planning/debug/layout-spacing-game-view.md`; the empty `.planning/ui-reviews/` directory contains no additional artifacts.

</canonical_refs>

<deferred>
## Deferred Ideas

- Combat state redesign and combat readability beyond navigation context (Phase 14).
- Shared hero identity/progression surfaces (Phase 15).
- Explicit route/selector/command modular seams beyond the compatibility contracts needed for this phase (Phase 18).
- Settings diagnostics implementation and final full-loop acceptance harness (Phase 20).
- Framework, bundler, ESM migration, backend, new content, generic tutorial tour, and elaborate always-on effects.

</deferred>

---

*Phase: 13-responsive-screen-grammar-navigation*
*Context gathered: 2026-09-20*
