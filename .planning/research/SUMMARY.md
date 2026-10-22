# Research Summary — v13.0 Screen-by-Scene Audit & Firebase Removal

## Stack additions / removals
- **Remove:** Firebase SDK CDN imports (`firebase-app`, `firebase-auth`, `firebase-firestore` v12.18.0) from `index.html`; `src/engine/firebase-config.js` (gitignored, generated from secrets); `src/engine/firebase-config.template.js`; Firebase config generation in `.github/` deploy workflows + `FIREBASE_*` secrets.
- **Keep:** vanilla JS, immediate-mode Canvas, localStorage/PWA persistence (already the offline default).
- **No new dependencies** required; removal is a net stack reduction.

## Features
- Scene-by-scene audit: check each Scene for outdated details starting with version numbers, update every stale detail, verify one-by-one.
- Firebase removal: eliminate auth UI (`authScene.js`), Firebase auth integration (`auth.js`), Firebase globals (`window.firebase*`), and the `firebase-ready` event contract; ensure game boots and saves via localStorage without Firebase.
- Preserve: all gameplay systems, save-compatible world state, no new zones/element types.

## Architecture
- Existing: vanilla ES6 script-order globals in `index.html`, `src/main.js` registers scenes + boot, `src/engine/game.js` owns `G`/rAF/`gScene`; `SaveSystem` owns persistence/migration in `src/systems/save.js`.
- Firebase integration points: `index.html` module script initializes app/auth/db and exposes `window.firebase*` globals for `auth.js`; `authScene.js` is the sign-in UI; `firebase-ready` event signals readiness.
- Removal must not break script-order dependencies or any consumer that gates on `window.firebaseReady`/`firebase-auth`.

## Pitfalls
- Code may gate on `window.firebaseReady` or `firebase-auth` — audit all consumers before removal; degrade gracefully (offline/local path) rather than hard-fail.
- `authScene.js` sign-in UI removal leaves a navigation hole — replace or remove the route entry in `navigation_routes.js`/`scene.js`.
- `.github/` workflows reference `FIREBASE_*` secrets and `tools/write_firebase_config.py` — remove or disable those steps; ensure deploy doesn't fail without Firebase config.
- `sw.js` precaches `src/engine/firebase-config.js` — remove from precache list to avoid caching a deleted file.
- `firebase-config.js` is gitignored and never committed; the template and docs still reference it — update docs/INSTALL/DEPLOYMENT/CONFIGURATION to drop Firebase setup instructions.
- Save compatibility: Firebase cloud-save is optional; localStorage is canonical — removal must not affect existing local saves.

## Recommendation
Proceed to requirements directly. The effort is removal + audit (no new domain to research), so inline research suffices.
