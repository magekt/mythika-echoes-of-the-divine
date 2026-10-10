const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];

function toHost(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadBond(affinity, party) {
  const context = vm.createContext({
    console,
    G: { state: { party: party || [], affinity: affinity === undefined ? {} : affinity } },
    HERO_IDS: HERO_IDS.slice(),
    HEROES: { arjuna: {}, bhima: {}, karna: {}, draupadi: {}, hanuman: {} }
  });
  context.globalThis = context;
  const source = fs.readFileSync(BOND_PATH, 'utf8');
  vm.runInContext(source + '\n;globalThis.BondSystem = BondSystem;', context, { filename: BOND_PATH });
  return context.BondSystem;
}

test('tierFor resolves DAO boundaries deterministically', () => {
  const Bond = loadBond({}, []);
  assert.equal(Bond.tierFor(-5), 'Wary');
  assert.equal(Bond.tierFor(0), 'Wary');
  assert.equal(Bond.tierFor(24), 'Wary');
  assert.equal(Bond.tierFor(25), 'Trusted');
  assert.equal(Bond.tierFor(49), 'Trusted');
  assert.equal(Bond.tierFor(50), 'Sworn');
  assert.equal(Bond.tierFor(89), 'Sworn');
  assert.equal(Bond.tierFor(90), 'Legend');
  assert.equal(Bond.tierFor(100), 'Legend');
  assert.equal(Bond.tierFor(150), 'Legend');
  assert.equal(Bond.tierFor(NaN), 'Wary');
  assert.equal(Bond.tierFor('x'), 'Wary');
  assert.equal(Bond.tierFor(undefined), 'Wary');
  assert.equal(Bond.tierFor(24.9), 'Wary');
  assert.equal(Bond.tierFor(25.7), 'Trusted');
});

test('valueFor clamps and tolerates missing maps', () => {
  const Bond = loadBond({ arjuna: 150, bhima: -3, karna: 'abc' }, []);
  assert.equal(Bond.valueFor('arjuna'), 100);
  assert.equal(Bond.valueFor('bhima'), 0);
  assert.equal(Bond.valueFor('karna'), 0);
  assert.equal(Bond.valueFor('draupadi'), 0);
  const missing = loadBond(undefined, []);
  // simulate missing map
  assert.equal(missing.valueFor('arjuna'), 0);
});

test('get() gates visibility on recruitment per D-03', () => {
  const Bond = loadBond({ arjuna: 40 }, [{ id: 'arjuna' }]);
  assert.deepEqual(toHost(Bond.get('arjuna')), { value: 40, tier: 'Trusted', visible: true });
  assert.deepEqual(toHost(Bond.get('bhima')), { value: 0, tier: 'Wary', visible: false });
  assert.deepEqual(toHost(Bond.get('unknownhero')), { value: 0, tier: 'Wary', visible: false });
  assert.deepEqual(toHost(Bond.get('__proto__')), { value: 0, tier: 'Wary', visible: false });
});

test('normalize heals hostile and unknown keys without throwing', () => {
  const Bond = loadBond({}, []);
  const candidate = JSON.parse('{"arjuna":200,"bhima":"junk","unknownhero":30,"constructor":5}');
  candidate['__proto__'] = { x: 1 };
  const out = Bond.normalize(candidate);
  assert.deepEqual(toHost(out), { arjuna: 100, bhima: 0 });
  assert.equal(Object.prototype.hasOwnProperty.call(out, 'unknownhero'), false);
  assert.equal({}.x, undefined);
  assert.equal(Object.prototype.x, undefined);
});

test('normalize non-object candidates become empty plain objects', () => {
  const Bond = loadBond({}, []);
  assert.deepEqual(toHost(Bond.normalize(null)), {});
  assert.deepEqual(toHost(Bond.normalize([1, 2])), {});
  assert.deepEqual(toHost(Bond.normalize('junk')), {});
  assert.deepEqual(toHost(Bond.normalize(undefined)), {});
  const out = Bond.normalize({ arjuna: 10 });
  assert.equal(Object.getPrototypeOf(toHost(out)), Object.prototype);
});

test('ensureSeed seeds missing keys only', () => {
  const context = vm.createContext({
    console,
    G: { state: { party: [{ id: 'arjuna' }], affinity: { bhima: 30 } } },
    HERO_IDS: HERO_IDS.slice(),
    HEROES: { arjuna: {}, bhima: {}, karna: {}, draupadi: {}, hanuman: {} }
  });
  context.globalThis = context;
  const source = fs.readFileSync(BOND_PATH, 'utf8');
  vm.runInContext(source + '\n;globalThis.BondSystem = BondSystem;', context, { filename: BOND_PATH });
  const Bond = context.BondSystem;
  assert.equal(Bond.ensureSeed('arjuna'), true);
  assert.equal(context.G.state.affinity.arjuna, 0);
  assert.equal(Bond.ensureSeed('bhima'), false);
  assert.equal(context.G.state.affinity.bhima, 30);
  assert.equal(Bond.ensureSeed('__proto__'), false);
  assert.equal(Bond.ensureSeed('unknownhero'), false);
});
