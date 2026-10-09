// Phase 20-02: cross-phase diagnostics integration + regression contracts.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

function loadDiag() {
  const state = { scene: 'ashram', debugMode: false, W: undefined };
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
  const ctx = vm.createContext({
    console, performance, Date, Math, Object, Array, JSON, Error,
    G, Navigation, Input, SaveSystem, R, localStorage,
    requestAnimationFrame: () => null, cancelAnimationFrame: () => {},
    UI: {}
  });
  ctx.window = ctx;
  ctx.module = { exports: {} };
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/engine/diagnostics.js'), 'utf8'), ctx, { filename: 'diagnostics.js' });
  return { ctx, G, Navigation, Input, SaveSystem, Diagnostics: vm.runInContext('Diagnostics', ctx) };
}

test('frame scriptGroups match index.html order (engine,data,systems,ui,scenes,boot)', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const groups = ['engine', 'data', 'systems', 'ui', 'scenes', 'boot'];
  let lastIdx = -1;
  for (const g of groups) {
    const i = html.indexOf(`__mythikaProbeGroup('${g}','start')`);
    assert.ok(i > lastIdx, `probe group marker missing/out of order: ${g}`);
    lastIdx = i;
  }
  const { Diagnostics } = loadDiag();
  assert.deepEqual(Array.from(Diagnostics.SCRIPT_GROUPS), groups);
});

test('diagnostics script registered after navigation.js, before scenes', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const nav = html.indexOf('src/engine/navigation.js');
  const diag = html.indexOf('src/engine/diagnostics.js');
  const firstScene = html.indexOf('src/scenes/title.js');
  assert.ok(nav !== -1 && diag !== -1 && firstScene !== -1);
  assert.ok(nav < diag && diag < firstScene);
});

test('transition hooks record Navigation.go/transition for core slice', () => {
  const env = loadDiag();
  env.Diagnostics.toggle(true);
  assert.equal(env.Navigation.go('travelMap'), true);
  assert.equal(env.Navigation.transition('ashram', 'travelMap'), true);
  assert.equal(env.Diagnostics.collectors.transition.length, 2);
  const t = env.Diagnostics.collectors.transition[1];
  assert.equal(t.to, 'travelMap');
  assert.ok(typeof t.fadeMs === 'number' && typeof t.cleanupMs === 'number');
  env.Diagnostics.toggle(false);
});

test('input hooks record hitTarget alignment across 5 viewports', () => {
  const env = loadDiag();
  env.Diagnostics.toggle(true);
  const viewports = [[400, 720], [540, 900], [720, 400], [1024, 768], [1440, 900]];
  for (const [w, h] of viewports) {
    env.G.W = w; env.G.H = h;
    env.Input._pushTap({ x: w / 2, y: h / 2, t: 'touch', hitTarget: 'probe-btn' });
  }
  assert.equal(env.Diagnostics.collectors.input.length, 5);
  assert.deepEqual(Array.from(env.Diagnostics.collectors.input.map((e) => e.viewport.w)), [400, 540, 720, 1024, 1440]);
  assert.ok(env.Diagnostics.collectors.input.every((e) => e.hitTarget === 'probe-btn'));
  env.Diagnostics.toggle(false);
});

test('persistence hooks record save/load with schemaVersion + storageBytes', () => {
  const env = loadDiag();
  env.Diagnostics.toggle(true);
  assert.equal(env.SaveSystem.save(), true);
  assert.equal(env.SaveSystem.load(), true);
  const rows = env.Diagnostics.collectors.persistence;
  assert.equal(rows.length, 2);
  assert.deepEqual(Array.from(rows.map((r) => r.type)), ['save', 'load']);
  assert.ok(rows.every((r) => r.schemaVersion === 1 && typeof r.storageBytes === 'number' && Array.isArray(r.migratedFields)));
  env.Diagnostics.toggle(false);
});

test('invariants: zero raw hex in diagnostics.js; uses R.tokens', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/engine/diagnostics.js'), 'utf8');
  const hexes = src.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  assert.deepEqual(hexes, []);
  assert.ok(src.includes('R.fonts.mono') && src.includes('R.colors'));
  assert.ok(src.includes('.radius') && src.includes('reducedMotion'));
});

test('?probe independent of debugMode; disabled diagnostics = silent', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(html.includes('__mythikaProbeGroup'));
  const logged = [];
  const origLog = console.log;
  console.log = (...a) => logged.push(a);
  try {
    const env = loadDiag();
    assert.equal(env.Diagnostics.isEnabled(), false);
    env.Diagnostics.recordFrame({ fps: 60, frameMs: 16 });
    env.Diagnostics.recordInput({ type: 'click', x: 1, y: 1 });
  } finally { console.log = origLog; }
  assert.equal(logged.length, 0);
});

test('save/load round-trip with debugMode=true; disable clears buffers', () => {
  const env = loadDiag();
  env.Diagnostics.toggle(true);
  env.G.state.gold = 42;
  assert.equal(env.SaveSystem.save(), true);
  env.G.state.gold = 0;
  assert.equal(env.SaveSystem.load(), true);
  assert.ok(env.Diagnostics.collectors.persistence.length >= 2);
  env.Diagnostics.toggle(false);
  assert.equal(env.G.state.diagnostics, undefined);
  assert.equal(env.G.state.debugMode, false);
  // Save output strips diagnostics even if re-enabled buffers exist.
  env.Diagnostics.toggle(true);
  env.Diagnostics.recordFrame({ fps: 60, frameMs: 16 });
  const saveSrc = fs.readFileSync(path.join(ROOT, 'src/systems/save.js'), 'utf8');
  assert.ok(saveSrc.includes('delete snap.diagnostics'));
  env.Diagnostics.toggle(false);
});

test('hooks are transparent: system behavior unchanged, wrappers idempotent', () => {
  const env = loadDiag();
  env.Diagnostics.toggle(true);
  env.Diagnostics.installHooks();
  env.Diagnostics.installHooks();
  assert.equal(env.Navigation.go('combat'), true);
  assert.equal(env.G.state.scene, 'combat');
  assert.equal(env.Diagnostics.collectors.transition.length, 1);
  env.Input._pushTap({ x: 5, y: 5, t: 'click' });
  assert.equal(env.Input.clicks.length, 1);
  env.Diagnostics.toggle(false);
});
