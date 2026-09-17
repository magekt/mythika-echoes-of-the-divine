const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const ZONES_PATH = path.join(ROOT, 'src/data/zones.js');
const LANDMARKS_PATH = path.join(ROOT, 'src/data/landmarks.js');
const WORLD_STATE_PATH = path.join(ROOT, 'src/systems/world_state.js');
const LANDMARK_SYSTEM_PATH = path.join(ROOT, 'src/systems/landmarks.js');
const INDEX_PATH = path.join(ROOT, 'index.html');

function loadData() {
  const context = vm.createContext({ console });
  const zonesSource = fs.readFileSync(ZONES_PATH, 'utf8');
  const landmarksSource = fs.readFileSync(LANDMARKS_PATH, 'utf8');
  vm.runInContext(zonesSource + '\n;globalThis.ZONES = ZONES;', context, { filename: ZONES_PATH });
  vm.runInContext(
    landmarksSource + '\n;globalThis.LANDMARKS = LANDMARKS; globalThis.ZONE_LANDMARKS = ZONE_LANDMARKS; globalThis.LandmarkDefs = LandmarkDefs;',
    context,
    { filename: LANDMARKS_PATH }
  );
  return context;
}

test('landmark definitions cover every zone with valid discovery conditions', () => {
  const context = loadData();
  const zoneIds = Object.keys(context.ZONES);
  const landmarkIds = Object.keys(context.LANDMARKS);
  const validConditions = new Set(['zonePercentage', 'zoneComplete', 'flag']);

  assert.ok(landmarkIds.length >= 12, 'at least twelve landmarks should be defined');
  for (const zoneId of zoneIds) {
    assert.ok(context.ZONE_LANDMARKS[zoneId], zoneId + ' should have a landmark index');
    assert.ok(context.ZONE_LANDMARKS[zoneId].length >= 2, zoneId + ' should have at least two landmarks');
  }

  for (const landmarkId of landmarkIds) {
    const landmark = context.LANDMARKS[landmarkId];
    assert.equal(landmark.id, landmarkId);
    assert.ok(context.ZONES[landmark.zoneId], landmarkId + ' should reference an existing zone');
    assert.ok(validConditions.has(landmark.discovery.type), landmarkId + ' should use a supported condition');
    assert.ok(landmark.description && landmark.relevance, landmarkId + ' should include inspectable lore');
  }
});

test('LandmarkDefs returns zone definitions without exposing the index array', () => {
  const context = loadData();
  const aryavarta = context.LandmarkDefs.getByZone('aryavarta');

  assert.deepEqual(Array.from(aryavarta, landmark => landmark.id), ['naradaStone', 'forestSpirit']);
  assert.deepEqual(Array.from(context.LandmarkDefs.getByZone('unknown')), []);
  assert.notEqual(aryavarta, context.ZONE_LANDMARKS.aryavarta);
});

function loadSystem() {
  const context = loadData();
  context.G = {
    state: {
      zoneProgress: {},
      flags: {},
      world: {
        landmarks: { discovered: {}, notified: {} },
        influence: {},
        narrativeEchoes: {},
        events: { active: {}, resolved: {} },
        transitions: {}
      }
    }
  };
  vm.runInContext(
    fs.readFileSync(WORLD_STATE_PATH, 'utf8') + '\n;globalThis.WorldState = WorldState;',
    context,
    { filename: WORLD_STATE_PATH }
  );
  vm.runInContext(
    fs.readFileSync(LANDMARK_SYSTEM_PATH, 'utf8') + '\n;globalThis.Landmarks = Landmarks;',
    context,
    { filename: LANDMARK_SYSTEM_PATH }
  );
  return context;
}

test('discovery checks live progress and flags and records each landmark once', () => {
  const context = loadSystem();
  context.G.state.zoneProgress = { aryavarta: 30 };
  context.G.state.flags = { enc_nagaBargain: 'share' };

  assert.equal(context.Landmarks.tryDiscover('naradaStone'), true);
  assert.equal(context.Landmarks.tryDiscover('naradaStone'), false);
  assert.equal(context.Landmarks.tryDiscover('forestSpirit'), false);
  assert.equal(context.Landmarks.tryDiscover('nagaFord'), true);
  assert.equal(context.Landmarks.isDiscovered('naradaStone'), true);
  assert.equal(context.Landmarks.isDiscovered('forestSpirit'), false);
  assert.equal(context.G.state.world.landmarks.discovered.naradaStone.zoneId, 'aryavarta');
});

test('zone checks and queries return eligible discoveries and enriched definitions', () => {
  const context = loadSystem();
  context.G.state.zoneProgress = { aryavarta: 100 };

  assert.deepEqual(Array.from(context.Landmarks.checkZone('aryavarta')), ['naradaStone', 'forestSpirit']);
  assert.deepEqual(Array.from(context.Landmarks.checkZone('aryavarta')), []);
  assert.deepEqual(Array.from(context.Landmarks.getDiscovered('aryavarta')), ['naradaStone', 'forestSpirit']);

  const all = context.Landmarks.getAll('aryavarta');
  assert.equal(all.length, 2);
  assert.equal(all[0].discovered, true);
  assert.equal(all[0].discovery, undefined, 'runtime query should expose only inspectable fields');
  assert.deepEqual(Array.from(context.Landmarks.getAll('unknown')), []);
});

test('index loads landmark data before the system and the system after WorldState', () => {
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const dataIndex = html.indexOf('src/data/landmarks.js');
  const worldIndex = html.indexOf('src/systems/world_state.js');
  const systemIndex = html.indexOf('src/systems/landmarks.js');

  assert.ok(dataIndex >= 0, 'index should load landmark definitions');
  assert.ok(systemIndex > worldIndex, 'landmark system should load after WorldState');
  assert.ok(dataIndex < systemIndex, 'landmark definitions should load before the system');
});
