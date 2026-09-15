<!-- generated-by: gsd-doc-writer -->
# Installing Mythika: Echoes of the Divine

Mythika is a static, browser-based game built with vanilla JavaScript and HTML5 Canvas. It does not use a package manager, require dependency installation, or need a build step.

## Prerequisites

To run the game locally, you need:

- Git, to clone the repository
- A modern browser with ES6, Canvas 2D, Web Audio, local storage, and service-worker support; current Chrome, Edge, Firefox, or Safari is recommended
- One of the following local static HTTP servers:
  - Python 3
  - Node.js with `npx` (optional alternative)

Firebase is not required for offline play. An internet connection is needed when using Firebase authentication or cloud-save features because the Firebase SDK is loaded from Google's CDN.

## Install the Project

1. Clone the repository:

   ```bash
   git clone https://github.com/magekt/mythika-echoes-of-the-divine.git
   ```

2. Enter the project directory:

   ```bash
   cd mythika-echoes-of-the-divine
   ```

3. Confirm that the root contains `index.html`, `manifest.json`, `sw.js`, `styles/`, and `src/`.

There is no `npm install`, `pip install`, compilation, or asset-generation command to run.

## Run Locally

### Python 3

From the repository root, start a static server:

```bash
python3 -m http.server 3000
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

### Node.js alternative

If Node.js and npm are available, you can use `serve` without adding it to the project:

```bash
npx serve .
```

Open the local URL printed by `serve`.

### Direct file access

You can open `index.html` directly for basic play. However, pages loaded with a `file://` URL do not register the service worker, so installation and service-worker-backed offline caching are unavailable. Use a local HTTP server for the complete experience.

## First Launch

1. Open the locally served game in a modern browser.
2. If you do not want to use a Firebase account, choose **Continue offline**.
3. Select **New Game**, create a character, and continue to the ashram.
4. Allow audio through a user interaction if the browser initially blocks Web Audio playback.

Offline saves are stored in the browser's local storage. Clearing site data or browser storage can remove them.

## Install as a Progressive Web App

The repository includes `manifest.json`, application icons, and `sw.js` for progressive web app support.

1. Serve the project over `http://localhost` or deploy it over HTTPS.
2. Open the game in a browser that supports PWA installation.
3. Use the browser's **Install app**, **Add to Home Screen**, or equivalent action.
4. Launch Mythika from the installed app icon.

The first online load populates the service-worker cache. Revisit the game after that initial load to verify that cached game assets remain available offline.

## Optional Firebase Features

Firebase Authentication and Firestore cloud saves are optional. The checked-in browser configuration is loaded from `src/engine/firebase-config.js`, while the Firebase browser SDK is requested by `index.html` from Google's CDN.

For ordinary local play, no Firebase setup is required: select **Continue offline**. If maintaining a separate Firebase deployment, replace the browser configuration with values for that Firebase project and configure the authentication providers and Firestore access outside this repository. <!-- VERIFY: Firebase console authentication-provider settings and production Firestore security rules must be confirmed for the target deployment. -->

Do not put private server credentials or service-account keys in browser JavaScript. Firebase web configuration is client-visible by design; access control must be enforced by Firebase Authentication and Firestore Security Rules.

## Verify the Installation

After loading the game, confirm that:

- The title screen renders without uncaught errors in the browser console.
- **New Game** opens character creation.
- Buttons respond to mouse, touch, or keyboard input as expected.
- Reloading the page preserves a locally saved game.
- When served over HTTP, the browser's developer tools show `sw.js` as a registered service worker.

For runtime diagnostics, append `?probe` to the local URL:

```text
http://localhost:3000/?probe
```

Use `?probe&selftest` to additionally run the input-chain self-test:

```text
http://localhost:3000/?probe&selftest
```

## Troubleshooting

### The page loads, but buttons do not work

Open the browser developer console and check for failed script requests. Always run the server from the repository root so paths such as `src/main.js` and `styles/game.css` resolve correctly.

### The service worker is not registered

Do not use a `file://` URL. Start a local HTTP server and open the game through `http://localhost`. For non-local deployments, service workers require HTTPS.

### Port 3000 is already in use

Choose another port:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

### Firebase sign-in or cloud saves fail

Confirm that the browser is online and can load the Firebase SDK URLs referenced by `index.html`. Firebase project settings—including authorized domains, enabled sign-in providers, and Firestore rules—must also permit the requested operation. You can continue playing with local saves by choosing **Continue offline**.

### Changes do not appear after a reload

The service worker uses cached assets. In browser developer tools, update or unregister the service worker and clear the site's cache, then reload. The service worker treats `index.html` as network-first, but other assets use cache-first behavior.

### Audio is silent

Interact with the page before expecting music or sound effects. Browsers commonly suspend Web Audio until a user gesture occurs. Also verify the tab and operating-system volume settings.

## Updating an Existing Checkout

Pull the latest source from the repository branch you use:

```bash
git pull
```

No dependency reinstall or rebuild is necessary. Reload the page; if old assets remain cached, follow the service-worker cache steps in the troubleshooting section.
