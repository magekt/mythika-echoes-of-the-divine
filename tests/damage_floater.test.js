const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadRenderer() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'engine', 'renderer.js'), 'utf8');
  const wrapped = code + '\n;__result = R;';
  const ctxObj = {
    globalAlpha: 1, fillStyle: '', strokeStyle: '', lineWidth: 1,
    textAlign: 'left', font: '12px sans-serif',
    fillRect: function() {}, strokeRect: function() {},
    beginPath: function() {}, arc: function() {}, stroke: function() {},
    fill: function() {}, save: function() {}, restore: function() {},
    translate: function() {}, rotate: function() {},
    moveTo: function() {}, lineTo: function() {}, closePath: function() {},
    quadraticCurveTo: function() {}, fillText: function() {},
    createLinearGradient: function() { return { addColorStop: function() {} }; },
    createRadialGradient: function() { return { addColorStop: function() {} }; },
    drawImage: function() {},
    getImageData: function() { return { data: [] }; },
    putImageData: function() {},
  };
  const G = { W: 400, H: 720, ctx: ctxObj, dt: 0.016, state: { reduceMotion: false } };
  const sandbox = {
    G: G,
    Audio: { hit() {}, crit() {}, skill() {}, heal() {}, combo() {}, comboMilestone() {}, musicVolume() {} },
    ZONES: {},
    document: { createElement: function() { return { width: 400, height: 720, getContext: function() { return ctxObj; } }; } },
    window: { matchMedia: function() { return { matches: false, addEventListener: function() {} }; } },
    __result: null,
  };
  vm.createContext(sandbox);
  vm.runInContext(wrapped, sandbox, { timeout: 5000 });
  return { R: sandbox.__result, G: G, ctx: ctxObj };
}

describe('R.damageNumber — DMG-01 opts signature', () => {
  let R, G, ctx;

  beforeEach(() => {
    const env = loadRenderer();
    R = env.R; G = env.G; ctx = env.ctx;
  });

  test('DMG-01: accepts opts param without error (backward compat)', () => {
    G.state.reduceMotion = false;
    assert.doesNotThrow(() => R.damageNumber(ctx, 50, 50, 42, R.colors.red));
    assert.doesNotThrow(() => R.damageNumber(ctx, 50, 50, 42, R.colors.red, { element: 'fire', crit: true }));
    assert.doesNotThrow(() => R.damageNumber(ctx, 50, 50, 42, null, { heal: true, element: 'ice' }));
  });

  test('DMG-01: floater object carries element + crit + heal fields', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 10, 10, 99, R.colors.red, { element: 'fire', crit: true, heal: false });
    const item = R.damageNumbers.buffer[0];
    assert.strictEqual(item.element, 'fire');
    assert.strictEqual(item.crit, true);
    assert.strictEqual(item.heal, false);
  });

  test('DMG-01: pre-allocated spring state attached to floater', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 10, 10, 10, R.colors.red, { element: 'ice' });
    const item = R.damageNumbers.buffer[0];
    assert.ok(item._spring, 'floater should have pre-allocated spring state');
    assert.strictEqual(typeof item._spring._springFn, 'function', 'spring state should have a springFn');
    assert.strictEqual(item._spring.value, 0, 'spring should start at value 0');
  });
});

describe('R.damageNumber — DMG-02 spring-driven scale', () => {
  let R, G, ctx;

  beforeEach(() => {
    const env = loadRenderer();
    R = env.R; G = env.G; ctx = env.ctx;
  });

  test('DMG-02: spring scale increases over time (normal path)', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 50, 50, 50, R.colors.red);
    const item = R.damageNumbers.buffer[0];
    assert.strictEqual(item.scale, 0, 'scale should start at 0');
    // Step through 30 frames of updates
    for (let i = 0; i < 30; i++) R.updateEffects(0.016);
    assert.ok(item.scale > 0, 'scale should increase after spring updates');
    assert.ok(item.scale <= 1.5, 'scale should be bounded');
  });

  test('DMG-02: no per-frame allocation — spring state object is reused', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 50, 50, 50, R.colors.red);
    const item = R.damageNumbers.buffer[0];
    const springBefore = item._spring;
    for (let i = 0; i < 10; i++) R.updateEffects(0.016);
    assert.strictEqual(item._spring, springBefore, 'spring state object must be mutated in place, not replaced');
  });
});

describe('R.damageNumber — DMG-03 element tint', () => {
  let R, G, ctx;

  beforeEach(() => {
    const env = loadRenderer();
    R = env.R; G = env.G; ctx = env.ctx;
  });

  test('DMG-03: fire element uses fire primary color', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 10, 10, 20, null, { element: 'fire' });
    const item = R.damageNumbers.buffer[0];
    assert.strictEqual(item.elPrimary, R.colors.elements.fire.primary);
  });

  test('DMG-03: ice element uses ice primary color', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 10, 10, 20, null, { element: 'ice' });
    const item = R.damageNumbers.buffer[0];
    assert.strictEqual(item.elPrimary, R.colors.elements.ice.primary);
  });

  test('DMG-03: unknown element falls back to default', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 10, 10, 20, null, { element: 'nonexistent' });
    const item = R.damageNumbers.buffer[0];
    assert.strictEqual(item.elPrimary, R.colors.elements.default.primary);
  });

  test('DMG-03: heal flag carries through', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 10, 10, 20, R.colors.green, { element: 'holy', heal: true });
    const item = R.damageNumbers.buffer[0];
    assert.strictEqual(item.heal, true);
    assert.strictEqual(item.elPrimary, R.colors.elements.holy.primary);
  });
});

describe('R.damageNumber — DMG-04 crit rendering', () => {
  let R, G, ctx;

  beforeEach(() => {
    const env = loadRenderer();
    R = env.R; G = env.G; ctx = env.ctx;
  });

  test('DMG-04: crit floater has longer life than normal', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 10, 10, 20, R.colors.red, { crit: true });
    const critItem = R.damageNumbers.buffer[0];
    R.damageNumber(ctx, 20, 20, 20, R.colors.red, { crit: false });
    const normalItem = R.damageNumbers.buffer[1];
    assert.ok(critItem.maxLife > normalItem.maxLife, 'crit floater should live longer');
  });

  test('DMG-04: crit flag is stored on the floater object', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 10, 10, 20, R.colors.red, { crit: true });
    assert.strictEqual(R.damageNumbers.buffer[0].crit, true);
  });
});

describe('R.damageNumber — DMG-05 reduced-motion', () => {
  let R, G, ctx;

  beforeEach(() => {
    const env = loadRenderer();
    R = env.R; G = env.G; ctx = env.ctx;
  });

  test('DMG-05: reduced-motion sets _reduced flag on spawn', () => {
    G.state.reduceMotion = true;
    R.damageNumber(ctx, 10, 10, 20, R.colors.red);
    assert.strictEqual(R.damageNumbers.buffer[0]._reduced, true);
  });

  test('DMG-05: reduced-motion path skips spring — scale is 1 immediately', () => {
    G.state.reduceMotion = true;
    R.damageNumber(ctx, 10, 10, 20, R.colors.red);
    const item = R.damageNumbers.buffer[0];
    R.updateEffects(0.016);
    assert.strictEqual(item.scale, 1, 'reduced-motion: scale should be instant (1), not spring-animated');
  });

  test('DMG-05: normal path does spring animation (scale < 1 early)', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 10, 10, 20, R.colors.red);
    const item = R.damageNumbers.buffer[0];
    R.updateEffects(0.016);
    assert.ok(item.scale < 1, 'normal path: scale should be mid-animation early on');
  });
});

describe('R.damageNumber — renderEffects integration', () => {
  let R, G, ctx;

  beforeEach(() => {
    const env = loadRenderer();
    R = env.R; G = env.G; ctx = env.ctx;
  });

  test('renderEffects does not throw with element + crit opts', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 50, 50, 42, R.colors.red, { element: 'fire', crit: true });
    assert.doesNotThrow(() => R.renderEffects(ctx));
  });

  test('renderEffects does not throw with heal flag', () => {
    G.state.reduceMotion = false;
    R.damageNumber(ctx, 50, 50, 20, R.colors.green, { element: 'holy', heal: true });
    assert.doesNotThrow(() => R.renderEffects(ctx));
  });

  test('renderEffects does not throw with reduced-motion active', () => {
    G.state.reduceMotion = true;
    R.damageNumber(ctx, 50, 50, 20, R.colors.red);
    assert.doesNotThrow(() => R.renderEffects(ctx));
  });
});
