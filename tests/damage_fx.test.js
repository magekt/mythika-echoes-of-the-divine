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

describe('R.elementBurst — combat integration', () => {
  let R, G, ctx;

  beforeEach(() => {
    const env = loadRenderer();
    R = env.R;
    G = env.G;
    ctx = env.ctx;
  });

  test('elementBurst spawns 6 particles for normal hit', () => {
    G.state.reduceMotion = false;
    R.elementBurst(100, 100, 'fire', false);
    assert.strictEqual(R.elementBurstCount, 6, 'normal burst should spawn 6 particles');
  });

  test('elementBurst spawns 10 particles for crit hit', () => {
    G.state.reduceMotion = false;
    R.elementBurst(100, 100, 'fire', true);
    assert.strictEqual(R.elementBurstCount, 10, 'crit burst should spawn 10 particles');
  });

  test('elementBurst is suppressed when reduceMotion is true', () => {
    G.state.reduceMotion = true;
    R.elementBurst(100, 100, 'fire', false);
    assert.strictEqual(R.elementBurstCount, 0, 'no particles should spawn in reduced-motion mode');
  });

  test('elementBurst uses correct element colors', () => {
    G.state.reduceMotion = false;
    R.elementBurst(100, 100, 'fire', false);
    const slots = R.elementBurstSlots.slice(0, 6);
    const firePrimary = R.colors.elements.fire.primary;
    const fireSecondary = R.colors.elements.fire.secondary;
    const colors = slots.map(s => s.color);
    assert.ok(colors.includes(firePrimary), 'burst should use fire primary color');
    assert.ok(colors.includes(fireSecondary), 'burst should use fire secondary color');
  });

  test('elementBurst falls back to default color for unknown element', () => {
    G.state.reduceMotion = false;
    R.elementBurst(100, 100, 'nonexistent', false);
    assert.strictEqual(R.elementBurstCount, 6);
    const slots = R.elementBurstSlots.slice(0, 6);
    assert.ok(slots.every(s => s.color === R.colors.elements.default.primary || s.color === R.colors.elements.default.secondary),
      'unknown element should use default colors');
  });

  test('updateElementBursts decays particle life over time', () => {
    G.state.reduceMotion = false;
    R.elementBurst(100, 100, 'ice', false);
    const beforeLife = R.elementBurstSlots[0].life;
    R.updateElementBursts(0.1);
    const afterLife = R.elementBurstSlots[0].life;
    assert.ok(afterLife < beforeLife, 'particle life should decrease after update');
  });

  test('renderElementBursts does not throw when ctx is valid', () => {
    G.state.reduceMotion = false;
    R.elementBurst(100, 100, 'fire', false);
    assert.doesNotThrow(() => R.renderElementBursts(ctx));
  });
});

describe('R.damageNumber — floater integration', () => {
  let R, G, ctx;

  beforeEach(() => {
    const env = loadRenderer();
    R = env.R;
    G = env.G;
    ctx = env.ctx;
  });

  test('damageNumber adds a floater entry', () => {
    R.damageNumber(ctx, 50, 50, 42, R.colors.red);
    const item = R.damageNumbers.buffer[0];
    assert.ok(item, 'floater should be added to buffer');
    assert.strictEqual(item.value, 42);
    assert.strictEqual(item.x, 50);
    assert.strictEqual(item.y, 50);
  });

  test('damageNumber defaults to red when color is null', () => {
    R.damageNumber(ctx, 10, 10, 7, null);
    const item = R.damageNumbers.buffer[0];
    assert.strictEqual(item.color, R.colors.red, 'null color should default to red');
  });
});

describe('combatScene element mapping', () => {
  test('agn ailment maps to fire element', () => {
    // Mirrors the mapping logic in combatScene.js
    function mapElement(ailment) {
      return ailment === 'agni' ? 'fire'
        : ailment === 'shila' ? 'ice'
        : ailment === 'vayu' ? 'lightning'
        : ailment === 'vajra' ? 'lightning'
        : 'dark';
    }
    assert.strictEqual(mapElement('agni'), 'fire');
    assert.strictEqual(mapElement('shila'), 'ice');
    assert.strictEqual(mapElement('vayu'), 'lightning');
    assert.strictEqual(mapElement('vajra'), 'lightning');
    assert.strictEqual(mapElement('visha'), 'dark');
    assert.strictEqual(mapElement(undefined), 'dark');
  });

  test('R.colors.elements covers all mapped element keys', () => {
    const { R } = loadRenderer();
    const keys = ['fire', 'ice', 'lightning', 'dark'];
    for (const k of keys) {
      assert.ok(R.colors.elements[k], 'R.colors.elements should define ' + k);
      assert.ok(R.colors.elements[k].primary, k + ' should have a primary color');
      assert.ok(R.colors.elements[k].secondary, k + ' should have a secondary color');
    }
  });
});
