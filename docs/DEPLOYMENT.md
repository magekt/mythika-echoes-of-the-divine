<!-- generated-by: gsd-doc-writer -->
# Deployment

Mythika: Echoes of the Divine is a zero-build static site deployed to GitHub Pages. The repository root **is** the deployable artifact — no build step, no bundler, no output directory.

## Deployment Platform

- **Platform:** GitHub Pages (static site hosting)
- **Workflow:** `.github/workflows/pages.yml`
- **Trigger:** Push to `master` branch or manual `workflow_dispatch`
- **Artifact:** Entire repository root (`.`)

## Deployment Pipeline

The deployment uses a two-job workflow in `.github/workflows/pages.yml`:

### Job 1: `verify` (runs on `ubuntu-latest`)

1. **Checkout** — `actions/checkout@v4`
2. **Generate Firebase config** — Runs `python3 tools/write_firebase_config.py` with 7 `FIREBASE_*` repository secrets
3. **Install Chrome** — `browser-actions/setup-chrome@v1` (stable channel)
4. **Boot matrix** — Runs `python3 tools/verify_matrix.py --budget 6000` with `MYTHIKA_CHROME` from Chrome setup and `CI=true`
5. **Upload boot screenshots** — Artifacts saved to `tools/shots/` (always uploaded)

### Job 2: `deploy` (runs on `ubuntu-latest`, needs `verify`, GitHub Pages environment)

1. **Checkout** — `actions/checkout@v4`
2. **Generate Firebase config** — Same as verify job, regenerates config from secrets
3. **Configure Pages** — `actions/configure-pages@v5`
4. **Upload site** — `actions/upload-pages-artifact@v3` with `path: '.'` (entire repo root)
5. **Deploy** — `actions/deploy-pages@v4`

The `deploy` job only runs if `verify` passes. Concurrency group `pages` with `cancel-in-progress: true` ensures only the latest push deploys.

## Required Repository Secrets

Configure these in the repository's secret manager (Settings → Secrets and variables → Actions):

| Secret | Required | Description |
|--------|----------|-------------|
| `FIREBASE_API_KEY` | Yes | Firebase web-app `apiKey` |
| `FIREBASE_AUTH_DOMAIN` | Yes | Firebase web-app `authDomain` |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | Yes | Firebase web-app ID |
| `FIREBASE_MEASUREMENT_ID` | No | Analytics measurement ID (optional; empty string if unset) |

These are injected at deploy time by `tools/write_firebase_config.py` into the gitignored `src/engine/firebase-config.js`. **Never commit this file** — it is listed in `.gitignore:39`.

## Local Deployment Preview

To preview the production build locally (exact same files that deploy):

```bash
# 1. Create local Firebase config (optional — game works offline without it)
cp src/engine/firebase-config.template.js src/engine/firebase-config.js
# Edit src/engine/firebase-config.js with your Firebase project values

# 2. Serve the repo root
python3 -m http.server 3000

# 3. Open http://localhost:3000
```

The game boots identically to production because there is no build step — the served files are exactly what GitHub Pages serves.

## Verification Gates

Before merging to `master`, run the full verification suite locally:

```bash
# 1. Node test suite (unit/contract tests)
node --test tests/*.test.js

# 2. UI invariant gate (syntax, load order, spring patterns)
tools/check_ui_invariants.sh

# 3. Browser boot matrix (requires Chrome/Chromium/Edge)
python3 tools/verify_matrix.py --budget 6000
```

The CI `verify` job runs steps 2 and 3. Step 1 is a developer gate — keep it green locally.

## Service Worker & Caching

- **Service worker:** `sw.js` (cache name: `mythika-v11`)
- **Strategy:** `index.html` and `/` are network-first (deploys land immediately); all other assets are cache-first with runtime caching and a never-rejecting 503/shell fallback
- **Precache list:** ~100 assets in `sw.js:9-114` including all `src/`, `styles/`, icons, manifest, and `src/engine/firebase-config.js`
- **Cache busting:** Increment the cache name in `sw.js:7` (e.g., `mythika-v12`) when deploying breaking changes to cached assets

## PWA Manifest

- **File:** `manifest.json` (committed, static)
- **Config:** Portrait orientation, standalone display, `#e8a030` theme color, `#0a0a1a` background
- **Icons:** `icon-192.png` (192×192), `icon-512.png` (512×512 maskable)

## Rollback

To rollback a deployment:
1. Revert the commit on `master` (or push a revert commit)
2. The workflow will re-run and deploy the previous version
3. Increment `sw.js` cache name if the reverted version has different assets

## Custom Domain (Optional)

If using a custom domain with GitHub Pages:
1. Add a `CNAME` file to the repo root with your domain
2. Configure DNS per GitHub Pages documentation
3. Enable "Enforce HTTPS" in repository Pages settings

The deployment workflow is unchanged — GitHub Pages handles the custom domain automatically.

## Troubleshooting Deployment

| Issue | Resolution |
|-------|------------|
| `verify` job fails on boot matrix | Run `python3 tools/verify_matrix.py --budget 6000` locally with Chrome installed; check `tools/shots/` screenshots |
| Service worker serves stale assets | Increment cache name in `sw.js:7` (e.g., `mythika-v12`) |
| PWA not installable | Verify `manifest.json` and icons are accessible; serve over HTTPS (required for service workers) |

## Security Notes

- No secrets in the repository
- GitHub Pages deployment uses OIDC token (`id-token: write`) for authentication
- Workflow permissions scoped to `contents: read`, `pages: write`, `id-token: write`

<!-- VERIFY: Infrastructure claims about GitHub Pages deployment mechanics require manual verification against the live deployment -->
<!-- VERIFY: Service worker cache version and precache list completeness require manual verification -->
<!-- VERIFY: Firebase secret names and injection workflow require manual verification against repository settings -->