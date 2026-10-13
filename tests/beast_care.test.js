const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const COMBAT_PATH = path.join(ROOT, 'src/systems/combat.js');
const SAVE_PATH = path.join(ROOT, 'src/systems/save.js');

function host(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultBeastBond() {
  return { xp: {}, feed: { day: 0, counts: {} }, train: { day: 0, counts: {} }, trainCd: {} };
}

// Combat sandbox: G + Notify/R/UI stubs, real bond.js, real combat.js,
// stub Economy routing through sandbox G.
function loadCombat(opts) {
  const o = opts || {};
  const beasts = o.beasts !== undefined ? o.beasts : [{ id: 'wolf', name: 'Shadow Wolf', level: 1, xp: 0, maxHp: 20, str: 3, agi: 4, def: 2, mag: 1 }];
  const activeBeast = o.activeBeast === undefined ? 'wolf' : o.activeBeast;
  const withBond = o.withBond === undefined ? true : o.withBond;
  const calls = { addGold: 0, addPartyXP: 0, toasts: [] };
  const context = vm.createContext({
    console,
    G: {
      state: {
        gold: 100,
        prana: 100,
        inventory: [{ name: 'Tulsi', type: 'herb', qty: 3 }],
        spiritBeasts: JSON.parse(JSON.stringify(beasts)),
        activeBeast: activeBeast,
        beastBond: defaultBeastBond()
      }
    },
    SPIRIT_BEASTS: { wolf: {}, owl: {} },
    HERB_GROWTH: { tulsi: { name: 'Tulsi' } },
    Economy: {
      spendGold: function(a) { if (context.G.state.gold < a) return false; context.G.state.gold -= a; return true; },
      removeItemByName: function() { return true; },
      getItemCount: function() { return 9; },
      addGold: function(a) { calls.addGold++; context.G.state.gold += a; }
    },
    Progression: { addPartyXP: function() { calls.addPartyXP++; return false; }, perkValue: function() { return 0; } },
    Notify: { show: function() {} },
    R: { colors: { gold: '#g', green: '#gr' } },
    UI: { Feedback: { Toast: function(msg) { calls.toasts.push(String(msg)); } } },
    Math: Math,
    __calls: calls
  });
  context.globalThis = context;
  if (withBond) {
    vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BondSystem = BondSystem; globalThis.BeastBond = BeastBond;', context, { filename: BOND_PATH });
  }
  vm.runInContext(fs.readFileSync(COMBAT_PATH, 'utf8') + '\n;globalThis.Combat = Combat;', context, { filename: COMBAT_PATH });
  // deterministic level-XP roll
  vm.runInContext('Math.random = function() { return 0.5; };', context);
  return context;
}

// --- battle bridge ---

test('awardBeastXP grants level XP + 8 bond XP to the active beast only', () => {
  const ctx = loadCombat({ beasts: [
    { id: 'wolf', name: 'Shadow Wolf', level: 1, xp: 0, maxHp: 20, str: 3, agi: 4, def: 2, mag: 1 },
    { id: 'owl', name: 'Night Owl', level: 1, xp: 0, maxHp: 18, str: 2, agi: 6, def: 1, mag: 4 }
  ]});
  vm.runInContext('Combat.awardBeastXP();', ctx);
  const wolf = ctx.G.state.spiritBeasts[0];
  assert.equal(wolf.xp, 20); // 10 + 0.5*20
  assert.equal(ctx.G.state.beastBond.xp.wolf, 8);
  assert.ok(!('owl' in ctx.G.state.beastBond.xp));
  assert.equal(ctx.__calls.toasts.length, 0); // no heart-up at 8 xp
});

test('heart threshold cross toasts the heart-up exactly once per cross', () => {
  const ctx = loadCombat();
  ctx.G.state.beastBond.xp.wolf = 24;
  vm.runInContext('Combat.awardBeastXP();', ctx);
  assert.equal(ctx.G.state.beastBond.xp.wolf, 32);
  assert.equal(ctx.__calls.toasts.length, 1);
  assert.match(ctx.__calls.toasts[0], /bond deepened! Hearts: 1\/3/);
});

test('no active beast is a no-op; BeastBond absent still grants level XP', () => {
  const ctx = loadCombat({ activeBeast: null });
  vm.runInContext('Combat.awardBeastXP();', ctx);
  assert.deepEqual(host(ctx.G.state.beastBond.xp), {});
  const bare = loadCombat({ withBond: false });
  vm.runInContext('Combat.awardBeastXP();', bare);
  assert.equal(bare.G.state.spiritBeasts[0].xp, 20);
  assert.deepEqual(host(bare.G.state.beastBond.xp), {});
});

// --- economy authority ---

test('feed/train mutate only via Economy stubs; denials mutate nothing', () => {
  const ctx = loadCombat();
  const spend = [];
  // wrap to count: replace with counting stubs bound to sandbox G
  vm.runInContext(
    'Economy.spendGold = function(a) { __spend.push(a); if (G.state.gold < a) return false; G.state.gold -= a; return true; };' +
    'Economy.removeItemByName = function(n, q) { __rem.push([n, q]);' +
    '  for (var i = G.state.inventory.length - 1; i >= 0 && q > 0; i--) {' +
    '    var it = G.state.inventory[i];' +
    '    if (it.name === n) { var avail = Math.max(0, Number(it.qty) || 0);' +
    '      if (avail > q) { it.qty = avail - q; q = 0; } else { q -= avail; G.state.inventory.splice(i, 1); } } }' +
    '  return q <= 0; };',
    ctx
  );
  ctx.__spend = spend;
  ctx.__rem = [];
  const goldBefore = ctx.G.state.gold;
  vm.runInContext('G.state.inventory.push({ name: "Tulsi", type: "herb", qty: 9 });', ctx);
  vm.runInContext('BeastBond.feed("wolf", "Tulsi");', ctx);
  assert.deepEqual(spend, [20]);
  assert.deepEqual(host(ctx.__rem), [['Tulsi', 1]]);
  assert.equal(ctx.G.state.gold, goldBefore - 20);
  // denial: cap out feeds then verify zero further mutations
  vm.runInContext('BeastBond.feed("wolf", "Tulsi"); BeastBond.feed("wolf", "Tulsi");', ctx);
  const n = spend.length;
  const denied = vm.runInContext('BeastBond.feed("wolf", "Tulsi");', ctx);
  assert.equal(denied.reason, 'capped');
  assert.equal(spend.length, n);
  assert.equal(ctx.__rem.length, 3);
});

// --- no duplication ---

test('getLoot output identical with and without the bond bridge', () => {
  const ctx = loadCombat();
  const loot = vm.runInContext(
    'Combat.enemies = [{ xp: 30, gold: 50 }, { xp: 20, gold: 10 }]; Combat.getLoot();',
    ctx
  );
  assert.deepEqual(host(loot), { xp: 50, gold: 60 });
  const bare = loadCombat({ withBond: false });
  const loot2 = vm.runInContext(
    'Combat.enemies = [{ xp: 30, gold: 50 }, { xp: 20, gold: 10 }]; Combat.getLoot();',
    bare
  );
  assert.deepEqual(host(loot2), { xp: 50, gold: 60 });
});

// --- save persistence ---

function loadSave(craftedBeastBond, withBond) {
  const calls = {};
  const context = vm.createContext({
    console,
    G: {
      state: null,
      createDefaultState: function() {
        return {
          debugMode: false, inventory: [], party: [], flags: {},
          encounters: {}, affinity: {},
          beastBond: defaultBeastBond(),
          world: {},
          gold: 0, prana: 0
        };
      }
    },
    SPIRIT_BEASTS: { wolf: {}, owl: {} },
    localStorage: { _m: {}, getItem: function(k) { return this._m[k] || null; }, setItem: function(k, v) { this._m[k] = String(v); }, removeItem: function(k) { delete this._m[k]; } },
    R: { colors: {} },
    Notify: { show: function() {} },
    __calls: calls
  });
  context.globalThis = context;
  if (withBond === undefined || withBond) {
    vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BondSystem = BondSystem; globalThis.BeastBond = BeastBond;', context, { filename: BOND_PATH });
  }
  vm.runInContext(fs.readFileSync(SAVE_PATH, 'utf8') + '\n;globalThis.SaveSystem = SaveSystem;', context, { filename: SAVE_PATH });
  // legacy-shaped state: no beastBond key at all, or a crafted one
  const incoming = {
    debugMode: false, inventory: [], party: [], flags: { boss_meru: true },
    encounters: {}, affinity: { arjuna: 40 },
    gold: 10, prana: 5
  };
  if (craftedBeastBond !== undefined) incoming.beastBond = JSON.parse(JSON.stringify(craftedBeastBond));
  vm.runInContext('G.state = ' + JSON.stringify(incoming) + ';', context);
  // G.state must be an object the sandbox owns; rehydrate via hydrate path:
  // hydrate() replaces G.state with defaults + incoming keys. Simulate by
  // assigning through JSON round-trip inside the realm.
  return context;
}

test('migrate heals crafted beastBond, keeps unrelated flags verbatim', () => {
  const ctx = loadSave({
    xp: { wolf: 40, notabeast: 99, '__proto__': 5 },
    feed: { day: 3, counts: { wolf: 1 } },
    train: { day: 3, counts: {} },
    trainCd: {}
  });
  vm.runInContext('SaveSystem.migrate();', ctx);
  const bb = host(ctx.G.state.beastBond);
  assert.equal(bb.xp.wolf, 40);
  assert.ok(!Object.prototype.hasOwnProperty.call(bb.xp, 'notabeast'));
  assert.equal(ctx.G.state.flags.boss_meru, true);
  assert.equal(ctx.G.state.affinity.arjuna, 40);
});

test('legacy save without beastBond boots the empty healed shape (incl. fallback)', () => {
  const ctx = loadSave(undefined, true);
  vm.runInContext('SaveSystem.migrate();', ctx);
  assert.deepEqual(host(ctx.G.state.beastBond), defaultBeastBond());
  const bare = loadSave(undefined, false);
  vm.runInContext('SaveSystem.migrate();', bare);
  assert.deepEqual(host(bare.G.state.beastBond), defaultBeastBond());
  const craftedFallback = loadSave({ xp: { wolf: 12, evil: 9 } }, false);
  vm.runInContext('SaveSystem.migrate();', craftedFallback);
  assert.equal(craftedFallback.G.state.beastBond.xp.wolf, 12);
  assert.ok(!('evil' in craftedFallback.G.state.beastBond.xp));
});
