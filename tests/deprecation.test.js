// Phase 19-02: deprecation scanner + save migration contracts.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DEP_PATH = path.join(ROOT, 'src/engine/deprecation.js');
const SAVE_PATH = path.join(ROOT, 'src/systems/save.js');

function loadDep() {
  const ctx = vm.createContext({ console, Object, Array, String, Number, Math, Date, RegExp, JSON });
  vm.runInContext(fs.readFileSync(DEP_PATH, 'utf8'), ctx, { filename: 'deprecation.js' });
  return vm.runInContext('Deprecation', ctx);
}

test('static analysis finds candidates: unused exports, dead paths, aliases', () => {
  const D = loadDep();
  const sources = [
    { file: 'a.js', text: 'const usedHelper = function() {}; const deadHelper = function() {}; usedHelper();' },
    { file: 'b.js', text: 'function v1Alias() {} function liveFn() {} liveFn(); liveFn();' }
  ];
  const cands = D.scan(sources);
  const byName = {};
  cands.forEach(c => { byName[c.name] = c; });
  assert.ok(byName.deadHelper, 'dead helper detected');
  assert.equal(byName.deadHelper.refs, 0);
  assert.ok(byName.usedHelper.refs > 0);
  assert.ok(byName.v1Alias && byName.v1Alias.refs === 0);
});

test('runtime probe instruments calls; 5-min session model logs usage', () => {
  const ctx = vm.createContext({ console, Object, Array, String, Number, Math, Date, RegExp, JSON });
  ctx.oldFn = function () { return 1; };
  vm.runInContext(fs.readFileSync(DEP_PATH, 'utf8'), ctx, { filename: 'deprecation.js' });
  const D = vm.runInContext('Deprecation', ctx);
  vm.runInContext('Deprecation.probe(["oldFn"]); oldFn(); oldFn();', ctx);
  assert.equal(vm.runInContext('Deprecation.runtimeMap().oldFn', ctx), 2);
});

test('removal safety: zero static refs + zero runtime hits + contract', () => {
  const D = loadDep();
  assert.equal(D.verifyRemoval({ name: 'dead', refs: 0, runtimeHits: 0 }), true);
  assert.equal(D.verifyRemoval({ name: 'live', refs: 3, runtimeHits: 0 }), false);
  assert.equal(D.verifyRemoval({ name: 'hot', refs: 0, runtimeHits: 5 }), false);
  assert.equal(D.verifyRemoval({ name: 'alias', refs: 0, runtimeHits: 0, replacement: 'newFn' }), false);
  assert.equal(D.verifyRemoval({ name: 'alias', refs: 0, runtimeHits: 0, replacement: 'newFn' }, { replacementHasContract: true }), true);
});

test('removal log formats file/function/replacement/evidence/contract', () => {
  const D = loadDep();
  const line = D.logRemoval({ file: 'src/x.js', fn: 'old', replacement: 'neu', evidence: 'grep:0 refs', contract: 'tests/x.test.js', status: 'removed' });
  for (const bit of ['src/x.js', 'old', 'neu', 'grep:0 refs', 'tests/x.test.js', 'removed']) {
    assert.ok(line.includes(bit), 'log contains ' + bit);
  }
});

test('save migration: fresh v3, v2, legacy, direct, cached all hydrate', () => {
  // Live check against real src/systems/save.js in a stubbed vm.
  const ctx = vm.createContext({
    console, JSON, Math, Object, Array, String, Number, Boolean, Date,
    parseFloat, isFinite, localStorage: { _s: {}, getItem(k) { return this._s[k] || null; }, setItem(k, v) { this._s[k] = String(v); } },
    ZoneRewardSystem: { normalize() {} },
    G: { state: {}, createDefaultState() { return { inventory: [], party: [], player: null, gold: 0, flags: {}, perks: {}, encounters: {}, world: { regions: {} } }; } }
  });
  vm.runInContext(fs.readFileSync(SAVE_PATH, 'utf8'), ctx, { filename: 'save.js' });
  const D = loadDep();
  const fixtures = [
    { name: 'fresh-v3', state: { gold: 10, inventory: [{ name: 'sword' }], party: [{ id: 1 }], flags: {} } },
    { name: 'v2-save', state: { gold: '25', inventory: ['legacy-string', { name: 'bow' }], party: [], flags: {} } },
    { name: 'legacy-save', state: { gold: NaN, inventory: null, party: 'x', challenge: 'abc' } },
    { name: 'direct-boot', state: { gold: 0, inventory: [], party: [], flags: {} } },
    { name: 'cached-boot', state: { gold: 5, inventory: [], party: [], flags: {}, uiFontScale: 1.2 } }
  ];
  const results = D.checkSaveMigration(
    (st) => vm.runInContext('SaveSystem.hydrate(__st)', vm.createContext(Object.assign({}, ctx, { __st: st }))) ,
    fixtures,
    () => true
  );
  // hydrate mutates the shared stub G; run sequentially in one context instead.
  const seq = fixtures.map((f) => {
    ctx.__st = f.state;
    let ok = false;
    try { ok = !!vm.runInContext('SaveSystem.hydrate(__st)', ctx); } catch (e) { ok = false; }
    const st = vm.runInContext('G.state', ctx);
    const shapeOk = Array.isArray(st.inventory) && Array.isArray(st.party) && st.flags && typeof st.flags === 'object';
    return { name: f.name, ok: ok && shapeOk, error: null };
  });
  assert.ok(results.length === 5, 'helper covers all fixtures');
  for (const r of seq) assert.equal(r.ok, true, r.name + ' hydrates to canonical shape');
  // Unrelated progress preserved: gold survives fresh hydrate.
  ctx.__st = { gold: 42, inventory: [], party: [], flags: { metElder: true } };
  vm.runInContext('SaveSystem.hydrate(__st)', ctx);
  const st = vm.runInContext('G.state', ctx);
  assert.equal(st.gold, 42);
  assert.equal(st.flags.metElder, true);
});

test('scanner performs no gameplay mutations', () => {
  const D = loadDep();
  const before = JSON.stringify(D.runtimeMap());
  D.scan([{ file: 'x.js', text: 'const a = function(){}; a();' }]);
  D.logRemoval({ file: 'x', fn: 'a' });
  assert.equal(JSON.stringify(D.runtimeMap()), before);
});
