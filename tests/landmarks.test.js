const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const ZONES_PATH = path.join(ROOT, 'src/data/zones.js');
const LANDMARKS_PATH = path.join(ROOT, 'src/data/landmarks.js');

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
