# Codebase Concerns

**Analysis Date:** 2026-09-19

## Tech Debt

**Global script architecture and state coupling:**
- Issue: The application exposes engine, data, systems, and scene objects as globals and relies on synchronous script order. Systems mutate `G.state` directly, so ownership and invariants are difficult to enforce.
- Files: `index.html`, `src/engine/game.js:1-503`, `src/systems/*.js`, `src/main.js:18-50`
- Impact: A missing or reordered script can leave a partially booted game; isolated testing and safe refactoring are difficult.
- Fix approach: Introduce explicit module boundaries incrementally, beginning with state accessors and a dependency manifest while preserving the current boot order during migration.

**Duplicated persistence and domain logic:**
- Issue: Save serialization deep-clones the entire mutable state, while hydration performs a shallow overlay and migration also normalizes domain state and calculates offline effects.
- Files: `src/systems/save.js:8-36`, `src/systems/save.js:39-85`, `src/systems/save.js:87-117`
- Impact: Large saves create GC pressure and shallow replacement can preserve incompatible nested shapes unless every migration path handles them.
- Fix approach: Separate persistence, schema validation, migration, and offline accrual; serialize only dirty domains and validate nested structures before assignment.

**Scene lifecycle contract is advisory:**
- Issue: The architecture expects every scene to implement cleanup, but the registry accepts arbitrary scene objects and the shared transition path only calls an optional `leave()`.
- Files: `src/engine/game.js:470-480`, `src/scenes/codemap.md:103-123`
- Impact: Scene-local timers, combat references, and cached UI objects can outlive the scene and accumulate across repeated transitions.
- Fix approach: Add a common lifecycle wrapper that always clears scene-owned resources and make missing cleanup visible in development diagnostics.

## Known Bugs

**Unresolved placeholder interaction:**
- Symptoms: Zone exploration contains an item-detail action that is explicitly left as a TODO, so the action cannot provide the intended inspection behavior.
- Files: `src/scenes/zoneExploration.js:188`
- Trigger: Select the affected item/detail interaction in zone exploration.
- Workaround: Not detected.

**Error recovery can mask broken gameplay state:**
- Symptoms: The frame watchdog catches all update/render exceptions, displays a generic recovery toast, and continues scheduling frames.
- Files: `src/engine/game.js:340-359`
- Trigger: Any exception during a frame.
- Workaround: Inspect the browser console; the visible game may remain in a partially updated state even though the loop continues.

## Security Considerations

**Client-authoritative save and progression state:**
- Risk: Local saves and imported JSON are user-controlled, and the cloud save path writes the supplied full game state to a document keyed by the authenticated user's UID.
- Files: `src/systems/save.js:124-169`, `src/engine/auth.js:112-151`
- Current mitigation: Hydration filters prototype keys, normalizes several numeric fields, and invokes migration before use (`src/systems/save.js:26-85`).
- Recommendations: Treat imported/cloud state as untrusted; validate every nested gameplay object, enforce Firestore rules and document size limits, and never use client values as authority for premium or competitive rewards.

**Authentication errors expose provider messages:**
- Risk: Firebase exception messages are returned directly to UI callers and may reveal provider-specific account or configuration details.
- Files: `src/engine/auth.js:27-45`, `src/engine/auth.js:49-58`, `src/engine/auth.js:78-96`
- Current mitigation: Calls are wrapped in `try/catch`.
- Recommendations: Map provider errors to stable user-facing categories and log detailed diagnostics only through a controlled development channel.

**Debug surface is shipped with the application:**
- Risk: A registered debug scene exists in the production script table and can expose internal state or mutation tools if navigable.
- Files: `src/main.js:40-43`, `src/scenes/debug.js`
- Current mitigation: Not detected.
- Recommendations: Gate debug registration behind an explicit development build/runtime flag and remove mutation tools from production bundles.

## Performance Bottlenecks

**Full-frame rendering work:**
- Problem: Every animation frame clears and redraws the whole logical canvas, creates a fresh gradient, and may draw a full-size noise bitmap.
- Files: `src/engine/game.js:362-394`, `src/engine/game.js:441-454`, `src/engine/renderer.js:67-86`
- Cause: Immediate-mode rendering has no dirty-region or cached-background path.
- Improvement path: Cache gradients by background key, update noise less frequently, and profile before introducing selective redraws.

**Effect rendering scales with active arrays:**
- Problem: Projectile and effect renderers iterate their collections each frame; several effect types also perform per-effect drawing loops.
- Files: `src/engine/renderer.js:366-398`, `src/engine/renderer.js:452-477`, `src/engine/game.js:369-393`
- Cause: Effects are globally rendered regardless of scene visibility; circular buffers bound capacity but do not reduce draw work.
- Improvement path: Cull off-screen effects and pool transient objects; retain the existing bounded buffers as a safety limit.

**Global ticks run outside their owning screen:**
- Problem: Farm and cultivation progression are advanced from the global frame loop, including while unrelated scenes are active.
- Files: `src/engine/game.js:372-383`, `src/systems/cultivation_sys.js`, `src/systems/farm.js`
- Cause: Idle progression is coupled to the render loop rather than an explicit simulation clock.
- Improvement path: Keep offline-safe simulation centralized but decouple it from per-frame rendering, with elapsed-time updates at controlled cadence.

## Fragile Areas

**Script loading and cache coherence:**
- Files: `index.html`, `src/main.js:18-50`, `sw.js:7-105`
- Why fragile: The app depends on global declarations and a manually maintained precache list; tolerant service-worker installation can succeed while silently omitting an asset.
- Safe modification: Update `index.html` and `sw.js` together, run `tests/save_coherence.test.js`, then test a cold cache and a stale-cache upgrade.
- Test coverage: Static precache coverage exists, but runtime failure/recovery and all script-order permutations are not covered.

**Cloud/local save convergence:**
- Files: `src/engine/auth.js:142-151`, `src/systems/save.js:184-245`
- Why fragile: Authentication loads cloud state with `Object.assign` after local boot, with no timestamp conflict policy or complete rehydration path.
- Safe modification: Route both local and cloud data through the same validated hydrate/migrate function and add conflict tests.
- Test coverage: Local legacy hydration is tested in `tests/save_coherence.test.js:60-152`; cloud precedence and malformed cloud payloads are not tested.

**Canvas/input global event ownership:**
- Files: `src/engine/input.js:35-125`, `src/main.js:107-109`, `src/engine/game.js:486-503`
- Why fragile: Listeners are installed at module/boot scope while cleanup is pagehide-specific; repeated harness boot or embedded usage can duplicate handlers.
- Safe modification: Make initialization idempotent and expose one teardown path for every listener group.
- Test coverage: Input listener lifecycle and duplicate boot behavior are not covered.

## Scaling Limits

**LocalStorage save capacity:**
- Current capacity: Browser localStorage quota is commonly around 5 MB; full state is serialized every 30 seconds.
- Limit: `src/systems/save.js:8-18` serializes all state, including growing inventory, quests, journeys, and world records.
- Scaling path: Bound historical collections, prune completed records where safe, and move large optional data to an explicit export or IndexedDB strategy.

**Long-session allocation pressure:**
- Current capacity: Effects use fixed circular buffers (`50`, `30`, `16`, and `100` entries), but each insertion allocates objects and nested spark arrays.
- Limit: `src/engine/renderer.js:312-323`, `src/engine/renderer.js:336-340`, `src/engine/renderer.js:405-449`, `src/engine/renderer.js:649-668`
- Scaling path: Reuse particle objects and nested spark arrays, then verify with a 30-minute session and low-end device profiling.

## Dependencies at Risk

**Firebase CDN/global SDK integration:**
- Risk: Authentication relies on globally available Firebase functions and configuration loaded by script tags rather than imports or pinned local packages.
- Files: `src/engine/auth.js:8-24`, `src/engine/firebase-config.js:1-12`, `index.html`
- Impact: CDN ordering, SDK version drift, or configuration mismatch can break sign-in and cloud saves at runtime.
- Migration plan: Pin SDK versions, verify initialization contracts at boot, and migrate the auth adapter behind an explicit module boundary.

## Test Coverage Gaps

**Lifecycle and memory behavior:**
- What's not tested: Repeated scene transitions, listener teardown, timer cleanup, effect bounds, and long-session memory stability.
- Files: `src/engine/game.js:470-503`, `src/engine/renderer.js:312-477`, `src/engine/audio.js:171-229`, `src/systems/save.js:184-198`
- Risk: Regressions accumulate silently because the primary verification remains manual browser play.
- Priority: High

**Security and malformed-state boundaries:**
- What's not tested: Malformed nested party/inventory/world payloads, malicious imported objects, Firestore rule enforcement, and cloud/local conflict resolution.
- Files: `src/systems/save.js:26-85`, `src/systems/save.js:150-169`, `src/engine/auth.js:112-151`
- Risk: Corrupt or manipulated saves can produce invalid progression or unsafe cloud data.
- Priority: High

---

*Concerns audit: 2026-09-19*
