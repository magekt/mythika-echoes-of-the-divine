const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const COMBAT_PATH = path.join(ROOT, 'src/systems/combat.js');
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];
const EXPECTED_KINDS = { arjuna: 'strike', bhima: 'slam', karna: 'volley', draupadi: 'aegis', hanuman: 'leap' };

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

function host(value) {
  return JSON.parse(JSON.stringify(value));
}

function activeParty(ids) {
  return ids.map(id => ({ id, active: true }));
}

function heroClone(id, stats) {
  return Object.assign({
    id, name: id[0].toUpperCase() + id.slice(1),
    hp: 100, maxHp: 100, mp: 30, maxMp: 30,
    str: 12, agi: 10, mag: 8, def: 10, active: true,
    weaponLvl: 1, weaponEquipped: { name: 'W', atk: 5, type: 'weapon' }
  }, stats || {});
}

function enemyClone(hp) {
  return { id: 'e1', name: 'E', hp: hp || 500, maxHp: hp || 500, mp: 0, maxMp: 0, str: 5, agi: 1, mag: 1, def: 2 };
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
  vm.runInContext('Math.random = function() { return 0.5; };', context);
  return context;
}

// --- COMBOS shape ---

test('COMBOS: exactly one entry per hero with the specified kinds', () => {
  const ctx = loadBond({}, []);
  const combos = ctx.BondSystem.COMBOS;
  assert.deepEqual(host(Object.keys(combos).sort()), HERO_IDS.slice().sort());
  for (const h of HERO_IDS) {
    const e = combos[h];
    assert.equal(e.heroId, h);
    assert.equal(e.kind, EXPECTED_KINDS[h], h + ' kind');
    assert.ok(typeof e.name === 'string' && e.name.length > 0, h + ' name');
    assert.ok(typeof e.flavor === 'string' && e.flavor.length > 0, h + ' flavor');
    assert.ok(Number.isFinite(e.base) && e.base > 0, h + ' base');
    assert.ok(Number.isFinite(e.statScale) && e.statScale >= 0, h + ' statScale');
  }
});

test('comboFor returns a copy; hostile keys yield null', () => {
  const ctx = loadBond({}, []);
  const first = ctx.BondSystem.comboFor('arjuna');
  assert.equal(first.kind, 'strike');
  first.kind = 'hacked';
  first.name = 'hacked';
  assert.equal(ctx.BondSystem.comboFor('arjuna').kind, 'strike');
  for (const bad of ['__proto__', 'constructor', 'prototype', 'unknownhero', '']) {
    assert.equal(ctx.BondSystem.comboFor(bad), null);
  }
  assert.equal({}.x, undefined);
  assert.equal(Object.prototype.x, undefined);
});

// --- comboAvailable ---

test('comboAvailable: Legend active pair is ok with the player as partner', () => {
  const ctx = loadBond({ arjuna: 95 }, activeParty(['leader', 'arjuna']));
  assert.deepEqual(host(ctx.BondSystem.comboAvailable('arjuna', ['leader', 'arjuna'], 'leader')),
    { available: true, heroId: 'arjuna', partnerId: 'leader', reason: 'ok' });
});

test('comboAvailable: Wary and Sworn heroes are not_legend', () => {
  let ctx = loadBond({ arjuna: 0 }, activeParty(['leader', 'arjuna']));
  assert.equal(ctx.BondSystem.comboAvailable('arjuna', ['leader', 'arjuna'], 'leader').reason, 'not_legend');
  ctx = loadBond({ arjuna: 50 }, activeParty(['leader', 'arjuna']));
  assert.equal(ctx.BondSystem.comboAvailable('arjuna', ['leader', 'arjuna'], 'leader').reason, 'not_legend');
  assert.equal(ctx.BondSystem.comboAvailable('arjuna', ['leader', 'arjuna'], 'leader').available, false);
});

test('comboAvailable: benched non-lingering Legend is hero_inactive', () => {
  const ctx = loadBond({ arjuna: 95 }, [{ id: 'leader', active: true }, { id: 'arjuna', active: false }]);
  const r = ctx.BondSystem.comboAvailable('arjuna', ['leader', 'arjuna'], 'leader');
  assert.equal(r.available, false);
  assert.equal(r.reason, 'hero_inactive');
});

test('comboAvailable: solo party yields no_partner; hostile yields unknown', () => {
  const ctx = loadBond({ arjuna: 95 }, [{ id: 'arjuna', active: true }]);
  const r = ctx.BondSystem.comboAvailable('arjuna', ['arjuna'], 'arjuna');
  assert.equal(r.available, false);
  assert.equal(r.reason, 'no_partner');
  for (const bad of ['__proto__', 'constructor', 'unknownhero', '']) {
    const d = ctx.BondSystem.comboAvailable(bad, ['leader', 'arjuna'], 'leader');
    assert.equal(d.available, false);
    assert.equal(d.reason, 'unknown');
  }
  assert.equal({}.x, undefined);
});

// --- comboPotencyFor ---

test('comboPotencyFor: unarmed gets base only; armed scales with weapon level', () => {
  const ctx = loadBond({}, []);
  const B = ctx.BondSystem;
  const unarmed = B.comboPotencyFor('arjuna', 14, 3, false);
  assert.equal(unarmed.bonus, 0);
  assert.ok(unarmed.mult > 1.8);
  const lvl1 = B.comboPotencyFor('arjuna', 14, 1, true);
  assert.equal(lvl1.bonus, 0.15);
  assert.equal(lvl1.mult, unarmed.mult);
  const lvl3 = B.comboPotencyFor('arjuna', 14, 3, true);
  assert.ok(Math.abs(lvl3.bonus - 0.45) < 1e-9);
  const stronger = B.comboPotencyFor('arjuna', 20, 1, true);
  assert.ok(stronger.mult > lvl1.mult);
});

test('comboPotencyFor: garbage inputs degrade to base effect, never NaN', () => {
  const ctx = loadBond({}, []);
  const B = ctx.BondSystem;
  for (const args of [['arjuna', NaN, 1, true], ['arjuna', 'x', 'y', true], ['nope', 10, 2, true], [null, null, null, null]]) {
    const r = B.comboPotencyFor.apply(B, args);
    assert.ok(Number.isFinite(r.mult) && r.mult > 0);
    assert.ok(Number.isFinite(r.bonus) && r.bonus >= 0);
  }
});

// --- unlock flags ---

test('comboSeen/markComboSeen: exactly-once; normalizeCombo heals safely', () => {
  const ctx = loadBond({ arjuna: 95 }, activeParty(['leader', 'arjuna']), {});
  assert.equal(ctx.BondSystem.comboSeen('arjuna'), false);
  assert.deepEqual(host(ctx.BondSystem.markComboSeen('arjuna')), { ok: true, first: true });
  assert.equal(ctx.BondSystem.comboSeen('arjuna'), true);
  assert.deepEqual(host(ctx.BondSystem.markComboSeen('arjuna')), { ok: true, first: false });
  assert.deepEqual(host(ctx.BondSystem.markComboSeen('__proto__')), { ok: false });
  assert.deepEqual(host(ctx.BondSystem.markComboSeen('unknownhero')), { ok: false });
  const out = ctx.BondSystem.normalizeCombo({ questDone: 1, combo_arjuna: true, combo_bhima: 'yes', combo_unknownhero: true });
  assert.deepEqual(host(out), { questDone: 1, combo_arjuna: true });
  assert.deepEqual(host(ctx.BondSystem.normalizeCombo(null)), {});
  const crafted = ctx.BondSystem.normalizeCombo(JSON.parse('{"a":1,"__proto__":{"x":1},"constructor":7}'));
  assert.deepEqual(host(crafted), { a: 1 });
  assert.equal({}.x, undefined);
});

// --- Combat execution per kind ---

function comboResultFor(heroId, heroStats) {
  const party = [heroClone('leader'), heroClone(heroId, heroStats)];
  const aff = {};
  aff[heroId] = 95;
  const ctx = loadCombat(aff, party, {}, 'leader');
  const heroes = [heroClone('leader'), heroClone(heroId, heroStats)];
  const foes = [enemyClone(2000), enemyClone(2000)];
  ctx.Combat.startBattle(heroes, foes);
  const r = ctx.Combat.performSignatureCombo(heroes[1], heroes[0], { target: foes[0] });
  return { ctx, heroes, foes, r: host(r) };
}

test('execution: strike hits one target heavy with 1-2 log lines', () => {
  const { foes, r } = comboResultFor('arjuna');
  assert.equal(r.ok, true);
  assert.equal(r.kind, 'strike');
  assert.ok(r.total > 0);
  assert.ok(r.lines.length >= 1 && r.lines.length <= 2);
  assert.ok(foes[0].hp < 2000);
  assert.equal(foes[1].hp, 2000);
});

test('execution: leap damages primary plus splash on others', () => {
  const { foes, r } = comboResultFor('hanuman');
  assert.equal(r.ok, true);
  assert.equal(r.kind, 'leap');
  assert.ok(foes[0].hp < 2000);
  assert.ok(foes[1].hp < 2000);
  assert.ok(foes[0].hp < foes[1].hp);
});

test('execution: volley damages all enemies', () => {
  const { foes, r } = comboResultFor('karna');
  assert.equal(r.ok, true);
  assert.equal(r.kind, 'volley');
  assert.ok(foes[0].hp < 2000 && foes[1].hp < 2000);
});

test('execution: slam damages plus shields the party', () => {
  const { ctx, heroes, foes, r } = comboResultFor('bhima');
  assert.equal(r.ok, true);
  assert.equal(r.kind, 'slam');
  assert.ok(foes[0].hp < 2000);
  for (const h of ctx.Combat.heroes) {
    assert.ok(h.buffs && h.buffs.shield && h.buffs.shield.value > 0, 'shield on ' + h.id);
  }
  assert.ok(heroes.length === 2);
});

test('execution: aegis heals and shields without dealing damage', () => {
  const party = [heroClone('leader', { hp: 40 }), heroClone('draupadi', { hp: 40 })];
  const ctx = loadCombat({ draupadi: 95 }, party, {}, 'leader');
  const heroes = [heroClone('leader', { hp: 40 }), heroClone('draupadi', { hp: 40 })];
  const foes = [enemyClone(2000)];
  ctx.Combat.startBattle(heroes, foes);
  const before = heroes[0].hp;
  const r = host(ctx.Combat.performSignatureCombo(heroes[1], heroes[0], { target: foes[0] }));
  assert.equal(r.ok, true);
  assert.equal(r.kind, 'aegis');
  assert.ok(heroes[0].hp > before);
  assert.equal(foes[0].hp, 2000);
  assert.ok(ctx.Combat.heroes[0].buffs.shield.value > 0);
});

// --- both-turns consumption ---

test('consumption: partner turn skipped exactly once, then cleared', () => {
  const party = [heroClone('leader'), heroClone('arjuna')];
  const ctx = loadCombat({ arjuna: 95 }, party, {}, 'leader');
  const heroes = [heroClone('leader'), heroClone('arjuna')];
  ctx.Combat.startBattle(heroes, [enemyClone(2000)]);
  // Pin a deterministic order: hero acts, partner is next.
  ctx.Combat.turnOrder = [{ type: 'hero', ref: heroes[1] }, { type: 'hero', ref: heroes[0] }];
  ctx.Combat.currentTurn = 0;
  const r = ctx.Combat.performSignatureCombo(heroes[1], heroes[0], {});
  assert.equal(r.ok, true);
  assert.equal(ctx.Combat.consumedTurns.leader, true);
  ctx.Combat.nextTurn();
  // Partner skipped: round rebuilt (length 2 order) or advanced past partner.
  assert.equal(ctx.Combat.consumedTurns.leader, undefined);
});

test('execution: dead or foreign participants fail without mutation', () => {
  const party = [heroClone('leader'), heroClone('arjuna')];
  const ctx = loadCombat({ arjuna: 95 }, party, {}, 'leader');
  const heroes = [heroClone('leader'), heroClone('arjuna')];
  const foe = enemyClone(2000);
  ctx.Combat.startBattle(heroes, [foe]);
  const dead = heroClone('arjuna');
  dead.hp = 0;
  const hpBefore = foe.hp;
  assert.equal(ctx.Combat.performSignatureCombo(dead, heroes[0], {}).ok, false);
  assert.equal(ctx.Combat.performSignatureCombo(heroes[1], dead, {}).ok, false);
  assert.equal(ctx.Combat.performSignatureCombo(heroClone('outsider'), heroes[0], {}).ok, false);
  assert.equal(foe.hp, hpBefore);
  assert.deepEqual(host(ctx.Combat.consumedTurns), {});
});

test('fallback: combat without BondSystem still executes', () => {
  const ctx = loadCombat({}, [heroClone('leader'), heroClone('karna')], {}, 'leader', false);
  const heroes = [heroClone('leader'), heroClone('karna')];
  const foes = [enemyClone(2000)];
  ctx.Combat.startBattle(heroes, foes);
  const r = ctx.Combat.performSignatureCombo(heroes[1], heroes[0], { target: foes[0] });
  assert.equal(r.ok, true);
  assert.equal(r.kind, 'volley');
  assert.ok(foes[0].hp < 2000);
});

// --- Plan 03: end-to-end matrix ---

test('matrix: all five combos resolve end-to-end with kind-correct effects', () => {
  for (const h of HERO_IDS) {
    const party = [heroClone('leader', { hp: 60 }), heroClone(h, { hp: 60 })];
    const aff = {};
    aff[h] = 95;
    const ctx = loadCombat(aff, party, {}, 'leader');
    const heroes = [heroClone('leader', { hp: 60 }), heroClone(h, { hp: 60 })];
    const foes = [enemyClone(3000), enemyClone(3000)];
    ctx.Combat.startBattle(heroes, foes);
    const avail = ctx.BondSystem.comboAvailable(h, ['leader', h], 'leader');
    assert.equal(avail.available, true, h + ' available');
    const r = host(ctx.Combat.performSignatureCombo(heroes[1], heroes[0], { target: foes[0] }));
    assert.equal(r.ok, true, h + ' ok');
    assert.equal(r.kind, EXPECTED_KINDS[h], h + ' kind');
    assert.ok(r.lines.length >= 1 && r.lines.length <= 2, h + ' 1-2 log lines');
    if (r.kind === 'aegis') {
      assert.ok(heroes[0].hp > 60, h + ' healed');
      assert.ok(ctx.Combat.heroes[0].buffs.shield.value > 0, h + ' shielded');
    } else if (r.kind === 'slam') {
      assert.ok(foes[0].hp < 3000, h + ' damaged');
      assert.ok(ctx.Combat.heroes[0].buffs.shield.value > 0, h + ' shielded');
    } else if (r.kind === 'volley') {
      assert.ok(foes[0].hp < 3000 && foes[1].hp < 3000, h + ' all foes hit');
    } else if (r.kind === 'leap') {
      assert.ok(foes[0].hp < 3000 && foes[1].hp < 3000, h + ' primary + splash');
    } else {
      assert.ok(foes[0].hp < 3000, h + ' heavy single-target');
    }
    assert.equal(ctx.G.state.flags['combo_' + h], true, h + ' unlock flag set');
  }
});

test('matrix: build scaling — armed beats unarmed, higher weaponLvl wins, role stat matters', () => {
  function totalFor(heroId, stats) {
    const party = [heroClone('leader'), heroClone(heroId, stats)];
    const aff = {};
    aff[heroId] = 95;
    const ctx = loadCombat(aff, party, {}, 'leader');
    const heroes = [heroClone('leader'), heroClone(heroId, stats)];
    const foes = [enemyClone(5000)];
    ctx.Combat.startBattle(heroes, foes);
    return host(ctx.Combat.performSignatureCombo(heroes[1], heroes[0], { target: foes[0] })).total;
  }
  const unarmed = totalFor('arjuna', { weaponEquipped: null });
  const armed1 = totalFor('arjuna', { weaponLvl: 1 });
  const armed3 = totalFor('arjuna', { weaponLvl: 3 });
  assert.ok(armed1 > unarmed, 'armed > unarmed');
  assert.ok(armed3 > armed1, 'lvl3 > lvl1');
  const weakStat = totalFor('hanuman', { agi: 6 });
  const strongStat = totalFor('hanuman', { agi: 22 });
  assert.ok(strongStat > weakStat, 'role stat scales potency');
});

test('matrix: both-turns cost across a full round', () => {
  const party = [heroClone('leader'), heroClone('bhima')];
  const ctx = loadCombat({ bhima: 95 }, party, {}, 'leader');
  const heroes = [heroClone('leader'), heroClone('bhima')];
  ctx.Combat.startBattle(heroes, [enemyClone(5000)]);
  ctx.Combat.turnOrder = [
    { type: 'hero', ref: heroes[1] },
    { type: 'hero', ref: heroes[0] },
    { type: 'enemy', ref: ctx.Combat.enemies[0] }
  ];
  ctx.Combat.currentTurn = 0;
  assert.equal(host(ctx.Combat.performSignatureCombo(heroes[1], heroes[0], {})).ok, true);
  const seen = [];
  ctx.Combat.nextTurn(); // must skip leader, land on enemy
  seen.push(ctx.Combat.turnOrder[ctx.Combat.currentTurn].ref.id);
  assert.deepEqual(seen, ['e1']);
  assert.deepEqual(host(ctx.Combat.consumedTurns), {});
});

const GAME_PATH = path.join(ROOT, 'src/engine/game.js');
const SAVE_PATH = path.join(ROOT, 'src/systems/save.js');

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
  return { G: context.G, BondSystem: context.BondSystem, SaveSystem: context.SaveSystem, context };
}

test('matrix: combo flags survive save/load; crafted values heal', () => {
  const { G, SaveSystem, BondSystem } = loadSaveContract();
  G.state.party = [{ id: 'leader', active: true }, { id: 'arjuna', active: true }];
  G.state.player = G.state.party[0];
  G.state.affinity = { arjuna: 95 };
  G.state.flags = { questDone: 1 };
  assert.deepEqual(host(BondSystem.markComboSeen('arjuna')), { ok: true, first: true });
  assert.equal(SaveSystem.save(), true);
  G.state = G.createDefaultState();
  assert.equal(SaveSystem.load(), true);
  assert.equal(G.state.flags.combo_arjuna, true);
  assert.equal(G.state.flags.questDone, 1);
  // Crafted values heal on hydrate, unrelated flags verbatim.
  const crafted = G.createDefaultState();
  crafted.party = [{ id: 'leader', active: true }];
  crafted.player = crafted.party[0];
  crafted.affinity = {};
  crafted.flags = JSON.parse('{"questDone":2,"combo_arjuna":"yes","combo_unknownhero":true,"combo_bhima":true}');
  assert.equal(SaveSystem.hydrate(crafted), true);
  assert.deepEqual(host(G.state.flags), { questDone: 2, combo_bhima: true, welcomeGold: true });
});

test('matrix: band separation — scene adds no visual layer for combos', () => {
  const source = fs.readFileSync(path.join(ROOT, 'src/scenes/combatScene.js'), 'utf8');
  const exec = source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const layoutMatch = exec.match(/getCombatLayout\s*:\s*function\s*\(\)\s*\{[\s\S]*?return\s*\{([\s\S]*?)\};/);
  assert.ok(layoutMatch, 'getCombatLayout found');
  const bandKeys = (layoutMatch[1].match(/(header|roster|intent|log|actions|result)\s*:/g) || []).map(s => s.split(':')[0].trim());
  assert.deepEqual(bandKeys.sort(), ['actions', 'header', 'intent', 'log', 'result', 'roster']);
  const layoutAccesses = exec.match(/layout\.\w+/g) || [];
  for (const acc of layoutAccesses) {
    assert.ok(['layout.header', 'layout.roster', 'layout.intent', 'layout.log', 'layout.actions', 'layout.result'].includes(acc),
      'no new band access: ' + acc);
  }
  assert.ok(exec.includes('doSignatureCombo'), 'scene combo handler present');
  assert.ok(/doSignatureCombo[\s\S]{0,2000}this\.data\.log\.push/.test(exec), 'combo writes to the existing log band');
  assert.ok(/doSignatureCombo[\s\S]{0,2000}UI\.Feedback\.Toast/.test(exec), 'combo uses Toast feedback');
});
