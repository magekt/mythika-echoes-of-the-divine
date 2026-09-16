# Phase 6: World-State Continuity — Research

## Discovery level

Level 0: this phase extends established in-repository state/default/hydration patterns, adds no dependency, and uses the existing direct-script Canvas architecture.

## Existing patterns to preserve

- `src/engine/game.js` owns `createDefaultGameState()` and exposes it as `G.createDefaultState`.
- `SaveSystem.hydrate(state)` overlays incoming top-level state onto fresh defaults, preserves the `G.state` object identity, then calls `SaveSystem.migrate()`.
- `SaveSystem.migrate()` is the established repair boundary for legacy and malformed nested state.
- `SaveSystem.save()` serializes all of `G.state`; therefore a canonical `G.state.world` subtree persists without special serialization code.
- `index.html` controls dependency order. A world-state system must load after `game.js` and zone data, but before `save.js` and future consumers.
- Systems use global namespace objects and operate directly on `G.state`; cross-system calls use `typeof X !== 'undefined' && X.method` guards where optional.

## Recommended architecture

Create `src/systems/world_state.js` as the sole normalization and mutation boundary for the living-map state. Keep its schema under `G.state.world`:

```js
{
  regions: {},
  landmarks: { discovered: {}, notified: {} },
  influence: {},
  narrativeEchoes: {},
  events: { active: {}, resolved: {} },
  transitions: {}
}
```

Use keyed objects rather than arrays so one-time records are naturally idempotent and future map systems can address canonical IDs directly. Normalization must return fresh plain objects, reject prototype-pollution keys, drop malformed entries, clamp numeric influence values, and preserve valid unknown IDs so later data additions do not erase saves.

`WorldState.normalize()` should be called from `SaveSystem.migrate()` after the default state is overlaid. Mutation helpers should mark one-time transitions only when absent, with separate query helpers so rendering and scene entry remain read-only.

## Verification strategy

The repository has no package/test runner. Add a dependency-free Node VM harness that loads `game.js`, zone data, `world_state.js`, and `save.js` with mocked browser globals and localStorage. Cover:

1. default schema,
2. legacy save without `world`,
3. partial nested world state,
4. malformed/prototype-polluting world state,
5. save/load round trip,
6. one-time transition idempotency and resolved-event preservation,
7. unrelated player progress preservation.

Run with `node tests/world_state.test.js`; keep execution below 60 seconds.

## Risks and mitigations

- **Shallow hydration retains malformed nested values:** normalize the whole `world` subtree in `SaveSystem.migrate()`.
- **Future rendering replays transitions:** expose explicit `hasTransition`/`recordTransition` semantics; reads never mutate.
- **Data loss during repair:** rebuild only malformed branches/entries, preserve valid unknown keyed entries, and assert unrelated top-level progress in tests.
- **Prototype pollution:** copy only own safe keys and reject `__proto__`, `constructor`, and `prototype` recursively at normalization boundaries.
- **Script-order failure:** register `world_state.js` before `save.js`, and verify load order structurally.
