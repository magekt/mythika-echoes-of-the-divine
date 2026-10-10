# Technology Stack

**Analysis Date:** 2026-10-08

## Languages

**Primary:**
- JavaScript (ES2020+) - All game logic, scenes, systems, and UI components
- HTML5 - Entry point (index.html) and PWA manifest
- CSS3 - Styling with modern features (CSS variables, env(), dvh, media queries)

**Secondary:**
- None — no TypeScript, no build-time compilation

## Runtime

**Environment:**
- Browser (Canvas 2D API) — single-threaded event loop via `requestAnimationFrame`
- No Node.js runtime for the game itself; Node used only for test runner (`node --test`)

**Package Manager:**
- None — no `package.json`, no `node_modules`, no lockfile
- All dependencies loaded via CDN (Firebase SDK) or bundled as static files

## Frameworks

**Core:**
- None — vanilla JavaScript with immediate-mode Canvas 2D rendering
- Custom scene management (`gScene`, `Fade`), global game object `G`, and render helpers `R`

**Testing:**
- Node.js built-in test runner (`node --test`) — runs `tests/*.test.js`
- Custom shell script `tools/check_ui_invariants.sh` for syntax + UI/script-loading invariants

**Build/Dev:**
- No bundler, no transpiler, no dev server
- Local HTTP server for testing: `python3 -m http.server 3000`
- Service Worker (`sw.js`) for offline caching (PWA)

## Key Dependencies

**Critical (via CDN):**
- Firebase JS SDK 12.18.0 (modular)
  - `firebase-app.js` — initialization
  - `firebase-auth.js` — Email/password, Google, Phone auth
  - `firebase-firestore.js` — Cloud save sync (optional)
- Loaded in a `<script type="module">` block in `index.html:45-104`
- Exposed globally for classic scripts (e.g., `window.firebaseAuth`, `window.firebaseDb`)

**Infrastructure:**
- Service Worker (`sw.js`) — cache-first for assets, network-first for `index.html`
- PWA Manifest (`manifest.json`) — installable, portrait orientation

## Configuration

**Environment:**
- Firebase config injected via `src/engine/firebase-config.js` (gitignored)
- Template at `src/engine/firebase-config.template.js`
- No `.env` files; config is a global `window.FIREBASE_CONFIG` object

**Build:**
- No build step — repository root is the deployable static site
- Deploy by pushing to Firebase Hosting (or any static host)

## Platform Requirements

**Development:**
- Modern browser with ES2020 support, Canvas 2D, Service Worker, localStorage
- Python 3 for local HTTP server
- Node.js 18+ for test runner

**Production:**
- Static hosting (Firebase Hosting, Netlify, Vercel, GitHub Pages, etc.)
- HTTPS required for Service Worker + PWA + Firebase Auth
- Firebase project for optional cloud saves (Blaze plan not required)

---

*Stack analysis: 2026-10-08*