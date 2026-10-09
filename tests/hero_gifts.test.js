const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const ITEMS_PATH = path.join(ROOT, 'src/data/items.js');
const ECONOMY_PATH = path.join(ROOT, 'src/systems/economy.js');
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];
const WEEK_MS = 604800000;
const WEEK = 8 * WEEK_MS; // fixed test week

function heroesStub() {
  const h = {};
  for (const id of HERO_IDS) h[id] = { id: id, name: id };
  return h;
}

function giftItem(giftKey, name, qty) {
  return { name: name || giftKey, type: 'gift', giftKey: giftKey, qty: qty == null ? 5 : qty };
}

function loadWorld(opts) {
  const o = opts || {};
  const context = vm.createContext({
    console,
    Math,
    Object,
    Array,
    Date,
    Number,
    G: {
      state: {
        flags: Object.assign({}, o.flags),
        affinity: Object.assign({}, o.affinity),
        party: (o.party || [{ id: 'arjuna', active: true }]).map(function(h) { return Object.assign({}, h); }),
        inventory: (o.inventory || [giftItem('g_sungrass', 'Sungrass Garland')]).map(function(i) { return Object.assign({}, i); }),
        gold: 1000
      }
    },
    HEROES: heroesStub(),
    HERO_IDS: HERO_IDS.slice(),
    Progression: { perkValue: function() { return 0; }, getLootBonus: function() { return 1; } }
  });
  context.globalThis = context;
  if (!o.noItems) {
    vm.runInContext(fs.readFileSync(ITEMS_PATH, 'utf8') +
      '\n;globalThis.ITEMS = ITEMS; globalThis.HERO_GIFTS = HERO_GIFTS;', context, { filename: ITEMS_PATH });
  }
  if (!o.noBond) {
    vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') +
      '\n;globalThis.BondSystem = BondSystem;', context, { filename: BOND_PATH });
  }
  vm.runInContext(fs.readFileSync(ECONOMY_PATH, 'utf8') +
    '\n;globalThis.Economy = Economy;', context, { filename: ECONOMY_PATH });
  return context;
}

function invQty(ctx, giftKey) {
  return ctx.G.state.inventory.filter(function(i) { return i.giftKey === giftKey; })
    .reduce(function(n, i) { return n + (i.qty == null ? 1 : i.qty); }, 0);
}

// --- diminishing ---

test('diminishing: one pair yields 13/8/5 across the weekly cap, then 3 next week', () => {
  const ctx = loadWorld();
  let r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK);
  assert.deepEqual([r.ok, r.applied, r.gain, r.count], [true, 13, 13, 1]);
  r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK);
  assert.deepEqual([r.ok, r.applied, r.gain, r.count], [true, 8, 8, 2]);
  r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK);
  assert.deepEqual([r.ok, r.applied, r.gain, r.count], [true, 5, 5, 3]);
  assert.equal(ctx.G.state.affinity.arjuna, 26);
  // Cap spent (13+8+5=26): tail only arrives in a fresh week.
  r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK + WEEK_MS);
  assert.deepEqual([r.ok, r.applied, r.gain, r.count], [true, 3, 3, 4]);
  r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK + WEEK_MS);
  assert.deepEqual([r.ok, r.applied, r.gain, r.count], [true, 3, 3, 5]);
});

test('pairs are independent across items and heroes', () => {
  const ctx = loadWorld({
    party: [{ id: 'arjuna', active: true }, { id: 'bhima', active: true }],
    inventory: [giftItem('g_sungrass', 'Sungrass Garland'), giftItem('g_bowstring', 'Gandiva Bowstring'), giftItem('g_dandakaHoney', 'Dandaka Wild Honey')]
  });
  assert.equal(ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK).applied, 13);
  assert.equal(ctx.BondSystem.giveGift('arjuna', 'g_bowstring', WEEK).applied, 13);
  assert.equal(ctx.BondSystem.giveGift('bhima', 'g_dandakaHoney', WEEK).applied, 13);
});

// --- weekly cap ---

test('weekly cap: spent cap denies with capped, item not consumed', () => {
  const ctx = loadWorld({
    inventory: [giftItem('g_sungrass', 'Sungrass Garland'), giftItem('g_bowstring', 'Gandiva Bowstring')]
  });
  ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK); // 13
  ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK); // 8
  ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK); // 5 -> total 26
  const before = invQty(ctx, 'g_bowstring');
  const r = ctx.BondSystem.giveGift('arjuna', 'g_bowstring', WEEK);
  assert.deepEqual([r.ok, r.reason], [false, 'capped']);
  assert.equal(invQty(ctx, 'g_bowstring'), before);
  assert.equal(ctx.G.state.flags.gift_arjuna_g_bowstring, undefined);
});

test('weekly cap: partial grant when remaining is smaller than gain', () => {
  const ctx = loadWorld({
    flags: { giftweek_arjuna: 8, gifttotal_arjuna: 25 },
    inventory: [giftItem('g_bowstring', 'Gandiva Bowstring')]
  });
  const r = ctx.BondSystem.giveGift('arjuna', 'g_bowstring', WEEK);
  assert.equal(r.ok, true);
  assert.equal(r.applied, 1);
  assert.equal(r.weekTotal, 26);
});

test('weekly cap: new week resets the total', () => {
  const ctx = loadWorld({
    flags: { gift_arjuna_g_sungrass: 3, giftweek_arjuna: 8, gifttotal_arjuna: 26 },
    affinity: { arjuna: 26 },
    inventory: [giftItem('g_sungrass', 'Sungrass Garland')]
  });
  const r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK + WEEK_MS);
  assert.equal(r.ok, true);
  assert.equal(r.applied, 3);
});

// --- tier locks ---

test('tier lock: Sworn gift denied at Trusted, granted at Sworn, never consumed on lock', () => {
  const ctx = loadWorld({
    party: [{ id: 'bhima', active: true }],
    affinity: { bhima: 30 },
    inventory: [giftItem('g_serpentPearl', 'Patala Serpent Pearl')]
  });
  let r = ctx.BondSystem.giveGift('bhima', 'g_serpentPearl', WEEK);
  assert.deepEqual([r.ok, r.reason, r.need], [false, 'tier_locked', 'Sworn']);
  assert.equal(invQty(ctx, 'g_serpentPearl'), 5);
  ctx.G.state.affinity.bhima = 50;
  r = ctx.BondSystem.giveGift('bhima', 'g_serpentPearl', WEEK);
  assert.equal(r.ok, true);
  assert.equal(r.applied, 13);
});

test('open gifts work at Wary', () => {
  const ctx = loadWorld();
  const r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK);
  assert.equal(r.ok, true);
});

// --- denials consume nothing ---

test('denials: not_liked, no_item, not_recruited, inactive, maxed consume nothing', () => {
  // not_liked: catalog gift outside the roster + junk giftKey.
  let ctx = loadWorld({ inventory: [giftItem('g_armorOil', 'Surya Armor Oil')] });
  let r = ctx.BondSystem.giveGift('arjuna', 'g_armorOil', WEEK);
  assert.deepEqual([r.ok, r.reason], [false, 'not_liked']);
  assert.equal(invQty(ctx, 'g_armorOil'), 5);
  r = ctx.BondSystem.giveGift('arjuna', 'hpPotion', WEEK);
  assert.deepEqual([r.ok, r.reason], [false, 'not_liked']);

  // no_item: roster gift absent from inventory.
  ctx = loadWorld({ inventory: [] });
  r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK);
  assert.deepEqual([r.ok, r.reason], [false, 'no_item']);
  assert.equal(ctx.G.state.flags.gift_arjuna_g_sungrass, undefined);

  // not_recruited.
  ctx = loadWorld({ party: [], inventory: [giftItem('g_sungrass', 'Sungrass Garland')] });
  r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK);
  assert.deepEqual([r.ok, r.reason], [false, 'not_recruited']);
  assert.equal(invQty(ctx, 'g_sungrass'), 5);

  // inactive (benched; linger does not qualify).
  ctx = loadWorld({ party: [{ id: 'arjuna', active: false }], inventory: [giftItem('g_sungrass', 'Sungrass Garland')] });
  r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK);
  assert.deepEqual([r.ok, r.reason], [false, 'inactive']);
  assert.equal(invQty(ctx, 'g_sungrass'), 5);

  // maxed.
  ctx = loadWorld({ affinity: { arjuna: 100 }, inventory: [giftItem('g_sungrass', 'Sungrass Garland')] });
  r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK);
  assert.deepEqual([r.ok, r.reason], [false, 'maxed']);
  assert.equal(invQty(ctx, 'g_sungrass'), 5);
});

// --- canonical consumption + routing ---

test('success consumes exactly 1 and routes affinity via BondSystem.add with tierUp', () => {
  const ctx = loadWorld({
    affinity: { arjuna: 24 },
    inventory: [giftItem('g_sungrass', 'Sungrass Garland', 2)]
  });
  const r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK);
  assert.equal(r.ok, true);
  assert.equal(r.tierUp, true); // 24 + 13 crosses Trusted 25
  assert.equal(invQty(ctx, 'g_sungrass'), 1);
  assert.equal(ctx.G.state.affinity.arjuna, 37);
  assert.equal(ctx.G.state.flags.gift_arjuna_g_sungrass, 1);
  assert.equal(ctx.G.state.flags.giftweek_arjuna, 8);
  assert.equal(ctx.G.state.flags.gifttotal_arjuna, 13);
});

// --- persistence / normalization ---

test('normalizeGifts: heals crafted values, drops unknown + hostile keys, keeps the rest', () => {
  const ctx = loadWorld({
    flags: {
      gift_arjuna_g_sungrass: 3,
      gift_arjuna_g_bowstring: -4,
      gift_karna_g_armorOil: 'NaN',
      gift_nobody_g_sungrass: 2,
      gift_arjuna_nope_gift: 1,
      '__proto__': true,
      giftweek_arjuna: 8,
      gifttotal_arjuna: 99999,
      bond_arjuna_recruit: true,
      someFlag: 7
    }
  });
  const out = ctx.BondSystem.normalizeGifts(ctx.G.state.flags);
  assert.equal(out.gift_arjuna_g_sungrass, 3);
  assert.equal(out.gift_arjuna_g_bowstring, undefined);
  assert.equal(out.gift_karna_g_armorOil, undefined);
  assert.equal(out.gift_nobody_g_sungrass, undefined);
  assert.equal(out.gift_arjuna_nope_gift, undefined);
  assert.equal(out.giftweek_arjuna, 8);
  assert.ok(out.gifttotal_arjuna <= 26 * 4);
  assert.equal(out.bond_arjuna_recruit, true);
  assert.equal(out.someFlag, 7);
  assert.equal(Object.prototype.hasOwnProperty.call(out, '__proto__'), false);
});

test('absent HERO_GIFTS degrades safely (not_liked, normalize keeps hero ints)', () => {
  const ctx = loadWorld({ noItems: true });
  const r = ctx.BondSystem.giveGift('arjuna', 'g_sungrass', WEEK);
  assert.deepEqual([r.ok, r.reason], [false, 'not_liked']);
  const out = ctx.BondSystem.normalizeGifts({ gift_arjuna_anything: 2, other: 1 });
  assert.equal(out.gift_arjuna_anything, 2);
  assert.equal(out.other, 1);
});

test('hostile heroId/giftKey never throws', () => {
  const ctx = loadWorld();
  for (const bad of ['__proto__', 'constructor', 'prototype', '']) {
    assert.doesNotThrow(function() { ctx.BondSystem.giveGift(bad, 'g_sungrass', WEEK); });
    assert.doesNotThrow(function() { ctx.BondSystem.giveGift('arjuna', bad, WEEK); });
  }
  assert.equal(ctx.BondSystem.giveGift('__proto__', 'g_sungrass', WEEK).ok, false);
});
