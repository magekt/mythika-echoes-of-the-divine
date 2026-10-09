const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];

function loadBond(affinity, party, flags) {
  const context = vm.createContext({
    console,
    G: {
      state: {
        party: party || [],
        affinity: affinity === undefined ? {} : affinity,
        flags: flags === undefined ? {} : flags
      }
    },
    HERO_IDS: HERO_IDS.slice(),
    HEROES: { arjuna: {}, bhima: {}, karna: {}, draupadi: {}, hanuman: {} }
  });
  context.globalThis = context;
  vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BondSystem = BondSystem;', context, { filename: BOND_PATH });
  return context;
}

function activeParty(ids) {
  return ids.map(id => ({ id, active: true }));
}

// vm-created objects live in another realm: compare via JSON host copy
// (same convention as tests/bond_affinity.test.js).
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

// --- Plan 01: passive table ---

test('passive table: 0/24->0, 25/49->1, 50/89->2, 90/100->4', () => {
  const cases = [[0, 0], [24, 0], [25, 1], [49, 1], [50, 2], [89, 2], [90, 4], [100, 4]];
  for (const [value, expected] of cases) {
    const ctx = loadBond({ arjuna: value }, [{ id: 'arjuna', active: true }]);
    assert.equal(ctx.BondSystem.passiveFor('arjuna'), expected, 'affinity ' + value);
  }
});

test('passive table is non-cumulative (Legend is +4, not +7)', () => {
  const ctx = loadBond({ arjuna: 100 }, [{ id: 'arjuna', active: true }]);
  assert.equal(ctx.BondSystem.passiveFor('arjuna'), 4);
  assert.deepEqual(host(ctx.BondSystem.PASSIVE_BY_TIER), { Wary: 0, Trusted: 1, Sworn: 2, Legend: 4 });
});

test('roleStatFor: one role stat per hero, str fallback', () => {
  const ctx = loadBond({}, []);
  assert.equal(ctx.BondSystem.roleStatFor('arjuna'), 'str');
  assert.equal(ctx.BondSystem.roleStatFor('bhima'), 'def');
  assert.equal(ctx.BondSystem.roleStatFor('karna'), 'str');
  assert.equal(ctx.BondSystem.roleStatFor('draupadi'), 'mag');
  assert.equal(ctx.BondSystem.roleStatFor('hanuman'), 'agi');
  assert.equal(ctx.BondSystem.roleStatFor('unknownhero'), 'str');
});

// --- Plan 01: synergy gating ---

test('synergy: exactly one tag per hero', () => {
  const ctx = loadBond({}, []);
  const seen = {};
  for (const h of HERO_IDS) {
    const entry = ctx.BondSystem.SYNERGY[h];
    assert.ok(entry && typeof entry.tag === 'string', h + ' needs a tag');
    assert.equal(entry.minTier, 'Sworn');
    const effectKeys = Object.keys(entry).filter(k => k !== 'tag' && k !== 'minTier');
    assert.equal(effectKeys.length, 1, h + ' must carry exactly one effect key');
    seen[entry.tag] = (seen[entry.tag] || 0) + 1;
  }
  for (const [tag, count] of Object.entries(seen)) {
    assert.equal(count, 1, 'tag ' + tag + ' must be unique per hero');
  }
});

test('synergyFor: null below Sworn, tag copy at Sworn/Legend', () => {
  let ctx = loadBond({ arjuna: 25 }, [{ id: 'arjuna', active: true }]);
  assert.equal(ctx.BondSystem.synergyFor('arjuna'), null);
  ctx = loadBond({ arjuna: 50 }, [{ id: 'arjuna', active: true }]);
  assert.equal(ctx.BondSystem.synergyFor('arjuna').tag, 'crit');
  ctx = loadBond({ arjuna: 90 }, [{ id: 'arjuna', active: true }]);
  assert.equal(ctx.BondSystem.synergyFor('arjuna').tag, 'crit');
});

test('synergyFor returns a copy: mutating it leaves the table intact', () => {
  const ctx = loadBond({ arjuna: 50 }, [{ id: 'arjuna', active: true }]);
  const first = ctx.BondSystem.synergyFor('arjuna');
  first.critBonus = 999;
  first.tag = 'hacked';
  const second = ctx.BondSystem.synergyFor('arjuna');
  assert.equal(second.critBonus, 5);
  assert.equal(second.tag, 'crit');
});

// --- Plan 01: adjacency ---

test('adjacentToPlayer: index-distance 1 only', () => {
  const ctx = loadBond({}, []);
  const adj = ctx.BondSystem.adjacentToPlayer;
  assert.equal(adj('arjuna', ['leader', 'arjuna'], 'leader'), true);
  assert.equal(adj('leader', ['leader', 'arjuna'], 'arjuna'), true);
  assert.equal(adj('arjuna', ['leader', 'x', 'arjuna'], 'leader'), false);
  assert.equal(adj('arjuna', ['leader', 'arjuna'], 'missing'), false);
  assert.equal(adj('missing', ['leader', 'arjuna'], 'leader'), false);
  assert.equal(adj('arjuna', 'not-array', 'leader'), false);
  assert.equal(adj('arjuna', ['leader', 'arjuna'], 'leader', ), true);
});

// --- Plan 01: combatBonusFor ---

test('combatBonusFor: active adjacent Sworn hero gets passive + synergy', () => {
  const ctx = loadBond({ arjuna: 50 }, activeParty(['leader', 'arjuna']));
  const b = ctx.BondSystem.combatBonusFor('arjuna', ['leader', 'arjuna'], 'leader');
  assert.equal(b.eligible, true);
  assert.equal(b.passive, 2);
  assert.equal(b.roleStat, 'str');
  assert.equal(b.synergy && b.synergy.tag, 'crit');
  assert.equal(b.lingering, false);
  assert.equal(b.adjacent, true);
});

test('combatBonusFor: non-adjacent hero keeps passive but no synergy', () => {
  const ctx = loadBond({ karna: 90 }, activeParty(['leader', 'x', 'karna']));
  const b = ctx.BondSystem.combatBonusFor('karna', ['leader', 'x', 'karna'], 'leader');
  assert.equal(b.eligible, true);
  assert.equal(b.passive, 4);
  assert.equal(b.synergy, null);
  assert.equal(b.adjacent, false);
});

test('combatBonusFor: benched non-lingering hero is fully ineligible', () => {
  const ctx = loadBond({ arjuna: 50 }, [{ id: 'leader', active: true }, { id: 'arjuna', active: false }]);
  const b = ctx.BondSystem.combatBonusFor('arjuna', ['leader', 'arjuna'], 'leader');
  assert.equal(b.eligible, false);
  assert.equal(b.passive, 0);
  assert.equal(b.synergy, null);
});

// --- Plan 01: linger lifecycle ---

test('linger: benching a Sworn hero sets the flag and stays eligible', () => {
  const ctx = loadBond({ arjuna: 50 }, [{ id: 'leader', active: true }, { id: 'arjuna', active: true }]);
  const r = ctx.BondSystem.setActive('arjuna', false);
  assert.deepEqual(host(r), { ok: true, lingering: true });
  assert.equal(ctx.G.state.flags.bond_linger_arjuna, true);
  const b = ctx.BondSystem.combatBonusFor('arjuna', ['leader', 'arjuna'], 'leader');
  assert.equal(b.eligible, true);
  assert.equal(b.passive, 2);
  assert.equal(b.lingering, true);
});

test('linger: consume drops the flag and eligibility', () => {
  const ctx = loadBond({ arjuna: 50 }, [{ id: 'leader', active: true }, { id: 'arjuna', active: false }],
    { bond_linger_arjuna: true });
  assert.equal(ctx.BondSystem.isLingering('arjuna'), true);
  assert.equal(ctx.BondSystem.consumeLingerAfterBattle(), 1);
  assert.equal(ctx.G.state.flags.bond_linger_arjuna, undefined);
  assert.equal(ctx.BondSystem.isLingering('arjuna'), false);
  const b = ctx.BondSystem.combatBonusFor('arjuna', ['leader', 'arjuna'], 'leader');
  assert.equal(b.eligible, false);
  assert.equal(b.passive, 0);
});

test('linger: returning to the party clears the flag', () => {
  const ctx = loadBond({ arjuna: 50 }, [{ id: 'leader', active: true }, { id: 'arjuna', active: false }],
    { bond_linger_arjuna: true });
  const r = ctx.BondSystem.setActive('arjuna', true);
  assert.deepEqual(host(r), { ok: true, lingering: false });
  assert.equal(ctx.G.state.flags.bond_linger_arjuna, undefined);
  assert.equal(ctx.G.state.party[1].active, true);
});

test('linger: benching a Wary hero sets no flag', () => {
  const ctx = loadBond({ arjuna: 0 }, [{ id: 'leader', active: true }, { id: 'arjuna', active: true }]);
  const r = ctx.BondSystem.setActive('arjuna', false);
  assert.deepEqual(host(r), { ok: true, lingering: false });
  assert.equal(Object.prototype.hasOwnProperty.call(ctx.G.state.flags, 'bond_linger_arjuna'), false);
});

test('setActive: absent hero fails without writes', () => {
  const ctx = loadBond({ arjuna: 50 }, [{ id: 'leader', active: true }]);
  assert.deepEqual(host(ctx.BondSystem.setActive('arjuna', false)), { ok: false });
  assert.deepEqual(host(ctx.BondSystem.setActive('missing', true)), { ok: false });
});

// --- Plan 01: normalizeLinger ---

test('normalizeLinger: keeps true known-hero flags, drops the rest', () => {
  const ctx = loadBond({}, []);
  const out = ctx.BondSystem.normalizeLinger({
    questDone: 1,
    bond_linger_arjuna: true,
    bond_linger_bhima: 'yes',
    bond_linger_draupadi: false,
    bond_linger_unknownhero: true
  });
  assert.deepEqual(host(out), { questDone: 1, bond_linger_arjuna: true });
});

test('normalizeLinger: non-object and hostile keys heal safely', () => {
  const ctx = loadBond({}, []);
  assert.deepEqual(host(ctx.BondSystem.normalizeLinger(null)), {});
  assert.deepEqual(host(ctx.BondSystem.normalizeLinger([])), {});
  const out = ctx.BondSystem.normalizeLinger(JSON.parse('{"a":1,"__proto__":{"x":1},"constructor":7}'));
  assert.deepEqual(host(out), { a: 1 });
  assert.equal({}.x, undefined);
  assert.equal(Object.prototype.x, undefined);
});

// --- Plan 01: hostile inputs ---

test('hostile keys: passive/synergy/linger degrade safely', () => {
  const ctx = loadBond({}, [{ id: 'arjuna', active: true }]);
  for (const bad of ['__proto__', 'constructor', 'prototype', 'unknownhero', '']) {
    assert.equal(ctx.BondSystem.passiveFor(bad), 0);
    assert.equal(ctx.BondSystem.synergyFor(bad), null);
    assert.equal(ctx.BondSystem.isLingering(bad), false);
    assert.equal(ctx.BondSystem.isCombatEligible(bad), false);
  }
  assert.equal({}.x, undefined);
  assert.equal(Object.prototype.x, undefined);
});

// --- Plan 03: end-to-end matrix through real Combat calls ---

const COMBAT_PATH = path.join(ROOT, 'src/systems/combat.js');
const GAME_PATH = path.join(ROOT, 'src/engine/game.js');
const SAVE_PATH = path.join(ROOT, 'src/systems/save.js');

function heroClone(id, stats) {
  return Object.assign({
    id, name: id[0].toUpperCase() + id.slice(1),
    hp: 100, maxHp: 100, mp: 30, maxMp: 30,
    str: 12, agi: 10, mag: 8, def: 10, active: true
  }, stats || {});
}

function enemyClone() {
  return { id: 'e1', name: 'E', hp: 100, maxHp: 100, mp: 10, maxMp: 10, str: 20, agi: 5, mag: 5, def: 4 };
}

function loadCombat(affinity, party, flags, playerId, withBond) {
  const context = vm.createContext({
    console,
    G: {
      state: {
        party: party || [],
        affinity: affinity === undefined ? {} : affinity,
        flags: flags === undefined ? {} : flags,
        player: { id: playerId || (party && party[0] && party[0].id) || 'leader' }
      }
    },
    HERO_IDS: HERO_IDS.slice(),
    HEROES: { arjuna: {}, bhima: {}, karna: {}, draupadi: {}, hanuman: {} },
    Progression: { perkValue: () => 0 },
    AURAS: { getTotal: () => 0 },
    Audio: { hit() {}, crit() {}, skill() {}, heal() {}, combo() {} },
    R: { triggerComboFlash() {}, colors: { gold: 'gold' } },
    Notify: { show() {} },
    ENEMY_ABILITIES: {}
  });
  context.globalThis = context;
  if (withBond !== false) {
    vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BondSystem = BondSystem;', context, { filename: BOND_PATH });
  }
  vm.runInContext(fs.readFileSync(COMBAT_PATH, 'utf8') + '\n;globalThis.Combat = Combat;', context, { filename: COMBAT_PATH });
  // Deterministic damage: variance 1.0, no crits at base 10% chance.
  vm.runInContext('Math.random = function() { return 0.5; };', context);
  return context;
}

function loadSaveContract() {
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
    window: { innerWidth: 400, innerHeight: 720, devicePixelRatio: 1, addEventListener: () => {}, console },
    HERO_IDS: HERO_IDS.slice(),
    HEROES: { arjuna: {}, bhima: {}, karna: {}, draupadi: {}, hanuman: {} }
  });
  context.globalThis = context;
  vm.runInContext(fs.readFileSync(GAME_PATH, 'utf8') + '\n;globalThis.G = G;', context, { filename: GAME_PATH });
  vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BondSystem = BondSystem;', context, { filename: BOND_PATH });
  vm.runInContext(fs.readFileSync(SAVE_PATH, 'utf8') + '\n;globalThis.SaveSystem = SaveSystem;', context, { filename: SAVE_PATH });
  return { G: context.G, BondSystem: context.BondSystem, SaveSystem: context.SaveSystem, localStorage, context };
}

test('e2e application: adjacent Sworn hero enters battle buffed, leader untouched', () => {
  const party = [heroClone('leader'), heroClone('arjuna')];
  const ctx = loadCombat({ arjuna: 50 }, party, {}, 'leader');
  const heroes = [heroClone('leader'), heroClone('arjuna')];
  ctx.Combat.startBattle(heroes, [enemyClone()]);
  const arjuna = heroes.find(h => h.id === 'arjuna');
  const leader = heroes.find(h => h.id === 'leader');
  assert.equal(arjuna.str, 14); // 12 + 2 Sworn
  assert.equal(leader.str, 12); // Wary: untouched
  assert.deepEqual(host(ctx.Combat.bondBonuses), [
    { heroId: 'arjuna', name: 'Arjuna', passive: 2, roleStat: 'str', synergy: 'crit', lingering: false }
  ]);
});

test('e2e application: non-adjacent Sworn hero keeps passive, loses synergy', () => {
  const ctx = loadCombat({ karna: 90 }, [heroClone('leader'), heroClone('x'), heroClone('karna')], {}, 'leader');
  const heroes = [heroClone('leader', { str: 9 }), heroClone('x'), heroClone('karna')];
  ctx.Combat.startBattle(heroes, [enemyClone()]);
  const karna = heroes.find(h => h.id === 'karna');
  assert.equal(karna.str, 16); // 12 + 4 Legend
  assert.equal(karna.bondDmgPct, undefined);
  assert.equal(host(ctx.Combat.bondBonuses)[0].synergy, null);
});

test('e2e tags: burst/ward/swiftness/intercept fields land on adjacent clones', () => {
  const party = [heroClone('karna'), heroClone('leader'), heroClone('draupadi')];
  const ctx = loadCombat({ karna: 50, draupadi: 50 }, party, {}, 'leader');
  const heroes = [heroClone('karna'), heroClone('leader'), heroClone('draupadi')];
  ctx.Combat.startBattle(heroes, [enemyClone()]);
  assert.equal(heroes[0].bondDmgPct, 8);
  assert.equal(heroes[2].bondHealPct, 10);

  const ctx2 = loadCombat({ hanuman: 50, bhima: 60 }, [heroClone('leader'), heroClone('hanuman'), heroClone('bhima')], {}, 'leader');
  const heroes2 = [heroClone('leader'), heroClone('hanuman', { agi: 10 }), heroClone('bhima', { def: 10 })];
  ctx2.Combat.startBattle(heroes2, [enemyClone()]);
  // hanuman adjacent to leader: +2 agi passive (role stat) +2 swiftness = 14;
  // bhima NOT adjacent (distance 2): def +2 only, no intercept
  assert.equal(heroes2[1].agi, 14);
  assert.equal(heroes2[2].def, 12);
  assert.equal(heroes2[2].bondInterceptPct, undefined);

  const ctx3 = loadCombat({ bhima: 50 }, [heroClone('leader'), heroClone('bhima')], {}, 'leader');
  const heroes3 = [heroClone('leader'), heroClone('bhima', { def: 10 })];
  ctx3.Combat.startBattle(heroes3, [enemyClone()]);
  assert.equal(heroes3[1].def, 12); // 10 + 2 Sworn
  assert.equal(heroes3[1].bondInterceptPct, 15);
});

test('e2e intercept: protected hero takes less, exact deterministic values', () => {
  const ctx = loadCombat({ bhima: 50 }, [heroClone('leader'), heroClone('bhima')], {}, 'leader');
  const heroes = [heroClone('leader', { def: 10 }), heroClone('bhima', { def: 10 })];
  ctx.Combat.startBattle(heroes, [enemyClone()]);
  const foe = ctx.Combat.enemies[0];
  assert.equal(ctx.Combat._bondInterceptPctFor(heroes[0]), 15);
  const r1 = ctx.Combat.performAttack(foe, heroes[0], null);
  // atk floor(20*1.15)=23, def floor(10*1.15)=11: base 23-5.5=17.5 -> 17; intercepted floor(17*0.85)=14
  assert.equal(r1.dmg, 14);

  // protector dead -> no intercept
  heroes[1].hp = 0;
  assert.equal(ctx.Combat._bondInterceptPctFor(heroes[0]), 0);
  heroes[0].hp = 100;
  const r2 = ctx.Combat.performAttack(foe, heroes[0], null);
  assert.equal(r2.dmg, 17);

  // enemy defender never intercepts
  assert.equal(ctx.Combat._bondInterceptPctFor(foe), 0);
});

test('e2e intercept: enemy abilities on heroes are softened too', () => {
  const ctx = loadCombat({ bhima: 50 }, [heroClone('leader'), heroClone('bhima')], {}, 'leader');
  const heroes = [heroClone('leader', { def: 10 }), heroClone('bhima', { def: 10 })];
  ctx.Combat.startBattle(heroes, [enemyClone()]);
  const foe = ctx.Combat.enemies[0];
  const r = ctx.Combat.performEnemyAbility(foe, heroes[0], { name: 'Slam', dmg: 1.0 });
  // same base 17.5 -> 17, intercepted -> 14
  assert.equal(r.dmg, 14);
});

test('e2e ward: bonded healer restores more', () => {
  const ctx = loadCombat({ draupadi: 50 }, [heroClone('leader'), heroClone('draupadi', { type: 'hero' })], {}, 'leader');
  const heroes = [heroClone('leader', { hp: 50 }), heroClone('draupadi', { hp: 50, type: 'hero', mag: 8 })];
  ctx.Combat.startBattle(heroes, [enemyClone()]);
  const healer = heroes.find(h => h.id === 'draupadi');
  ctx.Combat.performAttack(healer, ctx.Combat.enemies[0], { heal: 0.2, mag: true });
  // heal floor(100*0.2)=20, ward +10% -> 22
  assert.equal(heroes[0].hp, 72);
});

test('e2e linger: benched hero keeps bonuses for one battle, then drops', () => {
  const party = [heroClone('leader'), heroClone('arjuna')];
  const ctx = loadCombat({ arjuna: 50 }, party, {}, 'leader');
  assert.deepEqual(host(ctx.BondSystem.setActive('arjuna', false)), { ok: true, lingering: true });
  // battle 1 (lingering): bonus still applies, flagged lingering
  let heroes = [heroClone('leader'), heroClone('arjuna')];
  ctx.Combat.startBattle(heroes, [enemyClone()]);
  assert.equal(heroes[1].str, 14);
  assert.equal(host(ctx.Combat.bondBonuses)[0].lingering, true);
  // endBattle equivalent consumes the linger
  assert.equal(ctx.BondSystem.consumeLingerAfterBattle(), 1);
  // battle 2: nothing applies
  heroes = [heroClone('leader'), heroClone('arjuna')];
  ctx.Combat.startBattle(heroes, [enemyClone()]);
  assert.equal(heroes[1].str, 12);
  assert.deepEqual(host(ctx.Combat.bondBonuses), []);
});

test('e2e linger: benched Wary hero gets nothing', () => {
  const party = [heroClone('leader'), heroClone('arjuna')];
  const ctx = loadCombat({ arjuna: 0 }, party, {}, 'leader');
  ctx.BondSystem.setActive('arjuna', false);
  const heroes = [heroClone('leader'), heroClone('arjuna')];
  ctx.Combat.startBattle(heroes, [enemyClone()]);
  assert.equal(heroes[1].str, 12);
  assert.deepEqual(host(ctx.Combat.bondBonuses), []);
});

test('e2e fallback: combat runs with zero bonuses when BondSystem is absent', () => {
  const ctx = loadCombat({}, [heroClone('leader'), heroClone('arjuna')], {}, 'leader', false);
  const heroes = [heroClone('leader'), heroClone('arjuna')];
  ctx.Combat.startBattle(heroes, [enemyClone()]);
  assert.equal(heroes[1].str, 12);
  assert.deepEqual(host(ctx.Combat.bondBonuses), []);
  const r = ctx.Combat.performAttack(ctx.Combat.enemies[0], heroes[0], null);
  assert.ok(r.dmg >= 1);
});

test('e2e isolation: linger consume never touches bond arc flags', () => {
  const ctx = loadBond({ arjuna: 50 }, [{ id: 'leader', active: true }, { id: 'arjuna', active: false }],
    { bond_arjuna_recruit: true, bond_linger_arjuna: true });
  assert.equal(ctx.BondSystem.consumeLingerAfterBattle(), 1);
  assert.equal(ctx.G.state.flags.bond_arjuna_recruit, true);
  assert.equal(ctx.G.state.flags.bond_linger_arjuna, undefined);
});

test('persistence round trip: affinity + linger flag survive save/load', () => {
  const { G, SaveSystem } = loadSaveContract();
  G.state.party = [{ id: 'leader', active: true }, { id: 'arjuna', active: false }];
  G.state.player = G.state.party[0];
  G.state.affinity = { arjuna: 50 };
  G.state.flags = { bond_linger_arjuna: true, questDone: 1 };
  assert.equal(SaveSystem.save(), true);
  G.state = G.createDefaultState();
  assert.equal(SaveSystem.load(), true);
  assert.deepEqual(host(G.state.affinity), { arjuna: 50 });
  assert.equal(G.state.flags.bond_linger_arjuna, true);
  assert.equal(G.state.flags.questDone, 1);
});

test('legacy healing: save without flags/affinity heals, bonuses default off', () => {
  const { G, SaveSystem, BondSystem } = loadSaveContract();
  const legacy = {
    player: { id: 'arjuna', name: 'Arjuna' },
    party: [{ id: 'arjuna', name: 'Arjuna', hp: 80, active: true }],
    gold: 100,
    flags: { questDone: 2 },
    encounters: { seen: {} }
  };
  assert.equal(SaveSystem.hydrate(legacy), true);
  assert.deepEqual(host(G.state.affinity), {});
  assert.equal(G.state.flags.questDone, 2);
  assert.equal(BondSystem.isCombatEligible('arjuna'), true); // active party
  assert.equal(BondSystem.passiveFor('arjuna'), 0); // no affinity -> no bonus
  assert.equal(BondSystem.synergyFor('arjuna'), null);
});

test('malformed healing: crafted linger values heal, quest flags verbatim', () => {
  const { G, SaveSystem } = loadSaveContract();
  const state = G.createDefaultState();
  state.party = [{ id: 'arjuna', active: true }];
  state.player = state.party[0];
  state.affinity = { arjuna: 50 };
  state.flags = JSON.parse('{"questDone":3,"bond_linger_arjuna":"yes","bond_linger_unknownhero":true}');
  state.flags['__proto__'] = { polluted: true };
  assert.equal(SaveSystem.hydrate(state), true);
  assert.deepEqual(host(G.state.flags), { questDone: 3 });
  assert.equal({}.polluted, undefined);
});
