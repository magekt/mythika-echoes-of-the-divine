<!-- generated-by: gsd-doc-writer -->
# Troubleshooting Mythika

Use this guide when **Mythika: Echoes of the Divine** does not start, input or audio stops working, progress appears missing, cloud sign-in fails, or the installed PWA seems out of date.

## Quick diagnostic checklist

1. Open the game in a current browser with JavaScript enabled.
2. Prefer an HTTP server over opening `index.html` directly:

   ```bash
   npx serve .
   ```

3. Open the browser developer tools and reload the page.
4. Check **Console** for the first error and **Network** for failed `.js`, Firebase CDN, or asset requests.
5. Before clearing site data, use **Settings → Export Save to File** and keep the downloaded `mythika-save.json` somewhere safe.

## The game does not start or shows an inert canvas

The boot path depends on `index.html` loading scripts in order, followed by `src/main.js`. The engine expects the global `G` object and `registerScene()` to exist before booting.

### Symptoms

- The canvas remains on the loading screen.
- The screen is painted, but buttons do nothing.
- The console contains `[Mythika] engine missing, aborting boot` or `[Mythika] no scenes registered, aborting boot`.
- One or more scripts return `404`, `503`, or `net::ERR_FAILED` in the Network panel.

### Fixes

1. Serve the **repository root**, not `src/`, so paths such as `styles/game.css`, `src/engine/game.js`, and `sw.js` resolve correctly.
2. Reload with developer tools open and fix the first failed script request. A missing dependency can prevent a scene from registering even though boot attempts to tolerate missing scenes.
3. If the app was previously installed, use **Settings → Check for Game Updates**. That action clears Cache Storage, asks registered service workers to update, and reloads the page.
4. If Settings is unreachable, use the browser's application/storage tools to unregister the Mythika service worker and clear **Cache Storage**, then reload. Do not clear Local Storage unless a save backup exists.
5. When running from `file://`, expect PWA installation and offline caching to be unavailable. Use a local HTTP server for behavior matching deployment.

A successful boot logs a message beginning with `[Mythika] booted scene=`.

## Buttons, taps, swipes, or scrolling do not respond

Input is attached directly to `#game-canvas`. Pointer coordinates are converted to the game's fixed `400 × 720` logical coordinate system, so incorrect canvas sizing or an overlay can make controls appear unresponsive.

### Fixes

- Tap and release without dragging. Mouse taps are accepted only when movement remains under 10 logical pixels.
- For horizontal navigation, swipe at least 40 logical pixels and keep the gesture predominantly horizontal.
- Avoid extremely rapid tapping. The input queue retains at most four events and ignores taps arriving less than 70 ms apart.
- Close any open modal before trying controls behind it.
- Rotate a phone to portrait orientation. The game scales down in landscape and displays a rotation hint when the viewport is short.
- Reload after resizing, browser zoom changes, or switching display orientation if hit targets remain offset.
- Inspect the page for an unexpected element covering `#game-canvas`. Authentication input overlays should become hidden when their scene is inactive.

### Developer input self-test

Load the game with both diagnostic query parameters:

```text
http://localhost:3000/?probe&selftest
```

Replace the host and port with the local server's address. The test navigates through the real input pipeline and writes `[Mythika] selftest`, `[Mythika] selftest-final`, and `[Mythika] selftest2` records to the console. Do not use this URL for normal play because it changes scenes and injects synthetic input.

## There is no music or sound effect

Browsers block Web Audio until a user gesture. Mythika creates or resumes its `AudioContext` on the first pointer, touch, or keyboard event.

### Fixes

1. Tap or click once inside the game after loading.
2. Open **Settings** and confirm **SFX** and **Music** are both on.
3. Check that the browser tab, device, and operating system are not muted.
4. If the tab was backgrounded, return to it and interact with the canvas so a suspended audio context can resume.
5. Reload the page if the console reports that audio playback was not allowed.

If audio initialization throws an error, the engine disables audio rather than stopping the game; gameplay should continue silently.

## Saves are missing, fail to load, or fail to export

Local progress is stored under the Local Storage key `mythika_save`. The save format currently requires `version: 1`. Autosaving begins when the Ashram scene is entered and runs every 30 seconds.

### Protect progress first

From **Settings**, select **Export Save to File**. A valid export is named `mythika-save.json`. Keep backups before browser cleanup, testing migrations, or switching devices.

### “No save found”

- Confirm the game is running under the same origin as before. `file://`, `http://localhost`, another port, and a deployed domain each have separate browser storage.
- Confirm this is the same browser profile and not a private/incognito window.
- Do not clear cookies/site data or Local Storage before exporting progress.
- If a backup exists, choose **Settings → Import Save from File**.

### “Save failed” or export does nothing

- Check whether storage or downloads are blocked by browser privacy settings.
- Allow downloads initiated by the site, then retry **Export Save to File**.
- Check the console for `Save failed:` or `Export failed:` followed by the underlying browser error.
- Free browser storage if the quota is exhausted.

### Import errors

The importer accepts JSON and validates the save structure:

| Message | Meaning | Action |
| --- | --- | --- |
| `No file chosen` | The file picker was cancelled. | Select the exported JSON file and retry. |
| `Invalid save file` | The file lacks `state`, uses another version, or cannot be hydrated. | Use an unmodified Mythika version 1 export. |
| `Save missing party data` | `state.party` is absent or empty. | Restore a different backup; do not invent party records manually. |
| `Corrupted save file` | The file is not valid JSON or parsing failed. | Re-download or recover an intact backup. |
| `Could not read file` | The browser could not access the selected file. | Copy it to local storage, verify permissions, and retry. |

After a successful import, press **Save Game** to persist the imported state locally.

### Last-resort reset

**Settings → Delete Save** removes only the local `mythika_save` entry after confirmation. This cannot be undone. Export first. If signed in, remember that signing in can subsequently load cloud state into the running game.

## Offline progress looks wrong

When loading a save, elapsed time is clamped to a maximum of 28,800 seconds (8 hours). The “While you were away” notification is shown only when more than 60 seconds have elapsed. Negative elapsed time, such as after moving the device clock backward, is treated as zero.

- Ensure the device date and time are correct before loading.
- Save before closing the tab so the stored timestamp is current.
- Do not expect more than eight hours of cultivation or prana from one offline interval.
- If no notification appears after a short absence, wait more than one minute before testing again.
- Farm processing still runs during load, but its results depend on the saved plot state.

## Sign-in or cloud save does not work

Authentication and cloud saves require Firebase scripts from `gstatic.com`, a valid `window.FIREBASE_CONFIG`, network access, and the relevant sign-in provider being enabled for the Firebase project. Offline play does not require authentication.

### “Auth not initialized” or Firebase initialization failure

- Check the Console for `[Mythika] Firebase init failed:` and inspect the accompanying message.
- Confirm `src/engine/firebase-config.js` loads before the Firebase initialization module.
- For a new environment, copy `src/engine/firebase-config.template.js` to `src/engine/firebase-config.js` and replace every placeholder with that environment's Firebase web-app configuration.
- Confirm the browser can load the Firebase SDK URLs referenced by `index.html`; content blockers, restrictive networks, or offline mode may block them.
- Never paste private credentials into a bug report or commit environment-specific secrets accidentally.

### Email or Google sign-in fails

- Verify the email and password are valid and inspect the on-screen Firebase error.
- Allow pop-ups for Google sign-in.
- Confirm the chosen provider is enabled in the Firebase project and the current host is an authorized domain. <!-- VERIFY: Firebase Authentication providers and authorized domains are configured for the current deployment. -->
- Retry on a normal browser tab if private browsing blocks storage or pop-ups.

### Phone verification fails

Phone sign-in needs reCAPTCHA initialization before sending a code. If the game reports `Recaptcha not initialized`, `RecaptchaVerifier not loaded`, or rejects the code:

- Ensure the Firebase authentication SDK loaded successfully.
- Disable blockers that prevent reCAPTCHA from loading.
- Enter a complete international-format phone number and the latest verification code.
- Request a new code if the previous reCAPTCHA session or code expired.
- Confirm Phone authentication is enabled for the Firebase project. <!-- VERIFY: Phone authentication and its required deployment configuration are enabled. -->

### Cloud progress is unexpected

On successful authentication, `Auth.loadAfterAuth()` loads cloud state and gives it precedence over the current in-memory state for cross-device synchronization. Therefore:

1. Export the local save before signing in on a device with progress you want to preserve.
2. Sign in and inspect the loaded character before saving again.
3. Use **Settings → Save to Cloud** only when the current state is the version you want stored remotely.
4. If cloud save reports an error, keep playing locally and preserve a file export until connectivity or Firebase permissions are fixed. <!-- VERIFY: Firestore rules allow each authenticated user to read and write only their intended cloud-save document. -->

## The installed PWA is stale or offline mode is incomplete

The service worker uses cache `mythika-v9`. The app shell is network-first, while other same-origin assets are cache-first and cached at runtime. A first offline visit cannot retrieve assets that were never successfully cached.

### Fixes

1. Reconnect to the network and load the game once to populate the cache.
2. Choose **Settings → Check for Game Updates** and allow the reload to complete.
3. If old code remains, unregister the service worker and clear Cache Storage in developer tools, then reload online.
4. Check Network responses for `503 Service Unavailable`; this means an uncached non-navigation asset could not be fetched.
5. If a newly added source file is required offline immediately, add it to the `ASSETS` list in `sw.js` and increment the cache name when shipping the change.

Clearing Cache Storage refreshes application assets. Clearing Local Storage also deletes the local save, so treat those actions separately.

## Display is too small, blurry, cropped, or rotated

Mythika renders at `400 × 720` logical pixels and scales the game container down to fit the viewport. It does not scale above 100%.

- Use portrait orientation on phones.
- Reset browser zoom to 100%.
- Leave enough viewport height by hiding oversized browser toolbars where possible.
- On high-density displays, reload after moving the window between monitors so the canvas backing resolution is recreated using the current device pixel ratio.
- If text or animation is difficult to follow, adjust the text-size and reduced-motion options in Settings. The renderer also honors the operating system's `prefers-reduced-motion` preference.

## Performance problems or animation stutter

The game loop uses `requestAnimationFrame`, clamps a single frame step to 50 ms, and automatically enables reduced motion after sustained poor frame rates unless the user has explicitly chosen a preference.

### Fixes

- Close graphics-heavy tabs and disable battery-saving browser modes temporarily.
- Test without browser developer tools recording performance profiles.
- Turn on reduced motion in Settings or in the operating system.
- Reload after the tab has remained suspended for a long period.
- Use the built-in FPS probe by adding `?probe` to the URL. It logs periodic records beginning with `[Mythika] fps`.

For a repeatable test, run the same scene and interaction sequence before and after a change. Do not compare a background tab with a foreground tab because browsers throttle background animation.

## Collecting a useful bug report

Include:

- Browser name and version, operating system, and device type.
- Whether the game was loaded from `file://`, a local HTTP server, an installed PWA, or a hosted site.
- The scene and exact steps that reproduce the problem.
- The first relevant Console error and failed Network request, with secrets and personal data removed.
- Whether the issue still occurs after a reload and after **Check for Game Updates**.
- Whether reduced motion, private browsing, content blockers, or offline mode were active.
- For input or performance issues, the relevant `?probe&selftest` or `?probe` console records.

Do **not** attach `mythika-save.json` publicly without reviewing it first: the file contains the complete game state.
