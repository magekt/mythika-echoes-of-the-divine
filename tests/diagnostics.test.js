// Phase 20-01: diagnostics system contracts (dependency-free, CommonJS).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

function loadDiag(overrides) {
  const state = { scene: 'ashram', debugMode: false };
  const G = { W: 400, H: 720, state: state, scenes: {} };
  const Navigation = {
    go(routeId) { G.state.scene = routeId; return true; },
    transition(from, to) { return true; }
  };
  const Input = {
    clicks: [], touches: [],
    _pushTap(t) { (t.t === 'click' ? this.clicks : this.touches).push(t); }
  };
  const store = {};
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };
  const SaveSystem = {
    SAVE_KEY: 'mythika_save',
    save() { localStorage.setItem(this.SAVE_KEY, JSON.stringify({ state: G.state, version: 1 })); return true; },
    load() { return localStorage.getItem(this.SAVE_KEY) !== null; }
  };
  const R = {
    colors: { gold: '#e8a030', panel: '#111', text: '#fff', textDim: '#888', red: '#f00', green: '#0f0' },
    fonts: { sm: 's', md: 'm', mono: 'monospace' },
    radius: { xs: 3, s: 5, m: 8, l: 10 },
    reducedMotion: () => !!G.state.reduceMotion
  };
  const ctx = vm.createContext(Object.assign({
    console, performance, Date, Math, Object, Array, JSON, Error,
    G, Navigation, Input, SaveSystem, R, localStorage,
    requestAnimationFrame: () => null, cancelAnimationFrame: () => {},
    UI: { PremiumShell() {}, Tabbar() {} }
  }, overrides || {}));
  ctx.window = ctx;
  ctx.module = { exports: {} };
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/engine/diagnostics.js'), 'utf8'), ctx, { filename: 'diagnostics.js' });
  return { ctx, G, Navigation, Input, SaveSystem, R, Diagnostics: vm.runInContext('Diagnostics', ctx) };
}

test('toggle(false) clears buffers, deletes diagnostics, no console output', () => {
  const { G, Diagnostics } = loadDiag();
  const logged = [];
  Diagnostics.toggle(true);
  Diagnostics.recordFrame({ fps: 60, frameMs: 16.6, scriptGroups: [] });
  assert.equal(Diagnostics.collectors.frame.length, 1);
  const origLog = console.log;
  console.log = (...a) => logged.push(a);
  try { Diagnostics.toggle(false); } finally { console.log = origLog; }
  assert.equal(logged.length, 0);
  assert.equal(G.state.debugMode, false);
  assert.equal(G.state.diagnostics, undefined);
  Diagnostics.recordFrame({ fps: 60, frameMs: 16.6 });
  assert.equal(Diagnostics.isEnabled(), false);
});

test('frame collector bounded at 300, samples fps/frameMs/scriptGroups', () => {
  const { Diagnostics } = loadDiag();
  Diagnostics.toggle(true);
  for (let i = 0; i < 350; i++) Diagnostics.recordFrame({ fps: 60, frameMs: 16.6, scriptGroups: ['engine'] });
  assert.equal(Diagnostics.collectors.frame.length, 300);
  assert.equal(Diagnostics.BOUNDS.frame, 300);
  const s = Diagnostics.collectors.frame[0];
  assert.ok(typeof s.fps === 'number' && typeof s.frameMs === 'number');
  assert.ok(Array.isArray(s.scriptGroups) && typeof s.timestamp === 'number');
  Diagnostics.toggle(false);
});

test('transition collector bounded at 50 with from/to/fadeMs/initMs/cleanupMs', () => {
  const { Diagnostics } = loadDiag();
  Diagnostics.toggle(true);
  for (let i = 0; i < 60; i++) Diagnostics.recordTransition({ from: 'ashram', to: 'combat', fadeMs: 150, initMs: 5, cleanupMs: 3 });
  assert.equal(Diagnostics.collectors.transition.length, 50);
  const t = Diagnostics.collectors.transition[0];
  assert.deepEqual(Object.keys(t).sort(), ['cleanupMs', 'fadeMs', 'from', 'initMs', 'timestamp', 'to'].sort());
  Diagnostics.toggle(false);
});

test('input collector bounded at 200 with coords/hitTarget/viewport/safeArea', () => {
  const { Diagnostics } = loadDiag();
  Diagnostics.toggle(true);
  for (let i = 0; i < 210; i++) Diagnostics.recordInput({ type: 'touch', x: 10, y: 20, hitTarget: 'btn' });
  assert.equal(Diagnostics.collectors.input.length, 200);
  const e = Diagnostics.collectors.input[0];
  assert.ok(e.viewport && e.safeArea && typeof e.timestamp === 'number');
  Diagnostics.toggle(false);
});

test('persistence collector bounded at 20 with schema metadata', () => {
  const { Diagnostics } = loadDiag();
  Diagnostics.toggle(true);
  for (let i = 0; i < 25; i++) Diagnostics.recordPersistence({ type: 'save', schemaVersion: 1, migratedFields: [], storageBytes: 10 });
  assert.equal(Diagnostics.collectors.persistence.length, 20);
  Diagnostics.toggle(false);
});

test('invariants runner returns pass/warn/fail checks, on demand only', () => {
  const { G, Diagnostics } = loadDiag();
  Diagnostics.toggle(true);
  G.scenes.ashram = { data: { buttons: [{ h: 38 }, { h: 44 }] } };
  G.state.scene = 'ashram';
  const checks = Diagnostics.runInvariants();
  assert.ok(checks.length >= 5);
  for (const c of checks) assert.ok(['pass', 'warn', 'fail'].includes(c.status));
  const names = checks.map((c) => c.name);
  for (const n of ['canvasAlign', 'colorTokens', 'fontScale', 'radiusScale', 'touchTargets']) assert.ok(names.includes(n));
  Diagnostics.toggle(false);
});

test('panel: Ctrl+Shift+D / ?debug access, tabbed, mono font, export/clear', () => {
  const { Diagnostics } = loadDiag();
  assert.equal(Diagnostics.shouldOpenPanel({ key: 'D', ctrlKey: true, shiftKey: true }), true);
  assert.equal(Diagnostics.shouldOpenPanel({ key: 'd', metaKey: true, shiftKey: true }), true);
  assert.equal(Diagnostics.shouldOpenPanel({ key: 'd' }), false);
  assert.equal(Diagnostics.openFromQuery('?debug'), true);
  assert.equal(Diagnostics.openFromQuery('?probe'), false);
  Diagnostics.toggle(true);
  Diagnostics.recordFrame({ fps: 60, frameMs: 16.6 });
  assert.equal(Diagnostics.panel.open('input'), 'input');
  assert.ok(Array.isArray(Diagnostics.panel.rows()));
  const out = Diagnostics.panel.render(null);
  assert.equal(out.mono, 'monospace');
  const json = JSON.parse(Diagnostics.exportJSON());
  assert.deepEqual(Object.keys(json).sort(), ['frame', 'input', 'invariants', 'persistence', 'transition'].sort());
  Diagnostics.clearBuffers();
  assert.equal(Diagnostics.collectors.frame.length, 0);
  Diagnostics.toggle(false);
});

test('no gameplay mutations: only diagnostics buffer + debugMode touched', () => {
  const { G, Diagnostics } = loadDiag();
  G.state.gold = 5;
  Diagnostics.toggle(true);
  Diagnostics.recordFrame({ fps: 60, frameMs: 16 });
  Diagnostics.recordTransition({ from: 'a', to: 'b' });
  Diagnostics.recordInput({ type: 'click', x: 1, y: 2 });
  Diagnostics.recordPersistence({ type: 'save' });
  Diagnostics.runInvariants();
  assert.equal(G.state.gold, 5);
  assert.deepEqual(Object.keys(G.state).sort(), ['debugMode', 'diagnostics', 'gold', 'scene'].sort());
  Diagnostics.toggle(false);
});

test('hooks wrap Navigation/Input/SaveSystem transparently', () => {
  const { G, Navigation, Input, SaveSystem, Diagnostics } = loadDiag();
  Diagnostics.toggle(true);
  assert.equal(Navigation.go('combat'), true);
  assert.equal(G.state.scene, 'combat');
  assert.equal(Diagnostics.collectors.transition.length, 1);
  Input._pushTap({ x: 1, y: 2, t: 'click' });
  assert.equal(Diagnostics.collectors.input.length, 1);
  assert.equal(Input.clicks.length, 1);
  assert.equal(SaveSystem.save(), true);
  assert.equal(Diagnostics.collectors.persistence.length, 1);
  assert.equal(SaveSystem.load(), true);
  assert.equal(Diagnostics.collectors.persistence.length, 2);
  Diagnostics.toggle(false);
});
