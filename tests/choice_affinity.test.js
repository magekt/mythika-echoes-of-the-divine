const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const ENCOUNTER_PATH = path.join(ROOT, 'src/systems/encounter.js');
const ENCOUNTERS_PATH = path.join(ROOT, 'src/data/encounters.js');
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];

function toHost(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadWorld(affinity, party) {
  const context = vm.createContext({
    console,
    G: {
      state: {
        party: party || [],
        affinity: affinity === undefined ? {} : affinity,
        flags: {},
        encounters: { seen: {} },
        karma: 0,
        currentZone: 'dandaka'
      }
    },
    HERO_IDS: HERO_IDS.slice(),
    HEROES: { arjuna: { name: 'Arjuna' }, bhima: { name: 'Bhima' }, karna: { name: 'Karna' }, draupadi: { name: 'Draupadi' }, hanuman: { name: 'Hanuman' } },
    Economy: { addGold: () => {}, addKarma: () => {}, addDivineFragments: () => {}, addItem: () => {} },
    Progression: { addPartyXP: () => {} },
    CultivationSystem: { addPrana: () => {}, addCultivationBase: () => {} },
    QuestSystem: { trackEncounter: () => {} },
    AchievementSystem: { check: () => {} },
    Notify: { show: () => {} },
    R: { colors: { gold: 'gold' } }
  });
  context.globalThis = context;
  vm.runInContext(fs.readFileSync(BOND_PATH, 'utf8') + '\n;globalThis.BondSystem = BondSystem;', context, { filename: BOND_PATH });
  vm.runInContext(fs.readFileSync(ENCOUNTERS_PATH, 'utf8') + '\n;globalThis.ENCOUNTERS = ENCOUNTERS;\n;globalThis.encounterAvailable = encounterAvailable;\n;globalThis.getZoneEncounters = getZoneEncounters;\n;globalThis.getTravelEncounters = getTravelEncounters;\n;globalThis.pickWeighted = pickWeighted;\n;globalThis.maxPartyLevel = maxPartyLevel;', context, { filename: ENCOUNTERS_PATH });
  vm.runInContext(fs.readFileSync(ENCOUNTER_PATH, 'utf8') + '\n;globalThis.EncounterSystem = EncounterSystem;\n;globalThis.EncounterTrigger = EncounterTrigger;', context, { filename: ENCOUNTER_PATH });
  return context;
}

test('gain sizes: +2 and +4 move an active hero', () => {
  const ctx = loadWorld({}, [{ id: 'arjuna', active: true }]);
  const r2 = ctx.BondSystem.add('arjuna', 2);
  assert.equal(r2.applied, 2);
  assert.equal(ctx.G.state.affinity.arjuna, 2);
  ctx.G.state.affinity = {};
  const r4 = ctx.BondSystem.add('arjuna', 4);
  assert.equal(r4.applied, 4);
  assert.equal(ctx.G.state.affinity.arjuna, 4);
  assert.equal(ctx.BondSystem.GAIN_SMALL, 2);
  assert.equal(ctx.BondSystem.GAIN_MAJOR, 4);
});

test('eligibility: absent/benched get no write; active true/undefined write', () => {
  let ctx = loadWorld({}, []);
  let r = ctx.BondSystem.add('arjuna', 2);
  assert.equal(r.applied, 0);
  assert.equal(Object.prototype.hasOwnProperty.call(ctx.G.state.affinity, 'arjuna'), false);

  ctx = loadWorld({}, [{ id: 'arjuna', active: false }]);
  r = ctx.BondSystem.add('arjuna', 2);
  assert.equal(r.applied, 0);
  assert.equal(Object.prototype.hasOwnProperty.call(ctx.G.state.affinity, 'arjuna'), false);

  ctx = loadWorld({}, [{ id: 'arjuna', active: true }]);
  r = ctx.BondSystem.add('arjuna', 2);
  assert.equal(r.applied, 2);

  ctx = loadWorld({}, [{ id: 'arjuna' }]);
  r = ctx.BondSystem.add('arjuna', 2);
  assert.equal(r.applied, 2);
});

test('no decay: negative and zero amounts ignored', () => {
  const ctx = loadWorld({ arjuna: 10 }, [{ id: 'arjuna', active: true }]);
  assert.deepEqual(toHost(ctx.BondSystem.add('arjuna', -5)), { applied: 0, before: 10, after: 10, tierUp: false });
  assert.deepEqual(toHost(ctx.BondSystem.add('arjuna', 0)), { applied: 0, before: 10, after: 10, tierUp: false });
  assert.equal(ctx.G.state.affinity.arjuna, 10);
});

test('clamp: 99 + 4 caps at 100', () => {
  const ctx = loadWorld({ arjuna: 99 }, [{ id: 'arjuna', active: true }]);
  const r = ctx.BondSystem.add('arjuna', 4);
  assert.equal(r.after, 100);
  assert.equal(ctx.G.state.affinity.arjuna, 100);
});

test('tierUp flags at 24+2, silent at 10+2', () => {
  let ctx = loadWorld({ arjuna: 24 }, [{ id: 'arjuna', active: true }]);
  let r = ctx.BondSystem.add('arjuna', 2);
  assert.equal(r.tierUp, true);
  assert.equal(ctx.BondSystem.tierFor(r.after), 'Trusted');
  ctx = loadWorld({ arjuna: 10 }, [{ id: 'arjuna', active: true }]);
  r = ctx.BondSystem.add('arjuna', 2);
  assert.equal(r.tierUp, false);
});

test('data audit: affinity values only 2/4, known heroes, every encounter annotated', () => {
  const ctx = loadWorld({}, []);
  const encounters = ctx.ENCOUNTERS;
  for (const [id, enc] of Object.entries(encounters)) {
    const annotated = (enc.choices || []).filter(c => c && typeof c.affinity === 'object' && c.affinity !== null);
    assert.ok(annotated.length >= 1, id + ' must have at least one affinity-annotated choice');
    for (const c of annotated) {
      for (const [hero, gain] of Object.entries(c.affinity)) {
        assert.ok(HERO_IDS.includes(hero), id + ' unknown hero ' + hero);
        assert.ok(gain === 2 || gain === 4, id + ' gain must be 2 or 4, got ' + gain);
      }
    }
  }
  const reachable = new Set();
  for (const enc of Object.values(encounters)) {
    for (const c of (enc.choices || [])) {
      if (c && c.affinity) for (const h of Object.keys(c.affinity)) reachable.add(h);
    }
  }
  for (const h of HERO_IDS) assert.ok(reachable.has(h), h + ' must be reachable');
});

test('choose() integration: annotated choice grants affinity when hero active', () => {
  const ctx = loadWorld({}, [{ id: 'arjuna', active: true }]);
  const result = ctx.EncounterSystem.choose('nagaBargain', 0);
  assert.ok(result);
  const aff = result.granted.find(g => g.type === 'affinity' && g.hero === 'arjuna');
  assert.ok(aff, 'expected affinity grant for arjuna');
  assert.equal(aff.amount, 4);
  assert.equal(ctx.G.state.affinity.arjuna, 4);
});

test('choose() integration: benched hero gets no affinity grant', () => {
  const ctx = loadWorld({}, [{ id: 'arjuna', active: false }]);
  const result = ctx.EncounterSystem.choose('nagaBargain', 0);
  assert.ok(result);
  assert.equal(result.granted.filter(g => g.type === 'affinity').length, 0);
});
