# Mythika: Echoes of the Divine

A 400x720 HTML5 Canvas idle RPG rooted in Indian mythology — cultivate your atman,
beast-companion in tow, through five zones toward Moksha. No frameworks, no build step.

**Play:** serve the folder with any static server and open `index.html`.

```bash
cd Mythika
python3 -m http.server 8931
# open http://localhost:8931
```

Deploys to Netlify as-is (`netlify.toml` publishes the repo root).

---

## Architecture

```
src/
├── main.js              scene registration (23 scenes)
├── engine/
│   ├── game.js          G state literal, gLoop (update → clearRect → render),
│   │                    gScene/Fade (both clear stale input), Notify toasts, fitGame()
│   ├── scene.js         Scene.create({ name, data, enter, update, render })
│   ├── scene-helpers.js shared scene patterns (see Conventions below)
│   ├── input.js         taps fire on release (10px dead-zone), touch drag-scrolls,
│   │                    swipes, long-press; Input.clear() runs on every scene change
│   ├── renderer.js      R.* draw helpers, pixel font, sprites, effects
│   └── audio.js         Web Audio oscillator SFX + music (no audio files)
├── ui/                  button, panel, progressBar, text, list, tabbar, modal, card
├── data/                heroes, enemies (+18 abilities), zones, items (rarity loot),
│                        classes, perks, auras, cultivation, alchemy recipes,
│                        spirit beasts (+2-stage evolutions), quests (+chains), achievements
├── systems/             economy, progression (adaptive difficulty), combat, cultivation,
│                        alchemy, save (+migration), quest, achievements
└── scenes/              23 scenes following the Scene contract
```

The canvas backs at `devicePixelRatio` resolution (capped 3x) while all game code uses
400x720 logical coordinates — text and edges stay crisp on phones. `fitGame()` scales
the container to letterbox any viewport; input maps taps through the scaled rect.

The game loop order matters: `update()` may rebuild UI (`build*()` functions), then the
canvas is cleared, then `render()` draws. **Never draw text directly to `G.ctx` outside
`render()`** — it will be wiped before it is ever seen.

## Code Conventions

### Static panels & headers
Build functions record draws into `data.staticDraws`; `render()` plays them back inside
the scroll clip/translate so they scroll with content:

```js
buildList: function() {
  this.data.staticDraws = [];
  const SD = this.data.staticDraws;
  SD.push({ text: ['Quest Log', 18, y, R.colors.gold, R.fonts.sm] });
  SD.push({ rect: [10, y, G.W - 20, 70, 6, R.colors.panel],
            stroke: [11, y + 1, G.W - 22, 68, R.colors.orange] });
}
// in render(), inside clip + translate(0, -scrollY):
Scene.drawStatic(ctx, this.data.staticDraws);
```

Entry shapes: `{ text: [str, x, y, color, font] }`, `{ textCenter: [...] }`,
`{ rect: [x,y,w,h,r,fill], stroke?: [x,y,w,h,color], lw?: n }`.

### Scrolling
Scenes own `data.scrollY`, `data.contentHeight` and a `clampScroll()`; the shared blocks
are factored out:

```js
update: function(dt) { Scene.scrollInput(this); ... }
// top of the content section in render():
Scene.clipContent(ctx, this);   // save + clip + translate; caller ctx.restore()s after
// end of render():
Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
```

### Headers & chrome
Every scene's top panel is one call (bg + hairline border + centered gold title);
scene-specific sub-lines follow it in `render()`:

```js
Scene.drawHeader(ctx, 62, 'Quest Log');   // height, title, optional titleY (default 22)
```

Long button lists must cull to the viewport (buttons keep build-time y):

```js
for (const b of Scene.cullButtons(this.data.buttons, this.data.scrollY, this.getContentHeight())) b.render(ctx);
```

### Shared buttons & economy guards
```js
this.data.buttons.push(Scene.backButton(y, { fade: true }));  // opts: label/target/fade
if (Economy.spendGoldOrNotify(cost)) { ... }   // spends + standard toast on failure
```

### Modals
Any scene that can open a modal guards its update first — otherwise taps pass through
the overlay:

```js
if (UI.Modal.active) { UI.Modal.handleInput(); return; }
```

### Gear slots
Equipped gear is an **object** (`{name, atk, type, rarity, ...}`) or `null`. Legacy saves
holding plain strings are healed by `SaveSystem.migrate()` on load. Always label slots
with `Scene.gearLabel(slot)` — handles object / legacy string / empty.

### Battle-instance timers
Combat schedules 300/500ms callbacks (auto-turn, enemy-turn pacing). Every such timer
must capture the battle token and bail if the battle changed:

```js
var runId = this.data.runId;   // incremented in enter()
setTimeout(function() {
  if (G.currentScene !== combatScene || combatScene.data.runId !== runId) return;
  combatScene.advanceTurn();
}, 500);
```

Without the `runId` check, a timer from a finished battle can fire into the next one
(the guard on scene alone is not enough — the scene object is reused).

### Transient effects
Fleeting visuals — `R.damageNumbers`, `R.deathBursts`, `R.comboFlash` — live on `R`
with matching `updateEffects()`/`renderEffects()` pairs. Never draw them outside
`render()`; never mutate scene state from an effect.

### Adaptive difficulty
There is no manual difficulty picker. `G.state.challenge` (0.6–1.5) drifts after every
battle via `Progression.adjustChallenge()` based on outcome, remaining HP, and speed.
It scales enemy HP/damage (`applyDifficulty`) plus reward and loot quality
(`getLootBonus`), and renders as a Threat level on the Travel Map.

## Development Workflow

1. Make changes; keep the Scene contract (`enter` builds UI, `render` draws).
2. Syntax-check every touched file: `node -c <file>`.
3. Run the headless boot matrix (needs local Chrome; stdlib only):

   ```bash
   python3 tools/verify_matrix.py
   ```

   It serves the repo root, boots desktop / phone / phone-landscape profiles in
   headless Chrome, asserts the `[Mythika] booted` beacon with no uncaught
   errors, and drops per-profile screenshots in `tools/shots/` for review.
4. Smoke-test in a browser (serve locally; hard-reload to bypass cache).
5. Commit with conventional prefixes: `fix:` / `feat:` / `refactor:` / `docs:` / `style:`.
6. Push: `git push origin master`.

Do not modify `netlify.toml`. See `BUILD_STATUS.md` for the current feature inventory.
