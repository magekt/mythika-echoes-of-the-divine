# Agent Instructions

## Setup and Verification

- There is no `package.json`, dependency install, build step, or bundler. The repository root is the deployable static site.
- Run the game through a local HTTP server: `python3 -m http.server 3000`.
- Run one test file with `node --test tests/world_state.test.js`; run related files with an explicit glob such as `node --test tests/travel_map_*.test.js`. Do not use `node --test tests/` because this Node setup treats the directory form as a module path.
- Run the full Node suite with `node --test tests/*.test.js`, then run `tools/check_ui_invariants.sh` for all-source syntax and UI/script-loading invariants.
- Run the real browser boot matrix with `python3 tools/verify_matrix.py --budget 6000`; it requires Chrome, Chromium, or Edge, and `MYTHIKA_CHROME` selects a specific binary.
- Use `node --check path/to/changed-file.js` and `git diff --check` for focused validation.
- Browser diagnostics are opt-in: append `?probe` for FPS/script timing and `&selftest` for the input-chain self-test. Clear or unregister the service worker before validating changed scripts.

## Runtime Contracts

- `index.html` is the synchronous, dependency-ordered entrypoint. Script order and classic globals are runtime contracts; do not casually add `defer`, `async`, modules, or reorder files.
- `src/main.js` registers scenes and starts boot; `src/engine/game.js` owns `G`, the rAF loop, `gScene`, `Fade`, error recovery, and global timing.
- This is an immediate-mode Canvas 2D game using logical coordinates around 400x720 with DPR-aware scaling. Scenes implement `enter`, `update`, `render`, and `leave`.
- Preserve the intentional global API (`G`, `R`, `UI`, `Scene`, `Input`, `Audio`, `Notify`, `Fade`, `Combat`, `Progression`, `SaveSystem`, and related systems) unless every consumer is migrated.
- `src/data/` is declarative gameplay data; `src/systems/` owns authoritative rules and mutates `G.state`; `src/scenes/` owns screens; `src/ui/` owns reusable immediate-mode components.
- Save persistence, migrations, and legacy normalization belong in `src/systems/save.js`, not in scenes or individual systems.
- UI factories return render/update/click/contains objects. Use `R.colors`, `R.fonts`, and `R.radius`; avoid raw component colors and ad-hoc hit testing.
- Use `R.reducedMotion()` for new animation and route scene changes through `gScene`/`Fade`.

## Data and Integration Constraints

- Local `localStorage` play is the default. Firebase authentication and cloud saves are optional and must not block offline play.
- Preserve unrelated save state when adding defaults or fields; do not overwrite existing inventory, party, or world branches during hydration.
- Route rewards, influence, quests, achievements, and events through their canonical systems and preserve exactly-once behavior where existing APIs provide it.
- `src/engine/firebase-config.js` is ignored and must never be committed. Configure it from `src/engine/firebase-config.template.js` or the repository’s secret-generation workflow.
- Service-worker changes require fresh-worker/browser verification, not only Node tests.

## Change Scope

- Read `codemap.md` and the relevant nested `src/*/codemap.md` before architecture or subsystem changes.
- When changing responsive UI, exercise portrait and landscape browser sizes, including 400x720, 540x900, 720x400, 1024x768, and 1440x900.
- When changing a scene, verify the actual transition and lifecycle, not only scene registration: boot, navigation, map/exploration, combat, party/equipment, save/reload, and settings are the main journey checkpoints.
