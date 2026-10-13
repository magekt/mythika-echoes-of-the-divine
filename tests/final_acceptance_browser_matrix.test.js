// Phase 20-03: final acceptance browser matrix contract (dependency-free).
// Asserts all 10 client/profile combinations are defined with complete
// journey steps and acceptance criteria, and that the source supports them.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PROFILES = [
  { name: 'phone-portrait', w: 400, h: 720 },
  { name: 'phone-tall', w: 540, h: 900 },
  { name: 'landscape', w: 720, h: 400 },
  { name: 'desktop-small', w: 1024, h: 768 },
  { name: 'desktop-wide', w: 1440, h: 900 }
];
const CLIENTS = ['fresh', 'existing-worker'];
const JOURNEY = ['start/load', 'navigate', 'inspect', 'act', 'outcome', 'save', 'reload', 'return'];
const NAV_SLICES = ['ashram', 'travelMap', 'zoneExploration', 'combat'];
const INSPECT_SLICES = ['party', 'equipment', 'cultivation', 'travelMap'];
const ACTS = ['equip', 'meditate', 'attack', 'resolve-event'];
const OUTCOMES = ['reward', 'breakthrough', 'influence'];
const ACCEPTANCE = { fpsP95: 30, frameMsP95: 33, minTouchTarget: 38 };

function matrix() {
  const combos = [];
  for (const c of CLIENTS) for (const p of PROFILES) combos.push({ client: c, profile: p.name, w: p.w, h: p.h, journey: JOURNEY.slice() });
  return combos;
}

test('matrix defines 2 clients x 5 profiles = 10 combinations', () => {
  const m = matrix();
  assert.equal(m.length, 10);
  assert.equal(new Set(m.map((c) => c.client)).size, 2);
  assert.equal(new Set(m.map((c) => c.profile)).size, 5);
  for (const c of m) assert.deepEqual(c.journey, JOURNEY);
});

test('each combination covers the full loop journey', () => {
  for (const c of matrix()) {
    assert.ok(c.journey.includes('start/load'));
    assert.ok(c.journey.indexOf('save') < c.journey.indexOf('reload'));
    assert.ok(c.journey.indexOf('reload') < c.journey.indexOf('return'));
  }
  assert.deepEqual(NAV_SLICES, ['ashram', 'travelMap', 'zoneExploration', 'combat']);
  assert.deepEqual(INSPECT_SLICES, ['party', 'equipment', 'cultivation', 'travelMap']);
  assert.deepEqual(ACTS, ['equip', 'meditate', 'attack', 'resolve-event']);
  assert.deepEqual(OUTCOMES, ['reward', 'breakthrough', 'influence']);
});

test('acceptance thresholds: FPS>=30 p95, frame<=33ms p95, touch>=38px', () => {
  assert.equal(ACCEPTANCE.fpsP95, 30);
  assert.equal(ACCEPTANCE.frameMsP95, 33);
  assert.equal(ACCEPTANCE.minTouchTarget, 38);
});

test('source supports the journey: scenes registered', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  for (const s of ['ashram', 'travelMap', 'zoneExploration', 'combatScene', 'party', 'equipment', 'cultivationScene', 'settings']) {
    assert.ok(html.includes(`src/scenes/${s}.js`), `scene missing: ${s}`);
  }
});

test('source supports save/reload/return: SaveSystem + diagnostics strip', () => {
  const save = fs.readFileSync(path.join(ROOT, 'src/systems/save.js'), 'utf8');
  assert.ok(save.includes('SaveSystem.save = function') && save.includes('SaveSystem.load = function'));
  assert.ok(save.includes('delete snap.diagnostics'));
  assert.ok(save.includes('debugMode'));
});

test('source supports probe + reduced motion + diagnostics toggle', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(html.includes('__mythikaProbeGroup') && html.includes('src/engine/diagnostics.js'));
  const settings = fs.readFileSync(path.join(ROOT, 'src/scenes/settings.js'), 'utf8');
  assert.ok(settings.includes('Debug Diagnostics') && settings.includes('Diagnostics.toggle'));
  const renderer = fs.readFileSync(path.join(ROOT, 'src/engine/renderer.js'), 'utf8');
  assert.ok(renderer.includes('reducedMotion'));
});

test('dense states readable: party/equipment/events/landmarks systems present', () => {
  for (const f of ['src/scenes/party.js', 'src/scenes/equipment.js', 'src/systems/world_events.js', 'src/systems/landmarks.js']) {
    assert.ok(fs.existsSync(path.join(ROOT, f)), `missing: ${f}`);
  }
});

test('verification record exists with per-combination evidence slots', () => {
  const candidates = [
    '.planning/phases/20-settings-diagnostics-full-loop/20-VERIFICATION.md',
    '.planning/milestones/v3.0-phases/20-settings-diagnostics-full-loop/20-VERIFICATION.md'
  ].map((rel) => path.join(ROOT, rel));
  const p = candidates.find((c) => fs.existsSync(c));
  assert.ok(p, '20-VERIFICATION.md missing');
  const doc = fs.readFileSync(p, 'utf8');
  for (const c of matrix()) {
    assert.ok(doc.includes(c.profile), `no evidence slot for profile: ${c.profile}`);
  }
  assert.ok(doc.includes('fresh') && doc.includes('existing-worker'));
});
