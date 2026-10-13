<!-- generated-by: gsd-doc-writer -->
# Configuration

Mythika is a zero-build static site: the repository root is the deployable
artifact. There is no `package.json`, no bundler, and no `.env` file support —
the game runtime reads zero `process.env` variables. All configuration flows
through four surfaces: a gitignored Firebase config script, `manifest.json`
(PWA install metadata), URL query flags (per-run diagnostics), and
`localStorage` keys (per-player persistence). The `tools/verify_matrix.py`
harness adds two process-environment inputs (`MYTHIKA_CHROME`, `CI`) that only
affect verification, never gameplay.

> `.planning/config.json` is workflow tooling state. The game never loads it;
> ignore it when configuring a deploy.

## Environment variables

There is no `.env.example` in this repo. The only environment variables the
project reads are consumed by `tools/write_firebase_config.py` (deploy-time
secret injection) and `tools/verify_matrix.py` (browser selection).

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `FIREBASE_API_KEY` | Required for cloud saves | — | Firebase web-app `apiKey`. Injected into `window.FIREBASE_CONFIG.apiKey`. |
| `FIREBASE_AUTH_DOMAIN` | Required for cloud saves | — | Firebase web-app `authDomain`. Injected into `window.FIREBASE_CONFIG.authDomain`. |
| `FIREBASE_PROJECT_ID` | Required for cloud saves | — | Firebase project id. Injected into `window.FIREBASE_CONFIG.projectId`. |
| `FIREBASE_STORAGE_BUCKET` | Required for cloud saves | — | Firebase storage bucket. Injected into `window.FIREBASE_CONFIG.storageBucket`. |
| `FIREBASE_MESSAGING_SENDER_ID` | Required for cloud saves | — | Firebase messaging sender id. Injected into `window.FIREBASE_CONFIG.messagingSenderId`. |
| `FIREBASE_APP_ID` | Required for cloud saves | — | Firebase web-app id. Injected into `window.FIREBASE_CONFIG.appId`. |
| `FIREBASE_MEASUREMENT_ID` | Optional | `""` (empty string) | Analytics measurement id. The only `FIELDS` entry excluded from `REQUIRED_ENV` in `tools/write_firebase_config.py`; missing value is written as `""`. |
| `MYTHIKA_CHROME` | Optional | Auto-detect | Absolute path to a Chrome, Chromium, or Microsoft Edge binary for `tools/verify_matrix.py`. Read by `find_chrome()` in `tools/verify_matrix.py:85`. When pinned, the harness also appends `--no-sandbox --disable-dev-shm-usage` runner flags. |
| `CI` | Optional | Unset locally | When set (or when `MYTHIKA_CHROME` is pinned), `tools/verify_matrix.py:96-100` appends `--no-sandbox --disable-dev-shm-usage` to the headless Chrome invocation. Set to `'true'` in `.github/workflows/pages.yml`. |

Missing-variable behavior: `python3 tools/write_firebase_config.py` exits `1`
and prints `Missing Firebase deployment variables: <names>` when any of the
six required `FIREBASE_*` values is unset (`tools/write_firebase_config.py:34-40`).

## Config file format

### `src/engine/firebase-config.js` (gitignored)

The single deploy-time config file. It assigns one global and one collection
constant. Never commit it — `.gitignore:39` lists
`src/engine/firebase-config.js` explicitly.

Create it locally by copying the template:

```bash
cp src/engine/firebase-config.template.js src/engine/firebase-config.js
```

Minimal working shape (placeholder values from
`src/engine/firebase-config.template.js:7-18`):

```javascript
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "G-XXXXXXXXXX"
};

// Firestore collection path for game saves
const SAVE_COLLECTION = "game_saves";
```

Top-level keys:

| Key | Description |
| --- | --- |
| `apiKey` | Firebase web-app API key. |
| `authDomain` | Firebase auth domain (`<project>.firebaseapp.com`). |
| `projectId` | Firebase project id. |
| `storageBucket` | Firebase storage bucket. |
| `messagingSenderId` | Firebase messaging sender id. |
| `appId` | Firebase web-app id. |
| `measurementId` | Analytics measurement id (optional; written as `""` when unset). |
| `SAVE_COLLECTION` | Firestore collection for cloud saves; always `"game_saves"`. Cloud documents live at `game_saves/{uid}`, one document per user (`src/engine/auth.js:121-132`). |

On GitHub Pages both the `verify` and `deploy` jobs regenerate this file from
repository secrets via `python3 tools/write_firebase_config.py`
(`.github/workflows/pages.yml:28-37`, `:68-77`). The Firebase client SDK itself
is loaded from the pinned CDN imports in `index.html:47-49`
(`firebasejs/12.18.0` `firebase-app.js`, `firebase-auth.js`,
`firebase-firestore.js`); no version pinning lives in the config file.

### `manifest.json` (PWA install metadata)

Committed, static, and fully self-contained. Current values
(`manifest.json:1-15`):

```json
{
  "name": "Mythika: Echoes of the Divine",
  "short_name": "Mythika",
  "description": "A 400x720 idle RPG rooted in Indian mythology - cultivate your atman toward Moksha.",
  "start_url": ".",
  "scope": ".",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0a0a1a",
  "theme_color": "#e8a030",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

Top-level keys: `name` / `short_name` (install labels), `start_url` / `scope`
(both `"."` — the repo root is the app), `display: standalone`,
`orientation: portrait`, `background_color` / `theme_color` (also mirrored as
`<meta name="theme-color" content="#e8a030">` in `index.html:10`), and the two
`icons` entries that must match the committed `icon-192.png` / `icon-512.png`
files.

### `sw.js` (service-worker cache manifest)

Not a settings file, but it hard-codes two deploy-relevant constants
(`sw.js:7`, `sw.js:9-114`): cache name `mythika-v11` and the `ASSETS` precache
list (~100 `src/`, `styles/`, icon, and manifest paths, including
`src/engine/firebase-config.js` and `src/scenes/debug.js`). Fetch policy is
fixed in code: `index.html` / `/` are network-first (deploys land
immediately); everything else is cache-first with runtime caching and a
never-rejecting 503 / shell-fallback tail.

## Required vs optional settings

**Required** (cloud-save deploys only):

- The six `FIREBASE_*` secrets listed above. Without them
  `tools/write_firebase_config.py` refuses to write the config file.
- A Firestore database with per-user documents at `game_saves/{userId}`
  secured so users can access only their own save (see `README.md` Firebase
  Setup), plus the email/password, Google, and/or phone sign-in providers
  enabled for the Firebase project (`src/engine/auth.js` implements all three
  flows; `index.html:48` imports them from the Firebase Auth SDK).
- A Chrome, Chromium, or Microsoft Edge binary for `tools/verify_matrix.py`
  (auto-detected from `CHROME_CANDIDATES`, or pinned via `MYTHIKA_CHROME`).
  Without any binary the harness exits `FAIL: no Chrome/Chromium/Edge binary
  found`.

**Optional — the game boots without any of these:**

- `window.FIREBASE_CONFIG` absent or invalid: `index.html:83-97` catches the
  `initializeApp` failure, sets `window.firebaseReady = false` silently in
  production, and only `console.warn`s when `?probe` is in the URL. Offline
  `localStorage` play is unaffected; the Settings screen shows `Not signed in
  — offline mode` (`src/scenes/settings.js:133`).
- `manifest.json` / `sw.js` missing: the game still boots; only installability
  and offline caching degrade. `src/main.js:4-6` skips service-worker
  registration on `file://` URLs.
- `localStorage` unavailable or empty: `SaveSystem.save()` returns `false`,
  `SaveSystem.load()` returns `false`, and audio preferences fall back to
  compiled defaults — none of these throw (`src/systems/save.js:8-27`,
  `:157-192`; `src/engine/audio.js:25-46`).
- Save-envelope validation: `SaveSystem.load()` rejects payloads whose
  `version !== 1` (`src/systems/save.js:162`); `SaveSystem.importFile()`
  additionally requires `data.state` and a non-empty `data.state.party` array,
  reporting `Invalid save file` / `Save missing party data` otherwise
  (`src/systems/save.js:230-233`).

## Defaults

| Setting | Default | Where set |
| --- | --- | --- |
| `measurementId` | `""` | `tools/write_firebase_config.py:42` (`os.environ.get(env_name, "")`) |
| `SAVE_KEY` (localStorage save slot) | `'mythika_save'` | `src/systems/save.js:2` (`SaveSystem.SAVE_KEY`) |
| Save envelope | `{ state, version: 1, timestamp: Date.now() }` | `src/systems/save.js:16-20` |
| `autoSaveInterval` | `30000` ms (30 s) | `src/systems/save.js:3` (`SaveSystem.autoSaveInterval`) |
| `SAVE_COLLECTION` | `"game_saves"` | `src/engine/firebase-config.template.js:18` and generated output |
| Cloud document path | `game_saves/{uid}` | `src/engine/auth.js:121`, `:132` |
| `WELCOME_GOLD` / starting `gold` | `9999` | `src/engine/game.js:184`, `:192` |
| `debugMode` | `false` | `src/engine/game.js:213` (`createDefaultGameState`) |
| `uiFontScale` | `1` (cycles `1` → `1.15` → `1.3`) | `src/scenes/settings.js:88`; applied by `R.applyFontScale` (`src/engine/renderer.js:55-65`) |
| `reduceMotion` | off until user or OS opts in | `G.state.reduceMotion`; checked with `prefers-reduced-motion` by `R.reducedMotion()` (`src/engine/renderer.js:91`) |
| `rmUserSet` / `rmAutoDone` | unset / `false`-ish until set | Settings toggle sets `rmUserSet = true` (`src/scenes/settings.js:106`); the adaptive loop sets `rmAutoDone = true` after two consecutive sub-30fps 5 s windows (`src/engine/game.js:493-498`) |
| `challenge` (adaptive difficulty) | `1.0`, clamped to `0.6`–`1.5` | `src/systems/progression.js:35-40`; healed on load by `SaveSystem.migrate()` (`src/systems/save.js:61-64`) |
| Audio prefs (`mythika_audio`) | `{ mute: false, musicOn: true, sfxOn: true }` | `src/engine/audio.js:2-5` (`Audio` literal); persisted shape is `{ mute, musicOn, sfxOn }` (`src/engine/audio.js:40-44`) |
| Service-worker cache | `'mythika-v11'` | `sw.js:7` |
| Verify `--budget` | `6000` ms virtual time per profile | `tools/verify_matrix.py:382-383` |
| Verify `--fps` | `0` (fps probe disabled) | `tools/verify_matrix.py:385-386`; set `--fps N` for the 12 s real-time `?probe=1` run |
| Verify `--outdir` | `tools/shots/` | `tools/verify_matrix.py:397` |
| PWA colors | `theme_color #e8a030`, `background_color #0a0a1a` | `manifest.json:9-10` |

## Per-environment overrides

There are no `.env.development` / `.env.production` / `.env.test` files and no
`NODE_ENV` conditionals. Overrides work through three mechanisms:

### 1. Local development (file copy + URL flags)

```bash
cp src/engine/firebase-config.template.js src/engine/firebase-config.js
python3 -m http.server 3000
```

Then open `http://localhost:3000` with one of these opt-in flags:

| Flag | Effect | Source |
| --- | --- | --- |
| `?probe` | Enables FPS beacons (`[Mythika] fps=…` every 5 s), script-group timings (`script-group …ms`), resource report (`script-resources=…`), and the Firebase-init warning. No gameplay change. | `src/engine/game.js:320`, `src/engine/game.js:481-485`, `index.html:19`, `index.html:32`, `index.html:93` |
| `?probe&selftest` | Runs the input-chain self-test: synthetic tap through the Forge button plus the equipment-tab blocked-tap check, logging `[Mythika] selftest`, `selftest-final`, and `selftest2` records. Changes scenes — never use for normal play. | `src/engine/game.js:329-391` |
| `?probe&map` | Boots straight into the `travelMap` scene for map-specific FPS measurement. | `src/engine/game.js:394-399` |
| `?debug` | Registers the `debug` scene (`src/main.js:61`), shows its Ashram nav button (`src/scenes/ashram.js:151`), and opens the diagnostics panel path (`src/engine/diagnostics.js:287-290`). Without it the debug scene is unreachable. | `src/main.js:61`, `src/scenes/ashram.js:151` |
| `Ctrl+Shift+D` / `Cmd+Shift+D` | Opens the diagnostics frame panel, but only after diagnostics are enabled via the Settings → Debug Diagnostics toggle (`Diagnostics.toggle`, `G.state.debugMode`). | `src/engine/diagnostics.js:281-302`, `src/scenes/settings.js:201-208` |

Always clear or unregister the service worker before validating changed
scripts, otherwise the cache-first policy serves the stale precache.

### 2. CI and production (GitHub secrets)

`.github/workflows/pages.yml` runs two jobs on `push` to `master` (plus manual
`workflow_dispatch`): `verify` (generate config → install Chrome → boot matrix
with `--budget 6000` and `MYTHIKA_CHROME` set from `setup-chrome`) and
`deploy` (regenerate config → upload repo root as the Pages artifact).
Configure per-environment values in the repository's secret manager under the
seven `FIREBASE_*` names from the table above — no secret values ever live in
the repo.

### 3. Player device (persisted preferences)

Per-player settings live inside the `mythika_save` envelope (`G.state`) or
alongside it, and are edited from the Settings scene rather than files:

- `mythika_save` → `{ state, version: 1, timestamp }`; `state` carries
  `uiFontScale`, `reduceMotion`, `rmUserSet`, `rmAutoDone`, `debugMode`,
  `challenge`, and all progression data. Export/import moves this envelope as
  `mythika-save.json` (`SaveSystem.exportFile` / `SaveSystem.importFile`).
- `mythika_audio` → `{ mute, musicOn, sfxOn }`, managed by
  `Audio.loadPrefs()` at boot and `Audio.savePrefs()` on every toggle
  (`src/engine/audio.js:25-46`).
- Offline progress caps on load: elapsed time is clamped to 8 h (`28800` s),
  and farm/cultivation/prana catch-up only applies after 60 s away
  (`src/systems/save.js:164`, `:174`).
