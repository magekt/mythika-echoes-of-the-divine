const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const BEAST_IDS = ['wolf', 'serpent', 'owl', 'bear', 'fox', 'dragon', 'phoenix', 'turtle', 'tiger', 'kitsune'];

const DAY = 86400000;

function host(value) {
  return JSON.parse(JSON.stringify(value));
}

// Sandbox with G.state, SPIRIT_BEASTS, HERB_GROWTH, and a stub Economy that
// routes through the sandbox G (mirrors src/systems/economy.js semantics).
function loadBeast(opts) {
  const o = opts || {};
  const now = o.now === undefined ? 1000 * DAY + 1000 : o.now;
  const inventory = o.inventory !== undefined ? o.inventory : [];
  const gold = o.gold === undefined ? 500 : o.gold;
  const prana = o.prana === undefined ? 200 : o.prana;
  const beastBond = o.beastBond;
  const calls = { spendGold: 0, removeItem: 0 };
  const context = vm.createContext({
    console,
    G: {
      state: {
        gold: gold,
        prana: prana,
        inventory: JSON.parse(JSON.stringify(inventory)),
        beastBond: beastBond === undefined ? undefined : JSON.parse(JSON.stringify(beastBond))
      }
    },
    SPIRIT_BEASTS: { wolf: {}, serpent: {}, owl: {}, bear: {}, fox: {}, dragon: {}, phoenix: {}, turtle: {}, tiger: {}, kitsune: {} },
    HERB_GROWTH: {
      tulsi: { name: 'Tulsi' },
      brahmi: { name: 'Brahmi' },
      ashwa: { name: 'Ashwa' }
    },
    __calls: calls,
    __now: now
  });
  context.globalThis = context;
  vm.runInContext(
    'Economy = {' +
    ' spendGold: function(a) { __calls.spendGold++; if (G.state.gold < a) return false; G.state.gold -= a; return true; },' +
    ' removeItemByName: function(n, q) { __calls.removeItem++; q = q || 1;' +
    '   for (var i = G.state.inventory.length - 1; i >= 0 && q > 0; i--) {' +
    '     var it = G.state.inventory[i];' +
    '     if (it.name === n) { var avail = Math.max(0, Number(it.qty) || 0);' +
    '       if (avail > q) { it.qty = avail - q; q = 0; } else { q -= avail; G.state.inventory.splice(i, 1); } } }' +
    '   return q <= 0; },' +
    ' getItemCount: function(n) { var c = 0; for (var it of G.state.inventory) { if (it.name === n) c += Math.max(0, Number(it.qty) || 0); } return c; }' +
    '};',
    context
  );
  vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BondSystem = BondSystem; globalThis.BeastBond = BeastBond;', context, { filename: BOND_PATH });
  context.BeastBond._now = function() { return context.__now; };
  context.__setNow = function(n) { context.__now = n; context.BeastBond._now = function() { return n; }; };
  return context;
}

function herbStack(name, qty) {
  return { name: name, type: 'herb', qty: qty };
}

// --- thresholds ---

test('heartFor: 0/29->0, 30/79->1, 80/159->2, 160+->3', () => {
  const ctx = loadBeast();
  const cases = [[0, 0], [29, 0], [30, 1], [79, 1], [80, 2], [159, 2], [160, 3], [999, 3], [-5, 0], [NaN, 0]];
  for (const [xp, heart] of cases) {
    assert.equal(ctx.BeastBond.heartFor(xp), heart, 'xp ' + xp);
  }
});

test('cost tables: feed 20/24/29/35, train 40/48/58/69', () => {
  const ctx = loadBeast();
  assert.deepEqual([0, 1, 2, 3].map(h => ctx.BeastBond.feedGoldFor(h)), [20, 24, 29, 35]);
  assert.deepEqual([0, 1, 2, 3].map(h => ctx.BeastBond.trainGoldFor(h)), [40, 48, 58, 69]);
  assert.equal(ctx.BeastBond.PRANA_COST, 25);
});

test('hostile keys safe: get/addBattleXP/statusFor never throw', () => {
  const ctx = loadBeast();
  for (const bad of ['__proto__', 'constructor', 'prototype', '', null, undefined, 42]) {
    assert.deepEqual(host(ctx.BeastBond.get(bad)), { xp: 0, heart: 0 });
    const r = host(ctx.BeastBond.addBattleXP(bad));
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'unknown_beast');
  }
  assert.equal(host(ctx.BeastBond.addBattleXP('notabeast')).reason, 'unknown_beast');
});

// --- battle XP ---

test('addBattleXP: +8 per call, heartUp on threshold cross', () => {
  const ctx = loadBeast();
  let r = host(ctx.BeastBond.addBattleXP('wolf'));
  assert.equal(r.ok, true);
  assert.equal(r.xp, 8);
  assert.equal(r.heart, 0);
  assert.equal(r.heartUp, false);
  r = host(ctx.BeastBond.addBattleXP('wolf'));
  r = host(ctx.BeastBond.addBattleXP('wolf'));
  r = host(ctx.BeastBond.addBattleXP('wolf'));
  assert.equal(r.xp, 32);
  assert.equal(r.heart, 1);
  assert.equal(r.heartUp, true);
  // other beasts untouched
  assert.deepEqual(host(ctx.BeastBond.get('owl')), { xp: 0, heart: 0 });
});

// --- feed ---

test('feed: consumes one herb + scaled gold, flat +11 XP at any heart', () => {
  const ctx = loadBeast({ inventory: [herbStack('Tulsi', 2)], gold: 100 });
  const r = host(ctx.BeastBond.feed('wolf', 'Tulsi'));
  assert.equal(r.ok, true);
  assert.equal(r.xp, 11);
  assert.equal(r.gold, 20);
  assert.equal(r.item, 'Tulsi');
  assert.equal(ctx.G.state.gold, 80);
  assert.equal(ctx.__calls.spendGold, 1);
  assert.equal(ctx.__calls.removeItem, 1);
  // flat gain at heart 2 as well
  ctx.G.state.beastBond.xp.wolf = 80;
  ctx.G.state.inventory.push(herbStack('Tulsi', 1));
  const r2 = host(ctx.BeastBond.feed('wolf', 'Tulsi'));
  assert.equal(r2.ok, true);
  assert.equal(r2.xp, 91);
  assert.equal(r2.gold, 29);
});

test('feed: alchemy consumable with recipeId accepted; junk rejected', () => {
  const ctx = loadBeast({ inventory: [{ name: 'Mystic Pill', type: 'consumable', recipeId: 'pill', qty: 1 }, { name: 'Rusty Sword', type: 'weapon', qty: 1 }], gold: 500 });
  assert.equal(ctx.BeastBond.isFeedItem({ name: 'Tulsi', type: 'herb' }), true);
  assert.equal(ctx.BeastBond.isFeedItem({ name: 'Mystic Pill', type: 'consumable', recipeId: 'pill' }), true);
  assert.equal(ctx.BeastBond.isFeedItem({ name: 'Rusty Sword', type: 'weapon' }), false);
  assert.equal(ctx.BeastBond.isFeedItem(null), false);
  const ok = host(ctx.BeastBond.feed('owl', 'Mystic Pill'));
  assert.equal(ok.ok, true);
  const bad = host(ctx.BeastBond.feed('owl', 'Rusty Sword'));
  assert.equal(bad.ok, false);
  assert.equal(bad.reason, 'no_item');
});

test('feed: 4th same-day denied capped; missing item no_item; poor no_gold; zero mutations on denial', () => {
  const ctx = loadBeast({ inventory: [herbStack('Tulsi', 9)], gold: 1000 });
  for (let i = 0; i < 3; i++) {
    assert.equal(host(ctx.BeastBond.feed('wolf', 'Tulsi')).ok, true);
  }
  const before = { gold: ctx.G.state.gold, spend: ctx.__calls.spendGold, rem: ctx.__calls.removeItem };
  const capped = host(ctx.BeastBond.feed('wolf', 'Tulsi'));
  assert.equal(capped.ok, false);
  assert.equal(capped.reason, 'capped');
  assert.equal(ctx.G.state.gold, before.gold);
  assert.equal(ctx.__calls.spendGold, before.spend);
  assert.equal(ctx.__calls.removeItem, before.rem);
  // per-beast isolation: owl still has 3
  assert.equal(host(ctx.BeastBond.feed('owl', 'Tulsi')).ok, true);

  const noItem = host(ctx.BeastBond.feed('wolf', 'Brahmi'));
  assert.equal(noItem.reason, 'no_item');
  const poor = loadBeast({ inventory: [herbStack('Tulsi', 1)], gold: 5 });
  const denied = host(poor.BeastBond.feed('wolf', 'Tulsi'));
  assert.equal(denied.ok, false);
  assert.equal(denied.reason, 'no_gold');
  assert.equal(poor.G.state.gold, 5);
});

// --- train ---

test('prana train: no cooldown, two back-to-back ok; poor denied', () => {
  const ctx = loadBeast({ prana: 100 });
  assert.equal(host(ctx.BeastBond.pranaTrain('bear')).ok, true);
  const second = host(ctx.BeastBond.pranaTrain('bear'));
  assert.equal(second.ok, true);
  assert.equal(second.xp, 12);
  assert.equal(ctx.G.state.prana, 50);
  const poor = loadBeast({ prana: 10 });
  const d = host(poor.BeastBond.pranaTrain('bear'));
  assert.equal(d.ok, false);
  assert.equal(d.reason, 'no_prana');
  assert.equal(poor.G.state.prana, 10);
});

test('gold train: larger XP, immediate repeat denied cooldown with retryMs', () => {
  const ctx = loadBeast({ gold: 500 });
  const r = host(ctx.BeastBond.goldTrain('tiger'));
  assert.equal(r.ok, true);
  assert.equal(r.xp, 14);
  assert.equal(r.gold, 40);
  const again = host(ctx.BeastBond.goldTrain('tiger'));
  assert.equal(again.ok, false);
  assert.equal(again.reason, 'cooldown');
  assert.ok(again.retryMs > 0);
  // other beast unaffected by the cooldown
  assert.equal(host(ctx.BeastBond.goldTrain('fox')).ok, true);
});

test('train: prana+gold share cap of 5; 6th denied capped with zero mutations', () => {
  const ctx = loadBeast({ gold: 5000, prana: 5000 });
  for (let i = 0; i < 3; i++) assert.equal(host(ctx.BeastBond.pranaTrain('wolf')).ok, true);
  assert.equal(host(ctx.BeastBond.goldTrain('wolf')).ok, true);
  ctx.__setNow(ctx.__now + 300001);
  assert.equal(host(ctx.BeastBond.goldTrain('wolf')).ok, true);
  const before = { gold: ctx.G.state.gold, prana: ctx.G.state.prana, spend: ctx.__calls.spendGold };
  const sixth = host(ctx.BeastBond.pranaTrain('wolf'));
  assert.equal(sixth.ok, false);
  assert.equal(sixth.reason, 'capped');
  assert.equal(ctx.G.state.gold, before.gold);
  assert.equal(ctx.G.state.prana, before.prana);
  assert.equal(ctx.__calls.spendGold, before.spend);
});

test('day rollover resets feed + train caps', () => {
  const ctx = loadBeast({ inventory: [herbStack('Tulsi', 9)], gold: 5000, prana: 5000 });
  for (let i = 0; i < 3; i++) assert.equal(host(ctx.BeastBond.feed('wolf', 'Tulsi')).ok, true);
  assert.equal(host(ctx.BeastBond.feed('wolf', 'Tulsi')).reason, 'capped');
  ctx.__setNow(ctx.__now + DAY);
  assert.equal(host(ctx.BeastBond.feed('wolf', 'Tulsi')).ok, true);
  for (let i = 0; i < 5; i++) assert.equal(host(ctx.BeastBond.pranaTrain('owl')).ok, true);
  assert.equal(host(ctx.BeastBond.pranaTrain('owl')).reason, 'capped');
  ctx.__setNow(ctx.__now + DAY);
  assert.equal(host(ctx.BeastBond.pranaTrain('owl')).ok, true);
});

// --- status + normalize ---

test('statusFor: view-only progress, caps, cooldown', () => {
  const ctx = loadBeast({ inventory: [herbStack('Tulsi', 1)] });
  let s = host(ctx.BeastBond.statusFor('wolf'));
  assert.deepEqual(s, { xp: 0, heart: 0, nextAt: 30, feedLeft: 3, trainLeft: 5, goldCdMs: 0 });
  host(ctx.BeastBond.feed('wolf', 'Tulsi'));
  host(ctx.BeastBond.goldTrain('wolf'));
  s = host(ctx.BeastBond.statusFor('wolf'));
  assert.equal(s.xp, 25);
  assert.equal(s.feedLeft, 2);
  assert.equal(s.trainLeft, 4);
  assert.ok(s.goldCdMs > 0);
  const max = host(ctx.BeastBond.statusFor('dragon'));
  ctx.G.state.beastBond.xp.dragon = 200;
  const sMax = host(ctx.BeastBond.statusFor('dragon'));
  assert.equal(sMax.heart, 3);
  assert.equal(sMax.nextAt, null);
  assert.equal(max.goldCdMs, 0);
});

test('normalize: drops unknown ids + hostile keys, clamps, keeps shape', () => {
  const ctx = loadBeast();
  const healed = host(ctx.BeastBond.normalize({
    xp: { wolf: 40, notabeast: 99, '__proto__': 50, owl: -5, fox: 99999, bad: 'x' },
    feed: { day: 12, counts: { wolf: 2, notabeast: 9, constructor: 1 } },
    train: { day: 'yesterday', counts: { wolf: 200 } },
    trainCd: { wolf: 12345, notabeast: 999, '__proto__': 1, owl: -3 },
    extra: true
  }));
  assert.deepEqual(Object.keys(healed).sort(), ['feed', 'train', 'trainCd', 'xp']);
  assert.equal(healed.xp.wolf, 40);
  assert.equal(healed.xp.fox, 9999);
  assert.equal(healed.xp.owl, 0);
  assert.ok(!Object.prototype.hasOwnProperty.call(healed.xp, 'notabeast'));
  assert.ok(!Object.prototype.hasOwnProperty.call(healed.xp, '__proto__'));
  assert.ok(!('bad' in healed.xp));
  assert.deepEqual(healed.feed, { day: 12, counts: { wolf: 2 } });
  assert.equal(healed.train.day, 0);
  assert.equal(healed.train.counts.wolf, 99);
  assert.deepEqual(healed.trainCd, { wolf: 12345 });
  assert.deepEqual(host(ctx.BeastBond.normalize(null)), { xp: {}, feed: { day: 0, counts: {} }, train: { day: 0, counts: {} }, trainCd: {} });
  assert.deepEqual(host(ctx.BeastBond.normalize('junk')), { xp: {}, feed: { day: 0, counts: {} }, train: { day: 0, counts: {} }, trainCd: {} });
});

// --- Plan 03: beast scene guards (static source checks, no canvas) ---

const SCENE_PATH = path.join(ROOT, 'src/scenes/spiritBeast.js');
const BATTLE_SCENE_SRC = path.join(ROOT, 'src/scenes/combatScene.js');
const SAVE_SRC = path.join(ROOT, 'src/systems/save.js');

function src(p) {
  return fs.readFileSync(p, 'utf8');
}

test('scene delegates all care mutations to BeastBond', () => {
  const s = src(SCENE_PATH);
  for (const call of ['BeastBond.statusFor', 'BeastBond.feed', 'BeastBond.pranaTrain', 'BeastBond.goldTrain']) {
    assert.ok(s.includes(call), 'scene must call ' + call);
  }
});

test('scene performs no direct economy writes', () => {
  const s = src(SCENE_PATH);
  // Scope to the Phase 26 care block (pre-existing level-up/fish buttons own
  // their legacy mutations and are out of scope for this phase).
  const start = s.indexOf('Phase 26 beast hearts: feed + prana/gold training');
  assert.ok(start >= 0, 'care block present');
  const region = s.slice(start, s.indexOf('Back to List', start));
  assert.ok(!region.includes('G.state.gold -='), 'no direct gold decrement');
  assert.ok(!region.includes('G.state.gold-='), 'no direct gold decrement');
  assert.ok(!region.includes('G.state.prana -='), 'no direct prana decrement');
  assert.ok(!region.includes('G.state.prana-='), 'no direct prana decrement');
  assert.ok(!region.includes('.splice('), 'no direct inventory splice');
});

test('scene explains every denial via Toast text', () => {
  const s = src(SCENE_PATH);
  for (const line of ['Care limit reached', 'Training cooldown', 'No feed item', 'Not enough']) {
    assert.ok(s.includes(line), 'denial text missing: ' + line);
  }
});

test('scene renders hearts + bond progress', () => {
  const s = src(SCENE_PATH);
  assert.ok(s.includes('♥'), 'hearts glyph present');
  assert.ok(s.includes('Bond XP: '), 'progress line present');
  assert.ok(s.includes('Feed '), 'feed button present');
  assert.ok(s.includes('Train ('), 'prana train button present');
  assert.ok(s.includes('Intense Train ('), 'gold train button present');
});

test('reward paths untouched: combat gold/hero-XP + save healing intact', () => {
  const c = src(BATTLE_SCENE_SRC);
  assert.equal(c.split('Economy.addGold(gainedGold)').length - 1, 1);
  assert.equal(c.split('Progression.addPartyXP(xpPerHero)').length - 1, 1);
  assert.ok(src(SAVE_SRC).includes('BeastBond.normalize'));
});
