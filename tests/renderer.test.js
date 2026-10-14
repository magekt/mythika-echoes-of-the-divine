/* tests/renderer.test.js
 *
 * Phase 46 — Renderer Primitives Foundation.
 *
 * Loads src/engine/renderer.js into a VM context (mirrors
 * tests/backgrounds_binding.test.js so the lexical `const R` is captured)
 * and tests the new primitives: R.strokeRoundRect, R.doubleBezel,
 * R.easePremium, R.spring, R.reducedMotion, and the new semantic colors.
 *
 * node:test + node:assert only. Run: node --test tests/renderer.test.js
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const RENDERER_PATH = path.join(ROOT, 'src/engine/renderer.js');

function recordingCtx() {
  const calls = [];
  const rec = (n) => () => calls.push(n);
  const ctx = {
    calls,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    fill: rec('fill'),
    stroke: rec('stroke'),
    save() {},
    restore() {},
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; }
  };
  ctx.fillRect = rec('fillRect');
  ctx.beginPath = rec('beginPath');
  ctx.moveTo = rec('moveTo');
  ctx.lineTo = rec('lineTo');
  ctx.quadraticCurveTo = rec('quadraticCurveTo');
  ctx.closePath = rec('closePath');
  return ctx;
}

// Load renderer.js into a VM context. Mirrors backgrounds_binding.test.js:
// const R is lexical, so capture it via a marker line evaluated in-context.
function loadRenderer() {
  const src = fs.readFileSync(RENDERER_PATH, 'utf8');
  const context = {
    window: {},
    document: {
      createElement: () => ({
        width: 0, height: 0,
        getContext: () => ({
          createImageData: () => ({ data: new Uint8ClampedArray(0) }),
          putImageData: () => {}
        }),
        style: {}
      })
    },
    matchMedia: () => ({ matches: false })
  };
  vm.createContext(context);
  vm.runInContext(src, context, { filename: 'renderer.js' });
  const R = vm.runInContext('R', context);
  return { R, context };
}

const { R, context } = loadRenderer();

test('R.exists as loaded object', () => {
  assert.ok(R, 'R must load');
  assert.strictEqual(typeof R.strokeRoundRect, 'function');
  assert.strictEqual(typeof R.doubleBezel, 'function');
  assert.strictEqual(typeof R.easePremium, 'function');
  assert.strictEqual(typeof R.spring, 'function');
  assert.strictEqual(typeof R.reducedMotion, 'function');
});

test('new semantic color tokens present, existing preserved', () => {
  assert.strictEqual(R.colors.overlay, 'rgba(0,0,0,0.6)');
  assert.strictEqual(R.colors.overlayMuted, 'rgba(0,0,0,0.4)');
  assert.strictEqual(R.colors.insetHighlight, 'rgba(255,255,255,0.10)');
  assert.strictEqual(R.colors.insetShade, 'rgba(0,0,0,0.30)');
  assert.strictEqual(R.colors.disabled, 'rgba(120,120,140,0.5)');
  assert.strictEqual(R.colors.hairline, 'rgba(255,255,255,0.08)');
  assert.strictEqual(R.colors.shadow, 'rgba(0,0,0,0.40)');
  // Existing keys must remain
  assert.strictEqual(R.colors.surface, '#1a1a30');
  assert.strictEqual(R.colors.surfaceElevated, '#222240');
});

test('easePremium: endpoints, monotone, clamps', () => {
  assert.strictEqual(R.easePremium(0), 0);
  assert.strictEqual(R.easePremium(1), 1);
  assert.strictEqual(R.easePremium(0.5), 0.5);
  // Monotone between 0 and 1
  let prev = 0;
  for (let i = 1; i <= 10; i++) {
    const v = R.easePremium(i / 10);
    assert.ok(v >= prev, `easePremium must be monotone at ${i}/10, got ${v} < ${prev}`);
    prev = v;
  }
  // Clamps out-of-range input
  assert.strictEqual(R.easePremium(-1), 0);
  assert.strictEqual(R.easePremium(2), 1);
  assert.strictEqual(R.easePremium(NaN), 0);
});

test('spring: converges to target', () => {
  const step = R.spring({ stiffness: 170, damping: 26, target: 1 });
  let value = 0, velocity = 0;
  const dt = 1 / 60;
  for (let i = 0; i < 60; i++) {
    const r = step(value, velocity, dt);
    value = r.value;
    velocity = r.velocity;
  }
  assert.ok(value > 0.95, `value must converge > 0.95, got ${value}`);
  assert.ok(Math.abs(velocity) < 0.05, `velocity must be near 0, got ${velocity}`);
});

test('spring: defaults applied when config omitted', () => {
  const step = R.spring();
  const r = step(0, 0, 1 / 60);
  assert.ok(r.value > 0, 'with defaults target=1, value should start rising');
});

test('reducedMotion: null-safe, false when G undefined', () => {
  // context has no G defined → must not throw, returns based on matchMedia (false)
  const result = vm.runInContext('R.reducedMotion()', context);
  assert.strictEqual(result, false);
});

test('reducedMotion: true when G.state.reduceMotion set', () => {
  context.G = { state: { reduceMotion: true } };
  const result = vm.runInContext('R.reducedMotion()', context);
  assert.strictEqual(result, true);
  delete context.G;
});

test('strokeRoundRect: calls ctx.stroke() once, silent on null', () => {
  const ctx = recordingCtx();
  R.strokeRoundRect(ctx, 10, 10, 100, 50, 8, '#ffffff', 1);
  assert.strictEqual(ctx.calls.filter(c => c === 'stroke').length, 1, 'exactly one stroke()');

  // null ctx returns silently
  let threw = false;
  try {
    const out = R.strokeRoundRect(null, 10, 10, 100, 50, 8, '#ffffff', 1);
    assert.strictEqual(out, undefined);
  } catch (e) { threw = true; }
  assert.strictEqual(threw, false, 'must not throw on null ctx');
});

test('doubleBezel: fill+stroke for shell and core, silent on null', () => {
  const ctx = recordingCtx();
  R.doubleBezel(ctx, 10, 10, 200, 120, {});
  // shell: R.roundRect (fill) + strokeRoundRect (stroke); core: R.roundRect (fill) + highlight (fill)
  const strokes = ctx.calls.filter(c => c === 'stroke').length;
  const fills = ctx.calls.filter(c => c === 'fill').length;
  assert.ok(strokes >= 1, `expect at least one stroke (shell hairline), got ${strokes}`);
  assert.ok(fills >= 2, `expect at least two fill() (shell + core), got ${fills}`);

  // null ctx returns silently
  let threw = false;
  try {
    R.doubleBezel(null, 10, 10, 200, 120, {});
  } catch (e) { threw = true; }
  assert.strictEqual(threw, false, 'must not throw on null ctx');
});
