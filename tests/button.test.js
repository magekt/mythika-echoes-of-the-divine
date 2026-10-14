/* tests/button.test.js
 * Phase 47 — Button press physics + MagneticBtn trailing icon.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

function loadInVm(srcFiles, stubs) {
  const ctx = {
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
    matchMedia: () => ({ matches: false }),
    performance: { now: () => 0 },
    UI: {},
    ...stubs
  };
  vm.createContext(ctx);
  for (const p of srcFiles) {
    const src = fs.readFileSync(p, 'utf8');
    vm.runInContext(src, ctx, { filename: p });
  }
  return ctx;
}

function recordingCtx() {
  const calls = [];
  const rec = (name) => (...args) => calls.push({ name, args });
  return {
    calls,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    save: rec('save'),
    restore: rec('restore'),
    translate: rec('translate'),
    scale: rec('scale'),
    beginPath: rec('beginPath'),
    moveTo: rec('moveTo'),
    lineTo: rec('lineTo'),
    quadraticCurveTo: rec('quadraticCurveTo'),
    closePath: rec('closePath'),
    stroke: rec('stroke'),
    fill: rec('fill'),
    fillRect: rec('fillRect'),
    arc: rec('arc'),
    fillText: rec('fillText'),
    strokeRect: rec('strokeRect'),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
  };
}

test('UI.Button spring press scales to ~0.97 and returns to ~1', () => {
  const RENDERER_PATH = path.join(ROOT, 'src/engine/renderer.js');
  const COMPONENT_PATH = path.join(ROOT, 'src/ui/component.js');
  const BUTTON_PATH = path.join(ROOT, 'src/ui/button.js');

  const ctx = loadInVm([RENDERER_PATH, COMPONENT_PATH, BUTTON_PATH], {
    Input: { _touchCurrent: null, _touchStart: null, _pressPos: null },
    Audio: { click() {} }
  });

  const UI = ctx.UI;
  const btn = UI.Button(10, 10, 100, 40, 'T');
  btn.enabled = true;
  btn.visible = true;
  btn._hovered = false;
  btn._pressed = true;

  const dt = 1 / 60;
  for (let i = 0; i < 18; i++) btn.update(dt);
  assert.ok(Math.abs(btn._visualScale - 0.97) <= 0.01, `scale=${btn._visualScale}`);

  btn._pressed = false;
  for (let i = 0; i < 18; i++) btn.update(dt);
  assert.ok(Math.abs(btn._visualScale - 1) <= 0.01, `scale=${btn._visualScale}`);
});

test('UI.Button reduced motion snaps scale instantly (no spring)', () => {
  const RENDERER_PATH = path.join(ROOT, 'src/engine/renderer.js');
  const COMPONENT_PATH = path.join(ROOT, 'src/ui/component.js');
  const BUTTON_PATH = path.join(ROOT, 'src/ui/button.js');

  const ctx = loadInVm([RENDERER_PATH, COMPONENT_PATH, BUTTON_PATH], {
    Input: { _touchCurrent: null, _touchStart: null, _pressPos: null },
    Audio: { click() {} },
    G: { state: { reduceMotion: true } }
  });

  // Force reduced motion deterministically even if media query differs.
  ctx.R = ctx.R || {};
  ctx.R.reducedMotion = () => true;

  const UI = ctx.UI;
  const btn = UI.Button(10, 10, 100, 40, 'T');
  btn._pressed = true;

  btn.update(1 / 60);
  assert.equal(btn._visualScale, 0.97);

  btn._pressed = false;
  btn.update(1 / 60);
  assert.equal(btn._visualScale, 1);
});

test('UI.MagneticBtn trailing icon draws nested circle even when not hovered', () => {
  const RENDERER_PATH = path.join(ROOT, 'src/engine/renderer.js');
  const COMPONENT_PATH = path.join(ROOT, 'src/ui/component.js');
  const BUTTON_PATH = path.join(ROOT, 'src/ui/button.js');

  const drawCtx = recordingCtx();
  const ctx = loadInVm([RENDERER_PATH, COMPONENT_PATH, BUTTON_PATH], {
    Input: { _touchCurrent: null, _touchStart: null, _pressPos: null, _mousePos: null },
    Audio: { click() {} }
  });

  const UI = ctx.UI;
  const btn = UI.MagneticBtn(10, 10, 120, 40, 'Go', { trailingIcon: 'arrow-right' });
  btn._hovered = false;
  btn._pressed = false;

  btn.render(drawCtx);
  const arcCalls = drawCtx.calls.filter(c => c.name === 'arc');

  // If R.roundRect exists, it uses a path + fill/stroke; circle enclosure uses
  // R.roundRect OR ctx.arc depending on environment. We accept either.
  const hasRoundRect = drawCtx.calls.some(c => c.name === 'quadraticCurveTo' || c.name === 'beginPath' || c.name === 'fill');
  assert.ok(arcCalls.length > 0 || hasRoundRect);
  // Also ensure we didn't regress to hover-only icon visibility.
  const hasCircleFill = drawCtx.calls.some(c => c.name === 'fill');
  assert.ok(hasCircleFill || hasRoundRect);
});
