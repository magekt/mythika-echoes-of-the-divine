const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const BONDS_PATH = path.join(ROOT, 'src/data/bonds.js');
const ENCOUNTERS_PATH = path.join(ROOT, 'src/data/encounters.js');
const ENCOUNTER_PATH = path.join(ROOT, 'src/systems/encounter.js');
const GAME_PATH = path.join(ROOT, 'src/engine/game.js');
const SAVE_PATH = path.join(ROOT, 'src/systems/save.js');
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];

function toHost(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadMatrix(affinity, party, flags) {
  const context = vm.createContext({
    console,
    G: {
      state: {
        party: party || [],
        affinity: affinity === undefined ? {} : affinity,
        flags: flags === undefined ? {} : flags,
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
  vm.runInContext(fs.readFileSync(BONDS_PATH, 'utf8') + '\n;globalThis.BOND_EVENTS = BOND_EVENTS;', context, { filename: BONDS_PATH });
  vm.runInContext(fs.readFileSync(ENCOUNTERS_PATH, 'utf8') + '\n;globalThis.ENCOUNTERS = ENCOUNTERS;\n;globalThis.encounterAvailable = encounterAvailable;\n;globalThis.getZoneEncounters = getZoneEncounters;\n;globalThis.getTravelEncounters = getTravelEncounters;\n;globalThis.pickWeighted = pickWeighted;\n;globalThis.maxPartyLevel = maxPartyLevel;', context, { filename: ENCOUNTERS_PATH });
  vm.runInContext(fs.readFileSync(ENCOUNTER_PATH, 'utf8') + '\n;globalThis.EncounterSystem = EncounterSystem;\n;globalThis.EncounterTrigger = EncounterTrigger;', context, { filename: ENCOUNTER_PATH });
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
  vm.runInContext(fs.readFileSync(BONDS_PATH, 'utf8') + '\n;globalThis.BOND_EVENTS = BOND_EVENTS;', context, { filename: BONDS_PATH });
  vm.runInContext(fs.readFileSync(SAVE_PATH, 'utf8') + '\n;globalThis.SaveSystem = SaveSystem;', context, { filename: SAVE_PATH });
  return { G: context.G, BondSystem: context.BondSystem, SaveSystem: context.SaveSystem, localStorage, context };
}

test('arc coverage: 15 entries, 3 stages per hero, ordered tierReq', () => {
  const ctx = loadMatrix({}, []);
  const events = ctx.BOND_EVENTS;
  assert.equal(Object.keys(events).length, 15);
  for (const h of HERO_IDS) {
    for (const stage of ['recruit', 'crisis', 'oath']) {
      const id = 'bond_' + h + '_' + stage;
      assert.ok(events[id], id + ' must exist');
      assert.equal(events[id].heroId, h);
      assert.equal(events[id].arc, stage);
      assert.equal(events[id].bondEvent, true);
      assert.ok(Array.isArray(events[id].choices) && events[id].choices.length >= 2);
    }
    assert.equal(events['bond_' + h + '_recruit'].tierReq, null);
    assert.equal(events['bond_' + h + '_crisis'].tierReq, 'Trusted');
    assert.equal(events['bond_' + h + '_oath'].tierReq, 'Sworn');
  }
});

test('availability ladder: recruit -> crisis -> oath -> null', () => {
  let ctx = loadMatrix({}, [{ id: 'arjuna', active: true }]);
  assert.equal(ctx.BondSystem.bondAvailable('arjuna'), 'bond_arjuna_recruit');
  ctx = loadMatrix({ arjuna: 25 }, [{ id: 'arjuna', active: true }], { bond_arjuna_recruit: true });
  assert.equal(ctx.BondSystem.bondAvailable('arjuna'), 'bond_arjuna_crisis');
  ctx = loadMatrix({ arjuna: 50 }, [{ id: 'arjuna', active: true }], { bond_arjuna_recruit: true, bond_arjuna_crisis: true });
  assert.equal(ctx.BondSystem.bondAvailable('arjuna'), 'bond_arjuna_oath');
  ctx = loadMatrix({ arjuna: 90 }, [{ id: 'arjuna', active: true }], { bond_arjuna_recruit: true, bond_arjuna_crisis: true, bond_arjuna_oath: true });
  assert.equal(ctx.BondSystem.bondAvailable('arjuna'), null);
});

test('first completion exactly-once: full gain once, replay path after', () => {
  const ctx = loadMatrix({}, [{ id: 'arjuna', active: true }]);
  const first = ctx.BondSystem.completeBond('bond_arjuna_recruit', 0);
  assert.equal(first.ok, true);
  assert.equal(first.first, true);
  assert.equal(first.applied, 2);
  assert.equal(ctx.G.state.flags.bond_arjuna_recruit, true);
  const second = ctx.BondSystem.completeBond('bond_arjuna_recruit', 0);
  assert.equal(second.ok, true);
  assert.equal(second.first, false);
  assert.ok(second.applied <= 1, 'replay must never grant the full gain again');
});

test('replay cap: REPLAY_CAP x +1 then hard cap', () => {
  const ctx = loadMatrix({}, [{ id: 'arjuna', active: true }]);
  assert.equal(ctx.BondSystem.REPLAY_CAP, 3);
  ctx.BondSystem.completeBond('bond_arjuna_recruit', 0);
  for (let i = 0; i < ctx.BondSystem.REPLAY_CAP; i++) {
    const r = ctx.BondSystem.completeBond('bond_arjuna_recruit', 0);
    assert.equal(r.ok, true);
    assert.equal(r.applied, 1);
  }
  const before = ctx.G.state.affinity.arjuna;
  const capped = ctx.BondSystem.completeBond('bond_arjuna_recruit', 0);
  assert.equal(capped.ok, true);
  assert.equal(capped.capped, true);
  assert.equal(capped.applied, 0);
  assert.equal(ctx.G.state.affinity.arjuna, before);
});

test('benched-hero completion: flag set, no gain', () => {
  const ctx = loadMatrix({}, [{ id: 'arjuna', active: false }]);
  const r = ctx.BondSystem.completeBond('bond_arjuna_recruit', 0);
  assert.equal(r.ok, true);
  assert.equal(ctx.G.state.flags.bond_arjuna_recruit, true);
  assert.equal(r.applied, 0);
});

test('tier-gate enforcement: sub-tier crisis rejected with no writes', () => {
  const ctx = loadMatrix({ arjuna: 10 }, [{ id: 'arjuna', active: true }]);
  const r = ctx.BondSystem.completeBond('bond_arjuna_crisis', 0);
  assert.equal(r.ok, false);
  assert.equal(Object.prototype.hasOwnProperty.call(ctx.G.state.flags, 'bond_arjuna_crisis'), false);
  assert.equal(ctx.G.state.affinity.arjuna, 10);
});

test('pool isolation: bond ids absent from ENCOUNTERS and pools', () => {
  const ctx = loadMatrix({}, []);
  for (const id of Object.keys(ctx.BOND_EVENTS)) {
    assert.equal(Object.prototype.hasOwnProperty.call(ctx.ENCOUNTERS, id), false);
  }
  ctx.G.state.party = [{ id: 'arjuna', level: 99, active: true }];
  ctx.G.state.karma = 0;
  for (const zone of ['dandaka', 'aryavarta', 'meru', 'svarga', 'patala', 'tapobhumi']) {
    for (const e of ctx.getZoneEncounters(zone)) {
      assert.equal(!!e.bondEvent, false);
      assert.ok(Object.prototype.hasOwnProperty.call(ctx.ENCOUNTERS, e.id));
    }
    for (const e of ctx.getTravelEncounters(zone, 'meru')) {
      assert.equal(!!e.bondEvent, false);
    }
  }
  assert.equal(ctx.encounterAvailable({ bondEvent: true, id: 'bond_arjuna_recruit' }, { zoneId: 'dandaka', level: 99, karma: 0 }), false);
});

test('hostile inputs rejected with no pollution', () => {
  const ctx = loadMatrix({}, [{ id: 'arjuna', active: true }]);
  for (const bad of ['__proto__', 'constructor', 'unknownhero']) {
    const r = ctx.BondSystem.add(bad, 4);
    assert.equal(r.applied, 0);
    const c = ctx.BondSystem.completeBond(bad, 0);
    assert.equal(c.ok, false);
  }
  assert.equal({}.x, undefined);
  assert.equal(Object.prototype.x, undefined);
});

test('no-decay sweep: every annotated ENCOUNTERS gain is non-decreasing', () => {
  const ctx = loadMatrix({ arjuna: 40, bhima: 40, karna: 40, draupadi: 40, hanuman: 40 },
    HERO_IDS.map(h => ({ id: h, active: true })));
  for (const enc of Object.values(ctx.ENCOUNTERS)) {
    for (const c of (enc.choices || [])) {
      if (!c || typeof c.affinity !== 'object' || c.affinity === null) continue;
      for (const [hero, gain] of Object.entries(c.affinity)) {
        const before = ctx.G.state.affinity[hero];
        ctx.BondSystem.add(hero, gain);
        assert.ok(ctx.G.state.affinity[hero] >= before, hero + ' decreased');
      }
    }
  }
});

test('persistence round trip: affinity, bond flags, replay counters survive', () => {
  const { G, SaveSystem } = loadSaveContract();
  G.state.party = [{ id: 'arjuna', active: true }];
  G.state.affinity = { arjuna: 30 };
  G.state.flags = { bond_arjuna_recruit: true, bond_arjuna_recruit_replays: 2 };
  assert.equal(SaveSystem.save(), true);
  G.state = G.createDefaultState();
  assert.equal(SaveSystem.load(), true);
  assert.deepEqual(toHost(G.state.affinity), { arjuna: 30 });
  assert.equal(G.state.flags.bond_arjuna_recruit, true);
  assert.equal(G.state.flags.bond_arjuna_recruit_replays, 2);
});

test('legacy healing: missing affinity heals, recruit still available', () => {
  const { G, SaveSystem, BondSystem } = loadSaveContract();
  const legacy = {
    player: { id: 'arjuna', name: 'Arjuna' },
    party: [{ id: 'arjuna', name: 'Arjuna', hp: 80, active: true }],
    gold: 100,
    flags: {},
    encounters: { seen: {} }
  };
  assert.equal(SaveSystem.hydrate(legacy), true);
  assert.deepEqual(toHost(G.state.affinity), {});
  assert.equal(BondSystem.bondAvailable('arjuna'), 'bond_arjuna_recruit');
});

test('malformed healing: clamped known-only affinity with no pollution', () => {
  const { G, SaveSystem } = loadSaveContract();
  const state = G.createDefaultState();
  state.affinity = JSON.parse('{"arjuna":200,"bhima":"junk","unknownhero":30,"constructor":7}');
  state.affinity['__proto__'] = { polluted: true };
  assert.equal(SaveSystem.hydrate(state), true);
  assert.deepEqual(toHost(G.state.affinity), { arjuna: 100, bhima: 0 });
  assert.equal({}.polluted, undefined);
});
