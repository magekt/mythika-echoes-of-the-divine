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
const LANDMARKS_SYS_PATH = path.join(ROOT, 'src/systems/landmarks.js');
const ECHOES_SYS_PATH = path.join(ROOT, 'src/systems/narrative_echoes.js');
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadWorld(opts) {
  const o = opts || {};
  const discovered = Object.assign({}, o.discovered);
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
    HEROES: (function() { const h = {}; for (const id of HERO_IDS) h[id] = { id: id, name: id[0].toUpperCase() + id.slice(1) }; return h; })(),
    HERO_IDS: HERO_IDS.slice(),
    SPIRIT_BEASTS: { wolf: { name: 'Shadow Wolf' }, serpent: { name: 'Iron Serpent' } },
    ZONES: { dandaka: { name: 'Dandaka Forest' } },
    LANDMARKS: {
      nagaFord: { id: 'nagaFord', name: "The Naga's Crossroads", icon: '🐍', zoneId: 'dandaka', description: 'd', relevance: 'r', action: null },
      shadowAltar: { id: 'shadowAltar', name: 'Altar', icon: '🔥', zoneId: 'dandaka', description: 'd2', relevance: 'r2', action: null }
    },
    ZONE_LANDMARKS: { dandaka: ['nagaFord', 'shadowAltar'] },
    LandmarkDefs: {
      getByZone: function(zoneId) {
        if (zoneId !== 'dandaka') return [];
        return [
          { id: 'nagaFord', name: "The Naga's Crossroads", icon: '🐍', zoneId: 'dandaka', description: 'd', relevance: 'r', action: null },
          { id: 'shadowAltar', name: 'Altar', icon: '🔥', zoneId: 'dandaka', description: 'd2', relevance: 'r2', action: null }
        ];
      }
    },
    WorldState: {
      getWorld: function() { return { landmarks: { discovered: discovered } }; },
      recordLandmarkDiscovery: function() { return true; }
    },
    NARRATIVE_ECHOES: [
      { flagKey: 'enc_nagaBargain', value: 'share', region: 'dandaka', marker: 'm1', label: 'Serpent\u2019s Blessing', desc: 'Fungi bloom.', markerColor: '#FFD700' },
      { flagKey: 'enc_nagaBargain', value: 'force', region: 'dandaka', marker: 'm2', label: 'Broken Scales', desc: 'Scales litter.', markerColor: '#4A6FA5' }
    ]
  });
  context.globalThis = context;
  vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BondSystem = BondSystem; globalThis.BeastBond = BeastBond;', context, { filename: BOND_PATH });
  vm.runInContext(fs.readFileSync(ENCOUNTERS_PATH, 'utf8') + '\n;globalThis.ENCOUNTERS = ENCOUNTERS;\n;globalThis.encounterAvailable = encounterAvailable;', context, { filename: ENCOUNTERS_PATH });
  vm.runInContext(fs.readFileSync(VARIANTS_PATH, 'utf8') + '\n;globalThis.ZONE_VARIANTS = ZONE_VARIANTS;', context, { filename: VARIANTS_PATH });
  if (!o.noLiving) {
    vm.runInContext(fs.readFileSync(LIVING_PATH, 'utf8') + '\n;globalThis.LivingZones = LivingZones;', context, { filename: LIVING_PATH });
  }
  vm.runInContext(fs.readFileSync(LANDMARKS_SYS_PATH, 'utf8') + '\n;globalThis.Landmarks = Landmarks;', context, { filename: LANDMARKS_SYS_PATH });
  vm.runInContext(fs.readFileSync(ECHOES_SYS_PATH, 'utf8') + '\n;globalThis.NarrativeEchoes = NarrativeEchoes;', context, { filename: ECHOES_SYS_PATH });
  return context;
}

function defaultBeastBond() {
  return { xp: {}, feed: { day: 0, counts: {} }, train: { day: 0, counts: {} }, trainCd: {} };
}

function party() {
  return [
    { id: 'arjuna', name: 'Arjuna', level: 30, active: true },
    { id: 'draupadi', name: 'Draupadi', level: 30, active: true }
  ];
}

// --- Landmarks.getAll bondNote ---

test('getAll names the oath hero; null when unbonded; stable shape without LivingZones', () => {
  let ctx = loadWorld({ party: party(), affinity: { arjuna: 60, draupadi: 30 }, flags: { bond_arjuna_oath: true }, beastBond: defaultBeastBond() });
  let all = plain(ctx.Landmarks.getAll('dandaka'));
  assert.equal(all.length, 2);
  for (const lm of all) {
    assert.equal(lm.bondNote, 'The land remembers Arjuna, oath-bound companion.');
    assert.ok(lm.id && lm.name && ('discovered' in lm), 'prior keys intact');
  }

  ctx = loadWorld({ party: party(), affinity: { arjuna: 40 }, beastBond: defaultBeastBond() });
  all = plain(ctx.Landmarks.getAll('dandaka'));
  assert.equal(all[0].bondNote, 'Arjuna\u2019s bond lingers here.');

  ctx = loadWorld({ party: party(), affinity: {}, beastBond: defaultBeastBond() });
  all = plain(ctx.Landmarks.getAll('dandaka'));
  assert.equal(all[0].bondNote, null);

  ctx = loadWorld({ party: party(), affinity: { arjuna: 60 }, flags: { bond_arjuna_oath: true }, beastBond: defaultBeastBond(), noLiving: true });
  all = plain(ctx.Landmarks.getAll('dandaka'));
  assert.equal(all[0].bondNote, null);
  assert.equal(all[0].name, "The Naga's Crossroads");
});

// --- NarrativeEchoes witness ---

test('echoes carry oath witness; null otherwise; source array unmutated', () => {
  const before = function(ctx) { return plain(ctx.NARRATIVE_ECHOES); };
  let ctx = loadWorld({
    party: party(),
    affinity: { arjuna: 60 },
    flags: { enc_nagaBargain: 'share', bond_arjuna_oath: true },
    beastBond: defaultBeastBond()
  });
  const snap = before(ctx);
  const echoes = plain(ctx.NarrativeEchoes.getForRegion('dandaka'));
  assert.equal(echoes.length, 1);
  assert.equal(echoes[0].companion, ' \u2014 witnessed by Arjuna, oath-bound');
  assert.equal(echoes[0].label, 'Serpent\u2019s Blessing');
  assert.equal(echoes[0].desc, 'Fungi bloom.');
  assert.deepEqual(before(ctx), snap);

  const active = plain(ctx.NarrativeEchoes.getActive());
  assert.equal(active.length, 1);
  assert.equal(active[0].companion, ' \u2014 witnessed by Arjuna, oath-bound');

  // non-oath bond: companion null, desc byte-identical
  ctx = loadWorld({
    party: party(),
    affinity: { arjuna: 40 },
    flags: { enc_nagaBargain: 'share' },
    beastBond: defaultBeastBond()
  });
  const plainEchoes = plain(ctx.NarrativeEchoes.getForRegion('dandaka'));
  assert.equal(plainEchoes[0].companion, null);
  assert.equal(plainEchoes[0].desc, 'Fungi bloom.');
  assert.deepEqual(before(ctx), plain(ctx.NARRATIVE_ECHOES));

  // unknown region still []
  assert.deepEqual(plain(ctx.NarrativeEchoes.getForRegion('nope')), []);
});

test('echoes degrade safe without LivingZones; isEchoed unchanged', () => {
  const ctx = loadWorld({
    party: party(),
    affinity: { arjuna: 60 },
    flags: { enc_nagaBargain: 'share', bond_arjuna_oath: true },
    beastBond: defaultBeastBond(),
    noLiving: true
  });
  const echoes = plain(ctx.NarrativeEchoes.getForRegion('dandaka'));
  assert.equal(echoes.length, 1);
  assert.equal(echoes[0].companion, null);
  assert.equal(echoes[0].desc, 'Fungi bloom.');
  assert.equal(ctx.NarrativeEchoes.isEchoed('nagaBargain'), true);
  assert.equal(ctx.NarrativeEchoes.isEchoed('yakshaRiddle'), false);
});
