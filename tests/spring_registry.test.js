/* tests/spring_registry.test.js
 *
 * Phase 51 — Spring Config Registry.
 *
 * Tests R.springConfigs registry and R.springConfig resolver.
 *
 * node:test + node:assert only. Run: node --test tests/spring_registry.test.js
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const RENDERER_PATH = path.join(ROOT, 'src/engine/renderer.js');

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

const { R } = loadRenderer();

const EXPECTED_CONFIGS = [
  'buttonPress',
  'iconPress',
  'panelEnter',
  'modalOverlay',
  'modalButton',
  'revealStagger',
  'sceneEnter'
];

const EXPECTED_VALUES = {
  buttonPress: { stiffness: 300, damping: 24, target: 0.97 },
  iconPress: { stiffness: 300, damping: 24, target: 1.05 },
  panelEnter: { stiffness: 300, damping: 24, target: 1 },
  modalOverlay: { stiffness: 300, damping: 24, target: 1 },
  modalButton: { stiffness: 300, damping: 24, target: 1, delay: 40 },
  revealStagger: { stiffness: 300, damping: 24, target: 1, delay: 40 },
  sceneEnter: { stiffness: 300, damping: 24, target: 1, duration: 400 }
};

test('R.springConfigs exists and has all 7 expected configs', () => {
  for (const name of EXPECTED_CONFIGS) {
    assert.ok(R.springConfigs[name], `Missing config: ${name}`);
  }
  // Exactly 7 configs (no duplicates in registry)
  assert.strictEqual(Object.keys(R.springConfigs).length, 7);
});

test('Each config has correct keys and values', () => {
  for (const [name, expected] of Object.entries(EXPECTED_VALUES)) {
    const cfg = R.springConfigs[name];
    for (const [key, value] of Object.entries(expected)) {
      assert.strictEqual(cfg[key], value, `${name}.${key} should be ${value}`);
    }
    // No extra unexpected keys
    for (const key of Object.keys(cfg)) {
      assert.ok(expected.hasOwnProperty(key), `${name} has unexpected key: ${key}`);
    }
  }
});

test('R.springConfig(name) returns correct config object', () => {
  for (const name of EXPECTED_CONFIGS) {
    const cfg = R.springConfig(name);
    const expected = EXPECTED_VALUES[name];
    for (const [key, value] of Object.entries(expected)) {
      assert.strictEqual(cfg[key], value, `${name}.${key} should be ${value}`);
    }
  }
});

test('R.springConfig(name) throws on unknown name', () => {
  assert.throws(() => R.springConfig('nonexistent'), /Unknown spring config/);
  assert.throws(() => R.springConfig(''), /Unknown spring config/);
  assert.throws(() => R.springConfig(null), /Unknown spring config/);
});

test('R.spring(R.springConfigs.<name>) produces working step function', () => {
  for (const name of EXPECTED_CONFIGS) {
    const step = R.spring(R.springConfigs[name]);
    assert.strictEqual(typeof step, 'function');
    // Call with initial state
    const result = step(0, 0, 1/60);
    assert.ok(typeof result === 'object' && result !== null);
    assert.strictEqual(typeof result.value, 'number');
    assert.strictEqual(typeof result.velocity, 'number');
  }
});

test('Spring converges to target over 60 steps (dt=1/60)', () => {
  for (const [name, expected] of Object.entries(EXPECTED_VALUES)) {
    const target = expected.target;
    const step = R.spring(R.springConfigs[name]);
    let value = 0;
    let velocity = 0;
    for (let i = 0; i < 60; i++) {
      const s = step(value, velocity, 1/60);
      value = s.value;
      velocity = s.velocity;
    }
    // After 1 second at 60fps, should be close to target
    assert.ok(Math.abs(value - target) < 0.05, `${name} did not converge: ${value} vs ${target}`);
  }
});

test('Registry is extensible — add new config and verify resolution', () => {
  const testName = 'testCustom';
  const testCfg = { stiffness: 500, damping: 30, target: 2, customField: 'hello' };
  R.springConfigs[testName] = testCfg;
  try {
    const resolved = R.springConfig(testName);
    assert.deepStrictEqual(resolved, testCfg);
    const step = R.spring(resolved);
    const result = step(0, 0, 1/60);
    assert.strictEqual(typeof result.value, 'number');
  } finally {
    delete R.springConfigs[testName];
  }
});

test('Spring step function is pure — no shared state between calls', () => {
  const step = R.spring(R.springConfigs.buttonPress);
  const r1 = step(0, 0, 1/60);
  const r2 = step(0, 0, 1/60);
  // Same inputs produce same outputs
  assert.strictEqual(r1.value, r2.value);
  assert.strictEqual(r1.velocity, r2.velocity);
});

test('Spring configs have required base properties (stiffness, damping, target)', () => {
  for (const [name, cfg] of Object.entries(R.springConfigs)) {
    assert.ok('stiffness' in cfg, `${name} missing stiffness`);
    assert.ok('damping' in cfg, `${name} missing damping`);
    assert.ok('target' in cfg, `${name} missing target`);
    assert.ok(typeof cfg.stiffness === 'number' && cfg.stiffness > 0);
    assert.ok(typeof cfg.damping === 'number' && cfg.damping > 0);
    assert.ok(typeof cfg.target === 'number');
  }
});