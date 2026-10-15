# Technology Stack

**Analysis Date:** 2026-10-15

## Languages

**Primary:**
- JavaScript (ES2020+; classic scripts + one `<script type="module">`) — `index.html`, `src/**`
- HTML5 — `index.html`, PWA manifest wiring via `manifest.json`
- CSS3 — `styles/game.css`

**Secondary:**
- None detected (no TypeScript)

## Runtime

**Environment:**
- Browser runtime using Canvas 2D with `requestAnimationFrame` (game loop)
- Classic global API surface (`G`, `R`, `UI`, `Scene`, `Input`, `Fade`, etc.)

**Package Manager:**
- None (no `package.json`, no lockfile). Static files loaded directly.

## Frameworks

**Core:**
- None (vanilla JavaScript)
- Custom scene/systems framework in `src/engine/*`, `src/scenes/*`, `src/systems/*`, `src/ui/*`

**Testing:**
- Node.js built-in test runner: `node --test` for `tests/*.test.js`

**Build/Dev:**
- No bundler/dev server
- Local server for testing: `python3 -m http.server 3000`
- Service worker / PWA: `sw.js`, `manifest.json`

## Key Dependencies

**Critical (optional, via CDN in `index.html`):**
- Firebase JS SDK 12.18.0 (Auth + Firestore)

**Infrastructure:**
- Service Worker caching: `sw.js` (cache-first)
- Web APIs: localStorage, Service Worker, Canvas 2D

## Configuration

**Environment (client-side only):**
- Firebase config injected by `<script src="src/engine/firebase-config.js">` in `index.html`
- Firebase initialization uses `window.FIREBASE_CONFIG` → `initializeApp(window.FIREBASE_CONFIG)`

**Build config files:**
- None detected for bundling/transpilation (static deploy)

## Platform Requirements

**Development:**
- Modern browser with ES2020+, Service Worker, Canvas 2D, localStorage
- Python 3 (local server) + Node (tests)

**Production:**
- HTTPS required for Service Worker + Firebase Auth
- Static hosting (Firebase Hosting or any static host)

---

*Stack analysis: 2026-10-15*
