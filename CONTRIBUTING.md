<!-- generated-by: gsd-doc-writer -->
# Contributing to Mythika: Echoes of the Divine

Thank you for helping improve Mythika. Contributions should preserve the game's mobile-first Canvas experience, offline behavior, mythology-sensitive presentation, and save compatibility.

## Development Setup

1. Fork the repository and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/mythika-echoes-of-the-divine.git
   cd mythika-echoes-of-the-divine
   ```

2. Create a focused branch from `master`:

   ```bash
   git checkout master
   git pull --ff-only origin master
   git checkout -b feat/short-description
   ```

3. Start a local static server; the project has no dependency installation, compilation, or build step:

   ```bash
   python3 -m http.server 3000
   ```

4. Open `http://localhost:3000` in a browser.

Before changing code, read [AGENTS.md](AGENTS.md), the repository [codemap](codemap.md), and the `codemap.md` inside any source directory you plan to modify. See the [README development section](README.md#development) for runtime diagnostics and verification commands.

Firebase is optional for offline development. Contributors working on cloud saves should copy `src/engine/firebase-config.template.js` to the gitignored `src/engine/firebase-config.js` and use their own development project credentials. Never commit credentials or the generated config file.

## Coding Standards

- Use vanilla ES6+ JavaScript and preserve the dependency order of scripts in `index.html`; there is no module bundler or compilation step.
- Follow the existing global singleton architecture (`G`, `R`, `UI`, `Scene`, `Input`, `Audio`, and system globals) and mutate game state through established system APIs where they exist.
- Keep Canvas UI immediate-mode. Reusable controls follow the `UI.ComponentName(...)` factory pattern and generally expose `render`, `update`, hit-testing, and click behavior.
- Use semantic design tokens such as `R.colors.*`, `R.fonts.*`, and `R.radius.*` instead of introducing raw colors or inconsistent radii in components.
- Check `R.reducedMotion()` before adding nonessential animation. Preserve touch, mouse, keyboard, scrolling, and short-landscape behavior.
- Maintain backward-compatible save data. Update save migration logic when a state-shape change requires it.
- Check each changed JavaScript file before opening a pull request:

  ```bash
  node --check path/to/changed-file.js
  ```

No automated linter or formatter is configured. Match the style of the surrounding file and keep changes narrowly scoped.

## Testing Changes

Run the headless boot matrix before submitting a pull request:

```bash
python3 tools/verify_matrix.py --budget 6000
```

The harness requires Chrome, Chromium, or Microsoft Edge. Set `MYTHIKA_CHROME` to the browser executable when automatic detection does not find it.

Also test the affected flow manually in a browser. At minimum, verify:

- The game boots without console errors on desktop and phone-sized viewports.
- Scene transitions, tap/click input, keyboard input, and scrolling still work where affected.
- Save/load and offline progress remain correct after state or progression changes.
- Reduced-motion mode works, using the operating-system preference or `G.state.reduceMotion = true` in the console.
- `?probe` reports stable frame behavior; use `?probe&selftest` when changing the input chain.
- UI changes remain usable in a short phone-landscape viewport.

GitHub Actions runs the same desktop, phone, and phone-landscape boot matrix for pushes to `master`. A successful verification is required before the static site is deployed by `.github/workflows/pages.yml`.

## Branch and Commit Conventions

The default integration branch is `master`. The repository does not document a mandatory branch naming scheme, but descriptive prefixes are recommended:

- `feat/short-description` for new functionality
- `fix/short-description` for bug fixes
- `docs/short-description` for documentation-only work
- `refactor/short-description` for behavior-preserving restructuring

Recent history follows concise Conventional Commit-style messages, often with a scope. Use an imperative summary such as `feat(combat): add ailment resistance indicator` or `fix(save): preserve legacy inventory entries`.

## Pull Request Guidelines

- Open the pull request against `master` from a focused branch; do not mix unrelated changes.
- Explain the player-facing or developer-facing problem, the chosen solution, and any save-data or performance implications.
- List the manual scenarios tested and include the boot-matrix result.
- Include screenshots or a short recording for visible Canvas, layout, motion, or responsive changes.
- Call out changes to `index.html` script order, global state shape, persistence, service-worker caching, Firebase integration, or economy/progression balance.
- Keep lore-sensitive names, descriptions, and mechanics consistent with surrounding game data and narrative content.
- Resolve review feedback with additional commits and wait for the verification workflow to pass before merging.

## Issue Reporting

Use [GitHub Issues](https://github.com/magekt/mythika-echoes-of-the-divine/issues) to report bugs or propose features. No issue templates are currently configured, so include enough detail to reproduce or evaluate the request.

For bug reports, provide:

- A concise summary and the affected scene or system
- Steps to reproduce, expected behavior, and actual behavior
- Browser, operating system, viewport/device, and input method
- Console errors and whether `?probe` or `?probe&selftest` reveals a failure
- Save-state context when relevant, with secrets and personal data removed
- Screenshots or recordings for visual or interaction problems

For feature requests, describe the player need, proposed behavior, affected systems, and any implications for progression, economy, lore, accessibility, offline play, or saved games.
