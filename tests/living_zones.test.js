const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const ENCOUNTERS_PATH = path.join(ROOT, 'src/data/encounters.js');
const VARIANTS_PATH = path.join(ROOT, 'src/data/zone_variants.js');
const LIVING_PATH = path.join(ROOT, 'src/systems/living_zones.js');
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];

function heroesStub() {
  const h = {};
  for (const id of HERO_IDS) h[id] = { id: id, name: id[0].toUpperCase() + id.slice(1) };
  return h;
}

function beastsStub() {
  return { wolf: { name: 'Shadow Wolf' }, serpent: { name: 'Iron Serpent' } };
}

function loadWorld(opts) {
  const o = opts || {};
  const context = vm.createContext({
    console,
    G: {
      state: {
        flags: Object.assign({}, o.flags),
        encounters: { seen: Object.assign({}, o.seen) },
        affinity: Object.assign({}, o.affinity),
        party: (o.party || []).map(function(h) { return Object.assign({}, h); }),
        beastBond: o.beastBond === undefined ? undefined : JSON.parse(JSON.stringify(o.beastBond)),
        karma: 50
      }
    },
    HEROES: heroesStub(),
    HERO_IDS: HERO_IDS.slice(),
    SPIRIT_BEASTS: beastsStub(),
    ZONES: { dandaka: { name: 'Dandaka Forest' }, aryavarta: { name: 'Aryavarta Grasslands' } }
  });
  context.globalThis = context;
  if (!o.noBond) {
    vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BondSystem = BondSystem; globalThis.BeastBond = BeastBond;', context, { filename: BOND_PATH });
  }
  vm.runInContext(fs.readFileSync(ENCOUNTERS_PATH, 'utf8') + '\n;globalThis.ENCOUNTERS = ENCOUNTERS;\n;globalThis.encounterAvailable = encounterAvailable;', context, { filename: ENCOUNTERS_PATH });
  vm.runInContext(fs.readFileSync(VARIANTS_PATH, 'utf8') + '\n;globalThis.ZONE_VARIANTS = ZONE_VARIANTS;', context, { filename: VARIANTS_PATH });
  vm.runInContext(fs.readFileSync(LIVING_PATH, 'utf8') + '\n;globalThis.LivingZones = LivingZones;', context, { filename: LIVING_PATH });
  return context;
}

function defaultBeastBond() {
  return { xp: {}, feed: { day: 0, counts: {} }, train: { day: 0, counts: {} }, trainCd: {} };
}

// Cross-realm guard: vm-context arrays fail strict deepEqual, so compare
// JSON-round-tripped (host-realm) copies (mirrors host() in beast_hearts).
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function party30() {
  return [{ id: 'arjuna', name: 'Arjuna', level: 30, active: true }, { id: 'draupadi', name: 'Draupadi', level: 30, active: true }];
}

// --- resolution ---

test('resolveFor returns highest met threshold first (dandaka: draupadi 25 vs arjuna 60)', () => {
  const ctx = loadWorld({ party: party30(), affinity: { arjuna: 60, draupadi: 30 }, beastBond: defaultBeastBond() });
  const r = ctx.LivingZones.resolveFor('dandaka');
  assert.ok(r && r.id === 'lz_dandaka_arjuna', 'highest threshold wins, got ' + (r && r.id));
  const list = plain(ctx.LivingZones.eligibleIn('dandaka').map(function(v) { return v.id; }));
  assert.deepEqual(list, ['lz_dandaka_arjuna', 'lz_dandaka_draupadi']);
});

test('resolveFor null below threshold while standards stay eligible', () => {
  const ctx = loadWorld({ party: party30(), affinity: { arjuna: 0 }, beastBond: defaultBeastBond() });
  assert.equal(ctx.LivingZones.resolveFor('aryavarta'), null);
  assert.equal(ctx.encounterAvailable(ctx.ENCOUNTERS['rishiBoon'], { zoneId: 'aryavarta', level: 30, karma: 50 }), true);
});

test('seen variants are skipped in favor of remaining eligible ones', () => {
  const ctx = loadWorld({ party: party30(), affinity: { arjuna: 60, draupadi: 30 }, seen: { lz_dandaka_arjuna: 'compact' }, beastBond: defaultBeastBond() });
  const r = ctx.LivingZones.resolveFor('dandaka');
  assert.ok(r && r.id === 'lz_dandaka_draupadi');
});

test('variantsFor unknown zone yields []', () => {
  const ctx = loadWorld({ party: party30(), beastBond: defaultBeastBond() });
  assert.deepEqual(plain(ctx.LivingZones.variantsFor('nope')), []);
  assert.equal(ctx.LivingZones.resolveFor('nope'), null);
});

// --- tease ---

test('teaseFor null when nothing locked; string naming nearest-locked otherwise', () => {
  let ctx = loadWorld({ party: party30(), affinity: { arjuna: 60, draupadi: 30 }, beastBond: defaultBeastBond() });
  // wolf (heart 2 ~ 50) still locked at 0 xp -> tease names someone
  let t = ctx.LivingZones.teaseFor('dandaka');
  assert.ok(typeof t === 'string' && t.length > 0, 'locked wolf yields tease');
  // all seen -> null
  const bb = defaultBeastBond(); bb.xp.wolf = 160;
  ctx = loadWorld({ party: party30(), affinity: { arjuna: 60, draupadi: 30 }, beastBond: bb, seen: { lz_dandaka_wolf: 'treasure' } });
  assert.equal(ctx.LivingZones.teaseFor('dandaka'), null);
  // unknown zone -> null
  assert.equal(ctx.LivingZones.teaseFor('nope'), null);
});

test('tease copy is a hint, never blocking language', () => {
  const ctx = loadWorld({ party: party30(), affinity: {}, beastBond: defaultBeastBond() });
  const t = ctx.LivingZones.teaseFor('aryavarta');
  assert.ok(typeof t === 'string' && t.includes('Bhima'), 'names nearest-locked companion, got: ' + t);
  assert.ok(!/required|locked out|must have|denied/i.test(t), 'no blocking verbs');
});

test('tease names lowest unmet threshold first', () => {
  const ctx = loadWorld({ party: party30(), affinity: {}, beastBond: defaultBeastBond() });
  const t = ctx.LivingZones.teaseFor('dandaka');
  assert.ok(t.includes('Arjuna') || t.includes('Draupadi'), 'nearest (25) before wolf (~50), got: ' + t);
});

// --- companion ---

test('companionFor prefers oath-flagged hero over higher-affinity non-oath', () => {
  const ctx = loadWorld({
    party: party30(),
    affinity: { arjuna: 90, draupadi: 30 },
    flags: { bond_draupadi_oath: true },
    beastBond: defaultBeastBond()
  });
  const c = ctx.LivingZones.companionFor('dandaka');
  assert.ok(c && c.id === 'draupadi' && c.oath === true, JSON.stringify(c));
});

test('companionFor falls back to highest affinity, then beasts; null when unbonded', () => {
  let ctx = loadWorld({ party: party30(), affinity: { arjuna: 40, draupadi: 10 }, beastBond: defaultBeastBond() });
  let c = ctx.LivingZones.companionFor('dandaka');
  assert.ok(c && c.id === 'arjuna' && c.oath === false);
  const bb = defaultBeastBond(); bb.xp.wolf = 80;
  ctx = loadWorld({ party: [], affinity: {}, beastBond: bb });
  c = ctx.LivingZones.companionFor('dandaka');
  assert.ok(c && c.kind === 'beast' && c.id === 'wolf' && c.oath === true, JSON.stringify(c));
  ctx = loadWorld({ party: party30(), affinity: {}, beastBond: defaultBeastBond() });
  assert.equal(ctx.LivingZones.companionFor('dandaka'), null);
  assert.equal(ctx.LivingZones.companionFor('nope'), null);
});

// --- notes ---

test('landmarkBondNote / echoWitness oath vs non-oath shapes', () => {
  let ctx = loadWorld({ party: party30(), affinity: { arjuna: 40 }, beastBond: defaultBeastBond() });
  assert.equal(ctx.LivingZones.landmarkBondNote('dandaka'), 'Arjuna\u2019s bond lingers here.');
  assert.equal(ctx.LivingZones.echoWitness('dandaka'), null);
  ctx = loadWorld({ party: party30(), affinity: { arjuna: 60 }, flags: { bond_arjuna_oath: true }, beastBond: defaultBeastBond() });
  assert.equal(ctx.LivingZones.landmarkBondNote('dandaka'), 'The land remembers Arjuna, oath-bound companion.');
  assert.equal(ctx.LivingZones.echoWitness('dandaka'), ' \u2014 witnessed by Arjuna, oath-bound');
  ctx = loadWorld({ party: party30(), affinity: {}, beastBond: defaultBeastBond() });
  assert.equal(ctx.LivingZones.landmarkBondNote('dandaka'), null);
  assert.equal(ctx.LivingZones.echoWitness('dandaka'), null);
});

// --- robustness ---

test('all LivingZones APIs degrade safe with bond globals absent', () => {
  const ctx = loadWorld({ party: party30(), noBond: true });
  ctx.HEROES = undefined;
  ctx.SPIRIT_BEASTS = undefined;
  assert.deepEqual(plain(ctx.LivingZones.eligibleIn('dandaka')), []);
  assert.equal(ctx.LivingZones.resolveFor('dandaka'), null);
  assert.equal(ctx.LivingZones.companionFor('dandaka'), null);
  assert.equal(ctx.LivingZones.landmarkBondNote('dandaka'), null);
  assert.equal(ctx.LivingZones.echoWitness('dandaka'), null);
  // tease with no eligibility info: variants exist but ineligible -> locked -> tease or null, never throws
  const t = ctx.LivingZones.teaseFor('dandaka');
  assert.ok(t === null || typeof t === 'string');
});

test('G absent degrades every API to safe defaults', () => {
  const ctx = loadWorld({ party: party30(), beastBond: defaultBeastBond() });
  ctx.G = undefined;
  ctx.globalThis.G = undefined;
  assert.deepEqual(plain(ctx.LivingZones.variantsFor('dandaka').length > 0 ? ctx.LivingZones.eligibleIn('dandaka') : []), []);
  assert.equal(ctx.LivingZones.resolveFor('dandaka'), null);
  assert.equal(ctx.LivingZones.companionFor('dandaka'), null);
  assert.equal(ctx.LivingZones.landmarkBondNote('dandaka'), null);
  assert.equal(ctx.LivingZones.echoWitness('dandaka'), null);
});
