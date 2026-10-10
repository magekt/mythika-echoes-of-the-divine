const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const GAME_PATH = path.join(ROOT, 'src/engine/game.js');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const SAVE_PATH = path.join(ROOT, 'src/systems/save.js');
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];

function toHost(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadContract(options = {}) {
  const storage = new Map();
  const localStorage = {
    getItem: key => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
  };
  const context = vm.createContext({
    console,
    setTimeout,
    clearTimeout,
    performance: { now: () => 0 },
    location: { search: '' },
    localStorage,
    document: { getElementById: () => null, addEventListener: () => {} },
    window: {
      innerWidth: 400,
      innerHeight: 720,
      devicePixelRatio: 1,
      addEventListener: () => {},
      console
    },
    HERO_IDS: HERO_IDS.slice(),
    HEROES: { arjuna: {}, bhima: {}, karna: {}, draupadi: {}, hanuman: {} }
  });
  context.globalThis = context;
  const gameSource = fs.readFileSync(GAME_PATH, 'utf8');
  vm.runInContext(gameSource + '\n;globalThis.G = G;', context, { filename: GAME_PATH });
  if (!options.withoutBond) {
    const bondSource = fs.readFileSync(BOND_PATH, 'utf8');
    vm.runInContext(bondSource + '\n;globalThis.BondSystem = BondSystem;', context, { filename: BOND_PATH });
  }
  const saveSource = fs.readFileSync(SAVE_PATH, 'utf8');
  vm.runInContext(saveSource + '\n;globalThis.SaveSystem = SaveSystem;', context, { filename: SAVE_PATH });
  return { G: context.G, BondSystem: context.BondSystem, SaveSystem: context.SaveSystem, localStorage, context };
}

test('fresh state contains an empty affinity map', () => {
  const { G } = loadContract();
  assert.deepEqual(toHost(G.createDefaultState().affinity), {});
});

test('affinity values survive a save-load round trip', () => {
  const { G, SaveSystem } = loadContract();
  G.state.gold = 500;
  G.state.flags.welcomeGold = true;
  G.state.affinity = { arjuna: 40, bhima: 90 };
  assert.equal(SaveSystem.save(), true);
  G.state = G.createDefaultState();
  assert.equal(SaveSystem.load(), true);
  assert.deepEqual(toHost(G.state.affinity), { arjuna: 40, bhima: 90 });
  assert.equal(G.state.gold, 500);
});

test('legacy saves without affinity heal to an empty map', () => {
  const { G, SaveSystem } = loadContract();
  const legacy = {
    player: { id: 'arjuna', name: 'Arjuna' },
    party: [{ id: 'arjuna', name: 'Arjuna', hp: 80 }],
    gold: 4321,
    flags: { pilgrimageComplete: true, welcomeGold: true },
    encounters: { seen: { hermit: true } }
  };
  assert.equal(SaveSystem.hydrate(legacy), true);
  assert.deepEqual(toHost(G.state.affinity), {});
  assert.equal(G.state.gold, 4321);
  assert.deepEqual(toHost(G.state.party), legacy.party);
});

test('malformed affinity maps are clamped and cleaned', () => {
  const { G, SaveSystem } = loadContract();
  const state = G.createDefaultState();
  state.affinity = JSON.parse('{"arjuna":200,"bhima":-5,"karna":"junk","draupadi":null,"unknownhero":30,"constructor":7}');
  state.affinity['__proto__'] = { polluted: true };
  assert.equal(SaveSystem.hydrate(state), true);
  assert.deepEqual(toHost(G.state.affinity), { arjuna: 100, bhima: 0, karna: 0, draupadi: 0 });
  assert.equal({}.polluted, undefined);
  assert.equal(Object.prototype.polluted, undefined);
});

test('non-object affinity maps heal to an empty map', () => {
  for (const bad of [null, [1, 2], 'junk', 42]) {
    const { G, SaveSystem } = loadContract();
    const state = G.createDefaultState();
    state.affinity = bad;
    assert.equal(SaveSystem.hydrate(state), true);
    assert.deepEqual(toHost(G.state.affinity), {});
  }
});

test('migrate heals via inline fallback when BondSystem is absent', () => {
  const { G, SaveSystem } = loadContract({ withoutBond: true });
  const state = G.createDefaultState();
  state.affinity = JSON.parse('{"arjuna":250,"bhima":"junk","unknownhero":30,"constructor":7}');
  state.affinity['__proto__'] = { polluted: true };
  assert.equal(SaveSystem.hydrate(state), true);
  assert.deepEqual(toHost(G.state.affinity), { arjuna: 100, bhima: 0 });
  assert.equal({}.polluted, undefined);
});

test('save envelope version stays 1 and unrelated state is preserved', () => {
  const { G, SaveSystem, localStorage } = loadContract();
  G.state.gold = 777;
  G.state.flags.welcomeGold = true;
  G.state.zoneProgress = { mountain: 9 };
  G.state.affinity = { karna: 55 };
  assert.equal(SaveSystem.save(), true);
  const raw = JSON.parse(localStorage.getItem(SaveSystem.SAVE_KEY));
  assert.equal(raw.version, 1);
  G.state = G.createDefaultState();
  assert.equal(SaveSystem.load(), true);
  assert.deepEqual(toHost(G.state.affinity), { karna: 55 });
  assert.equal(G.state.gold, 777);
  assert.deepEqual(toHost(G.state.zoneProgress), { mountain: 9 });
});
