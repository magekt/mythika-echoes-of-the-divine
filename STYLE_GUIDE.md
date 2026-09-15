<!-- generated-by: gsd-doc-writer -->
# Mythika Code Style Guide

This guide records the conventions already used by **Mythika: Echoes of the Divine**. The project is a browser game written in vanilla JavaScript, rendered with HTML5 Canvas, and loaded directly through ordered `<script>` tags in `index.html`; there is no bundler or module build step.

## JavaScript Formatting

- Use two spaces for indentation.
- Use semicolons.
- Prefer single-quoted strings. Use escapes such as `\u2026` when a source-safe Unicode representation is useful.
- Put opening braces on the same line as declarations and control statements.
- Use trailing commas only where the surrounding file already uses them.
- Keep simple guards and assignments on one line when they remain readable:

```js
if (!buttons) return;
if (this.data.damageFlash > 0) this.data.damageFlash -= dt;
```

- Use one declaration for closely related dimensions or constants when this improves readability:

```js
const bw = 200, bh = 38;
const stiffness = 120, damping = 22;
```

- Prefer `const`; use `let` for values that are reassigned. Legacy boot code may use `var`, but new code should follow the predominant `const`/`let` style.
- Arrow functions are acceptable for small callbacks and defaults. Existing public singleton methods generally use `function` so that `this` refers to their owning object.

## Naming

| Construct | Convention | Examples |
|---|---|---|
| Global singleton or namespace | PascalCase | `Combat`, `SaveSystem`, `UI`, `Scene` |
| Scene object | camelCase ending in `Scene` where practical | `combatScene`, `titleScene` |
| Functions and methods | camelCase, verb-led | `startBattle`, `buildContinueButton`, `applyFontScale` |
| Local variables | camelCase | `enemyTimer`, `reactionRemaining`, `scrollY` |
| Constants | `UPPER_SNAKE_CASE` | `ENCOUNTER_STORIES`, `CRIT_MULTIPLIER`, `SAVE_KEY` |
| Boolean values | Predicate-style names | `isPlayerTurn`, `battleOver`, `fleeAttempted` |
| Internal component state | Leading underscore | `_hovered`, `_pressed`, `_pressTimer` |
| Data keys and IDs | Stable camelCase or lowercase identifiers | `characterCreate`, `aryavarta`, `pushOn` |

Keep names aligned with the global API already used throughout the repository. Renaming a global requires updating every dependent script because files do not import or export symbols.

## File and Module Organization

Source files are grouped by responsibility:

- `src/engine/` contains the game loop, renderer, scene management, input, audio, authentication, and global state.
- `src/data/` contains static game definitions.
- `src/systems/` contains domain logic such as combat, progression, cultivation, economy, and saving.
- `src/scenes/` contains complete screens and their lifecycle logic.
- `src/ui/` contains reusable immediate-mode Canvas controls.

Each traditional script exposes a top-level global rather than an ES module export. Common forms are a singleton object followed by attached methods:

```js
const SaveSystem = {
  SAVE_KEY: 'mythika_save',
  autoSaveInterval: 30000
};

SaveSystem.save = function() {
  // ...
};
```

or a scene created through the shared factory:

```js
const exampleScene = Scene.create({
  name: 'example',
  data: {},
  enter: function() {},
  leave: function() {},
  update: function(dt) {},
  render: function(ctx) {}
});
```

### Script load order

`index.html` is the dependency graph. When adding a file:

1. Define it before any script that reads its global.
2. Keep the existing sequence: engine foundations, data, systems, UI, scenes, then `src/main.js`.
3. Add scenes before `src/main.js`, where scene registration and boot occur.
4. Do not introduce `import`/`export` into traditional scripts unless the loading architecture is deliberately migrated.

## Global State and Shared Services

- Store persistent and cross-scene game state in `G.state`.
- Mutate `G.state` directly; the project does not use a reducer or immutable state layer.
- Keep temporary screen state in the scene's `data` object.
- Access shared behavior through established globals such as `R`, `UI`, `Input`, `Audio`, `Notify`, `Fade`, and system singletons.
- When an optional or independently loaded global may be absent, guard it with `typeof` before referencing it:

```js
if (typeof ZoneRewardSystem !== 'undefined' && ZoneRewardSystem.normalize) {
  ZoneRewardSystem.normalize();
}
```

A bare reference to a missing script can throw a `ReferenceError` and abort boot, so resilient startup code must use `typeof Name !== 'undefined'`.

## Scene Conventions

Create scenes with `Scene.create()` and follow the lifecycle consistently:

- `data`: declares mutable scene-local state and collections.
- `enter()`: initializes state, starts music, creates buttons, and starts scene-owned work.
- `update(dt)`: advances time-based state and handles input. Treat `dt` as elapsed time rather than frame count.
- `render(ctx)`: draws the complete scene every frame.
- `leave()`: stops audio, clears controls and temporary data, and cancels asynchronous work.

Build controls into `data.buttons`, `data.actionButtons`, or another clearly named array. Update and dispatch them through shared helpers:

```js
UI.updateButtons(this.data.buttons, dt);
UI.handleButtons(this.data.buttons);
```

For scrollable scenes, keep scroll position in `data.scrollY`, pass the matching offset to hit testing, and use the scene clipping/translation helpers rather than duplicating viewport logic.

### Timer ownership

Store timeout handles in scene data, set them to `null` after firing, and clear them when the scene exits. For delayed callbacks, verify that the expected scene or run is still active before changing state. `combatScene` uses a `runId` check for this purpose.

## UI Component Conventions

Canvas UI uses factory functions under `UI`:

```js
UI.ComponentName = function(x, y, w, h, options) {
  return {
    render: function(ctx) {},
    update: function(dt) {},
    contains: function(px, py) {},
    onClick: null
  };
};
```

Components use immediate-mode rendering while retaining only interaction and animation state. Prefer composition over inheritance; for example, specialized buttons build on the base button behavior.

Button handlers follow an outcome convention:

- Return `false` when the requested action is rejected.
- Return any other value, including `undefined`, for a valid action.
- Let `UI.handleButtons()` consume the tap, play audio, and trigger valid/rejected feedback.

Respect `enabled` and `visible` instead of removing behavior ad hoc. Interactive controls should expose `contains(px, py)` and account for scroll-space versus screen-space coordinates.

## Rendering and Visual Tokens

Use renderer helpers from `R` instead of duplicating Canvas setup. Examples include `R.rect`, `R.roundRect`, `R.text`, and `R.textCenter`.

### Colors

Use semantic tokens from `R.colors` for new UI. Prefer:

- `surface`, `surfaceElevated`, and `surfaceGlass` for backgrounds
- `textPrimary`, `textSecondary`, and `textMuted` for text hierarchy
- `accent` and `accentMuted` for emphasis
- `success`, `warning`, `danger`, and `info` for status
- `borderHairline` and `borderFocus` for boundaries

Do not add raw hexadecimal colors inside new scene or component rendering code when an appropriate token exists. Static domain data may retain color values when color is part of the data definition.

### Radius scale

Use the shared shape scale rather than ad hoc corner radii:

| Token | Value | Intended use |
|---|---:|---|
| `R.radius.xs` | 3 | Chips and ticks |
| `R.radius.s` | 5 | Buttons and small bars |
| `R.radius.m` | 8 | Panels and headers |
| `R.radius.l` | 10 | Large cards |

### Typography

Use `R.fonts` so accessibility scaling remains effective:

- `display` and `displaySm` for lore and hero moments
- `lg`, `md`, `sm`, and `xs` for UI and body copy
- `mono` for compact technical or numeric content

Do not hard-code Canvas font strings in scenes. Text rendered through `R.text()` defaults to `R.colors.text` and `R.fonts.md` and restores left alignment after drawing.

### Canvas state

Wrap temporary Canvas transformations, clipping, alpha, or compositing changes in `ctx.save()` and `ctx.restore()`. Keep drawing coordinates in the logical `400 × 720` game space; CSS scales the fixed game container for different viewports.

## Motion and Accessibility

Check the shared preference before introducing decorative animation:

```js
const reduceMotion = R.reducedMotion ? R.reducedMotion() : false;
if (!reduceMotion) {
  // Decorative movement.
}
```

`R.reducedMotion()` combines `G.state.reduceMotion` with the operating system's `prefers-reduced-motion` setting.

- Disable or simplify decorative motion when reduced motion is active.
- Preserve essential state feedback. For example, a reward count-up may still run when it communicates an outcome rather than serving as decoration.
- Use the established magnetic-button spring constants, `stiffness = 120` and `damping = 22`, when extending that interaction.
- Use `dt`-based animation so behavior is independent of frame rate.
- Maintain touch and mouse parity for pressed, hover, and hit-test feedback.

## Data Definitions

Keep static content in `src/data/` or in clearly named constants near the scene that exclusively owns it. Use plain objects and arrays with stable keys:

```js
const EFFECTS = {
  example: {
    name: 'Example',
    duration: 3,
    color: R.colors.accent
  }
};
```

Do not mutate shared static definitions during play. Clone data when a battle or scene needs mutable instances; existing combat setup uses JSON serialization for plain game-data objects.

## Error Handling and Defensive Code

- Use early returns for invalid state and unavailable work.
- Catch storage, serialization, authentication, and browser API failures where recovery is possible.
- Return a boolean when callers need to know whether an operation succeeded, as `SaveSystem.save()` does.
- Log recoverable failures with useful context through `console.warn()` or `console.error()`.
- Guard nonessential visual or audio effects so their absence cannot break input or the game loop.
- Validate loaded save data before merging it into `G.state`. Reject arrays or non-object roots and filter unsafe object keys such as `__proto__`, `constructor`, and `prototype`.
- Preserve object identity when hydrating `G.state` so existing references remain valid.

Comments should explain the reason for a guard, workaround, invariant, or non-obvious timing choice. Avoid comments that merely restate the following line.

## HTML and CSS

The application shell is minimal and Canvas-first.

- Keep game markup in `index.html` and visual shell rules in `styles/game.css`.
- Use lowercase kebab-case for CSS class and ID names, such as `game-container` and `auth-input-overlay`.
- Use two-space indentation inside CSS rule blocks.
- Keep the logical game surface at `400px × 720px`; responsive behavior scales the container rather than changing Canvas layout coordinates.
- Preserve mobile interaction controls such as `touch-action`, overscroll prevention, and safe-area handling.
- Native overlays must remain positioned relative to `#game-container` and visually aligned with Canvas controls.
- Use CSS custom properties for overlay values that must match Canvas theme or focus colors.

## Adding New Code

Before submitting a change:

1. Place the code in the directory matching its responsibility.
2. Read that directory's `codemap.md` and follow nearby patterns.
3. Reuse existing globals, renderer helpers, components, and semantic tokens.
4. Add new traditional scripts to `index.html` in dependency order.
5. Ensure scene-owned timers, audio, controls, and temporary state are cleaned up in `leave()`.
6. Test mouse and touch input, scene transitions, scrolling, save/load behavior, and browser-console output.
7. Test with reduced motion enabled through the OS or `G.state.reduceMotion = true`.
8. For performance-sensitive changes, use `?probe`; use `?probe&selftest` to exercise the input chain self-test.
