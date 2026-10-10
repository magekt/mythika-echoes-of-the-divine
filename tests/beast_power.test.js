const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');

const BEAST_IDS = ['wolf', 'serpent', 'owl', 'bear', 'fox', 'dragon', 'phoenix', 'turtle', 'tiger', 'kitsune'];

// Cross-realm comparison: vm objects carry the sandbox prototype, so
// strict deepEqual needs a host-side JSON copy (matches beast_hearts.test.js).
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

function load(xpMap, opts) {
  const o = opts || {};
  const withBeasts = o.withBeasts === undefined ? true : o.withBeasts;
  const context = vm.createContext({
    console,
    G: o.noG ? undefined : { state: { beastBond: { xp: Object.assign({}, xpMap), feed: { day: 0, counts: {} }, train: { day: 0, counts: {} }, trainCd: {} } } },
    SPIRIT_BEASTS: withBeasts ? { wolf: {}, serpent: {}, owl: {}, bear: {}, fox: {}, dragon: {}, phoenix: {}, turtle: {}, tiger: {}, kitsune: {} } : undefined,
    Math: Math
  });
  context.globalThis = context;
  vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BeastBond = BeastBond;', context, { filename: BOND_PATH });
  return context;
}

// --- potency ---

test('potency maps threshold boundaries to 1/1.1/1.2/1.3', () => {
  const cases = [[0, 0, 1], [29, 0, 1], [30, 1, 1.1], [79, 1, 1.1], [80, 2, 1.2], [159, 2, 1.2], [160, 3, 1.3], [9999, 3, 1.3]];
  for (const [xp, heart, mult] of cases) {
    const ctx = load({ wolf: xp });
    const r = vm.runInContext('BeastBond.potencyFor("wolf")', ctx);
    assert.equal(r.heart, heart, 'xp ' + xp);
    assert.equal(r.mult, mult, 'xp ' + xp);
  }
});

test('potencyFor unknown/hostile ids yields heart 0 mult 1', () => {
  const ctx = load({ wolf: 160 });
  assert.deepEqual(host(vm.runInContext('BeastBond.potencyFor("nope")', ctx)), { heart: 0, mult: 1 });
  assert.deepEqual(host(vm.runInContext('BeastBond.potencyFor("__proto__")', ctx)), { heart: 0, mult: 1 });
  assert.deepEqual(host(vm.runInContext('BeastBond.potencyFor("")', ctx)), { heart: 0, mult: 1 });
  assert.deepEqual(host(vm.runInContext('BeastBond.potencyFor(null)', ctx)), { heart: 0, mult: 1 });
});

// --- flat boost ---

test('statBoostFor zeros below heart 2, +10/+1x4 at heart 2+', () => {
  const zero = { hp: 0, str: 0, agi: 0, def: 0, mag: 0 };
  const full = { hp: 10, str: 1, agi: 1, def: 1, mag: 1 };
  assert.deepEqual(host(vm.runInContext('BeastBond.statBoostFor("wolf")', load({ wolf: 0 }))), zero);
  assert.deepEqual(host(vm.runInContext('BeastBond.statBoostFor("wolf")', load({ wolf: 79 }))), zero);
  assert.deepEqual(host(vm.runInContext('BeastBond.statBoostFor("wolf")', load({ wolf: 80 }))), full);
  assert.deepEqual(host(vm.runInContext('BeastBond.statBoostFor("wolf")', load({ wolf: 9999 }))), full);
  assert.deepEqual(host(vm.runInContext('BeastBond.statBoostFor("nope")', load({ wolf: 9999 }))), zero);
});

test('statBoostFor returns fresh refs (caller mutation is isolated)', () => {
  const ctx = load({ wolf: 160 });
  const a = vm.runInContext('BeastBond.statBoostFor("wolf")', ctx);
  const b = vm.runInContext('BeastBond.statBoostFor("wolf")', ctx);
  assert.notEqual(a, b);
  a.hp = 999;
  assert.equal(vm.runInContext('BeastBond.statBoostFor("wolf").hp', ctx), 10);
});

// --- auras ---

test('auraFor null at hearts 0-1, defined for all 10 beasts at hearts 2-3', () => {
  for (const id of BEAST_IDS) {
    assert.equal(vm.runInContext('BeastBond.auraFor("' + id + '")', load({ [id]: 0 })), null, id + ' h0');
    assert.equal(vm.runInContext('BeastBond.auraFor("' + id + '")', load({ [id]: 79 })), null, id + ' h1');
    const two = vm.runInContext('BeastBond.auraFor("' + id + '")', load({ [id]: 80 }));
    const three = vm.runInContext('BeastBond.auraFor("' + id + '")', load({ [id]: 160 }));
    for (const r of [two, three]) {
      assert.ok(r && typeof r.key === 'string' && typeof r.name === 'string' && typeof r.desc === 'string', id);
      assert.ok(r.effect && typeof r.effect === 'object', id + ' effect');
      assert.ok(['heal', 'shield', 'buff'].includes(r.effect.kind), id + ' kind');
    }
  }
  const ctx = load({ wolf: 160 });
  assert.equal(vm.runInContext('BeastBond.auraFor("nope")', ctx), null);
  assert.equal(vm.runInContext('BeastBond.auraFor("__proto__")', ctx), null);
});

test('aura effect values match the locked plan table', () => {
  const expected = {
    wolf: { kind: 'heal', amount: 4 },
    serpent: { kind: 'shield', amount: 5 },
    owl: { kind: 'heal', amount: 3 },
    bear: { kind: 'shield', amount: 6 },
    fox: { kind: 'heal', amount: 5 },
    dragon: { kind: 'buff', buff: 'atkBuff', value: 1.05, turns: 2 },
    phoenix: { kind: 'heal', amount: 6 },
    turtle: { kind: 'buff', buff: 'defBuff', value: 1.05, turns: 2 },
    tiger: { kind: 'buff', buff: 'atkBuff', value: 1.05, turns: 2 },
    kitsune: { kind: 'shield', amount: 4 }
  };
  for (const [id, fx] of Object.entries(expected)) {
    const r = vm.runInContext('BeastBond.auraFor("' + id + '")', load({ [id]: 160 }));
    assert.deepEqual(host(r.effect), fx, id);
  }
  const keys = vm.runInContext('BeastBond.auraFor("wolf").key', load({ wolf: 160 }));
  assert.equal(keys, 'moonlit_vigor');
});

test('auraFor deep-copies (mutating a result does not pollute the next)', () => {
  const ctx = load({ fox: 160 });
  const a = vm.runInContext('BeastBond.auraFor("fox")', ctx);
  a.effect.amount = 999;
  a.name = 'HACK';
  const b = vm.runInContext('BeastBond.auraFor("fox")', ctx);
  assert.equal(b.effect.amount, 5);
  assert.equal(b.name, 'Ember Regen');
});

// --- robustness ---

test('power APIs degrade safe when G/beastBond/SPIRIT_BEASTS are absent', () => {
  const ctx = load({}, { noG: true, withBeasts: true });
  assert.deepEqual(host(vm.runInContext('BeastBond.potencyFor("wolf")', ctx)), { heart: 0, mult: 1 });
  assert.deepEqual(host(vm.runInContext('BeastBond.statBoostFor("wolf")', ctx)), { hp: 0, str: 0, agi: 0, def: 0, mag: 0 });
  assert.equal(vm.runInContext('BeastBond.auraFor("wolf")', ctx), null);
  const ctx2 = load({ wolf: 160 }, { withBeasts: false });
  // allow-all fallback: known-id gate opens, thresholds still apply
  assert.equal(vm.runInContext('BeastBond.potencyFor("wolf").mult', ctx2), 1.3);
  assert.equal(vm.runInContext('BeastBond.auraFor("wolf").key', ctx2), 'moonlit_vigor');
});
