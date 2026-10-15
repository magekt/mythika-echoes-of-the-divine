# External Integrations

**Analysis Date:** 2026-10-15

## APIs & External Services

**Firebase (Google) — critical but optional**
- Auth (Email/password, Google OAuth, Phone/SMS)
  - SDK: `firebase-auth.js` (CDN, version 12.18.0)
  - Wired in: `index.html` imports Firebase modules via `https://www.gstatic.com/firebasejs/12.18.0/*`
  - Runtime objects exposed globally for classic scripts: `window.firebaseAuth`, `window.firebaseApp`, `window.firebaseSignOut`, etc.
  - Implementation: `src/engine/auth.js` (`Auth` object) + cloud hooks (`Auth.loadAfterAuth`)
- Firestore (cloud save sync) — optional
  - SDK: `firebase-firestore.js` (CDN, version 12.18.0)
  - Wired in: `index.html` imports Firestore modules; initialized in `Auth.init()`
  - Config: `src/engine/firebase-config.js` (gitignored) provides `window.FIREBASE_CONFIG` + `SAVE_COLLECTION`
  - Storage layout: collection `game_saves/{uid}`
  - Implementation touchpoints: `src/engine/auth.js` + `src/systems/save.js`
  - Default behavior: localStorage-first; cloud sync occurs after auth events

## Data Storage

**Local (primary)**
- `localStorage` key: `mythika_save`
- Implementation: `src/systems/save.js` (`SaveSystem.save`, `SaveSystem.hydrate`, migration, export/import)

**Cloud (optional)**
- Firestore documents store `{ state, version, timestamp }`
- Conflict handling (observed): `Object.assign` merge on load (`Auth.loadAfterAuth`)

## Authentication & Identity
- Provider: Firebase Auth
- Session model: `onAuthStateChanged` listener inside `src/engine/auth.js`
- Sign-in surfaces: `src/scenes/authScene.js` (auth UI/flow)
- No custom JWT/auth server detected

## Monitoring & Observability
- Error handling: console + in-game toasts from `src/engine/game.js`
- No external error tracking (no Sentry/Datadog/etc.) detected

## CI/CD & Deployment
- No repository CI config detected in code examined
- Deployment assumes static host + HTTPS

## Webhooks & Callbacks
- None detected (no inbound webhooks)

## Integration Health Notes
- `src/engine/firebase-config.js` contains real values and is explicitly not committed (generated during verification/deployment)
- `sw.js` caches Firebase config/auth scripts (precache includes `src/engine/firebase-config.js`)

---

*Integration audit: 2026-10-15*
