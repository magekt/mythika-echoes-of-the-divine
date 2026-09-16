const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const GAME_PATH = path.join(ROOT, 'src/engine/game.js');
const WORLD_STATE_PATH = path.join(ROOT, 'src/systems/world_state.js');
const SAVE_PATH = path.join(ROOT, 'src/systems/save.js');
const INDEX_PATH = path.join(ROOT, 'index.html');

function loadContract(options = {}) {
  const storage = new Map();
  const localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
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
    window: {
      innerWidth: 400,
      innerHeight: 720,
      devicePixelRatio: 1,
      addEventListener: () => {},
      console
    }
  });

  const gameSource = fs.readFileSync(GAME_PATH, 'utf8');
  vm.runInContext(gameSource + '\n;globalThis.G = G;', context, { filename: GAME_PATH });

  if (!options.withoutWorldState) {
    const worldStateSource = fs.readFileSync(WORLD_STATE_PATH, 'utf8');
    vm.runInContext(worldStateSource + '\n;globalThis.WorldState = WorldState;', context, {
      filename: WORLD_STATE_PATH
    });
  }

  if (options.withSave) {
    const saveSource = fs.readFileSync(SAVE_PATH, 'utf8');
    vm.runInContext(saveSource + '\n;globalThis.SaveSystem = SaveSystem;', context, {
      filename: SAVE_PATH
    });
  }

  return {
    G: context.G,
    WorldState: context.WorldState,
    SaveSystem: context.SaveSystem,
    localStorage
  };
}

function assertPlainObject(value, message) {
  assert.equal(Object.prototype.toString.call(value), '[object Object]', message);
  assert.equal(Object.getPrototypeOf(value), null, message + ' must have a null prototype');
}

function toHost(value) {
  return JSON.parse(JSON.stringify(value));
}

test('new games expose the complete canonical world-state shape', () => {
  const { G, WorldState } = loadContract();
  const world = G.createDefaultState().world;

  assert.deepEqual(toHost(world), {
    regions: {},
    landmarks: { discovered: {}, notified: {} },
    influence: {},
    narrativeEchoes: {},
    events: { active: {}, resolved: {} },
    transitions: {}
  });
  assert.deepEqual(toHost(WorldState.createDefault()), toHost(world));
});

test('normalization repairs malformed branches while preserving valid records', () => {
  const { WorldState } = loadContract();
  const candidate = {
    regions: { aryavarta: { explored: true }, broken: null },
    landmarks: {
      discovered: { banyan: { discoveredAt: 12 }, broken: [] },
      notified: 'invalid'
    },
    influence: {
      aryavarta: { value: 250, control: 'player' },
      dandaka: { value: -250, control: 'contested' },
      meru: { value: Number.POSITIVE_INFINITY, control: 'enemy' },
      patala: { value: 25, control: 'invalid' }
    },
    narrativeEchoes: { vow: 'kept', broken: undefined },
    events: {
      active: { eclipse: { stage: 2 }, broken: null },
      resolved: { pilgrimage: { outcome: 'blessed' }, broken: [] }
    },
    transitions: { firstMapVisit: { recordedAt: 10 }, broken: null }
  };

  const normalized = WorldState.normalize(candidate);

  assertPlainObject(normalized, 'normalized world');
  assert.deepEqual(toHost(normalized.regions), { aryavarta: { explored: true } });
  assert.deepEqual(toHost(normalized.landmarks.discovered), { banyan: { discoveredAt: 12 } });
  assert.deepEqual(toHost(normalized.landmarks.notified), {});
  assert.deepEqual(toHost(normalized.influence), {
    aryavarta: { value: 100, control: 'player' },
    dandaka: { value: -100, control: 'contested' },
    meru: { value: 0, control: 'enemy' },
    patala: { value: 25, control: 'neutral' }
  });
  assert.deepEqual(toHost(normalized.narrativeEchoes), { vow: 'kept' });
  assert.deepEqual(toHost(normalized.events.active), { eclipse: { stage: 2 } });
  assert.deepEqual(toHost(normalized.events.resolved), { pilgrimage: { outcome: 'blessed' } });
  assert.deepEqual(toHost(normalized.transitions), { firstMapVisit: { recordedAt: 10 } });

  for (const branch of [
    normalized.regions,
    normalized.landmarks,
    normalized.landmarks.discovered,
    normalized.landmarks.notified,
    normalized.influence,
    normalized.narrativeEchoes,
    normalized.events,
    normalized.events.active,
    normalized.events.resolved,
    normalized.transitions
  ]) assertPlainObject(branch, 'world branch');
});

test('normalization drops unsafe keys without polluting prototypes', () => {
  const { WorldState } = loadContract();
  const candidate = JSON.parse(`{
    "regions": {
      "safe": {"known": true},
      "__proto__": {"polluted": true},
      "constructor": {"polluted": true},
      "prototype": {"polluted": true}
    },
    "transitions": {
      "safe": {"metadata": {"ok": true}},
      "__proto__": {"polluted": true}
    }
  }`);

  const normalized = WorldState.normalize(candidate);

  assert.deepEqual(Object.keys(normalized.regions), ['safe']);
  assert.deepEqual(Object.keys(normalized.transitions), ['safe']);
  assert.equal({}.polluted, undefined);
});

test('queries are read-only and mutations clone accepted metadata', () => {
  const { G, WorldState } = loadContract();
  G.state.world = WorldState.createDefault();
  const before = JSON.stringify(G.state.world);

  assert.equal(WorldState.getRegion('unknown'), null);
  assert.equal(WorldState.hasTransition('unknown'), false);
  assert.equal(JSON.stringify(G.state.world), before);

  const metadata = { source: 'exploration', nested: { count: 1 } };
  assert.equal(WorldState.recordLandmarkDiscovery('banyan', metadata), true);
  metadata.source = 'changed';
  metadata.nested.count = 99;
  assert.deepEqual(toHost(G.state.world.landmarks.discovered.banyan), {
    source: 'exploration',
    nested: { count: 1 }
  });
});

test('one-time discoveries, notifications, transitions, and resolutions are idempotent', () => {
  const { G, WorldState } = loadContract();
  G.state.world = WorldState.createDefault();

  assert.equal(WorldState.recordLandmarkDiscovery('banyan', { source: 'first' }), true);
  assert.equal(WorldState.recordLandmarkDiscovery('banyan', { source: 'second' }), false);
  assert.equal(G.state.world.landmarks.discovered.banyan.source, 'first');

  assert.equal(WorldState.markLandmarkNotified('banyan'), true);
  assert.equal(WorldState.markLandmarkNotified('banyan'), false);

  assert.equal(WorldState.recordTransition('mapIntroduced', { scene: 'travel' }), true);
  assert.equal(WorldState.recordTransition('mapIntroduced', { scene: 'title' }), false);
  assert.equal(WorldState.hasTransition('mapIntroduced'), true);
  assert.equal(G.state.world.transitions.mapIntroduced.scene, 'travel');

  assert.equal(WorldState.setEventActive('eclipse', { stage: 1 }), true);
  assert.equal(WorldState.resolveEvent('eclipse', { result: 'sealed' }), true);
  assert.equal(WorldState.resolveEvent('eclipse', { result: 'escaped' }), false);
  assert.equal(G.state.world.events.active.eclipse, undefined);
  assert.deepEqual(toHost(G.state.world.events.resolved.eclipse), { result: 'sealed' });
});

test('repeatable mutations validate identifiers and normalize influence/control', () => {
  const { G, WorldState } = loadContract();
  G.state.world = WorldState.createDefault();

  assert.equal(WorldState.setInfluence('aryavarta', 140, 'player'), true);
  assert.deepEqual(toHost(G.state.world.influence.aryavarta), { value: 100, control: 'player' });
  assert.equal(WorldState.setInfluence('aryavarta', Number.NaN, 'invalid'), true);
  assert.deepEqual(toHost(G.state.world.influence.aryavarta), { value: 0, control: 'neutral' });
  assert.equal(WorldState.setNarrativeEcho('vow', 'kept'), true);
  assert.equal(G.state.world.narrativeEchoes.vow, 'kept');

  assert.equal(WorldState.setInfluence('__proto__', 5, 'player'), false);
  assert.equal(WorldState.setNarrativeEcho('constructor', 'unsafe'), false);
  assert.equal(WorldState.setEventActive('prototype', { bad: true }), false);
});

test('legacy save hydration adds canonical world state without changing unrelated progress', () => {
  const { G, SaveSystem } = loadContract({ withSave: true });
  const legacyState = {
    player: { id: 'hero-1', name: 'Arjun' },
    party: [{ id: 'hero-1', name: 'Arjun', hp: 80 }],
    gold: 4321,
    karma: 17,
    flags: { pilgrimageComplete: true },
    encounters: { seen: { hermit: true } },
    zoneProgress: { forest: 6 }
  };

  assert.equal(SaveSystem.hydrate(legacyState), true);
  assert.deepEqual(toHost(G.state.world), {
    regions: {},
    landmarks: { discovered: {}, notified: {} },
    influence: {},
    narrativeEchoes: {},
    events: { active: {}, resolved: {} },
    transitions: {}
  });
  assert.equal(G.state.gold, 4321);
  assert.equal(G.state.karma, 17);
  assert.deepEqual(toHost(G.state.party), legacyState.party);
  assert.deepEqual(toHost(G.state.flags), legacyState.flags);
  assert.deepEqual(toHost(G.state.encounters), legacyState.encounters);
  assert.deepEqual(toHost(G.state.zoneProgress), legacyState.zoneProgress);
});

test('save migration repairs partial and malformed world branches during load', () => {
  const { G, SaveSystem, localStorage } = loadContract({ withSave: true });
  const state = G.createDefaultState();
  state.gold = 99;
  state.zoneProgress = { coast: 3 };
  state.world = JSON.parse(`{
    "regions":{"coast":{"explored":true},"__proto__":{"polluted":true}},
    "landmarks":{"discovered":{"shrine":{"foundAt":12}},"notified":[]},
    "influence":{"coast":{"value":999,"control":"player"},"void":{"value":null,"control":"enemy"}},
    "narrativeEchoes":"invalid",
    "events":{"active":{"storm":{"stage":2}},"resolved":42},
    "transitions":{"intro":{"at":1}}
  }`);
  localStorage.setItem(SaveSystem.SAVE_KEY, JSON.stringify({ state, version: 1, timestamp: Date.now() }));

  assert.equal(SaveSystem.load(), true);
  assert.deepEqual(toHost(G.state.world), {
    regions: { coast: { explored: true } },
    landmarks: { discovered: { shrine: { foundAt: 12 } }, notified: {} },
    influence: {
      coast: { value: 100, control: 'player' },
      void: { value: 0, control: 'enemy' }
    },
    narrativeEchoes: {},
    events: { active: { storm: { stage: 2 } }, resolved: {} },
    transitions: { intro: { at: 1 } }
  });
  assert.equal(G.state.gold, 99);
  assert.deepEqual(toHost(G.state.zoneProgress), { coast: 3 });
  assert.equal({}.polluted, undefined);
});

test('every world domain and replay guard survives a save-load round trip', () => {
  const { G, WorldState, SaveSystem } = loadContract({ withSave: true });
  G.state.gold = 777;
  G.state.zoneProgress = { mountain: 9 };
  G.state.world = WorldState.normalize({
    regions: { mountain: { explored: true, tier: 2 } },
    landmarks: {
      discovered: { summit: { source: 'quest' } },
      notified: { summit: { notifiedAt: 20 } }
    },
    influence: { mountain: { value: 44, control: 'contested' } },
    narrativeEchoes: { oath: { choice: 'kept' } },
    events: {
      active: { monsoon: { stage: 3 } },
      resolved: { eclipse: { result: 'sealed' } }
    },
    transitions: { mapIntroduced: { scene: 'travel' } }
  });
  const expectedWorld = toHost(G.state.world);

  assert.equal(SaveSystem.save(), true);
  G.state = G.createDefaultState();
  assert.equal(SaveSystem.load(), true);
  assert.deepEqual(toHost(G.state.world), expectedWorld);
  assert.equal(G.state.gold, 777);
  assert.deepEqual(toHost(G.state.zoneProgress), { mountain: 9 });

  assert.equal(WorldState.recordLandmarkDiscovery('summit', { source: 'repeat' }), false);
  assert.equal(WorldState.markLandmarkNotified('summit'), false);
  assert.equal(WorldState.recordTransition('mapIntroduced', { scene: 'title' }), false);
  assert.equal(WorldState.resolveEvent('eclipse', { result: 'escaped' }), false);
  assert.deepEqual(toHost(G.state.world.landmarks.discovered.summit), { source: 'quest' });
  assert.deepEqual(toHost(G.state.world.transitions.mapIntroduced), { scene: 'travel' });
  assert.deepEqual(toHost(G.state.world.events.resolved.eclipse), { result: 'sealed' });
});

test('migration falls back to a canonical default when WorldState is unavailable', () => {
  const { G, SaveSystem } = loadContract({ withSave: true, withoutWorldState: true });
  const state = G.createDefaultState();
  state.world = { regions: [] };

  assert.equal(SaveSystem.hydrate(state), true);
  assert.deepEqual(toHost(G.state.world), toHost(G.createDefaultState().world));
});

test('WorldState is registered after zone data and before SaveSystem', () => {
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const zonesIndex = html.indexOf('src/data/zones.js');
  const worldIndex = html.indexOf('src/systems/world_state.js');
  const saveIndex = html.indexOf('src/systems/save.js');

  assert.notEqual(worldIndex, -1, 'WorldState script tag is missing');
  assert.ok(worldIndex > zonesIndex, 'WorldState must load after zone data');
  assert.ok(worldIndex < saveIndex, 'WorldState must load before SaveSystem');
});
