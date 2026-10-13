const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const ITEMS_PATH = path.join(ROOT, 'src/data/items.js');
const ZONES = ['aryavarta', 'dandaka', 'meru', 'patala', 'svarga', 'tapobhumi'];
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];
const SWORN_GIFTS = ['g_serpentPearl', 'g_celestialSilk', 'g_ashenEmber', 'g_stillnessBell', 'g_pilgrimAsh', 'g_dharmaScale'];

function loadItems() {
  const context = vm.createContext({
    console,
    Math,
    Object,
    Array,
    G: { state: {} },
    Progression: { perkValue: function() { return 0; }, getLootBonus: function() { return 1; } }
  });
  context.globalThis = context;
  vm.runInContext(
    fs.readFileSync(ITEMS_PATH, 'utf8') +
    '\n;globalThis.ITEMS = ITEMS; globalThis.HERO_GIFTS = HERO_GIFTS; globalThis.generateLoot = generateLoot;',
    context,
    { filename: ITEMS_PATH }
  );
  return context;
}

// --- catalog scale: 6 zone + 6 realm + 7 story = 19 ---

test('gift catalog: exactly 19 gifts (6 zone + 6 realm + 7 story)', () => {
  const ctx = loadItems();
  const keys = Object.keys(ctx.ITEMS.gifts);
  assert.equal(keys.length, 19);
  const flavor = { zone: 0, realm: 0, story: 0 };
  for (const k of keys) flavor[ctx.ITEMS.gifts[k].flavor]++;
  assert.deepEqual(flavor, { zone: 6, realm: 6, story: 7 });
});

test('gift defs: type gift, key match, name/desc, zones subset, zone coverage >= 3', () => {
  const ctx = loadItems();
  const coverage = {};
  for (const key of Object.keys(ctx.ITEMS.gifts)) {
    const g = ctx.ITEMS.gifts[key];
    assert.equal(g.type, 'gift', key);
    assert.equal(g.giftKey, key, key);
    assert.ok(typeof g.name === 'string' && g.name.length > 0, key);
    assert.ok(typeof g.desc === 'string' && g.desc.length > 0, key);
    assert.equal(g.cost, 0, key);
    assert.ok(Array.isArray(g.zones) && g.zones.length > 0, key);
    for (const z of g.zones) {
      assert.ok(ZONES.includes(z), key + ' zone ' + z);
      coverage[z] = (coverage[z] || 0) + 1;
    }
  }
  for (const z of ZONES) assert.ok((coverage[z] || 0) >= 3, z + ' covered by >=3 gifts');
});

test('tier locks: exactly the 6 Sworn gifts carry minTier, nothing else', () => {
  const ctx = loadItems();
  const locked = Object.keys(ctx.ITEMS.gifts).filter(function(k) { return ctx.ITEMS.gifts[k].minTier != null; });
  assert.deepEqual(locked.sort(), SWORN_GIFTS.slice().sort());
  for (const k of locked) assert.equal(ctx.ITEMS.gifts[k].minTier, 'Sworn');
});

// --- rosters ---

test('rosters: 5 heroes x 10 resolving giftKeys, union covers all 19', () => {
  const ctx = loadItems();
  assert.deepEqual(Object.keys(ctx.HERO_GIFTS).sort(), HERO_IDS.slice().sort());
  const union = {};
  for (const hid of HERO_IDS) {
    const roster = ctx.HERO_GIFTS[hid];
    assert.equal(roster.length, 10, hid);
    for (const gk of roster) {
      assert.ok(ctx.ITEMS.gifts[gk], hid + ' gift ' + gk + ' resolves');
      union[gk] = true;
    }
  }
  assert.deepEqual(Object.keys(union).sort(), Object.keys(ctx.ITEMS.gifts).sort());
});

test('rosters: each holds >=1 Sworn-locked and >=1 always-effective gift', () => {
  const ctx = loadItems();
  for (const hid of HERO_IDS) {
    const roster = ctx.HERO_GIFTS[hid];
    assert.ok(roster.some(function(gk) { return SWORN_GIFTS.includes(gk); }), hid + ' has Sworn gift');
    assert.ok(roster.some(function(gk) { return !SWORN_GIFTS.includes(gk); }), hid + ' has open gift');
  }
});

// --- loot branch ---

test('loot branch: equipment path unchanged when gift roll misses', () => {
  const ctx = loadItems();
  const realRandom = ctx.Math.random;
  // Force equipment drop (roll 0 < 0.35), common rarity, then gift miss (0.5 > 0.12).
  const seq = [0.0, 0.01, 0.99, 0.0, 0.0, 0.0, 0.5];
  let i = 0;
  ctx.Math.random = function() { return seq[Math.min(i++, seq.length - 1)]; };
  const loot = ctx.generateLoot('aryavarta', 5);
  ctx.Math.random = realRandom;
  assert.equal(loot.length, 1);
  assert.ok(loot[0].type === 'weapon' || loot[0].type === 'armor' || loot[0].type === 'accessory');
});

test('loot branch: forced gift yields zone-appropriate giftKey', () => {
  const ctx = loadItems();
  const realRandom = ctx.Math.random;
  // Force: equipment hit, rarity, type/weap/template picks, gift hit (<0.12), gift pick.
  const seq = [0.0, 0.01, 0.99, 0.0, 0.0, 0.0, 0.05, 0.0];
  let i = 0;
  ctx.Math.random = function() { return seq[Math.min(i++, seq.length - 1)]; };
  const loot = ctx.generateLoot('meru', 15);
  ctx.Math.random = realRandom;
  const gifts = loot.filter(function(l) { return l.type === 'gift'; });
  assert.equal(gifts.length, 1);
  const def = ctx.ITEMS.gifts[gifts[0].giftKey];
  assert.ok(def, 'giftKey resolves');
  assert.ok(def.zones.includes('meru'), 'gift zones include meru');
});

test('loot branch: unknown zone yields no gift and never throws', () => {
  const ctx = loadItems();
  const realRandom = ctx.Math.random;
  ctx.Math.random = function() { return 0.0; }; // force everything
  let loot;
  assert.doesNotThrow(function() { loot = ctx.generateLoot('nope_zone', 5); });
  ctx.Math.random = realRandom;
  assert.ok(Array.isArray(loot));
  assert.equal(loot.filter(function(l) { return l.type === 'gift'; }).length, 0);
});
