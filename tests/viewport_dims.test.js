/* tests/viewport_dims.test.js
 *
 * Contract tests for Phase 42 adaptive fill viewport core (Plan 42-01):
 * pure computeViewportDims math + input-mapping regression pin.
 * node:test + assert/strict, zero dependencies.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const VIEWPORT_PATH = path.join(ROOT, 'src/engine/viewport.js');
const INPUT_PATH = path.join(ROOT, 'src/engine/input.js');

const ZERO = { t: 0, r: 0, b: 0, l: 0 };

function loadViewport() {
  // Fresh load so global attachment is observable per test file run.
  delete require.cache[VIEWPORT_PATH];
  return require(VIEWPORT_PATH);
}

function dimsOf(mod, vw, vh, dpr, safe) {
  const fn = mod.computeViewportDims || globalThis.computeViewportDims;
  assert.equal(typeof fn, 'function', 'computeViewportDims must be a function');
  return fn(vw, vh, dpr, safe);
}

test('phone portrait 390x844 fills edge-to-edge (mode: phone-portrait)', () => {
  const mod = loadViewport();
  assert.deepEqual(dimsOf(mod, 390, 844, 3, ZERO), { W: 400, H: 865, dpr: 3, mode: 'phone-portrait' });
});

test('phone landscape 844x390 becomes wide band (mode: phone-landscape)', () => {
  const mod = loadViewport();
  assert.deepEqual(dimsOf(mod, 844, 390, 3, ZERO), { W: 865, H: 400, dpr: 3, mode: 'phone-landscape' });
});

test('legacy 400x720 card size is identity (mode: phone-portrait)', () => {
  const mod = loadViewport();
  assert.deepEqual(dimsOf(mod, 400, 720, 1, ZERO), { W: 400, H: 720, dpr: 1, mode: 'phone-portrait' });
});

test('large portrait 540x900 scales down (mode: phone-portrait)', () => {
  const mod = loadViewport();
  assert.deepEqual(dimsOf(mod, 540, 900, 2, ZERO), { W: 400, H: 667, dpr: 2, mode: 'phone-portrait' });
});

test('landscape tablet band 720x400 (mode: phone-landscape)', () => {
  const mod = loadViewport();
  assert.deepEqual(dimsOf(mod, 720, 400, 2, ZERO), { W: 720, H: 400, dpr: 2, mode: 'phone-landscape' });
});

test('desktop 1024x768 keeps legacy card (mode: desktop)', () => {
  const mod = loadViewport();
  assert.deepEqual(dimsOf(mod, 1024, 768, 1, ZERO), { W: 400, H: 720, dpr: 1, mode: 'desktop' });
});

test('desktop 1440x900 keeps legacy card (mode: desktop)', () => {
  const mod = loadViewport();
  assert.deepEqual(dimsOf(mod, 1440, 900, 1, ZERO), { W: 400, H: 720, dpr: 1, mode: 'desktop' });
});

test('dpr is capped at 3 and falsy dpr falls back to 1', () => {
  const mod = loadViewport();
  assert.equal(dimsOf(mod, 390, 844, 4, ZERO).dpr, 3);
  assert.equal(dimsOf(mod, 390, 844, 0, ZERO).dpr, 1);
  assert.equal(dimsOf(mod, 390, 844, undefined, ZERO).dpr, 1);
});

test('safe-area insets shrink the usable area', () => {
  const mod = loadViewport();
  const d = dimsOf(mod, 390, 844, 3, { t: 47, r: 0, b: 34, l: 0 });
  assert.equal(d.H, 782);
  assert.ok(d.H < 865, 'insets must shrink H below the full-bleed 865');
  assert.equal(d.mode, 'phone-portrait');
});

test('input-mapping pin: rect-ratio mapping untouched', () => {
  const src = fs.readFileSync(INPUT_PATH, 'utf8');
  assert.match(src, /getBoundingClientRect/);
  assert.match(src, /\(G\.W \/ r\.width\)/);
});
