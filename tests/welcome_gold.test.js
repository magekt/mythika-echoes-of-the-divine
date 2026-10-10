const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const GAME_PATH = path.join(ROOT, 'src/engine/game.js');
const SAVE_PATH = path.join(ROOT, 'src/systems/save.js');

function createContext() {
  const storage = new Map();
  const context = vm.createContext({
    console,
    setTimeout,
    clearTimeout,
    performance: { now: () => 0 },
    location: { search: '' },
    localStorage: {
      getItem: k => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: k => storage.delete(k),
    },
    document: { getElementById: () => null, addEventListener: () => {} },
    window: { innerWidth: 400, innerHeight: 720, devicePixelRatio: 1, addEventListener: () => {}, console },
  });
  vm.runInContext(fs.readFileSync(GAME_PATH, 'utf8') + '\n;globalThis.G = G;', context, { filename: GAME_PATH });
  vm.runInContext(fs.readFileSync(SAVE_PATH, 'utf8') + '\n;globalThis.SaveSystem = SaveSystem;', context, { filename: SAVE_PATH });
  return context;
}

test('new games start with the welcome gold grant', () => {
  const ctx = createContext();
  const gold = vm.runInContext('G.createDefaultState().gold', ctx);
  assert.equal(gold, 9999);
});

test('migrate grants welcome gold once to existing saves', () => {
  const ctx = createContext();
  vm.runInContext('G.state = G.createDefaultState(); G.state.gold = 120; G.state.flags = {}; SaveSystem.migrate();', ctx);
  assert.equal(vm.runInContext('G.state.gold', ctx), 120 + 9999);
  assert.equal(vm.runInContext('G.state.flags.welcomeGold', ctx), true);
  vm.runInContext('SaveSystem.migrate();', ctx);
  assert.equal(vm.runInContext('G.state.gold', ctx), 120 + 9999);
});

test('migrate heals missing gold then grants', () => {
  const ctx = createContext();
  vm.runInContext('G.state = G.createDefaultState(); delete G.state.gold; G.state.flags = {}; SaveSystem.migrate();', ctx);
  assert.equal(vm.runInContext('G.state.gold', ctx), 9999);
});
