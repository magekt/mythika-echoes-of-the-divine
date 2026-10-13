# Mythika — Performance & Loading Architecture

Research on loading architecture for a zero-build, mobile-first Canvas 2D RPG with 100 classic `<script>` tags.
Researched: 2026-10-13

## Codebase Baseline

| Group | Files | Bytes | Notes |
|-------|-------|-------|-------|
| engine | 15 | ~154 KB | G, Input, Auth, R (renderer) |
| data | 21 | ~154 KB | declarative |
| systems | 26 | ~221 KB | economy, combat, save, etc. |
| ui | 10 | ~78 KB | button, feedback, modal, etc. |
| scenes | 27 | ~382 KB | combatScene, party, travelMap |
| main.js | 1 | ~7 KB | boot + scene registration |
| **Total** | **104** | **~1.0 MB** | 100 `<script src>` tags |

Top files by size:
- `combatScene.js` 58 KB
- `bond.js` 52 KB
- `party.js` 39 KB
- `combat.js` 32 KB
- `travelMap.js` 31 KB
- `renderer.js` 28 KB
- `button.js` 27 KB
- `game.js` 24 KB

All served via service worker `mythika-v11` with cache-first strategy for assets; `index.html` is network-first.

---

## Q1: Loading Progress Bar for 100 Classic Scripts

### Findings

**Classic `<script>` tags fire `load` and `error` events — not `progress` events.**
You cannot get byte-level progress of individual files. What you can do:

1. **Count-based progress** — Attach `onload` / `onerror` handlers to each `<script>` element and count how many have finished. With 100 files, the progress goes 0%, 1%, 2%, … 100% in coarse steps.
2. **Weighted progress** — Group files by size and weight each file's completion by its byte size. This makes the bar feel smoother (bigger files contribute more to the percent). The sw.js precache manifest already lists all assets; you can derive a weight table from file sizes at build time or use a static table.
3. **XHR/Fetch-based loading** — Replace `<script>` tags with `fetch()` + `eval()` or `new Function()` to get actual `progress` events. This is the only way to get byte-level accuracy, but it breaks the synchronous execution order guarantee and is fragile with classic globals. **Not recommended** for this codebase.

### Recommended Approach

Use **count-based tracking with a simple counter**:

```js
// Injected in index.html before the first <script src>:
window.__scriptLoad = { total: 100, loaded: 0 };
function trackScriptLoad(el) {
  el.addEventListener('load', () => {
    window.__scriptLoad.loaded++;
    updateLoadingBar();
  });
  el.addEventListener('error', () => {
    // mark as failed but still increment to unblock
    window.__scriptLoad.loaded++;
    updateLoadingBar();
  });
}
function updateLoadingBar() {
  const bar = document.getElementById('load-progress');
  const pct = Math.round((window.__scriptLoad.loaded / window.__scriptLoad.total) * 100);
  if (bar) bar.style.width = pct + '%';
}
```

For a more accurate-feeling bar, use **weighted by byte size**:

```js
// Pre-computed weight table (relative sizes from sw.js manifest):
const WEIGHTS = {
  'combatScene.js': 58, 'bond.js': 52, 'party.js': 39,
  'combat.js': 32, 'travelMap.js': 31, 'renderer.js': 28,
  // all other files: 1
};
let completed = 0, totalWeight = 0;
for (const [k, v] of Object.entries(WEIGHTS)) totalWeight += v;
// For each <script src>:
function onScriptDone(src) {
  const w = WEIGHTS[src.split('/').pop()] || 1;
  completed += w;
  updateLoadingBar(Math.round((completed / totalWeight) * 100));
}
```

**Key detail:** The `loading` CSS class removal at `G.frameCount === 1` (game.js:474) is the right gate — by then all 100 scripts have been parsed and the rAF loop is running. The progress bar should be removed alongside the `loading` class.

### Risks
- Count-based: bar jumps in ~1% steps on fast connections (cached from SW), which is fine.
- Weighted: requires maintaining a weight table when files are added/removed. Can be auto-generated from `sw.js`'s `ASSETS` list.
- If a script fails to load, the progress bar stalls at < 100%. Mitigation: increment on `error` too (as above), so the bar still reaches 100% and the user sees the failBoot message.

---

## Q2: Blocking User Input Until "Ready"

### Findings

The game's input system is **event-driven, not poll-based**:
- `mousedown` / `mouseup` / `touchstart` / `touchend` handlers in `input.js` are attached to the canvas
- `keydown` / `keyup` handlers are attached to `document`
- Events are queued (`Input.clicks`, `Input.touches`) and consumed by `UI.consume()` / `UI.getPress()` each frame in `gLoopFrame`

The rAF loop starts when `main.js` runs, which is **after all 100 scripts have been parsed**. So during the synchronous script loading phase, **no event handlers are registered yet** — user input is naturally ignored.

The window of risk is **between the first rAF frame and the first scene render**, or if a user interacts with the canvas before `initInput()` runs (it's called at module top-level in `input.js` and runs when that script is parsed).

In practice, the canvas is covered by the `#game-container.loading` overlay (CSS `::after` with text "Summoning the realms..."). This overlay has `pointer-events` default, which would block clicks to the canvas beneath it. However, key events still propagate to the document.

### Recommended Approach

Add a **ready-state guard** that blocks input consumption until the game confirms it's ready. The cleanest place is `UI.consume()` / `Input._consumeTap()`:

```js
// In input.js, add a gate:
Input._ready = false;
Input.markReady = function() { this._ready = true; };
```

Then in `UI.consume()` and `UI.getPress()`, early-return `null` when `!Input._ready`.

Call `Input.markReady()` from `main.js` after scene registration succeeds (after the `registerScene` loop, before the rAF loop starts). This way:
- No `defer` or `async` needed
- Global event listener architecture is untouched
- The only change is a boolean flag checked at the consumer side

**For keyboard specifically**, you can also add `e.preventDefault()` in the document-level keydown handler when `!Input._ready`:

```js
document.addEventListener('keydown', e => {
  if (!Input._ready) { e.preventDefault(); return; }
  Input.keys[e.key] = true;
}, true);
```

### Risks
- If `main.js` fails to boot (missing globals), `Input._ready` never gets set → input stays blocked forever. Mitigation: set `Input._ready = true` in the `failBoot` path too, or use a timeout fallback.
- Over-blocking: if you block keydown globally, legitimate system shortcuts (F5, Ctrl+R) are also blocked. Use `e.target === document.body` check to only block when the canvas/game area has focus.

---

## Q3: Preloading & Critical-Script Optimization

### Findings

The browser already handles these automatically to some degree:
- The preload scanner sees all 100 `<script src>` tags during HTML parsing and begins fetching them in parallel (up to 6 per origin).
- The service worker precache (`sw.js`) means **returning visitors load all 100 files from cache** — no network latency, the only cost is JavaScript parse+evaluate time.

For **first-time visitors**, the bottleneck is:
1. `index.html` download
2. CSS download (render-blocking, ~80 lines of CSS)
3. 100 JS file downloads in parallel (6 concurrent per connection on HTTP/1.1; all parallel on HTTP/2+)
4. Firebase module script in `<head>` (3 imports: firebase-app.js, firebase-auth.js, firebase-firestore.js)

### Recommendations

**Preconnect to Firebase CDN** (saves ~50–100ms on first visit):

```html
<link rel="preconnect" href="https://www.gstatic.com" crossorigin>
```

**Preconnect to your own domain is automatic** (same-origin), so no action needed there.

**For the Firebase SDK**, the module script in `<head>` is render-blocking because it's a `<script type="module">` with `import` statements. The `import` creates a dependency chain. The three Firebase files are loaded in parallel by the module resolution algorithm. You can preload them to start fetching before the module script is parsed:

```html
<link rel="preload" href="https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js" as="script">
<link rel="preload" href="https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js" as="script">
<link rel="preload" href="https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js" as="script">
```

However, per web.dev guidance: **use preload sparingly**. The browser's module resolution already discovers these imports from the module script tag. The benefit is marginal unless the module script is late in the document. Since it's in `<head>`, the imports are discovered early. **Skip the preloads for Firebase unless profiling shows a benefit.**

**For the 100 classic scripts**, preloading individual files is counterproductive. The browser's preload scanner handles it. The real optimization is the **service worker precache**, which already works for returning visitors.

**Critical script optimization:** The first render depends on `game.js` (G object, rAF loop) and `viewport.js` (canvas sizing). These are loaded early in the script chain (engine group, position 3–4 out of 100). There's no way to preload just these two without changing the loading architecture.

**What would actually help most for first-time visitors:**
- **Gzip/Brotli compression** — 1 MB of un-minified JS compresses to ~250–300 KB with Brotli. This is the single biggest win for first-time visitors on slow connections. No build step required: configure your host (Firebase Hosting, GitHub Pages, nginx) to serve Brotli.
- **Enable HTTP/2** on your hosting platform — all 100 JS requests are served in parallel rather than 6-per-connection. Firebase Hosting, GitHub Pages, and Netlify all support HTTP/2 by default.

### Risks
- Preloading too many resources competes for bandwidth. With 100+ requests, additional preloads can slow down the critical path. **Do not preload the 100 individual script files.**
- Preconnects to origins the user doesn't use for a while are wasted. Preconnect only to Firebase (used on every page load).

---

## Q4: Code Splitting & Minification Without a Build Step

### Findings

**Minification without a build step is impossible for classic scripts** — you'd need to preprocess 100 files. However:

**Option A: Manual minification (one-off, maintained manually)**
Run each file through `terser` locally and commit the minified versions. Problem: you need to maintain 100 minified files alongside 100 source files. The repo's test infrastructure (`node --test`, `check_ui_invariants.sh`) expects source files, not minified ones. This is high-maintenance.

**Option B: Build step (recommending against)**
The project explicitly has "no package.json, no build step, no bundler." Introducing a build step changes the development workflow, deploys, and testing. The AGENTS.md treats this as a constraint, not an option.

**Option C: Compression at the hosting layer (recommended)**
Don't minify the source. Configure the hosting platform to compress responses:
- **Firebase Hosting:** `firebase.json` → `"headers"` with `Content-Encoding: br` or enable automatic Brotli/Gzip in the hosting settings.
- **GitHub Pages / Netlify:** enable Gzip/Brotli compression in the hosting config.
- **Custom hosting:** configure nginx/apache to compress `.js` files.

This saves ~60–70% of transfer size on first-time visitors with **zero source code changes**.

**Option D: Script bundling (group-level)**
Bundle the 21 `data/` files into one file (they're pure literals, ~154 KB unminified). Bundle the 10 `ui/` files into one file. This reduces request count from 100 to ~70. But:
- Reduces granularity — a single data file error kills all 21 data definitions
- Makes the service worker precache list harder to maintain (reduced file count is easier to manage, actually)
- The browser parallel-loading makes 100 requests cheap on HTTP/2

**My assessment: Do not bundle.** The main cost is transfer size (solved by compression) and request count (solved by HTTP/2). Bundling adds maintenance burden and fragility.

### Code Splitting

Code splitting doesn't apply well here because **all 100 files are required for the game to boot**. There's no "lazy-load scene X when needed" pattern in the current architecture. The only candidate for lazy-loading would be:
- Individual scenes (combatScene, party, travelMap are 30–58 KB each)
- But the scene registration system requires all scenes to be registered before the rAF loop starts

A **real code-splitting approach** would require:
1. Loading only engine + data + systems + UI + main.js at boot (~60 files, ~830 KB)
2. Defining scenes as lazy classes that load on demand
3. Changing the scene registration to support async loading
4. Adding a loading overlay between scene transitions

This is a **significant architectural change** and not justified at 1 MB total. The service worker precache makes the second and all subsequent visits instant.

### Recommendation
**Do not add a build step.** The 1 MB of source is acceptable for a static game that:
- Is cached entirely in the service worker after first visit
- Serves all subsequent visits from cache (0 network bytes)
- Compresses to ~300 KB on first-visit (with Brotli)

If you must reduce first-visit size: configure Brotli on the hosting platform.

---

## Q5: Risks of Changing Script Loading Order

### Findings

The dependency chain in `index.html` is **load-bearing**. The comment at line 16 says:
> "Classic script tags below execute before the Firebase module resolves."

And the AGENTS.md contract:
> "Script order and classic globals are runtime contracts; do not casually add `defer`, `async`, modules, or reorder files."

**Known dependency chains:**

1. **engine group must load before systems/scenes/ui:**
   - `game.js` defines `G` (game state, rAF loop) — required by everything
   - `viewport.js` sets `G.W`, `G.H`, canvas — required by `game.js` init
   - `scene.js` defines `Scene`, `registerScene` — required by `main.js`
   - `input.js` defines `Input` — required by UI, scenes, systems
   - `renderer.js` defines `R` (color palette, fonts, draw helpers) — required by everything
   - `auth.js` defines `Auth` — required by scenes, main.js
   - `audio.js` defines `Audio` — required by systems, scenes

2. **data group loads before systems group:**
   - `heroes.js`, `enemies.js`, `zones.js`, `items.js` etc. define data arrays
   - `systems/progression.js` reads `HEROES`, `ENEMIES`, `ZONES` arrays
   - `systems/combat.js` reads `ENEMIES`, `ITEMS` arrays
   - `systems/save.js` references data structures

3. **systems group loads before scenes group:**
   - Scenes call `Combat.init()`, `SaveSystem.load()`, `Progression.applyLevelUp()`, etc.
   - Scenes read `UI.Button`, `UI.Modal`, `UI.Feedback`
   - Scenes call `gScene('sceneName')` (defined in `navigation.js`)

4. **main.js loads last:**
   - Registers all scenes (reads `titleScene`, `combatScene`, `partyScene`, etc.)
   - Starts the rAF loop
   - Registers service worker

5. **Firebase bridge in `<head>`:**
   - The module script exposes `onAuthStateChanged`, `signInWithEmailAndPassword`, `getFirestore`, `doc`, `setDoc`, `getDoc`, `serverTimestamp` as globals
   - `auth.js` consumes these globals at call time (not at parse time)
   - The module script fires `document.dispatchEvent(new Event('firebase-ready'))` on success
   - `main.js` listens for `firebase-ready` before calling `Auth.init()`

### What Breaks if You Reorder

| Change | What Breaks |
|--------|-------------|
| Move `data/` before `engine/` | `game.js` / `renderer.js` may reference data constants |
| Move `systems/` before `data/` | `systems/combat.js` reads `ENEMIES`, `ITEMS` at top-level or in init functions called during parse |
| Move `ui/` before `systems/` | `systems/` may call `UI.Button` or `UI.Modal` during parse |
| Move `scenes/` before `ui/` or `systems/` | Scenes reference `UI`, `Combat`, `SaveSystem` |
| Add `defer` to any script | `defer` defers execution until DOM parse complete, but maintains order among deferred scripts; classic globals would still be available, but the load order relative to inline scripts changes |
| Add `async` to any script | Execution order becomes non-deterministic. `async` scripts execute as soon as downloaded, in no guaranteed order. **This would break the dependency chain.** |
| Convert to ES modules | Module scripts are deferred by default; import order is guaranteed by the module graph, but the 100-file chain would need explicit `import` statements throughout. Also, ES modules don't expose globals to other classic scripts. |
| Move Firebase module to end of body | The `firebase-ready` event would fire after script execution; `main.js`'s `document.addEventListener('firebase-ready')` listener would still work, but the classic `auth.js` would reference the bridge globals before they're set (it only uses them at call time, not parse time, so this would likely be fine but needs verification) |

### Safest Refactoring Order

If you must change loading strategy:

1. **Add compression (Brotli) at the hosting layer** — zero source changes, no risk
2. **Add `<link rel="preconnect">` to Firebase CDN** — one line, no risk
3. **Add progress bar** — pure addition to the `loading` overlay, no risk
4. **Add input ready-state guard** — pure addition to `Input` object, no risk
5. **If you want to reduce first-visit payload**, consider inlining the data group (21 files, ~154 KB) into a single inline `<script>` block. This reduces 21 network requests. All data files are pure literals — they don't reference each other and don't reference any engine globals. **This is the only safe structural change.**
6. **Do not** add `defer`, `async`, modules, or reorder groups without a full dependency audit

---

## Existing Patterns in the Codebase

### What Helps

1. **`window.__mythikaProbeGroup`** — already instrumented for per-group timing. Extend this pattern for per-script load tracking (add `onload` listeners to each script element in `index.html`).
2. **`G.frameCount === 1` as "first rendered frame" gate** — already the signal for removing the loading overlay. The progress bar removal should piggyback on this.
3. **Service worker precache** — already caches all 100 assets. First-time visitors pay the full cost; returning visitors load from cache instantly.
4. **`R.reducedMotion()`** — CSS loading animation already respects reduced-motion preferences.
5. **`document.dispatchEvent(new Event('firebase-ready'))`** — clean event-based decoupling. The `main.js` listener pattern is already in place.
6. **`failBoot()` in main.js** — graceful error handling when globals are missing. The progress bar should call this on script errors.

### What Gets in the Way

1. **No per-file load tracking** — the 100 `<script>` tags are bare, no `onload` attributes. Adding `onload` handlers requires either inline `onload` attributes on each tag (verbose) or a loop in `index.html` that wraps all script elements with listeners.
2. **Synchronous execution model** — the global-namespace pattern means scripts execute in order. There's no way to know which file "failed" without checking each global individually (which `main.js` already does with its `required` array).
3. **Firebase module in `<head>`** — a module script with 3 imports that blocks until all three resolve. It's in `<head>`, so it delays the start of the 100 classic script downloads. **Consider moving the Firebase module to just before the closing `</body>` tag.** The bridge globals (`onAuthStateChanged`, etc.) are consumed by `auth.js` at **call time**, not parse time. The `firebase-ready` event listener in `main.js` handles the async gap. The only risk: `auth.js`'s top-level `init` function references `onAuthStateChanged` by name — but it's a function body reference, so it's resolved when called, not when parsed.

Actually, wait — let me re-check. `auth.js` line 16: `onAuthStateChanged(this.auth, function(user) {...})`. This is inside `Auth.init()`. So it's resolved at call time. The module script can be moved to end of body **without breaking `auth.js`**.

But the `index.html` comment says "Classic script tags below execute before the Firebase module resolves." This is a statement of fact, not a constraint — the classic tags execute when the parser reaches them, which is before the async module resolution. The Firebase module's `initializeApp` call and `firebase-ready` dispatch happen asynchronously. Moving the module to end of body would change when it starts resolving, but the `main.js` listener still works.

**This is a safe optimization for first-time visitors.**

4. **No lazy loading of scenes** — all 27 scenes (~382 KB) load at boot even if the player only visits 5–6 of them. This is the largest source of first-visit waste. But implementing lazy scene loading requires architectural changes to the scene registration system.

---

## Prioritized Recommendations

### Phase 1: Zero-Risk Wins (do these first)

**P1.1 — Enable Brotli/Gzip compression on the hosting platform**
- No source code changes
- Saves ~60–70% of first-visit transfer size
- Firebase Hosting: `firebase.json` → add `"headers"` or enable `GZIP` / `BROTLI` in the hosting config
- GitHub Pages / Netlify: enable compression in their respective settings
- **Depends on: nothing**

**P1.2 — Add `<link rel="preconnect">` to Firebase CDN**
- One line in `<head>`, no source changes
- Saves 1–2 round-trips on first-visit Firebase load
- **Depends on: nothing**

**P1.3 — Move Firebase module script to end of `<body>`**
- Reduces head-parse time by removing 3 imports from the critical path
- `auth.js` and `main.js` use event-based decoupling, so the order change is safe
- **Depends on: P1.2 (preconnect still needed)**
- **Verify:** confirm `auth.js` top-level code doesn't reference Firebase globals at parse time (checked: it doesn't — only inside functions)

### Phase 2: Progress Bar (Pure Addition)

**P2.1 — Add a progress bar to the loading overlay**
- Add a `<div id="load-progress">` element to the loading overlay in `index.html`
- Add CSS: a thin bar at the bottom of the loading overlay, fill animation
- Add JS: loop over all `<script>` elements in `index.html`, attach `onload` / `onerror` handlers
- Update bar width on each load event
- Remove bar when `G.frameCount === 1` (existing gate) or when `failBoot` is called
- **Depends on: nothing (pure addition)**

**P2.2 — Block input during load**
- Add `Input._ready = false` to `Input` object in `input.js`
- In `UI.consume()` / `UI.getPress()`, early-return when `!Input._ready`
- Add `e.preventDefault()` guard to document-level keydown when `!Input._ready`
- Call `Input.markReady()` in `main.js` after scene registration succeeds
- Also call `Input.markReady()` in `failBoot` so the user can at least see the error
- **Depends on: P2.1 (progress bar should show before input is unblocked)**

### Phase 3: Structural Optimizations (Lower Priority)

**P3.1 — Inline the data group (21 files, ~154 KB)**
- Concatenate all 21 data files into a single inline `<script>` block in `index.html`
- Reduces 21 network requests to 0
- Data files are pure literals — no dependencies, no side effects
- **Depends on: nothing, but must maintain the concatenation (one-off task, no build step needed — just a shell script that runs locally before commit)**
- **Risk:** if the inline block is wrong, all data is missing. Use `node --check` to validate.

**P3.2 — Lazy-load individual scenes (Architectural Change)**
- Requires: changing scene registration to support async loading
- Adds loading overlay between scene transitions
- Saves ~200 KB of scene code on first-visit for unused scenes
- **Depends on: P2.1 (loading overlay infrastructure)**
- **Complexity: High — do only if first-visit size is a problem**

### Phase 4: What NOT to Do

- **Do not add `defer` or `async` to any script** — breaks the global-namespace dependency chain
- **Do not convert to ES modules** — would require importing every global into every file
- **Do not add a build step** — the project explicitly forbids it
- **Do not preload individual script files** — the browser's preload scanner handles this

---

## Summary Table

| Recommendation | Effort | Risk | Impact | Phase |
|---|---|---|---|---|
| Enable Brotli compression | Low | None | High (first-visit) | 1 |
| Preconnect to Firebase CDN | Low | None | Medium (first-visit) | 1 |
| Move Firebase module to end of body | Low | Low | Medium (first-visit) | 1 |
| Add progress bar | Medium | Low | UX | 2 |
| Block input during load | Low | Low | UX | 2 |
| Inline data files | Medium | Low | Medium (first-visit) | 3 |
| Lazy-load scenes | High | High | High (first-visit) | 4 |
