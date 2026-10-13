const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const BEASTS_PATH = path.join(ROOT, 'src/data/spirit_beasts.js');

function host(value) {
  return JSON.parse(JSON.stringify(value));
}

function wolfBeast(level, stage) {
  return { id: 'wolf', name: 'Shadow Wolf', tier: 1, hp: 20, maxHp: 20, str: 3, agi: 4, def: 2, mag: 1, skill: 'Howl', desc: 'x', level: level, xp: 0, active: true, evolutionStage: stage || 0, evolutionForm: null };
}

// Sandbox: real bond.js + real spirit_beasts.js, stub G with one wolf.
function load(wolfLevel, bondXp, opts) {
  const o = opts || {};
  const withBond = o.withBond === undefined ? true : o.withBond;
  const stage = o.stage || 0;
  const context = vm.createContext({
    console,
    G: { state: { spiritBeasts: [wolfBeast(wolfLevel, stage)], beastBond: { xp: { wolf: bondXp }, feed: { day: 0, counts: {} }, train: { day: 0, counts: {} }, trainCd: {} } } },
    SPIRIT_BEASTS: { wolf: {}, serpent: {}, owl: {}, bear: {}, fox: {}, dragon: {}, phoenix: {}, turtle: {}, tiger: {}, kitsune: {} },
    Math: Math
  });
  context.globalThis = context;
  if (withBond) {
    vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BeastBond = BeastBond;', context, { filename: BOND_PATH });
  }
  vm.runInContext(fs.readFileSync(BEASTS_PATH, 'utf8'), context, { filename: BEASTS_PATH });
  return context;
}

// --- requiredLevelFor ---

test('requiredLevelFor halves at heart 3, base otherwise, Infinity unknown', () => {
  assert.equal(vm.runInContext('requiredLevelFor("wolf", 0)', load(1, 160)), 5);
  assert.equal(vm.runInContext('requiredLevelFor("wolf", 1)', load(1, 160)), 12);
  assert.equal(vm.runInContext('requiredLevelFor("wolf", 0)', load(1, 80)), 10);
  assert.equal(vm.runInContext('requiredLevelFor("wolf", 1)', load(1, 79)), 25);
  assert.equal(vm.runInContext('requiredLevelFor("wolf", 0)', load(1, 0)), 10);
  assert.equal(vm.runInContext('requiredLevelFor("nope", 0)', load(1, 160)), Infinity);
  assert.equal(vm.runInContext('requiredLevelFor("wolf", 9)', load(1, 160)), Infinity);
});

test('requiredLevelFor degrades to base when BeastBond is absent', () => {
  assert.equal(vm.runInContext('requiredLevelFor("wolf", 0)', load(1, 160, { withBond: false })), 10);
  assert.equal(vm.runInContext('requiredLevelFor("wolf", 1)', load(1, 160, { withBond: false })), 25);
});

// --- canEvolve / getBeastEvolution / evolveBeast ---

test('heart-3 wolf canEvolve at 5, not at 4; unbonded needs 10', () => {
  assert.equal(vm.runInContext('canEvolve(G.state.spiritBeasts[0])', load(5, 160)), true);
  assert.equal(vm.runInContext('canEvolve(G.state.spiritBeasts[0])', load(4, 160)), false);
  assert.equal(vm.runInContext('canEvolve(G.state.spiritBeasts[0])', load(9, 0)), false);
  assert.equal(vm.runInContext('canEvolve(G.state.spiritBeasts[0])', load(10, 0)), true);
  assert.equal(vm.runInContext('canEvolve(G.state.spiritBeasts[0])', load(12, 160, { stage: 1 })), true);
  assert.equal(vm.runInContext('canEvolve(G.state.spiritBeasts[0])', load(11, 160, { stage: 1 })), false);
});

test('getBeastEvolution returns the stage form at assisted levels', () => {
  assert.equal(vm.runInContext('getBeastEvolution("wolf", 5).form', load(5, 160)), 'direWolf');
  assert.equal(vm.runInContext('getBeastEvolution("wolf", 4)', load(4, 160)), null);
  assert.equal(vm.runInContext('getBeastEvolution("wolf", 9)', load(9, 0)), null);
});

test('evolveBeast at assisted level grants the identical form as a base-level evolve', () => {
  const assisted = load(5, 160);
  const base = load(10, 0);
  const ra = host(vm.runInContext('evolveBeast(G.state.spiritBeasts[0])', assisted));
  const rb = host(vm.runInContext('evolveBeast(G.state.spiritBeasts[0])', base));
  assert.equal(ra.form, 'direWolf');
  assert.deepEqual(ra, rb);
  assert.equal(vm.runInContext('G.state.spiritBeasts[0].evolutionForm', assisted), 'direWolf');
});

// --- getBeastBonus flat boost ---

test('getBeastBonus adds exactly the heart-2 deltas on base and evolved stats', () => {
  const plain = host(vm.runInContext('getBeastBonus(G.state.spiritBeasts[0])', load(1, 0)));
  const boosted = host(vm.runInContext('getBeastBonus(G.state.spiritBeasts[0])', load(1, 80)));
  assert.deepEqual(boosted, { hp: plain.hp + 10, str: plain.str + 1, agi: plain.agi + 1, def: plain.def + 1, mag: plain.mag + 1 });
  // evolved form stacks too
  const ctx = load(10, 160);
  vm.runInContext('evolveBeast(G.state.spiritBeasts[0])', ctx);
  const evoBoosted = host(vm.runInContext('getBeastBonus(G.state.spiritBeasts[0])', ctx));
  assert.equal(evoBoosted.hp, 35 + 10 * 3 + 10); // form hp + l*3 + boost
  assert.equal(evoBoosted.str, 6 + 10 * 1.5 + 1);
});

test('getBeastBonus heart 0-1 output matches the pre-boost formula', () => {
  const r = host(vm.runInContext('getBeastBonus(G.state.spiritBeasts[0])', load(4, 79)));
  assert.deepEqual(r, { hp: 20 + 8, str: 3 + 4, agi: 4 + 4, def: 2 + 4, mag: 1 + 4 });
});

// --- potency math mirror (locks the doBeastSkill formulas) ---

test('plan potency formulas on fixed inputs', () => {
  assert.equal(Math.max(1, Math.floor(25 * (1 + 6 * 0.1) * 1.3)), 52); // Spirit Flame, mag 6, heart 3
  assert.equal(Math.max(1, Math.floor(40 * (1 + 7 * 0.1) * 1.3)), 88); // Tempest, mag 7, heart 3
  assert.equal(Math.floor(20 * 1.3), 26); // Shell Guard heart 3
  assert.equal(1 + 0.10 * 1.3, 1.13); // Howl heart 3 (scene stores float)
  assert.equal(1 - 0.15 * 1, 0.85); // Dark Veil heart 0 unchanged
  assert.equal(3 + 3, 6); // ailment duration heart 3
  assert.equal(0.30 + 0.05 * 3, 0.45); // revive fraction heart 3
});
