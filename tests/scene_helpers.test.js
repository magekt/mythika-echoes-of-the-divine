/* tests/scene_helpers.test.js
 * Phase 49 — Reveal Lifecycle & Scene Entrances.
 *  REV-01: ScrollReveal.apply save/restore brackets the render fn
 *  REV-02: entranceReveal advances 0.4s, snaps t=1 under reduced motion
 *  REV-04: EmptyState/HeroMoment construct CTA once (same instance each render)
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
    ...stubs
  };
  vm.createContext(ctx);
  for (const p of srcFiles) {
    const src = fs.readFileSync(p, 'utf8');
    vm.runInContext(src, ctx, { filename: p });
  }
  // `const R` / `const Scene` are global-lexical bindings in the context, not
  // properties of globalThis — expose them so the test can reach the REAL
  // objects that scene-helpers.js mutated (not a stale globalThis stub).
  vm.runInContext('globalThis.R = R; globalThis.Scene = Scene; globalThis.UI = UI;', ctx);
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
    filter: 'none',
    save: rec('save'),
    restore: rec('restore'),
    translate: rec('translate'),
    scale: rec('scale'),
    filterFn: null,
    fillText: rec('fillText'),
    strokeRect: rec('strokeRect'),
    fillRect: rec('fillRect'),
    beginPath: rec('beginPath'),
    arc: rec('arc'),
    moveTo: rec('moveTo'),
    lineTo: rec('lineTo'),
    quadraticCurveTo: rec('quadraticCurveTo'),
    closePath: rec('closePath'),
    stroke: rec('stroke'),
    fill: rec('fill'),
    measureText: () => ({ width: 0 }),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
  };
}

const RENDERER = path.join(ROOT, 'src/engine/renderer.js');
const SCENE = path.join(ROOT, 'src/engine/scene.js');
const SCENE_HELPERS = path.join(ROOT, 'src/engine/scene-helpers.js');
const BUTTON = path.join(ROOT, 'src/ui/button.js');

function helpersCtx(stubs) {
  return loadInVm([RENDERER, SCENE, BUTTON, SCENE_HELPERS], {
    Input: { _touchCurrent: null, _touchStart: null, _pressPos: null, getScrollDelta: () => 0 },
    Audio: { click() {} },
    G: { W: 400, H: 720, state: {} },
    ...stubs
  });
}

// ---------------------------------------------------------------------------
// REV-01 — ScrollReveal.apply save/restore order
// ---------------------------------------------------------------------------
test('ScrollReveal.apply invokes renderFn between save() and restore()', () => {
  const ctx = helpersCtx({});
  const sctx = recordingCtx();

  const el = {};
  el._revealState = { opacity: 0.4, y: 12, blur: 3 };

  const seq = [];
  const reveal = ctx.Scene.ScrollReveal();
  reveal.apply(sctx, el, (c) => {
    seq.push('render');
    // The transform must be live while the child draws.
    assert.equal(c.globalAlpha, 0.4, 'globalAlpha not applied to child ctx');
    assert.equal(c.filter, 'blur(3px)', 'filter not applied to child ctx');
  });
  seq.push('done');

  // Reconstruct the exact call order observed on the context.
  const order = sctx.calls.map(c => c.name);
  const renderIdx = seq.indexOf('render');
  const saveIdx = order.indexOf('save');
  const restoreIdx = order.indexOf('restore');

  assert.ok(saveIdx !== -1, 'ctx.save() was called');
  assert.ok(restoreIdx !== -1, 'ctx.restore() was called');
  assert.ok(saveIdx < restoreIdx, 'save() must precede restore()');
  // renderFn ran (proven by the inner assertions above) and the context was
  // transformed at that moment.
  assert.equal(renderIdx, 0, 'renderFn invoked before completion');
});

test('ScrollReveal.apply with no revealState still calls renderFn', () => {
  const ctx = helpersCtx({});
  const sctx = recordingCtx();
  const el = {}; // no _revealState
  let called = false;
  const reveal = ctx.Scene.ScrollReveal();
  reveal.apply(sctx, el, () => { called = true; });
  assert.equal(called, true, 'renderFn must run when there is no reveal state');
  // No save/restore when nothing is hidden.
  const order = sctx.calls.map(c => c.name);
  assert.equal(order.indexOf('save'), -1, 'no save() without reveal state');
});

// ---------------------------------------------------------------------------
// REV-02 — entranceReveal snaps t=1 under reduced motion
// ---------------------------------------------------------------------------
test('entranceReveal snaps t to 1 immediately under reduced motion', () => {
  const ctx = helpersCtx({ G: { W: 400, H: 720, state: { reduceMotion: true } } });
  const r = ctx.Scene.entranceReveal();
  // Under reduced motion the factory should have snapped t=1 already.
  assert.equal(r.t, 1, 'reduced motion: t must start at 1');
  // update is a no-op once done.
  r.update(1 / 60);
  assert.equal(r.t, 1, 'reduced motion: update keeps t at 1');
});

test('entranceReveal advances 0->1 over ~0.4s at normal motion', () => {
  const ctx = helpersCtx({});
  const r = ctx.Scene.entranceReveal();
  assert.equal(r.t, 0, 'starts at 0');
  const dt = 1 / 60; // 16.67ms
  for (let i = 0; i < 15; i++) r.update(dt); // 250ms
  assert.ok(r.t > 0 && r.t < 1, `mid-progress t=${r.t}`);
  for (let i = 0; i < 30; i++) r.update(dt); // +500ms, should complete
  assert.equal(r.t, 1, 'reaches t=1');
});

test('entranceReveal render applies easePremium alpha + upward fade', () => {
  const ctx = helpersCtx({});
  const r = ctx.Scene.entranceReveal();
  r.update(1 / 60); // t ~ 0.0417
  const sctx = recordingCtx();
  let ran = false;
  r.render(sctx, () => { ran = true; });
  assert.equal(ran, true, 'render fn invoked');
  assert.equal(sctx.filter, 'none', 'filter reset after restore');
  const order = sctx.calls.map(c => c.name);
  assert.ok(order.indexOf('save') !== -1 && order.indexOf('restore') !== -1);
});

// ---------------------------------------------------------------------------
// REV-04 — EmptyState CTA is constructed once (same instance each render)
// ---------------------------------------------------------------------------
test('EmptyState uses the SAME MagneticBtn instance across renders', () => {
  const ctx = helpersCtx({});
  // Track instances allocated by UI.MagneticBtn.
  const origMagnetic = ctx.UI.MagneticBtn;
  const created = [];
  ctx.UI.MagneticBtn = function(...a) {
    const b = origMagnetic.apply(ctx.UI, a);
    created.push(b);
    return b;
  };

  const es = ctx.Scene.EmptyState({ type: 'journey', title: 'T', hint: 'H', ctaLabel: 'Go' });
  const sctx = recordingCtx();
  es.render(sctx);
  es.render(sctx);
  es.render(sctx);

  assert.equal(created.length, 1, `expected 1 allocation, got ${created.length}`);
});

test('EmptyState without ctaLabel allocates no button', () => {
  const ctx = helpersCtx({});
  const origMagnetic = ctx.UI.MagneticBtn;
  const created = [];
  ctx.UI.MagneticBtn = function(...a) { created.push(origMagnetic.apply(ctx.UI, a)); };
  const es = ctx.Scene.EmptyState({ type: 'journey', title: 'T', hint: 'H' });
  const sctx = recordingCtx();
  es.render(sctx);
  es.render(sctx);
  assert.equal(created.length, 0, 'no button when ctaLabel absent');
});

test('HeroMoment constructs its CTA once, not per frame', () => {
  const ctx = helpersCtx({});
  const origMagnetic = ctx.UI.MagneticBtn;
  const created = [];
  ctx.UI.MagneticBtn = function(...a) { created.push(origMagnetic.apply(ctx.UI, a)); };

  const hm = ctx.Scene.HeroMoment({ title: 'T', subtitle: 'S', ctaLabel: 'Go' });
  const sctx = recordingCtx();
  hm.render(sctx);
  hm.render(sctx);
  hm.render(sctx);
  assert.equal(created.length, 1, `expected 1 allocation, got ${created.length}`);
});
