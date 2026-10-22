const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadRenderer() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'engine', 'renderer.js'), 'utf8');
  // Append a line to leak R out of the vm context (const is module-scoped, not global)
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
    window: { matchMedia: function() { return { matches: false, addEventListener: function() {}, removeEventListener: function() {} }; } },
    globalThis: { matchMedia: function() { return { matches: false }; } },
    __result: null,
  };

  vm.createContext(sandbox);
  vm.runInContext(wrapped, sandbox);
  return { R: sandbox.__result, G: G, ctxObj: ctxObj };
}

const { R, G, ctxObj } = loadRenderer();

function activeCount() {
  let n = 0;
  for (let i = 0; i < 60; i++) {
    if (R.elementBurstSlots[i] && R.elementBurstSlots[i].active) n++;
  }
  return n;
}

function resetBurst() {
  for (let i = 0; i < 60; i++) {
    if (R.elementBurstSlots[i]) R.elementBurstSlots[i].active = false;
  }
  R.elementBurstWriteIdx = 0;
  R.elementBurstCount = 0;
}

beforeEach(function() {
  G.state.reduceMotion = false;
});

describe('R.elementBurst — Phase 55 element burst particles', function() {

  test('spawns at least 6 active particles on normal hit', function() {
    resetBurst();
    R.elementBurst(100, 100, 'fire', false);
    assert.ok(activeCount() >= 6, 'Expected >=6 active, got ' + activeCount());
  });

  test('spawns at least 10 particles on crit', function() {
    resetBurst();
    R.elementBurst(100, 100, 'fire', true);
    assert.ok(activeCount() >= 10, 'Crit should have >=10, got ' + activeCount());
  });

  test('R.colors.elements.fire.primary is #ff6020', function() {
    assert.strictEqual(R.colors.elements.fire.primary, '#ff6020');
  });

  test('R.colors.elements.ice.primary is #a0e0ff', function() {
    assert.strictEqual(R.colors.elements.ice.primary, '#a0e0ff');
  });

  test('R.colors.elements.lightning.primary is #c0c0ff', function() {
    assert.strictEqual(R.colors.elements.lightning.primary, '#c0c0ff');
  });

  test('R.colors.elements.dark.primary is #8040ff', function() {
    assert.strictEqual(R.colors.elements.dark.primary, '#8040ff');
  });

  test('R.colors.elements.holy.primary is #e8e0d0', function() {
    assert.strictEqual(R.colors.elements.holy.primary, '#e8e0d0');
  });

  test('R.colors.elements.default.primary is #e8a030', function() {
    assert.strictEqual(R.colors.elements.default.primary, '#e8a030');
  });

  test('unknown element falls back to default color', function() {
    resetBurst();
    R.elementBurst(100, 100, 'totally_unknown_element', false);
    const s0 = R.elementBurstSlots[0];
    assert.ok(s0 && s0.active, 'Slot 0 should be populated and active');
    const def = R.colors.elements.default;
    assert.ok(s0.color === def.primary || s0.color === def.secondary,
      'Unknown element should use default colors, got ' + s0.color);
  });

  test('reduced motion suppresses R.elementBurst entirely', function() {
    resetBurst();
    G.state.reduceMotion = true;
    const before = R.elementBurstWriteIdx;
    R.elementBurst(100, 100, 'fire', false);
    assert.strictEqual(R.elementBurstWriteIdx, before, 'writeIdx must not advance when reduced motion is on');
    assert.strictEqual(activeCount(), 0, 'No active particles when reduced motion is on');
  });

  test('R.updateElementBursts mutates in place — object identity preserved', function() {
    resetBurst();
    R.elementBurst(100, 100, 'ice', false);
    const s0 = R.elementBurstSlots[0];
    const s1 = R.elementBurstSlots[1];
    assert.ok(s0 && s0.active, 'Slot 0 active before update');
    R.updateElementBursts(0.5);
    assert.strictEqual(R.elementBurstSlots[0], s0, 'Slot 0 identity must not change');
    assert.strictEqual(R.elementBurstSlots[1], s1, 'Slot 1 identity must not change');
  });

  test('R.renderElementBursts does not throw with empty buffer', function() {
    resetBurst();
    assert.doesNotThrow(function() { R.renderElementBursts(ctxObj); });
  });

  test('buffer wraps around at capacity 60 — writeIdx stays in [0,60)', function() {
    resetBurst();
    for (let i = 0; i < 10; i++) R.elementBurst(100, 100, 'fire', false);
    assert.ok(R.elementBurstWriteIdx >= 0 && R.elementBurstWriteIdx < 60,
      'writeIdx out of range: ' + R.elementBurstWriteIdx);
    assert.ok(R.elementBurstCount <= 60, 'count exceeds 60: ' + R.elementBurstCount);
  });

  test('particles expire after their lifetime', function() {
    resetBurst();
    R.elementBurst(100, 100, 'fire', false);
    assert.ok(activeCount() > 0, 'Should have active particles before expiry');
    R.updateElementBursts(1.0);
    assert.strictEqual(activeCount(), 0, 'All particles should be inactive after 1s, got ' + activeCount());
  });

  test('crit particles have larger size than normal', function() {
    resetBurst();
    R.elementBurst(0, 0, 'fire', true);
    const critSize = R.elementBurstSlots[0].size;
    resetBurst();
    R.elementBurst(0, 0, 'fire', false);
    const normSize = R.elementBurstSlots[0].size;
    assert.ok(critSize > normSize, 'Crit size (' + critSize + ') should exceed normal size (' + normSize + ')');
  });

});
