const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const ENCOUNTERS_PATH = path.join(ROOT, 'src/data/encounters.js');
const VARIANTS_PATH = path.join(ROOT, 'src/data/zone_variants.js');
const ENCOUNTER_SYS_PATH = path.join(ROOT, 'src/systems/encounter.js');
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];
const BEAST_IDS = ['wolf', 'serpent', 'owl', 'bear', 'fox', 'dragon', 'phoenix', 'turtle', 'tiger', 'kitsune'];

const EXPECTED_COUNTS = { aryavarta: 1, tapobhumi: 1, meru: 2, svarga: 2, dandaka: 3, patala: 3 };

function heroesStub() {
  const h = {};
  for (const id of HERO_IDS) h[id] = { id: id, name: id[0].toUpperCase() + id.slice(1) };
  return h;
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
        karma: 50,
        gold: 1000,
        prana: 200,
        inventory: [],
        cultivationBase: 0
      }
    },
    HEROES: heroesStub(),
    HERO_IDS: HERO_IDS.slice(),
    SPIRIT_BEASTS: (function() { const s = {}; for (const b of BEAST_IDS) s[b] = { name: b }; return s; })()
  });
  context.globalThis = context;
  if (!o.noBond) {
    vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BondSystem = BondSystem; globalThis.BeastBond = BeastBond;', context, { filename: BOND_PATH });
  }
  vm.runInContext(fs.readFileSync(ENCOUNTERS_PATH, 'utf8') + '\n;globalThis.ENCOUNTERS = ENCOUNTERS;\n;globalThis.encounterAvailable = encounterAvailable;\n;globalThis.getZoneEncounters = getZoneEncounters;\n;globalThis.pickWeighted = pickWeighted;\n;globalThis.maxPartyLevel = maxPartyLevel;', context, { filename: ENCOUNTERS_PATH });
  vm.runInContext(fs.readFileSync(VARIANTS_PATH, 'utf8') + '\n;globalThis.ZONE_VARIANTS = ZONE_VARIANTS;', context, { filename: VARIANTS_PATH });
  return context;
}

function defaultBeastBond() {
  return { xp: {}, feed: { day: 0, counts: {} }, train: { day: 0, counts: {} }, trainCd: {} };
}

function partyWith(level) {
  return [{ id: 'arjuna', name: 'Arjuna', level: level || 30, active: true }];
}

// --- table shape ---

test('variant table: exactly 12 entries with per-zone counts 1/1/2/2/3/3', () => {
  const ctx = loadWorld({ party: partyWith() });
  assert.equal(ctx.ZONE_VARIANTS.length, 12);
  const counts = {};
  for (const v of ctx.ZONE_VARIANTS) {
    assert.equal(v.zones.length, 1);
    counts[v.zones[0]] = (counts[v.zones[0]] || 0) + 1;
  }
  assert.deepEqual(counts, EXPECTED_COUNTS);
});

test('variants: pool zone, valid zones, baseId resolves to same-zone standard base', () => {
  const ctx = loadWorld({ party: partyWith() });
  const ids = new Set();
  for (const v of ctx.ZONE_VARIANTS) {
    assert.ok(v.id.indexOf('lz_') === 0, v.id + ' uses lz_ prefix');
    assert.ok(!ids.has(v.id), v.id + ' unique');
    ids.add(v.id);
    assert.equal(v.pool, 'zone');
    assert.ok(Object.prototype.hasOwnProperty.call(EXPECTED_COUNTS, v.zones[0]));
    assert.ok(ctx.ENCOUNTERS[v.id], v.id + ' registered in ENCOUNTERS');
    const base = ctx.ENCOUNTERS[v.baseId];
    assert.ok(base, v.id + ' base ' + v.baseId + ' exists');
    assert.ok(base.zones.includes(v.zones[0]), v.id + ' base covers same zone');
    assert.ok(!base.bondReq, 'base ' + v.baseId + ' has no bondReq (ungated default)');
    if (v.bondReq.hero) {
      assert.ok(HERO_IDS.includes(v.bondReq.hero));
      assert.ok([25, 50].includes(v.bondReq.affinityMin));
    } else {
      assert.ok(BEAST_IDS.includes(v.bondReq.beast));
      assert.equal(v.bondReq.heartMin, 2);
    }
    assert.ok(Array.isArray(v.choices) && v.choices.length === 2);
    for (const c of v.choices) {
      assert.ok(c.flags && Object.keys(c.flags)[0] === 'enc_' + v.id, v.id + ' flags keyed enc_<id>');
    }
  }
});

test('no new zone IDs: variant zones are all pre-existing geography', () => {
  const ctx = loadWorld({ party: partyWith() });
  for (const v of ctx.ZONE_VARIANTS) {
    assert.ok(Object.prototype.hasOwnProperty.call(EXPECTED_COUNTS, v.zones[0]));
  }
  assert.deepEqual(Object.keys(EXPECTED_COUNTS).sort(), ['aryavarta', 'dandaka', 'meru', 'patala', 'svarga', 'tapobhumi']);
});

// --- gating ---

test('hero variant eligible at threshold, ineligible one below; base unaffected', () => {
  // lz_aryavarta_bhima: affinityMin 25
  let ctx = loadWorld({ party: partyWith(), affinity: { bhima: 25 }, beastBond: defaultBeastBond() });
  let enc = ctx.ENCOUNTERS['lz_aryavarta_bhima'];
  assert.equal(ctx.encounterAvailable(enc, { zoneId: 'aryavarta', level: 30, karma: 50 }), true);
  ctx = loadWorld({ party: partyWith(), affinity: { bhima: 24 }, beastBond: defaultBeastBond() });
  assert.equal(ctx.encounterAvailable(enc, { zoneId: 'aryavarta', level: 30, karma: 50 }), false);
  // base rishiBoon stays eligible regardless of affinity
  const base = ctx.ENCOUNTERS['rishiBoon'];
  assert.equal(ctx.encounterAvailable(base, { zoneId: 'aryavarta', level: 30, karma: 50 }), true);

  // lz_tapobhumi_karna: Sworn 50 boundary
  ctx = loadWorld({ party: partyWith(), affinity: { karna: 50 }, beastBond: defaultBeastBond() });
  enc = ctx.ENCOUNTERS['lz_tapobhumi_karna'];
  assert.equal(ctx.encounterAvailable(enc, { zoneId: 'tapobhumi', level: 55, karma: 50 }), true);
  ctx = loadWorld({ party: partyWith(), affinity: { karna: 49 }, beastBond: defaultBeastBond() });
  assert.equal(ctx.encounterAvailable(enc, { zoneId: 'tapobhumi', level: 55, karma: 50 }), false);
});

test('beast variant eligible at heart threshold xp, ineligible below', () => {
  // heart 2 at xp 80
  let bb = defaultBeastBond(); bb.xp.wolf = 80;
  let ctx = loadWorld({ party: partyWith(), beastBond: bb });
  assert.equal(ctx.encounterAvailable(ctx.ENCOUNTERS['lz_dandaka_wolf'], { zoneId: 'dandaka', level: 30, karma: 50 }), true);
  bb = defaultBeastBond(); bb.xp.wolf = 79;
  ctx = loadWorld({ party: partyWith(), beastBond: bb });
  assert.equal(ctx.encounterAvailable(ctx.ENCOUNTERS['lz_dandaka_wolf'], { zoneId: 'dandaka', level: 30, karma: 50 }), false);
});

test('getZoneEncounters includes met variants alongside standards; excludes unmet', () => {
  const ctx = loadWorld({ party: partyWith(), affinity: { arjuna: 30, draupadi: 0 }, beastBond: defaultBeastBond() });
  const ids = ctx.getZoneEncounters('dandaka').map(function(e) { return e.id; });
  assert.ok(ids.includes('lz_dandaka_arjuna'), 'met arjuna variant listed');
  assert.ok(!ids.includes('lz_dandaka_draupadi'), 'unmet draupadi variant excluded');
  assert.ok(!ids.includes('lz_dandaka_wolf'), 'unmet wolf variant excluded');
  assert.ok(ids.includes('nagaBargain') || ids.includes('asuraWhisper'), 'standards still listed');
});

// --- degradation ---

test('absent bond systems degrade variants to ineligible without throwing', () => {
  const ctx = loadWorld({ party: partyWith(), noBond: true });
  assert.equal(ctx.encounterAvailable(ctx.ENCOUNTERS['lz_aryavarta_bhima'], { zoneId: 'aryavarta', level: 30, karma: 50 }), false);
  assert.equal(ctx.encounterAvailable(ctx.ENCOUNTERS['lz_dandaka_wolf'], { zoneId: 'dandaka', level: 30, karma: 50 }), false);
  assert.equal(ctx.encounterAvailable(ctx.ENCOUNTERS['rishiBoon'], { zoneId: 'aryavarta', level: 30, karma: 50 }), true);
});

test('hostile bondReq shapes are ineligible, never throw', () => {
  const ctx = loadWorld({ party: partyWith(), affinity: { bhima: 100 }, beastBond: defaultBeastBond() });
  assert.equal(ctx.encounterAvailable({ id: 'x', bondReq: { hero: '__proto__', affinityMin: 0 } }, { zoneId: 'aryavarta', level: 30, karma: 50 }), false);
  assert.equal(ctx.encounterAvailable({ id: 'y', bondReq: { affinityMin: 0 } }, { zoneId: 'aryavarta', level: 30, karma: 50 }), false);
  assert.equal(ctx.encounterAvailable({ id: 'z', bondReq: 'bhima' }, { zoneId: 'aryavarta', level: 30, karma: 50 }), true);
});

// --- exactly-once via EncounterSystem.choose ---

test('variant completion is exactly-once through the seen ledger', () => {
  const ctx = loadWorld({ party: partyWith(), affinity: { bhima: 30 }, beastBond: defaultBeastBond() });
  vm.runInContext(
    'Economy = { addGold: function(){}, addKarma: function(){}, addDivineFragments: function(){}, addItem: function(){} };' +
    'Progression = { addPartyXP: function(){}, perkValue: function(){ return 0; } };' +
    'CultivationSystem = { addPrana: function(){}, addCultivationBase: function(){} };',
    ctx
  );
  vm.runInContext(fs.readFileSync(ENCOUNTER_SYS_PATH, 'utf8') + '\n;globalThis.EncounterSystem = EncounterSystem;', ctx, { filename: ENCOUNTER_SYS_PATH });
  const first = ctx.EncounterSystem.choose('lz_aryavarta_bhima', 0);
  assert.ok(first && first.id === 'lz_aryavarta_bhima');
  assert.equal(ctx.G.state.flags['enc_lz_aryavarta_bhima'], 'stand');
  assert.equal(ctx.EncounterSystem.choose('lz_aryavarta_bhima', 0), false);
  assert.equal(ctx.EncounterSystem.choose('lz_aryavarta_bhima', 1), false);
});
