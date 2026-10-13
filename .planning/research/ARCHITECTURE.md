# Architecture Research: Screen & Gameplay Revamp v3.0

**Project:** Mythika: Echoes of the Divine  
**Milestone:** v3.0 Screen & Gameplay Revamp  
**Researched:** 2026-09-20  
**Confidence:** MEDIUM-HIGH (based on repository codemaps and current project constraints)

## Recommendation

Keep the immediate-mode Canvas renderer and global script loading for this milestone, but introduce **explicit seams around the globals** rather than attempting an ES-module rewrite. The safe target is a layered “kernel + ports + features” architecture:

```text
Browser/PWA shell
  → GameKernel (loop, diagnostics, lifecycle, input frame)
    → SceneManager (registry, transitions, screen contracts)
      → Screen adapters (scene-local view state and commands)
        → UI primitives / Renderer
    → Application services (store, commands, event log, persistence)
      → Domain systems (Combat, Cultivation, Economy, Quests, World)
        → Data catalogs
```

This preserves compatibility with `G`, `R`, `UI`, `Scene`, and existing systems while making new code depend on narrow facades. Deprecated behavior can then be removed behind verified seams instead of during a broad rewrite.

## Current Constraints and Architectural Read

- `index.html` loads roughly 72 scripts in dependency order; there is no build step or package manifest.
- `game.js` owns global state, the frame loop, scene transitions, fade, notifications, and background rendering.
- Scenes are factory objects with `enter/update/render/leave`, but cleanup and UI construction are inconsistent.
- Systems are namespace singletons that directly mutate `G.state`; several systems also call one another and engine effects directly.
- Canvas UI is immediate-mode with retained component animation state. This is a useful boundary: rendering can remain immediate-mode while state and commands become explicit.
- Save/load is localStorage-based and must remain backward-compatible. Backend readiness should therefore mean stable serializable state and persistence ports, not networking.

## Target Component Boundaries

| Component | Responsibility | Integration point | Must not own |
|---|---|---|---|
| `GameKernel` facade | Frame timing, update/render ordering, error recovery, lifecycle hooks | Wrap `gLoopFrame`, `gInit`, `gScene` | Gameplay rules or screen-specific state |
| `SceneManager` facade | Registry, transition requests, current-screen lifecycle, transition diagnostics | Adapt `Scene.create`, `registerScene`, `gScene`, `Fade` | Save mutation, domain rules |
| `ScreenContext` | Per-screen dependencies: renderer, input snapshot, commands, selectors, diagnostics | Inject into scene adapters while retaining legacy globals as fallback | Global singleton replacement all at once |
| `GameStore` | Validated state access, action/command dispatch, subscription/change notifications | Initially delegates to existing systems and `G.state` | Rendering, persistence format decisions |
| `Command bus` | Named player intents such as `navigate`, `startBattle`, `craft`, `equip` | Screen button callbacks and system entry points | Direct drawing or arbitrary state writes |
| `Event journal` | Structured domain/UI events for diagnostics and future sync | Systems emit events after authoritative mutations | Replacing state as the source of truth |
| `PersistencePort` | Save/load/export/import contract and versioned snapshots | Adapter around `SaveSystem` and localStorage | Network sync or remote authority |
| `Diagnostics` | Frame timings, transition traces, command failures, invariant violations | Kernel, SceneManager, Store, PersistencePort | User-facing gameplay decisions |
| `RenderPort` | Canvas primitives, tokens, effects, viewport/clipping helpers | Adapter around `R` | State mutation |
| `InputPort` | Per-frame taps, pointer/keyboard state, swipe and scroll events | Adapter around `Input` | Calling system mutations directly |

### Compatibility strategy

Expose the new facades as globals initially (`GameKernel`, `SceneManager`, `GameStore`, `Diagnostics`) and implement them as adapters over current globals. Existing scenes remain runnable. New or migrated screens use injected context. Only after all callers move off a deprecated API should that API be deleted.

## Screen Interconnectivity

Screen navigation should become intent-driven, not a collection of scene-local `gScene()` calls:

```text
tap → InputPort snapshot → screen command
  → Command bus validates intent
  → domain system/store mutation (if any)
  → event journal + notification
  → SceneManager.request(target, params)
  → leave old screen → enter new screen with route params
  → selectors produce render model → Canvas render
```

Define a small route table with canonical route IDs, optional typed-ish params, and access predicates. Examples: `ashram`, `travelMap`, `zoneExploration({zoneId})`, `combat({encounterId})`, `party({tab})`, and `settings`. Screens should navigate through `Navigation.request(route)` rather than constructing or mutating another screen’s data. Route parameters are transient; persistent progression remains in the store/save snapshot.

Use a single shared navigation shell for back/home/world actions, but keep screen content owned by each screen. This avoids a second retained UI tree while making screen links discoverable and testable.

## Data Flow and Authority

### Runtime flow

```text
Input events
  → normalized frame input
  → active screen command handlers
  → authoritative domain system APIs
  → validated state mutation
  → domain/UI events
  → selectors/view models
  → immediate-mode Canvas render
```

### State ownership rules

1. `G.state` remains the serialized state during migration, but screens must read through selectors and mutate only through commands or existing authoritative system APIs.
2. Combat owns battle-scoped state; do not expose long-lived mutable combat arrays to screens.
3. Economy owns currency changes; progression owns XP/level changes; zone/world systems own progress and influence; SaveSystem owns snapshot hydration/migration.
4. Derived values (progress bars, access labels, combat summaries) are computed selectors, not duplicated into save state.
5. Events are notifications of committed changes, never an alternate authority. Include event name, timestamp/frame, source, payload, and correlation ID.

### Backend-ready without backend

Create `PersistencePort` and `SyncPort` interfaces conceptually, with only a `LocalPersistenceAdapter` implemented now. Save snapshots should have a schema version, player/session metadata, deterministic timestamps where needed, and stable IDs for entities and events. A future backend can implement upload/download/conflict policy without requiring screens to know transport details. Do not add authentication, network retries, optimistic sync, or server scheduling in v3.0.

## Diagnostics Seams

Diagnostics should be a first-class dependency, not console calls scattered through scenes.

- **Frame seam:** frame duration, update duration, render duration, dropped-frame count, active scene.
- **Transition seam:** requested route, source/target, fade duration, enter/leave duration, failure and recovery.
- **Command seam:** command name, source screen, result (`accepted/rejected/error`), duration, correlation ID.
- **Persistence seam:** save/load duration, byte size, schema version, migration path, malformed-field counts.
- **Invariant seam:** bounded arrays, state validation, currency non-negativity, route validity, cleanup completion.
- **Memory seam:** active scene references, timers/listeners registered by owner, effect counts, modal ownership.

Use a ring buffer with a bounded size and a production-safe sampling/disable switch. The existing `debug` scene can consume this diagnostic port; normal gameplay should only show concise recoverable notifications. Diagnostics must never alter gameplay state.

## Deprecated Code Removal Plan

Removal must be evidence-led and staged:

1. Inventory global call sites and classify each as engine, domain, screen, UI, or deprecated.
2. Add adapters and deprecation warnings behind diagnostics, not unconditional noisy logs.
3. Migrate one vertical slice (navigation shell plus `ashram → travelMap → zoneExploration`) to facades.
4. Add contract tests for each migrated seam and browser smoke checks for legacy screens.
5. Remove deprecated aliases only after zero runtime references and save compatibility evidence.

Likely first removal targets are duplicate scene-local navigation helpers, direct screen-to-screen mutation, obsolete rendering helpers superseded by shared UI primitives, and unowned timers/listeners. Do not delete a global merely because it looks unused in static search; script-order and runtime callback references require browser diagnostics.

## Recommended Build Order

1. **Baseline and observability** — record current frame/transition/save behavior; add bounded diagnostics and a screen-transition trace without changing gameplay.
2. **Lifecycle safety** — standardize scene `leave`, component `destroy`, timer/listener ownership, modal cleanup, and effect bounds. This reduces risk before modularization.
3. **Navigation seam** — introduce route definitions, `SceneManager.request`, route params, back/home behavior, and failure recovery. Migrate the core progression path first.
4. **Store and selectors** — add read-only selectors and command wrappers over `G.state`/existing systems; keep direct mutation compatibility temporarily.
5. **Screen context adapters** — inject `InputPort`, `RenderPort`, navigation, selectors, commands, and diagnostics into migrated screens. Start with high-connectivity screens: ashram, travel map, zone exploration, combat, party.
6. **Domain event journal** — emit structured events from authoritative systems at commit points; use them for notifications, diagnostics, achievements/quests integration, and later sync preparation.
7. **Persistence boundary** — put localStorage behind `PersistencePort`, preserve migration/version behavior, and make snapshot serialization selective only after equivalence tests.
8. **Deprecation cleanup** — remove proven-unused globals/helpers and collapse duplicate code. Keep compatibility shims for untouched scenes until the final migration wave.
9. **Backend readiness review** — validate stable IDs, schema versioning, event shape, and conflict-sensitive fields; explicitly defer transport implementation.

This order prevents a navigation or rendering rewrite from hiding lifecycle leaks and makes each phase observable in the running game.

## Anti-Patterns to Avoid

- Replacing Canvas with a DOM/framework or converting all scripts to modules during v3.0; that violates scope and multiplies regression surface.
- Introducing a global event bus that permits arbitrary listeners and hidden mutation. Events need named contracts, ownership, and bounded retention.
- Making selectors mutate state or making render functions call gameplay systems.
- Creating a second state store that drifts from `G.state`; use an adapter and migrate ownership incrementally.
- Treating route parameters as save data, or persisting transient animation/UI state.
- Adding backend-shaped abstractions that require network behavior now. Define ports and local adapters only.
- Keeping “temporary” compatibility paths undocumented. Every shim needs an owner, migration status, and deletion condition.

## Scalability and Risk Notes

| Concern | v3.0 target | Future path |
|---|---|---|
| 30+ screens | Route table + shared lifecycle/context | Lazy loading when a build pipeline is intentionally introduced |
| Global state | Selector/command facade over `G.state` | Slice ownership and stronger schema validation |
| Canvas performance | Bounded effects, cached render resources, viewport culling | Dirty-region or worker strategies only if profiling justifies them |
| Save size/GC | Versioned snapshots and selective serialization seam | Server snapshots/delta sync behind the same port |
| Diagnostics | In-memory bounded ring buffer + debug screen | Exportable telemetry, still opt-in and privacy-safe |
| Cross-system coupling | Commit events and authoritative command owners | Explicit domain/application service modules |

## Open Questions for Phase Research

- Which scenes are highest-connectivity by actual runtime navigation, rather than static references?
- Can existing save migration be split into pure validation, migration, and application steps without changing legacy behavior?
- Which deprecated effects/UI helpers are genuinely unreachable after a 30-minute transition stress run?
- What is the minimum event schema needed by quests, achievements, notifications, and future sync without duplicating business rules?
- Should the route table support modal routes/overlays now, or remain screen-only until modal ownership is standardized?

## Sources

- `codemap.md` — repository architecture, data flow, debt, and constraints (HIGH confidence for current implementation).
- `src/engine/codemap.md` — loop, scene transition, input, renderer, and lifecycle seams (HIGH confidence for current implementation).
- `src/systems/codemap.md` — system ownership, mutations, dependencies, and persistence flow (HIGH confidence for current implementation).
- `src/scenes/codemap.md` — screen contracts, navigation patterns, and cleanup risks (HIGH confidence for current implementation).
- `src/ui/codemap.md` — immediate-mode component model, interaction contracts, and cleanup risks (HIGH confidence for current implementation).
- `.planning/PROJECT.md` — v3.0 constraints inferred from the current project context; backend synchronization and replacing Canvas remain out of scope (HIGH confidence).
