<!-- generated-by: gsd-doc-writer -->
# Development

How to set up **Mythika: Echoes of the Divine** for development, validate changes, follow code style, and submit pull requests. The project is a vanilla-JS Canvas 2D RPG with no build step, no bundler, and no modules — the repository root is the deployable static site loaded through ordered `<script>` tags in `index.html`.

Related docs: `docs/GETTING-STARTED.md` (first run), `docs/CONFIGURATION.md` (Firebase/PWA/URL-flag config), `docs/TESTING.md` (test suite detail), `ARCHITECTURE.md` (engine/scenes/systems layout).

## Local setup

Development setup is identical to player setup plus dev-only validation tooling. There is no `package.json`, no dependency install, and no compile step.

1. Fork the repository, then clone your fork:

   ```bash
   git clone https://github.com/<your-username>/mythika-echoes-of-the-divine.git
   cd mythika-echoes-of-the-divine
   ```

2. Confirm the working tree root contains `index.html`, `src/`, `styles/`, `manifest.json`, and `sw.js`. If those are present, setup is complete — do not run `npm install` (there is nothing to install).

3. (Optional, cloud-save work only) Copy the Firebase template to the gitignored local config:

   ```bash
   cp src/engine/firebase-config.template.js src/engine/firebase-config.js
   ```

   Fill in your own development project credentials. `src/engine/firebase-config.js` is gitignored and must never be committed. Offline `localStorage` play needs no Firebase config at all.

4. Start a static server from the repository root (serving the root matters — paths like `src/main.js` and `styles/game.css` only resolve from there):

   ```bash
   python3 -m http.server 3000
   ```

   Open `http://localhost:3000`. A successful boot logs `[Mythika] booted scene=` to the browser console.

5. Before changing code, read `AGENTS.md`, the root `codemap.md`, and the `codemap.md` inside each `src/*/` directory you plan to touch (`src/engine/codemap.md`, `src/data/codemap.md`, `src/systems/codemap.md`, `src/scenes/codemap.md`, `src/ui/codemap.md`). For style detail, read `STYLE_GUIDE.md` and `.planning/codebase/CONVENTIONS.md`.

Dev-only notes:

- Always serve over `http://localhost`, never `file://`, so the service worker registers and `src/` paths resolve. When changed scripts do not appear after reload, unregister the service worker in devtools and clear Cache Storage (the worker is cache-first for everything except `index.html`, which is network-first). Do not clear Local Storage unless you have exported your save — progress lives under the `mythika_save` key.
- Keep edits in the directory matching their responsibility: `src/engine/` (loop, renderer, scene management, input, audio, auth, global state), `src/data/` (static definitions), `src/systems/` (authoritative rules that mutate `G.state`), `src/scenes/` (screens), `src/ui/` (reusable immediate-mode Canvas controls). Save persistence, migrations, and legacy normalization belong in `src/systems/save.js`, not in scenes or individual systems.
- When adding a file, register its `<script>` tag in `index.html` in dependency order: engine foundations, then data, then systems, then UI, then scenes, with `src/main.js` last. New scenes go before `src/main.js`, where scene registration and boot occur. Never add `defer`, `async`, or `import`/`export` to traditional scripts — synchronous order and classic globals are runtime contracts.
- Browser diagnostics are opt-in: append `?probe` for FPS/script timing and `?probe&selftest` for the input-chain self-test (the self-test navigates scenes with synthetic input — not for normal play).

## Build commands

There is no `package.json` and therefore no `scripts` field, no bundler, and no lifecycle hooks. The table below lists the actual commands developers run, grouped by purpose.

| Command | Description |
|---|---|
| `python3 -m http.server 3000` | Dev server. Serves the repo root; open `http://localhost:3000`. No build or watch step — the browser consumes edits directly. |
| `node --check path/to/changed-file.js` | Per-file syntax check. Run for every changed JS file before opening a PR (e.g. `node --check src/engine/game.js`). |
| `git diff --check` | Whitespace check. Run before committing to catch trailing whitespace and conflict markers. |
| `node --test tests/world_state.test.js` | Run a single Node test file. |
| `node --test tests/travel_map_*.test.js` | Run a related set of test files with an explicit glob. Do not use `node --test tests/` — this Node setup treats the directory form as a module path. |
| `node --test tests/*.test.js` | Run the full Node suite (62 test files in `tests/`). |
| `tools/check_ui_invariants.sh` | Pre-deploy gate: `node --check` over every `src/**/*.js`, forbids raw unanchored spring back-translate patterns (`translate(-bw/2`, `translate(-bh/2`, `translate(-this.w/2`, `translate(-this.h/2`), and verifies each `src/systems/*.js` file is loaded exactly once in `index.html`. |
| `python3 tools/verify_matrix.py --budget 6000` | Real browser boot matrix across desktop, phone, and phone-landscape viewports. Requires Chrome, Chromium, or Edge; `MYTHIKA_CHROME` selects a specific binary. |
| `cp src/engine/firebase-config.template.js src/engine/firebase-config.js` | One-time local Firebase config setup for cloud-save development. Not a build step. |

There is intentionally no `lint`, `format`, `build`, `dev`, `serve`, or `test:watch` script. Validation is `node --check` + `git diff --check` + the Node suite + `tools/check_ui_invariants.sh` + the browser boot matrix.

## Code style

No automated linter or formatter is configured. There is no `.eslintrc*`, `eslint.config.*`, `.prettierrc*`, `prettier.config.*`, `biome.json`, or `.editorconfig` anywhere in the repo. CI does not enforce a lint step — the `verify` job in `.github/workflows/pages.yml` runs the boot matrix, not a linter.

The enforced standard is `STYLE_GUIDE.md` at the repo root (distilled with file references in `.planning/codebase/CONVENTIONS.md`) plus "match the style of the surrounding file" (`CONTRIBUTING.md`). Key rules:

- **Formatting:** 2-space indentation, semicolons, single-quoted strings, opening braces on the same line as declarations and control statements. Trailing commas only where the surrounding file already uses them. Keep simple guards on one line (`if (!buttons) return;`). Prefer `const`; use `let` for reassigned values (legacy boot code may use `var`, but new code uses `const`/`let`).
- **Naming:** PascalCase global singletons (`Combat`, `SaveSystem`, `UI`, `Scene`); camelCase verb-led functions (`startBattle`, `buildContinueButton`); camelCase locals; `UPPER_SNAKE_CASE` constants (`SAVE_KEY`, `CRIT_MULTIPLIER`); predicate-style booleans (`isPlayerTurn`, `battleOver`); leading underscore for internal component state (`_hovered`, `_pressed`); stable camelCase/lowercase data keys (`characterCreate`, `aryavarta`).
- **Module pattern:** Each traditional script exposes a top-level global (singleton object + attached `function` methods so `this` binds to the owner), never `import`/`export`. Testable modules add a dual browser-global/CommonJS tail so Node `require()` works while the browser still gets the global:

  ```js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WorldState };
  }
  ```

  (Live examples: `src/systems/world_state.js`, `src/systems/influence.js`, `src/data/zones.js`.)
- **Scenes:** Create with `Scene.create({ name, data, enter, leave, update, render })`. `data` holds mutable scene-local state; `enter()` initializes state/audio/buttons; `update(dt)` advances time-based state (`dt` is elapsed time, not frame count); `render(ctx)` redraws the complete scene every frame; `leave()` stops audio, clears controls and temporary data, and cancels async work including timers (`combatScene` uses a `runId` check for delayed callbacks).
- **UI components:** Factories under `UI` (`UI.Button = function(x, y, w, h, ...)`) returning `{ render, update, contains, onClick }` objects. Drive buttons through `UI.updateButtons(this.data.buttons, dt)` and `UI.handleButtons(this.data.buttons)`. Button handlers return `false` for a rejected action, anything else (including `undefined`) for a valid action.
- **Rendering tokens:** Use `R.rect`, `R.roundRect`, `R.text` helpers; `R.colors.*` semantic colors (never raw hex in new scene/component code); `R.radius.*` scale (`xs: 3`, `s: 5`, `m: 8`, `l: 10`); `R.fonts.*` (never hard-coded Canvas font strings). Wrap temporary Canvas state in `ctx.save()` / `ctx.restore()` and draw in logical `400 × 720` game space. Check `R.reducedMotion()` before nonessential animation and keep mouse/touch parity.
- **Defensive code:** Guard optional globals with `typeof` (`if (typeof ZoneRewardSystem !== 'undefined' && ZoneRewardSystem.normalize)`), since a bare reference to a missing script throws `ReferenceError` and aborts boot. Validate loaded save data (reject non-object roots, filter `__proto__`/`constructor`/`prototype` keys) and preserve object identity when hydrating `G.state`. Single-responsibility guard comments explain *why*, not *what*.

  To check style compliance before a PR, run:

  ```bash
  node --check path/to/changed-file.js
  git diff --check
  tools/check_ui_invariants.sh
  ```

## Branch conventions

The default integration branch is `master` (`.github/workflows/pages.yml` triggers on `push` to `master`; `CONTRIBUTING.md` branches from `master`). There is no `PULL_REQUEST_TEMPLATE.md`, no issue templates, and no documented mandatory branch-naming scheme.

Descriptive prefixes are recommended:

- `feat/short-description` for new functionality
- `fix/short-description` for bug fixes
- `docs/short-description` for documentation-only work
- `refactor/short-description` for behavior-preserving restructuring

Example workflow:

```bash
git checkout master
git pull --ff-only origin master
git checkout -b feat/short-description
```

Recent history follows concise Conventional Commit-style messages, often with a scope and an imperative summary, e.g. `feat(combat): add ailment resistance indicator` or `fix(save): preserve legacy inventory entries`.

## PR process

There is no PR template file — follow this checklist (from `CONTRIBUTING.md` and the `verify`/`deploy` workflow):

- Open the PR against `master` from a focused branch; do not mix unrelated changes. Resolve feedback with additional commits and wait for the verification workflow to pass before merging.
- Explain the player-facing or developer-facing problem, the chosen solution, and any save-data or performance implications. Call out changes to `index.html` script order, global state shape, persistence/migration, service-worker caching, Firebase integration, or economy/progression balance.
- List the manual scenarios tested and include the boot-matrix result (`python3 tools/verify_matrix.py --budget 6000`, which also runs in CI for every push to `master`). At minimum verify: clean boot with no console errors on desktop and phone-sized viewports; scene transitions, tap/click, keyboard, and scrolling where affected; save/load and offline progress after state or progression changes; reduced-motion mode (OS preference or `G.state.reduceMotion = true`); `?probe` frame behavior (`?probe&selftest` when touching the input chain); usability in a short phone-landscape viewport.
- Include screenshots or a short recording for visible Canvas, layout, motion, or responsive changes. Keep lore-sensitive names, descriptions, and mechanics consistent with surrounding game data.
- A successful verification is required before the static site is deployed by `.github/workflows/pages.yml` (verify job must pass before the deploy job publishes the repo root to GitHub Pages).
