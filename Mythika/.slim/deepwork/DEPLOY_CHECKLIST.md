# Mythika — Pre-Deploy Gate

Run these in order. **Do not deploy with any box unchecked.** This checklist
exists because two separate launches died silently: once from an unregistered
button, once from a boot that threw before the game loop started.

## 1. Automated guard (must be green)

```bash
cd /Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima
bash Mythika/tools/check_ui_invariants.sh
```

It verifies, from ANY working directory:
- every `src/**/*.js` file passes `node --check` (a real file count is
  printed — a zero-file "pass" fails the gate by design), and
- no raw unanchored spring back-translate (`translate(-bw/2` etc.) exists
  outside `R.withCenteredScale`.

## 2. Boot proof (clean profile, headless or real browser)

1. Serve the tree: `npx serve . -p 3000` from `Mythika/`.
2. Fresh profile (or Incognito) → `http://localhost:3000/`, DevTools Console open.
3. Required console state:
   - [ ] No errors except the benign Firebase placeholder/config warning.
   - [ ] No `safeEnter` / `journeyScene` / `R.* is not defined` ReferenceErrors.
   - [ ] No service-worker `Failed to fetch` unhandled rejections.
4. Required live state (paste in console):
   ```js
   [G._booted, G.state.scene, Object.keys(G.scenes).length, G.frameCount]
   ```
   - [ ] `G._booted === true`, scene is `"title"`, scene count is 25,
         and `G.frameCount` increases between two reads (loop is alive).

## 3. Button proof (the regression that started all this)

1. On the title screen, click/tap the primary button.
   - [ ] Scene changes to `characterCreate` (or `ashram` via Continue).
   - [ ] `G._errStreak` stays `0`/undefined — no loop-killing exception.
2. Visual-vs-hitbox alignment (every button you can see must be tappable
   where it is painted — a spring-scale centering bug once painted buttons
   at 2× while hitboxes stayed put):
   - [ ] Spot-check 3+ screens: screenshot, then tap the visible button
         (not the coordinates you assume) and confirm navigation/action.

## 4. Release hygiene

- [ ] `sw.js` CACHE version bumped if any cached asset changed.
- [ ] `main.js` still boots with any single scene script deleted
      (guarded registration — delete one file locally and re-run §2).
- [ ] Reduce-motion path: reload with emulated `prefers-reduced-motion`
      and confirm no animation-only code throws.
- [ ] Commit the tree (`git add -A && git commit`) so the verified state
      is restorable — uncommitted fixes have been lost to stray checkouts
      during this project.
