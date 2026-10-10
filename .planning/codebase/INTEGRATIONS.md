# External Integrations

**Analysis Date:** 2026-10-08

## APIs & External Services

**Firebase (Google):**
- Authentication — Email/password, Google OAuth, Phone (SMS)
  - SDK: `firebase-auth.js` 12.18.0 (CDN)
  - Auth: `window.firebaseAuth`, `window.firebaseApp` (initialized in `index.html:92-100`)
  - Implemented in `src/engine/auth.js` (`Auth` object)
- Firestore — Cloud save synchronization (optional, opt-in)
  - SDK: `firebase-firestore.js` 12.18.0 (CDN)
  - Client: `window.firebaseDb` (Firestore instance)
  - Collection: `game_saves/{uid}` (document per user)
  - Implemented in `src/engine/auth.js:112-140` (`saveToCloud`, `loadFromCloud`)
  - Triggered from `src/systems/save.js:188-190` (auto-save) and `SaveSystem.cloudSave()`/`cloudLoad()`

## Data Storage

**Local (Primary):**
- `localStorage` — key `mythika_save`
- Format: JSON `{ state: G.state, version: 1, timestamp: number }`
- Managed by `SaveSystem` in `src/systems/save.js`
- Offline-first; works without Firebase

**Cloud (Optional):**
- Firestore — `game_saves/{uid}` document
- Same JSON structure as local save
- Sync is manual (user-initiated) or on first auto-save after sign-in
- Conflict resolution: cloud wins on load (`Auth.loadAfterAuth` merges via `Object.assign`)

**File Storage:**
- Import/Export via `SaveSystem.exportFile()` / `importFile()` (JSON file download/upload)
- No external file storage service

**Caching:**
- Service Worker (`sw.js`) — Cache-first for all static assets (`mythika-v11` cache)
- `index.html` — Network-first with cache fallback
- Runtime caching for any missed assets
- No Redis, Memcached, or CDN-layer caching

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication
- Providers: Email/Password, Google (popup), Phone (SMS with reCAPTCHA)
- Implementation: `src/engine/auth.js` (`Auth` singleton)
- Session persistence: Firebase default (indexedDB)
- No custom auth, no JWT handling in game code

**User Flow:**
1. User signs in via `authScene` (`src/scenes/authScene.js`)
2. `Auth.init()` called from `main.js:105-106` after `firebase-ready` event
3. `onAuthStateChanged` listener sets `Auth.user`
4. On sign-in: `Auth.loadAfterAuth()` fetches cloud save, merges into `G.state`
5. On sign-out: `Auth.user = null`, local save remains

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, LogRocket, etc.)
- Errors caught in game loop watchdog (`src/engine/game.js:349-363`)
- Logged to `console.error` with streak counter
- First 2 errors + every 25th surfaced as toast via `Notify.show()`

**Logs:**
- Console logging with `[Mythika]` prefix
- Probe mode (`?probe`): FPS every 5s, script group timing, resource timing
- Self-test mode (`?probe&selftest`): synthetic input chain verification
- No structured logging, no log aggregation

**Performance:**
- Adaptive Reduce Motion (O4): auto-enables `reduceMotion` after 2 consecutive sub-30fps windows (`game.js:426-441`)
- FPS probe output to console
- No Real User Monitoring (RUM), no Core Web Vitals collection

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting (configured via `firebase.json` — not in repo, managed separately)
- Alternative: any static host

**CI Pipeline:**
- None in repository
- Local verification commands (from AGENTS.md):
  - `node --test tests/*.test.js`
  - `tools/check_ui_invariants.sh`
  - `python3 tools/verify_matrix.py --budget 6000` (browser matrix, opt-in)

**Service Worker Updates:**
- Versioned cache name (`mythika-v11` in `sw.js:7`)
- New version activates on next visit (`skipWaiting` + `clients.claim`)
- Must clear/unregister SW before validating changed scripts

## Environment Configuration

**Required env vars (Firebase config):**
- `window.FIREBASE_CONFIG` — injected by `src/engine/firebase-config.js`
- Fields: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId` (optional)

**Secrets location:**
- `src/engine/firebase-config.js` — gitignored, created from template
- Template: `src/engine/firebase-config.template.js`
- Never committed; generated via repository secret workflow

## Webhooks & Callbacks

**Incoming:**
- None — no webhook endpoints

**Outgoing:**
- None — no outbound webhooks
- Firebase Auth triggers (onCreate, onDelete) not used
- Firestore triggers not used

---

*Integration audit: 2026-10-08*