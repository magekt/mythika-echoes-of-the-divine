# Verification Playbook

## Purpose

This playbook ensures every code change to Mythika passes through a standardized verification pipeline before reaching production. It catches syntax errors, runtime failures, boot failures, and layout regressions.

## Pre-Commit Checklist

Every change must pass ALL of these before committing:

### 1. Syntax Check

```bash
node --check src/<file>.js
```

For multi-file changes:

```bash
for f in $(find src -name "*.js"); do node --check "$f" 2>/dev/null || echo "SYNTAX ERROR: $f"; done
```

**Gate:** Zero syntax errors.

### 2. Boot Matrix

```bash
python3 tools/verify_matrix.py --budget 6000
```

Tests 3 profiles: desktop (1280×1400@1x), phone (390×844@3x), phone-landscape (844×390@3x).

**Gate:** All 3 profiles PASS (boot beacon + no uncaught errors + screenshot captured).

### 3. Local Server Check (optional but recommended)

```bash
python3 -m http.server 3000 &
```

Then navigate to the affected scene and verify visually.

## Post-Commit Checks

After pushing, verify:

### 4. CI Status

```bash
gh run list --limit 1
gh run watch <run-id> --exit-status
```

**Gate:** CI passes (verify + deploy).

### 5. Live Deployment

- Wait 2-5 minutes for GitHub Pages build
- Hard refresh (Ctrl+Shift+R) or incognito window
- Navigate to the changed scene
- Check console for errors
- Verify layout matches local screenshots

## Common Failure Patterns

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| "Summoning..." stuck, no boot | Syntax error in a JS file prevents parse | `node --check` all files |
| `R.textRight is not a function` | renderer.js failed to parse (check for `continue` in forEach, missing parens) | Fix syntax, verify renderer loads |
| `ctx is not defined` in buildMenu | Drawing code in a setup function (no ctx param) | Move drawing to render function via button pattern |
| CI fails "no boot beacon" | Same as stuck splash — game doesn't boot | Check syntax first, then check console errors |
| Layout overlap | Fixed elements drawn inside clip area | Verify y-coordinates against CONTENT_TOP boundary |

## Scene Verification Template

When working on a specific scene, use this template:

1. `node --check src/scenes/<scene>.js`
2. `node --check src/engine/renderer.js` (if renderer changes)
3. `python3 tools/verify_matrix.py --budget 6000`
4. Navigate to scene in browser, verify:
   - [ ] No console errors
   - [ ] All interactive elements respond to click/tap
   - [ ] Scroll works (if scrollable scene)
   - [ ] Layout fits within 400×720 viewport
   - [ ] Cards/buttons meet 44px touch target minimum
   - [ ] No content clipped at CONTENT_TOP boundary